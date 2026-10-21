import { readFile, readdir, realpath, mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { parse, stringify } from 'yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkStringify)
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 16)
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'])
const inside = (root, file) => file.startsWith(root + path.sep)
const escapeLabel = (text) => text.replace(/[\\[\]]/g, '\\$&')

async function inventory(root, relative = '') {
  const files = []
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    // Never follow symlinks or read Obsidian/plugin configuration.
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue
    const name = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) files.push(...(await inventory(root, name)))
    else if (entry.isFile()) files.push(name)
  }
  return files.sort()
}

function parseNote(text, file) {
  const frontmatter = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter || !/^publish:\s*true\s*(?:#.*)?$/m.test(frontmatter[1])) return null
  const data = parse(frontmatter[1])
  if (data?.publish !== true || data.draft === true) return null
  const slug = data.slug || `note-${hash(file)}`
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error('发布笔记的 slug 只能包含小写英文字母、数字和连字符。')
  const date = data.pubDate || data.date
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error('发布笔记需要有效的 date: YYYY-MM-DD。')
  if (!Array.isArray(data.tags || []) || !(data.tags || []).every((tag) => typeof tag === 'string'))
    throw new Error('tags 应为字符串列表。')
  if (data.language && !['zh', 'en'].includes(data.language)) throw new Error('language 只能为 zh 或 en。')
  for (const key of ['title', 'description', 'category'])
    if (data[key] !== undefined && typeof data[key] !== 'string') throw new Error(`${key} 应为字符串。`)
  const title = data.title || path.basename(file, '.md')
  return {
    file,
    slug,
    body: text.replace(/^\uFEFF/, '').slice(frontmatter[0].length),
    meta: {
      title,
      description: data.description || `${title}：学习与实践中的个人笔记。`,
      pubDate: new Date(`${date}T00:00:00Z`),
      tags: data.tags || [],
      category: data.category || '随笔',
      language: data.language || 'zh',
      draft: false,
    },
  }
}

// Replace Obsidian-only syntax outside fenced and inline code, without interpreting instructions in notes.
function transformText(body, transform) {
  const tree = processor.parse(body)
  const protectedRanges = []
  visit(tree, (node) => {
    if (['code', 'inlineCode'].includes(node.type)) protectedRanges.push([node.position.start.offset, node.position.end.offset])
  })
  let result = '',
    offset = 0
  for (const [start, end] of protectedRanges.sort((a, b) => a[0] - b[0])) {
    result += transform(body.slice(offset, start)) + body.slice(start, end)
    offset = end
  }
  return result + transform(body.slice(offset))
}

function stripComments(body) {
  const protectedRanges = []
  visit(processor.parse(body), (node) => {
    if (['code', 'inlineCode'].includes(node.type)) protectedRanges.push([node.position.start.offset, node.position.end.offset])
  })
  let offset = 0,
    result = '',
    cursor = 0
  while ((cursor = body.indexOf('%%', cursor)) >= 0) {
    if (protectedRanges.some(([start, end]) => cursor >= start && cursor < end)) {
      cursor += 2
      continue
    }
    const end = body.indexOf('%%', cursor + 2)
    if (end < 0) throw new Error('存在未闭合的 Obsidian 私人注释，已停止同步。')
    result += body.slice(offset, cursor)
    offset = cursor = end + 2
  }
  return result + body.slice(offset)
}

export async function syncObsidian({ vault, root = projectRoot, dryRun = false, log = console.log }) {
  const source = await realpath(vault)
  const files = await inventory(source)
  const notes = []
  for (const file of files.filter((file) => file.endsWith('.md'))) {
    const note = parseNote(await readFile(path.join(source, file), 'utf8'), file)
    if (note) notes.push(note)
  }
  const selected = new Map(notes.map((note) => [note.file, note]))
  if (new Set(notes.map((note) => note.slug)).size !== notes.length) throw new Error('存在重复 slug，请为每篇发布笔记使用不同的 slug。')
  const output = new Map()
  let privateLinks = 0
  function resolveFile(target, current) {
    let decoded
    try {
      decoded = decodeURIComponent(target)
    } catch {
      return null
    }
    if (!decoded || decoded.includes('\\') || decoded.startsWith('/')) return null
    const relative = path.posix.normalize(path.posix.join(path.posix.dirname(current), decoded))
    for (const candidate of [relative, decoded, `${relative}.md`, `${decoded}.md`]) if (files.includes(candidate)) return candidate
    const candidates = files.filter(
      (file) => file === decoded || file.endsWith(`/${decoded}`) || file === `${decoded}.md` || file.endsWith(`/${decoded}.md`)
    )
    return candidates.length === 1 ? candidates[0] : null
  }
  async function asset(target, current) {
    const file = resolveFile(target, current)
    if (!file || !imageExtensions.has(path.extname(file).toLowerCase()))
      throw new Error('选中笔记包含无法解析或不支持的图片。仅支持 PNG、JPEG、WebP、GIF、AVIF；不会自动公开其他附件或嵌入笔记。')
    const absolute = await realpath(path.join(source, file))
    if (!inside(source, absolute)) throw new Error('图片路径超出了笔记库。')
    const bytes = await readFile(absolute)
    if (bytes.length > 20 * 1024 * 1024) throw new Error('图片超过 20 MB，请先压缩。')
    const name = `${hash(bytes)}${path.extname(file).toLowerCase()}`
    output.set(`public/media/blog/obsidian/${name}`, bytes)
    return `/media/blog/obsidian/${name}`
  }
  for (const note of notes) {
    let body = stripComments(note.body)
    const embeds = []
    body = transformText(body, (text) =>
      text.replace(/(!?)\[\[([^\]\n]+)\]\]/g, (_, embed, contents) => {
        const [target, ...aliases] = contents.split('|')
        const [name, heading] = target.split('#')
        const label = aliases.join('|') || heading || path.posix.basename(name, '.md')
        if (embed) {
          const token = `OBSIDIANASSET${embeds.length}TOKEN`
          embeds.push({ token, target: name, label: /^\d+(?:x\d+)?$/.test(label) ? '' : label })
          return `![${escapeLabel(label)}](${token})`
        }
        const linked = name ? selected.get(resolveFile(name, note.file)) : note
        // Links to private notes become plain text, never copied or expanded.
        if (!linked) {
          privateLinks++
          return escapeLabel(label)
        }
        if (heading?.startsWith('^')) throw new Error('暂不支持 Obsidian 块引用，请改成标题链接。')
        const fragment = heading
          ? `#${encodeURIComponent(
              heading
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\p{L}\p{N}_-]/gu, '')
            )}`
          : ''
        return `[${escapeLabel(label)}](/blog/obsidian/${linked.slug}${fragment})`
      })
    )
    const tree = processor.parse(body)
    const jobs = []
    visit(tree, (node) => {
      if (node.type === 'html') throw new Error('选中笔记包含原始 HTML，请改用 Markdown；同步工具不会直接发布 HTML。')
      if (!['link', 'image', 'definition'].includes(node.type)) return
      const embed = embeds.find((item) => item.token === node.url)
      if (embed) {
        jobs.push(
          asset(embed.target, note.file).then((url) => {
            node.url = url
            node.alt = embed.label
          })
        )
        return
      }
      if (/^(?:https?:\/\/|mailto:|#|\/blog\/|\/media\/blog\/)/i.test(node.url)) return
      if (node.type === 'image' || imageExtensions.has(path.extname(node.url).toLowerCase())) {
        jobs.push(
          asset(node.url, note.file).then((url) => {
            node.url = url
          })
        )
        return
      }
      const linked = selected.get(resolveFile(node.url.split('#')[0], note.file))
      if (linked) node.url = `/blog/obsidian/${linked.slug}`
      else
        throw new Error('选中笔记包含私密、无法解析或不支持的本地 Markdown 链接。请移除该链接，或使用 [[双链]] 将未发布引用显示为纯文本。')
    })
    await Promise.all(jobs)
    output.set(`src/content/posts/obsidian/${note.slug}.md`, `---\n${stringify(note.meta)}---\n\n${processor.stringify(tree)}`)
  }
  const manifestPath = path.join(root, 'scripts/obsidian-manifest.json')
  let previous = []
  try {
    previous = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const validOutput = (file) =>
    /^(?:src\/content\/posts\/obsidian\/[a-z0-9-]+\.md|public\/media\/blog\/obsidian\/[a-f0-9]{16}\.(?:png|jpg|jpeg|webp|gif|avif))$/.test(
      file
    )
  if (!Array.isArray(previous) || !previous.every((file) => typeof file === 'string' && validOutput(file)))
    throw new Error('同步清单不合法，已停止。')
  // Validate the entire export before touching the generated files.
  for (const file of output.keys()) {
    try {
      await readFile(path.join(root, file))
      if (!previous.includes(file)) throw new Error('导出目标已有手动文件，已停止以避免覆盖。')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  const removed = previous.filter((file) => !output.has(file))
  log(
    `${dryRun ? '[预览] ' : ''}选中 ${notes.length} 篇笔记，导出 ${output.size - notes.length} 张图片，撤下 ${removed.length} 个旧生成文件。未发布笔记不会导入。`
  )
  if (privateLinks) log(`${privateLinks} 处未发布双链将显示为纯文本。`)
  if (dryRun) return { notes: notes.length, output, removed }
  for (const [file, contents] of output) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), contents)
  }
  for (const file of removed)
    await unlink(path.join(root, file)).catch((error) => {
      if (error.code !== 'ENOENT') throw error
    })
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, JSON.stringify([...output.keys()].sort(), null, 2) + '\n')
  return { notes: notes.length, output, removed }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const vaultIndex = args.indexOf('--vault')
  const vault = vaultIndex >= 0 ? args[vaultIndex + 1] : process.env.OBSIDIAN_VAULT || path.join(os.homedir(), 'timidbirch_obsidian')
  if (!vault || args.some((arg, index) => !['--dry-run', '--vault'].includes(arg) && !(vaultIndex >= 0 && index === vaultIndex + 1))) {
    console.error('用法：npm run blog:sync -- [--vault /笔记库绝对路径] [--dry-run]')
    process.exitCode = 1
  } else
    await syncObsidian({ vault, dryRun: args.includes('--dry-run') }).catch((error) => {
      console.error(`同步未完成：${error.message}`)
      process.exitCode = 1
    })
}

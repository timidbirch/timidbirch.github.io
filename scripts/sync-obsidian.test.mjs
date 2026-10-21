import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, readdir, symlink, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { syncObsidian } from './sync-obsidian.mjs'

const note = (body = '## 测试标题\n\n公开的正文。', extra = '') =>
  `---\npublish: true\nslug: first-note\ndate: 2026-10-22\ntitle: 测试笔记\ntags: [AI]\n${extra}---\n${body}\n`
async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'obsidian-blog-test-'))
  const vault = path.join(directory, 'vault'),
    root = path.join(directory, 'site')
  await mkdir(vault)
  await mkdir(root)
  t.after(() => rm(directory, { recursive: true, force: true }))
  return { vault, root, log: () => {} }
}

test('opt-in only; source untouched; dry run does not write', async (t) => {
  const options = await fixture(t)
  await writeFile(path.join(options.vault, 'private.md'), '# DO NOT PUBLISH\nprivate-body')
  await writeFile(path.join(options.vault, 'first.md'), note())
  const result = await syncObsidian({ ...options, dryRun: true })
  assert.equal(result.notes, 1)
  assert.deepEqual(await readdir(options.root), [])
  await syncObsidian(options)
  const exported = await readFile(path.join(options.root, 'src/content/posts/obsidian/first-note.md'), 'utf8')
  assert.match(exported, /公开的正文/)
  assert.doesNotMatch(exported, /DO NOT PUBLISH|private-body/)
  assert.equal(await readFile(path.join(options.vault, 'first.md'), 'utf8'), note())
})

test('wiki links only connect selected notes; comments removed; code preserved', async (t) => {
  const options = await fixture(t)
  await writeFile(
    path.join(options.vault, 'first.md'),
    note('[[second|朋友]] [[private|私人引用]]\n\n%%private `inline secret` %%\n\n`[[private]]`\n\n```md\n%%keep%%\n[[private]]\n```\n')
  )
  await writeFile(path.join(options.vault, 'second.md'), note('公开目标').replace('first-note', 'second-note'))
  await writeFile(path.join(options.vault, 'private.md'), 'hidden')
  const { output } = await syncObsidian(options)
  const body = output.get('src/content/posts/obsidian/first-note.md')
  assert.match(body, /\[朋友\]\(\/blog\/obsidian\/second-note\)/)
  assert.match(body, /私人引用/)
  assert.doesNotMatch(body, /inline secret|\[私人引用\]\(/)
  assert.match(body, /`\[\[private\]\]`/)
  assert.match(body, /%%keep%%/)
})

test('only referenced raster assets copied; symlinks never exported', async (t) => {
  const options = await fixture(t)
  await mkdir(path.join(options.vault, 'img'))
  await writeFile(path.join(options.vault, 'img/picture.png'), 'fake-image-fixture')
  await writeFile(path.join(options.vault, 'img/private.png'), 'private-fixture')
  await symlink(path.join(options.vault, 'img/private.png'), path.join(options.vault, 'linked.png'))
  await writeFile(path.join(options.vault, 'first.md'), note('![[picture.png|320]]'))
  const { output } = await syncObsidian(options)
  assert.equal(output.size, 2)
  assert.match(output.get('src/content/posts/obsidian/first-note.md'), /\/media\/blog\/obsidian\/[a-f0-9]+\.png/)
  await writeFile(path.join(options.vault, 'first.md'), note('![[linked.png]]'))
  await assert.rejects(syncObsidian(options), /不支持的图片/)
})

test('unpublish removes only owned generated files', async (t) => {
  const options = await fixture(t)
  await writeFile(path.join(options.vault, 'first.md'), note())
  await syncObsidian(options)
  await writeFile(path.join(options.root, 'src/content/posts/manual.md'), 'manual post')
  await writeFile(path.join(options.vault, 'first.md'), note().replace('publish: true', 'publish: false'))
  await syncObsidian(options)
  assert.deepEqual(await readdir(path.join(options.root, 'src/content/posts/obsidian')), [])
  assert.equal(await readFile(path.join(options.root, 'src/content/posts/manual.md'), 'utf8'), 'manual post')
})

test('invalid metadata, embeds and raw HTML stop before writing', async (t) => {
  const options = await fixture(t)
  for (const contents of [
    note().replace('2026-10-22', '2026-02-30'),
    note('![[secret.md]]'),
    note('<script>alert(1)</script>'),
    note('%%unclosed secret'),
  ]) {
    await writeFile(path.join(options.vault, 'first.md'), contents)
    await assert.rejects(syncObsidian(options))
    assert.deepEqual(await readdir(options.root), [])
  }
})

test('slug collisions and overwriting a manual file are rejected', async (t) => {
  const options = await fixture(t)
  await writeFile(path.join(options.vault, 'first.md'), note())
  await writeFile(path.join(options.vault, 'second.md'), note())
  await assert.rejects(syncObsidian(options), /重复 slug/)
  await writeFile(path.join(options.vault, 'second.md'), 'private')
  await mkdir(path.join(options.root, 'src/content/posts/obsidian'), { recursive: true })
  await writeFile(path.join(options.root, 'src/content/posts/obsidian/first-note.md'), 'manual')
  await assert.rejects(syncObsidian(options), /避免覆盖/)
})

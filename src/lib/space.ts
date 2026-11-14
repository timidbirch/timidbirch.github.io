import type { CollectionEntry } from 'astro:content'
import { photoAlbums } from './photos'

type Update = {
  date: string
  title: string
  language?: string
  type: string
  kind: 'writing' | 'project' | 'photo'
  href: string
}

export function getRecentUpdates(posts: CollectionEntry<'posts'>[], projects: CollectionEntry<'projects'>[], en: boolean) {
  const prefix = en ? '/en' : ''
  const updates: Update[] = [
    ...posts.map<Update>(({ id, data }) => ({
      date: (data.updatedDate ?? data.pubDate).toISOString().slice(0, 10),
      title: data.title,
      language: data.language === 'zh' ? 'zh-CN' : 'en',
      type: en ? 'Essay' : '文章',
      kind: 'writing',
      href: `${prefix}/blog/${id}`,
    })),
    ...projects.flatMap<Update>(({ id, data }) =>
      data.updatedDate
        ? [
            {
              date: data.updatedDate.toISOString().slice(0, 10),
              title: en ? data.nameEn : data.name,
              type: en ? 'Project update' : '项目更新',
              kind: 'project',
              href: `${prefix}/projects/${id}`,
            },
          ]
        : []
    ),
    ...photoAlbums.map<Update>((album) => ({
      date: album.date,
      title: en ? album.title : album.titleZh,
      type: en ? 'Photos' : '照片',
      kind: 'photo',
      href: `${prefix}/photos#${album.id}`,
    })),
  ]
  return updates.sort((a, b) => b.date.localeCompare(a.date))
}

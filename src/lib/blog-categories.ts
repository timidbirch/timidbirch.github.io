export const BLOG_CATEGORIES = [
  {
    id: 'technology',
    name: '技术与 AI',
    nameEn: 'Technology & AI',
    code: 'BUILD',
    icon: '⌘',
    description: 'AI 系统、编程实践与信息安全，在构建中理解技术。',
    descriptionEn: 'AI systems, programming, and security. Understanding technology by building it.',
    aliases: ['技术探索', '技术', 'AI', 'CS', 'Technology', 'Technology & AI'],
  },
  {
    id: 'finance',
    name: '金融与量化',
    nameEn: 'Finance & Quant',
    code: 'RESEARCH',
    icon: '↗',
    description: '市场观察、量化研究与交易思考，用数据探索决策。',
    descriptionEn: 'Market observations, quantitative research, and trading. Exploring decisions through data.',
    aliases: ['市场观察', '金融', '量化', '投资研究', 'Finance', 'Finance & Quant'],
  },
  {
    id: 'product',
    name: '产品与创业',
    nameEn: 'Product & Ventures',
    code: 'CREATE',
    icon: '✳',
    description: '从问题到产品，记录创意、设计与落地的过程。',
    descriptionEn: 'From problems to products. Ideas, design decisions, and lessons from making things real.',
    aliases: ['产品', '创业', '产品设计', 'Product', 'Product & Ventures'],
  },
  {
    id: 'learning',
    name: '学习与生活',
    nameEn: 'Learning & Life',
    code: 'REFLECT',
    icon: '↟',
    description: '学习方法、日常观察与个人随笔，给思考留一点空间。',
    descriptionEn: 'Learning, everyday observations, and personal essays. A little space to reflect.',
    aliases: ['学习与思考', '学习笔记', '学习', '生活', '随笔', 'Learning', 'Learning & Life'],
  },
] as const

export type BlogCategoryId = (typeof BLOG_CATEGORIES)[number]['id']
const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '')

export function getBlogCategory(value: string) {
  const key = normalize(value)
  return (
    BLOG_CATEGORIES.find((category) => [category.id, category.name, ...category.aliases].some((alias) => normalize(alias) === key)) ||
    BLOG_CATEGORIES[3]
  )
}

export function postsInCategory<T extends { data: { category: string } }>(posts: T[], categoryId?: BlogCategoryId) {
  return categoryId ? posts.filter((post) => getBlogCategory(post.data.category).id === categoryId) : posts
}

import type {
  AnalyticsConfig, CommentConfig, GithubConfig, Link, PhotosConfig,
  PostConfig, ProjectConfig, Site, SkillsShowcaseConfig, SocialLink, TagsConfig,
} from '~/types'

export const SITE: Site = {
  title: 'CHEN Peihua',
  description: '陈佩桦的个人网站，聚焦量化交易、商业分析、AI 系统与信息安全。',
  website: 'https://timidbirch.github.io',
  lang: 'zh-CN',
  base: '/',
  author: 'CHEN Peihua',
  ogImage: '/og-image.webp',
  transition: false,
  themeAnimation: true,
}

export const HEADER_LINKS: Link[] = [
  { name: '项目', url: '/projects' },
  { name: '实践经历', url: '/experience' },
  { name: '关于', url: '/about' },
]

export const FOOTER_LINKS: Link[] = [
  { name: '首页', url: '/' },
  { name: '项目', url: '/projects' },
  { name: '实践经历', url: '/experience' },
  { name: '关于', url: '/about' },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'github', url: 'https://github.com/timidbirch', icon: 'icon-[ri--github-fill]' },
  { name: 'email', url: 'mailto:1146816430@qq.com', icon: 'icon-[ri--mail-line]' },
]

export const SKILLSSHOWCASE_CONFIG: SkillsShowcaseConfig = {
  SKILLS_ENABLED: false,
  SKILLS_DATA: [],
}

export const GITHUB_CONFIG: GithubConfig = {
  ENABLED: false,
  GITHUB_USERNAME: 'timidbirch',
  TOOLTIP_ENABLED: true,
}

export const POSTS_CONFIG: PostConfig = {
  title: '文章', description: '陈佩桦的文章。', introduce: '记录项目之外的思考。', author: 'CHEN Peihua',
  homePageConfig: { size: 2, type: 'compact' },
  postPageConfig: { size: 10, type: 'image', coverLayout: 'right' },
  tagsPageConfig: { size: 10, type: 'time-line' },
  ogImageUseCover: false, postType: 'metaOnly', imageDarkenInDark: true,
  readMoreText: '继续阅读', prevPageText: '上一页', nextPageText: '下一页',
  tocText: '本页目录', backToPostsText: '返回文章', nextPostText: '下一篇', prevPostText: '上一篇',
  recommendText: '推荐', wordCountView: true,
}

export const COMMENT_CONFIG: CommentConfig = {
  enabled: false,
  system: 'gitalk',
  gitalk: {
    clientID: import.meta.env.PUBLIC_GITHUB_CLIENT_ID,
    clientSecret: import.meta.env.PUBLIC_GITHUB_CLIENT_SECRET,
    repo: 'timidbirch.github.io', owner: 'timidbirch', admin: ['timidbirch'], language: 'zh-CN',
    perPage: 5, pagerDirection: 'last', createIssueManually: false, distractionFreeMode: false, enableHotKey: true,
  },
}

export const TAGS_CONFIG: TagsConfig = { title: '标签', description: '文章标签', introduce: '按主题浏览文章。' }
export const PROJECTS_CONFIG: ProjectConfig = { title: '项目', description: '陈佩桦的技术项目。', introduce: '从大模型安全测试到数字人生成，记录问题、方法与结果。' }
export const PHOTOS_CONFIG: PhotosConfig = { title: '照片', description: '日常影像。', introduce: '一些生活中的观察。' }
export const ANALYTICS_CONFIG: AnalyticsConfig = {
  vercount: { enabled: false },
  umami: { enabled: false, websiteId: '', serverUrl: 'https://cloud.umami.is/script.js' },
}

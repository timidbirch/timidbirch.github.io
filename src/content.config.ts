import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { POSTS_CONFIG } from '~/config'
import type { CoverLayout, PostType } from '~/types'

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        tags: z.array(z.string()).optional(),
        updatedDate: z.date().optional(),
        author: z.string().default(POSTS_CONFIG.author),
        cover: image().optional(),
        ogImage: image().optional(),
        recommend: z.boolean().default(false),
        postType: z.custom<PostType>().optional(),
        coverLayout: z.custom<CoverLayout>().optional(),
        pinned: z.boolean().default(false),
        draft: z.boolean().default(false),
        license: z.string().optional(),
      })
      .transform((data) => ({
        ...data,
        ogImage: POSTS_CONFIG.ogImageUseCover && data.cover ? data.cover : data.ogImage,
      })),
})

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      nameEn: z.string(),
      description: z.string(),
      descriptionEn: z.string(),
      summary: z.string().optional(),
      summaryEn: z.string().optional(),
      year: z.number().optional(),
      role: z.array(z.string()).default([]),
      roleEn: z.array(z.string()).default([]),
      sectionsEn: z.array(z.object({ heading: z.string(), body: z.array(z.string()) })).default([]),
      githubUrl: z.string().optional(),
      website: z.string().optional(),
      type: z.string().default('image'),
      cover: image().optional(),
      icon: image().optional(),
      imageClass: z.string().optional(),
      star: z.number().optional(),
      fork: z.number().optional(),
      draft: z.boolean().default(false),
    }),
})

const experiences = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/experiences',
  }),
  schema: z.object({
    company: z.string(),
    companyEn: z.string().optional(),
    role: z.string(),
    roleEn: z.string(),
    period: z.string(),
    location: z.string().optional(),
    summary: z.string(),
    summaryEn: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
    tagsEn: z.array(z.string()).default([]),
    sectionsEn: z.array(z.object({ heading: z.string(), body: z.array(z.string()) })).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { posts, projects, experiences }

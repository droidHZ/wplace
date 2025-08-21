import { defineCollection, defineConfig } from '@content-collections/core';
import { createMetaSchema } from '@fumadocs/content-collections/configuration';

/**
 * 1. Content Collections documentation
 * https://www.content-collections.dev/docs/quickstart/next
 * https://www.content-collections.dev/docs/configuration
 * https://www.content-collections.dev/docs/transform#join-collections
 *
 * 2. Use Content Collections for Fumadocs
 * https://fumadocs.vercel.app/docs/headless/content-collections
 */
const docs = defineCollection({
  name: 'docs',
  directory: 'content/docs',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    preview: z.string().optional(),
    index: z.boolean().default(false),
  }),
});

const metas = defineCollection({
  name: 'meta',
  directory: 'content/docs',
  include: '**/meta**.json',
  parser: 'json',
  schema: createMetaSchema,
});

/**
 * Pages collection for policy pages like privacy-policy, terms-of-service, etc.
 *
 * New format: content/pages/page-slug.{locale}.mdx
 *
 * 1. For a page at content/pages/privacy-policy.mdx (default locale):
 * locale: en
 * slug: /pages/privacy-policy
 * slugAsParams: privacy-policy
 *
 * 2. For a page at content/pages/privacy-policy.zh.mdx (Chinese locale):
 * locale: zh
 * slug: /pages/privacy-policy
 * slugAsParams: privacy-policy
 */
export const pages = defineCollection({
  name: 'page',
  directory: 'content/pages',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    published: z.boolean().default(true),
  }),
});

/**
 * Releases collection for changelog
 *
 * New format: content/release/version-slug.{locale}.mdx
 *
 * 1. For a release at content/release/v1-0-0.mdx (default locale):
 * locale: en
 * slug: /release/v1-0-0
 * slugAsParams: v1-0-0
 *
 * 2. For a release at content/release/v1-0-0.zh.mdx (Chinese locale):
 * locale: zh
 * slug: /release/v1-0-0
 * slugAsParams: v1-0-0
 */
export const releases = defineCollection({
  name: 'release',
  directory: 'content/release',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    version: z.string(),
    published: z.boolean().default(true),
  }),
});

export default defineConfig({
  collections: [docs, metas, pages, releases],
});

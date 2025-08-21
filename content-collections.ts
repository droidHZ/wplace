import path from 'path';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/routing';
import { console } from '@/lib/logger';
import { defineCollection, defineConfig } from '@content-collections/core';
import {
  createDocSchema,
  createMetaSchema,
  transformMDX,
} from '@fumadocs/content-collections/configuration';

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
    ...createDocSchema(z),
    preview: z.string().optional(),
    index: z.boolean().default(false),
  }),
  transform: transformMDX,
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
  transform: async (data, context) => {
    // Use Fumadocs transformMDX for consistent MDX processing
    const transformedData = await transformMDX(data, context);

    // Get the filename from the path
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || '';

    // Extract locale and base from filename
    const { locale, base } = extractLocaleAndBase(fileName);
    // console.log(`page processed: ${fileName}, base=${base}, locale=${locale}`);

    // Create the slug and slugAsParams
    const slug = `/pages/${base}`;
    const slugAsParams = base;

    return {
      ...data,
      locale,
      slug,
      slugAsParams,
      body: transformedData.body,
      toc: transformedData.toc,
    };
  },
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
  transform: async (data, context) => {
    // Use Fumadocs transformMDX for consistent MDX processing
    const transformedData = await transformMDX(data, context);

    // Get the filename from the path
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || '';

    // Extract locale and base from filename
    const { locale, base } = extractLocaleAndBase(fileName);
    // console.log(`release processed: ${fileName}, base=${base}, locale=${locale}`);

    // Create the slug and slugAsParams
    const slug = `/release/${base}`;
    const slugAsParams = base;

    return {
      ...data,
      locale,
      slug,
      slugAsParams,
      body: transformedData.body,
      toc: transformedData.toc,
    };
  },
});

/**
 * Helper function to extract locale and base name from filename
 * Handles filename formats:
 * - name -> locale: DEFAULT_LOCALE, base: name
 * - name.zh -> locale: zh, base: name
 *
 * @param fileName Filename without extension (already has .mdx removed)
 * @returns Object with locale and base name
 */
function extractLocaleAndBase(fileName: string): {
  locale: string;
  base: string;
} {
  // Split filename into parts
  const parts = fileName.split('.');

  if (parts.length === 1) {
    // Simple filename without locale: xxx
    return { locale: DEFAULT_LOCALE, base: parts[0] };
  }
  if (parts.length === 2 && LOCALES.includes(parts[1])) {
    // Filename with locale: xxx.zh
    return { locale: parts[1], base: parts[0] };
  }
  // Unexpected format, use first part as base and default locale
  console.warn(`Unexpected filename format: ${fileName}`);
  return { locale: DEFAULT_LOCALE, base: parts[0] };
}

export default defineConfig({
  collections: [docs, metas, pages, releases],
});

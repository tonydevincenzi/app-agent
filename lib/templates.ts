export function getTemplateIdSuffix(id: string) {
  // Temporarily disabled -dev suffix until templates are built
  // const isDev = process.env.NODE_ENV === 'development'
  // return isDev ? `${id}-dev` : id
  return id
}

export function getTemplateId(id: string) {
  return id.replace(/-dev$/, '')
}

const templates = {
  [getTemplateIdSuffix('nextjs-developer')]: {
    name: 'Next.js developer',
    lib: [
      'nextjs@14.2.5',
      'typescript',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'postcss',
      'tailwindcss',
      'shadcn',
    ],
    file: 'pages/index.tsx',
    instructions:
      'A Next.js 13+ app that reloads automatically. Using the pages router. IMPORTANT: Design with mobile-first responsive approach using Tailwind CSS. Use mobile-optimized layouts (flex-col on mobile, responsive breakpoints sm:, md:, lg:). Ensure touch-friendly UI with large tap targets (min 44px), readable text (min 16px base), and thumb-friendly bottom navigation. Test all interactions for mobile usability.',
    port: 3000,
  },
}

export type Templates = typeof templates
export default templates

export function templatesToPrompt(templates: Templates) {
  return `${Object.entries(templates)
    .map(
      ([id, t], index) =>
        `${index + 1}. ${id}: "${t.instructions}". File: ${t.file || 'none'}. Dependencies installed: ${t.lib.join(', ')}. Port: ${t.port || 'none'}.`,
    )
    .join('\n')}`
}

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
  'code-interpreter-v1': {
    name: 'Python data analyst',
    lib: [
      'python',
      'jupyter',
      'numpy',
      'pandas',
      'matplotlib',
      'seaborn',
      'plotly',
    ],
    file: 'script.py',
    instructions:
      'Runs code as a Jupyter notebook cell. Strong data analysis angle. Can use complex visualisation to explain results.',
    port: null,
  },
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
  [getTemplateIdSuffix('vue-developer')]: {
    name: 'Vue.js developer',
    lib: ['vue@latest', 'nuxt@3.13.0', 'tailwindcss'],
    file: 'app/app.vue',
    instructions:
      'A Vue.js 3+ app that reloads automatically. Only when asked specifically for a Vue app. Design mobile-first with responsive Tailwind classes, touch-optimized interactions, and mobile-friendly layouts.',
    port: 3000,
  },
  [getTemplateIdSuffix('streamlit-developer')]: {
    name: 'Streamlit developer',
    lib: [
      'streamlit',
      'pandas',
      'numpy',
      'matplotlib',
      'requests',
      'seaborn',
      'plotly',
    ],
    file: 'app.py',
    instructions: 'A streamlit app that reloads automatically. Configure for mobile viewing with st.set_page_config(layout="wide", initial_sidebar_state="collapsed") and use mobile-friendly components.',
    port: 8501,
  },
  [getTemplateIdSuffix('gradio-developer')]: {
    name: 'Gradio developer',
    lib: [
      'gradio',
      'pandas',
      'numpy',
      'matplotlib',
      'requests',
      'seaborn',
      'plotly',
    ],
    file: 'app.py',
    instructions:
      'A gradio app. Gradio Blocks/Interface should be called demo. Use mobile-responsive themes (gr.themes.Soft() or gr.themes.Glass()) and ensure UI elements are touch-friendly with appropriate sizing for mobile devices.',
    port: 7860,
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

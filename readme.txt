AI-POWERED APP GENERATOR
=====================================

OVERVIEW
--------
App Agent is an AI-powered application generator that allows users to create 
interactive web applications through natural language conversation. The app uses 
large language models (LLMs) to generate code applications based on user prompts 
and automatically deploys them to E2B sandboxes for live preview.

FEATURES
--------
- Chat-based interface for generating applications
- Support for multiple LLM providers (OpenAI, Anthropic, Google, Mistral, etc.)
- Automatic code generation and deployment
- Live preview of generated applications
- Multiple template support (Next.js, Streamlit, Gradio, Vue, Code Interpreter)
- Rate limiting for API requests
- Multi-modal input support (text and images)
- Real-time code streaming
- Code editing with morph/apply functionality
- Theme support (dark/light mode)
- Analytics integration (PostHog, Vercel Analytics)

TECHNOLOGIES
------------
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- E2B Code Interpreter
- Supabase (authentication)
- Vercel KV (rate limiting via Upstash)
- AI SDK (Vercel AI SDK)
- Radix UI components
- PostHog (analytics)

INSTALLATION
------------
1. Install dependencies:
   npm install

2. Set up environment variables (see ENVIRONMENT VARIABLES section)

3. Run the development server:
   npm run dev

4. Build for production:
   npm run build

5. Start production server:
   npm start

ENVIRONMENT VARIABLES
---------------------
Required environment variables (create a .env.local file):

- E2B_API_KEY: API key for E2B sandbox service
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (for authentication)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key
- KV_REST_API_URL: Vercel KV REST API URL (for rate limiting)
- KV_REST_API_TOKEN: Vercel KV REST API token
- RATE_LIMIT_MAX_REQUESTS: Maximum requests per rate limit window (default: 10)
- RATE_LIMIT_WINDOW: Rate limit window duration (default: 1d)
- NEXT_PUBLIC_POSTHOG_KEY: PostHog project key (optional, for analytics)
- NEXT_PUBLIC_POSTHOG_HOST: PostHog host URL (optional)
- NEXT_PUBLIC_USE_MORPH_APPLY: Enable morph/apply feature (true/false)

Optional API keys for LLM providers (if not using default keys):
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- GOOGLE_GENERATIVE_AI_API_KEY
- FIREWORKS_API_KEY
- MISTRAL_API_KEY
- (and others as needed)

AVAILABLE TEMPLATES
-------------------
1. nextjs-developer
   - Next.js 14+ with TypeScript
   - Tailwind CSS for styling
   - Pages router
   - Mobile-first responsive design
   - Port: 3000

2. streamlit-developer
   - Streamlit Python applications
   - Port: 8501

3. gradio-developer
   - Gradio Python applications
   - Port: 7860

4. vue-developer
   - Vue.js/Nuxt applications
   - Port: 3000

5. code-interpreter-v1
   - Python code execution environment
   - No web interface, returns execution results

PROJECT STRUCTURE
-----------------
app/
  - actions/          Server actions
  - api/              API routes (chat, sandbox, morph-chat, generate-message)
  - layout.tsx        Root layout
  - page.tsx          Main page component
  - providers.tsx     Context providers

components/
  - chat.tsx          Chat interface component
  - chat-input.tsx    Chat input component
  - preview.tsx       Code preview component
  - fragment-*.tsx    App-related components
  - ui/               Reusable UI components (Radix UI)

lib/
  - api-errors.ts     Error handling utilities
  - auth.ts           Authentication utilities
  - models.ts         LLM model configuration
  - prompt.ts         Prompt generation
  - schema.ts         Zod schemas for apps
  - templates.ts      Template definitions
  - types.ts          TypeScript type definitions

sandbox-templates/   Template build configurations

HOW IT WORKS
------------
1. User enters a prompt describing the application they want to create
2. The app sends the prompt to the selected LLM provider
3. The LLM generates application code following the schema and template
4. Generated code is streamed back to the user in real-time
5. Code is automatically deployed to an E2B sandbox
6. User receives a live URL to preview the generated application
7. User can continue chatting to modify and iterate on the application

API ENDPOINTS
-------------
- POST /api/chat
  Main endpoint for generating apps using LLM

- POST /api/morph-chat
  Endpoint for modifying existing apps

- POST /api/sandbox
  Creates and deploys the app to E2B sandbox

- POST /api/generate-message
  Generates friendly assistant messages about what's being built

RATE LIMITING
-------------
Rate limiting is enforced per IP address when users don't provide their own 
API keys. Default limits:
- Max requests: 10
- Window: 1 day

SUPPORTED LLM MODELS
--------------------
The app supports models from various providers:
- OpenAI (GPT series)
- Anthropic (Claude series)
- Google (Gemini, Vertex AI)
- Mistral
- Fireworks AI
- DeepSeek
- Together AI
- Groq
- X.AI
- Ollama (local models)

Currently filtered to show only:
- GPT-5 series
- Sonnet 4.5 series
- Haiku 4.5 series

DEVELOPMENT
-----------
- Uses Next.js Turbo mode for faster development
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (with import sorting)

LICENSE
-------
(Add your license information here)

CONTRIBUTING
-----------
(Add contribution guidelines here)

SUPPORT
-------
(Add support/contact information here)


# AGENTS.md - InPageEdit Analytics Next

## Project Overview

A Nuxt 4 + Vue 3 analytics dashboard for InPageEdit usage statistics, deployed on Cloudflare Workers with D1 database and KV storage.

## Build Commands

Package manager: pnpm

```bash
# Development
pnpm run dev              # Start dev server on port 20105

# Production
pnpm run build            # Build for production
pnpm run generate         # Static site generation
pnpm run preview          # Preview production build

# Database (Drizzle ORM)
pnpm run drizzle:generate    # Generate migrations
pnpm run drizzle:push        # Apply migrations to local D1
pnpm run drizzle:push-prod   # Apply migrations to production D1
pnpm run drizzle:studio      # Open Drizzle Studio (local)
pnpm run drizzle:studio-prod # Open Drizzle Studio (production)
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with explicit types
- Prefer `interface` over `type` for object shapes
- Use PascalCase for interfaces/types (e.g., `IPEBeaconPayload`)
- Use camelCase for variables/functions
- Use UPPER_SNAKE_CASE for constants
- Import modules ends with `.js` extension for ESM compatibility (e.g., `import { eventLogTable } from '~~/db/schema.js'`)

### Vue Components

- Use `<script setup lang="ts">` syntax
- Use self-closing tags for components without slots
- Use kebab-case for custom components in templates
- Place composables at top of script, then reactive data, then methods

### Imports

```typescript
// 1. External libraries (alphabetical)
import { and, count, eq } from 'drizzle-orm'
import * as echarts from 'echarts'

// 2. Nuxt/Vue auto-imports (no explicit import needed)
// ref, computed, onMounted, useFetch, etc.

// 3. Internal aliases
import { eventLogTable } from '~~/db/schema.js'
import type { AnalyticsResponse } from '#shared/types/AnalyticsResponse'
import { checkWikiTitle } from '~/shared/utils/wikiTitle'
```

### Naming Conventions

- **Files**: camelCase for utilities (e.g., `useCloudflare.ts`)
- **Components**: PascalCase (e.g., `AppHeader.vue`)
- **API Routes**: kebab-case (e.g., `submit.post.ts`)
- **Database tables**: snake_case (e.g., `event_log`, `wiki_site`)
- **Composables**: use prefix (e.g., `useDrizzle`, `useCF`)

### Error Handling

```typescript
// API routes - return JSON with status
return Response.json({ error: 'Invalid parameters' }, { status: 400 })

// Use optional chaining and nullish coalescing
const total = rows[0]?.total ?? 0

// Validate with Zod for external inputs
const schema = z.object({ siteId: z.number().optional() })
```

### Database (Drizzle ORM)

- Use `casing: 'snake_case'` in Drizzle config
- Define tables in `db/schema.ts` with proper indexes
- Use `useDrizzle(event)` composable in API routes
- Reference tables with `~~/db/schema.js` import

### Styling

- Use Tailwind CSS utility classes
- Use `@nuxt/ui` components (UButton, UCard, etc.)
- Dark mode support via `dark:` prefix
- Custom animations in `app/assets/styles/main.css`

### Comments

- Use English for code comments
- Use Chinese only for UI text and user-facing content
- JSDoc for utility functions with @param and @returns

### API Patterns

```typescript
// Standard API response format
export default eventHandler(async (event) => {
  const query = getQuery(event)
  // Parse and validate parameters
  const siteId = parseInt(String(query.siteId || ''))

  // Get database instance
  const drizzle = useDrizzle(event)

  // Return standardized response
  return Response.json({
    data: result,
    filters: { siteId, userId, start, end },
  })
})
```

## Project Structure

```
app/              # Nuxt app (pages, components, layouts)
  components/     # Vue components
  pages/          # File-based routing
  layouts/        # Page layouts
  assets/styles/  # Global CSS
server/           # Nitro server
  api/            # API routes
  utils/          # Server utilities
  plugins/        # Server plugins
  middleware/     # Server middleware
  routes/         # Custom routes
shared/           # Shared code
  types/          # TypeScript types
  utils/          # Shared utilities
db/               # Database schema
```

## Key Technologies

- **Framework**: Nuxt 4, Vue 3, TypeScript 5
- **Database**: Cloudflare D1 with Drizzle ORM
- **Cache**: Cloudflare Workers KV
- **UI**: Nuxt UI, Tailwind CSS 4
- **Charts**: ECharts 6
- **Validation**: Zod 4

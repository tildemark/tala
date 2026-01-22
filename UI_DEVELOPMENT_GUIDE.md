# TALA UI Development Quick Guide

## Running the Application

```bash
# Start all dev servers
cd c:\code\tala
pnpm dev

# Frontend: http://localhost:3000
# API: http://localhost:3001
# Swagger Docs: http://localhost:3001/api-docs
```

---

## Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with TALAMainLayout
│   │   ├── globals.css             # Global styles & CSS variables
│   │   ├── page.tsx                # Dashboard
│   │   └── accounting/             # Accounting pages
│   ├── components/
│   │   ├── layouts/
│   │   │   └── tala-main-layout.tsx  # Custom layout (sidebar + header)
│   │   ├── ui/                     # Reusable UI components (from Metronic)
│   │   └── ...
│   └── lib/
│       └── utils.ts                # Utility functions (cn, formatCurrency, etc.)
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── public/                          # Static assets
```

---

## CSS & Styling System

### Tailwind CSS 4
Write styles using Tailwind utility classes:

```tsx
<div className="bg-background text-foreground border border-border rounded-lg p-4">
  Content here
</div>
```

### CSS Variables
Automatically light/dark mode aware:

```tsx
// Semantic colors (work in light AND dark mode)
- bg-background      // Page background
- text-foreground    // Text color
- bg-card           // Card backgrounds
- border-border     // Borders
- text-muted        // Muted text
- bg-primary        // Primary buttons/highlights
```

### Dark Mode
Wrap app with `ThemeProvider` (already done in `layout.tsx`):

```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <App />
</ThemeProvider>
```

User's dark/light preference automatically detected and applied.

---

## Layout Structure

### Main Layout Component
File: `src/components/layouts/tala-main-layout.tsx`

- **Sidebar**: Left navigation menu (collapsible)
- **Header**: Top bar with app title
- **Content Area**: Main page content (scrollable)
- **Footer**: Optional additional controls

### Adding Menu Items
Edit menu items array in `tala-main-layout.tsx`:

```tsx
const menuItems = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: '📑' },
  // ... add more items
];
```

---

## Creating New Pages

### 1. Create Page File
```bash
apps/web/src/app/section/page-name/page.tsx
```

### 2. Basic Template
```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Page Title</h1>
      {/* Your content here */}
    </div>
  );
}
```

### 3. Auto-Wrapped in Layout
- TALAMainLayout automatically applies sidebar + header
- No need to import or wrap anything
- Just write your page content

---

## Using API Data

### Fetching Data
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/endpoint')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      {/* Display data */}
    </div>
  );
}
```

### API Endpoints (localhost:3001)
- `GET /api/dashboard/metrics` - Dashboard KPIs
- `GET /api/accounting/chart-of-accounts` - COA list
- `GET /api/accounting/journal-entries` - Journal entries
- Full docs: http://localhost:3001/api-docs

---

## Using Metronic UI Components

Pre-built components available in `src/components/ui/`:

### Data Table
```tsx
import { DataTable } from '@/components/ui/data-table';

<DataTable columns={columns} data={data} />
```

### Forms
```tsx
import { Form } from '@/components/ui/form';

<Form {...form}>
  <FormField name="email" label="Email" />
</Form>
```

### Charts
```tsx
import ApexCharts from 'apexcharts';

// Use ApexCharts for financial visualizations
```

---

## Utility Functions

### Formatting
```tsx
import { formatCurrency, formatDate, cn } from '@/lib/utils';

// Currency formatting (PHP)
formatCurrency(1000)  // ₱1,000.00

// Date formatting
formatDate(new Date())  // Jan 15, 2026

// Tailwind class merging
cn('bg-red-500', condition && 'bg-blue-500')  // Smart class merge
```

---

## Common Tasks

### Adding a Button
```tsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
  Click Me
</button>
```

### Adding a Card
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Adding a Form Input
```tsx
<input 
  type="text"
  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
  placeholder="Enter text"
/>
```

---

## Debugging

### Check Tailwind Classes
- Open browser DevTools
- Inspect element to see applied classes
- Verify CSS variables are resolved (check Computed Styles)

### Check API Connectivity
- Open http://localhost:3001/api-docs
- Test endpoints directly in Swagger UI
- Check browser Console for fetch errors

### Check Layout
- Sidebar should render on left
- Header should render on top
- Content should fill remaining space
- Test sidebar toggle (click menu icon)

---

## Troubleshooting

### Styles Not Applying
1. Make sure using Tailwind classes (e.g., `bg-red-500` not `background-color: red`)
2. Verify class names are correct
3. Check browser DevTools that classes are present
4. Restart dev server if adding new CSS variables

### API Errors
1. Check API is running (`http://localhost:3001` should show "TALA API")
2. Check Swagger docs for correct endpoint paths
3. Verify request method (GET, POST, etc.)
4. Check browser Console for error details

### Dark Mode Not Working
- Ensure `ThemeProvider` wraps your app (check `layout.tsx`)
- Add `suppressHydrationWarning` to `<html>` tag
- Theme class should be added to `<html>` element

---

## TypeScript Support

Full TypeScript support for:
- React components
- API types
- Utility functions
- Page props

Check `tsconfig.json` for path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Use `@/` prefix to import from `src/`:
```tsx
import { cn } from '@/lib/utils';
import { TALAMainLayout } from '@/components/layouts/tala-main-layout';
```

---

## Performance Tips

1. **Use 'use client'** only where needed (for interactivity)
2. **Lazy load** heavy components with `dynamic()`
3. **Memoize** expensive computations with `useMemo`
4. **Use** `useCallback` for event handlers
5. **Code split** pages automatically (Next.js feature)

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- TALA Codebase: `.github/copilot-instructions.md`
- API Swagger: `http://localhost:3001/api-docs`

---

## Quick Commands

```bash
# Start dev servers
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Database operations
pnpm db:push      # Sync Prisma schema to DB
pnpm db:seed      # Populate test data

# View API docs
# Open http://localhost:3001/api-docs
```

---

## Architecture Overview

```
User Browser (localhost:3000)
        ↓
Next.js Frontend (React)
        ↓
API Routes / Express Backend (localhost:3001)
        ↓
PostgreSQL Database + Redis Cache
```

All multi-tenant requests include `tenantId` in JWT token, enforced by `@tala/auth` middleware.

---

**Happy coding! 🚀**

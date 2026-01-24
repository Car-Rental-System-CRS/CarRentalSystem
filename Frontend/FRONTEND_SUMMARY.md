# Frontend Summary - Car Rental System

## Overview

This is a **Next.js 16** application built with **React 19**, **TypeScript**, and **TailwindCSS**. The project follows the Next.js App Router architecture with a well-organized folder structure separating authenticated and unauthenticated routes.

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | ^16.0.10 |
| UI Library | React | ^19.1.0 |
| Language | TypeScript | ^5.5.3 |
| Styling | TailwindCSS | ^3.4.1 |
| Authentication | NextAuth.js | ^5.0.0-beta.25 |
| HTTP Client | Axios | ^1.13.2 |
| Form Handling | React Hook Form | ^7.71.1 |
| Validation | Zod | ^4.3.6 |
| UI Components | shadcn/ui (New York style) | - |
| Icons | Lucide React | ^0.563.0 |

---

## Dependencies

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework with App Router |
| `react` / `react-dom` | UI library |
| `next-auth` | Authentication (Credentials provider) |
| `axios` | HTTP client for API calls |
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | Form validation resolvers |
| `zod` | Schema validation |
| `sonner` | Toast notifications |
| `next-themes` | Theme management |
| `class-variance-authority` | UI component variants |
| `clsx` | Conditional classnames |
| `tailwind-merge` | Merge Tailwind classes |
| `tailwindcss-animate` | Animation utilities |
| `lucide-react` | Icon library |
| `@radix-ui/react-slot` | Primitive component composition |
| `@radix-ui/react-label` | Label primitive component |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `eslint` / `eslint-config-next` | Linting |
| `prettier` | Code formatting |
| `husky` | Git hooks |
| `@commitlint/cli` | Commit message linting |
| `lint-staged` | Run linters on staged files |
| `postcss` | CSS processing |

---

## Project Structure

```
Frontend/
├── public/                          # Static assets
│   └── assets/
│       └── images/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── not-found.tsx            # 404 page
│   │   ├── robots.ts                # SEO robots.txt
│   │   ├── sitemap.ts               # SEO sitemap
│   │   ├── (auth)/                  # 🔒 Protected routes (authenticated)
│   │   │   ├── layout.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── (unauth)/                # 🌐 Public routes (unauthenticated)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── products/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       └── ProductCard.tsx
│   │   │   ├── sign-in/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       └── SignInForm.tsx
│   │   │   └── sign-up/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── components/
│   │   │           └── SignUpForm.tsx
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts     # NextAuth API route
│   ├── components/                  # Global components
│   │   ├── ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Label.tsx
│   │       ├── sonner.tsx
│   │       └── Tag.tsx
│   ├── lib/                         # Third-party library configs
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── axios.ts                 # Axios instance
│   │   ├── errorHandler.ts          # Error handling utilitiesonents
│   │       ├── Button.tsx
│   │       └── Tag.tsx
│   ├── lib/                         # Third-party library configs
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── axios.ts                 # Axios instance
│   │   └── utils.ts                 # Utility functions (cn)
│   ├── services/                    # API service layer
│   │   └── userService.ts
│   ├── styles/
│   │   └── global.css               # Global styles & Tailwind imports
│   ├── types/                       # TypeScript type definitions
│   │   ├── global.ts
│   │   └── user.ts
│   └── utils/                       # Helper functions
│       └── helpers.ts
├── components.json                  # shadcn/ui configuration
├── tailwind.config.ts               # TailwindCSS configuration
├── tsconfig.json                    # TypeScript configuration
├── next.config.mjs                  # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration
├── commitlint.config.ts             # Commit linting rules
├── lint-staged.config.js            # Lint-staged configuration
└── package.json
```

---

## Key Architecture Patterns

### 1. Route Groups
The app uses Next.js route groups to organize routes:
- **`(auth)`** - Protected routes requiring authentication
- **`(unauth)`** - Public routes accessible without login

### 2. Path Aliases
Configured in `tsconfig.json`:
```json
{
  "@/*": ["./src/*"],
  "@/public/*": ["./public/*"]
}
```

### 3. Component Organization
- **Global components**: `src/components/` - Shared across the app
- **UI primitives**: `src/components/ui/` - shadcn/ui styled components
- **Page-specific components**: `src/app/**/components/` - Colocated with pages

### 4. Service Layer
API calls are abstracted in `src/services/` for separation of co

### 6. Error Handling
- Centralized error handling in `src/lib/errorHandler.ts`
- Toast notifications using **Sonner**
- Support for multiple error types (validation, authentication, network, server)
- Axios and Zod error parsing
- Development mode error logging

---

## Error Handler Features

The Available Components
- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link) and sizes
- **Card**: Container with header, content, and footer sections
- **Input**: Styled input fields with focus states
- **Label**: Form labels with accessibility support
- **Toaster**: Toast notification system using Sonner

### error handler provides comprehensive error management:

```typescript
// Error Types
- VALIDATION: Form validation errors (4xx)
- AUTHENTICATION: 401 errors
- AUTHORIZATION: 403 errors
- NOT_FOUND: 404 errors
- SERVER: 5xx errors
- NETWORK: Network connectivity issues
- UNKNOWN: Unexpected errors

// Helper Functions
- handleError(error, customMessage?): Display error toast
- handleSuccess(message, description?): Display success toast
- getErrorMessage(error): Extract readable error message
- getErrorType(statusCode): Determine error category
- showLoading(message): Display loading toast
- dismissToast(toastId): Dismiss specific toast
- handlePromise(promise, messages): Promise-based toast
```

---

## Toast Notifications

Using **Sonner** for beautiful toast notifications:
- **Position**: Top-right
- **Features**: Rich colors, close button, auto-dismiss
- **Types**: Success, Error, Loading, Promise
- **Styling**: Integrated with app themencerns.

### 5. Authentication
- Uses **NextAuth.js v5** with Credentials provider
- Auth configuration in `src/lib/auth.ts`
- API route handler at `src/app/api/auth/[...nextauth]/route.ts`

---

## UI Component System

### shadcn/ui Configuration
- **Style**: New York
- **Base Color**: Neutral
- **Icon Library**: Lucide
- **CSS Variables**: Enabled
- **RSC Support**: Enabled

### Button Component Variants
```typescript
variants: {
  variant: ["default", "destructive", "outline", "secondary", "ghost", "link"],
  size: ["default", "sm", "lg", "icon"]
}
```

### Theme Colors (TailwindCSS)
Extends default theme with CSS variable-based colors:
- `primary`, `secondary`, `muted`, `accent`, `destructive`
- `card`, `popover`, `border`, `input`, `ring`
- Chart colors (`chart-1` through `chart-5`)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run check-types` | TypeScript type checking |
| `npm run format` | Format code with ESLint & Prettier |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Frontend application URL |
| `NEXT_PUBLIC_SERVER_URL` | Backend API URL (default: `http://localhost:8080`) |
| `VERCEL_URL` | Auto-set by Vercel for deployments |

---

## Code Quality Tools

- **ESLint**: JavaScript/TypeScript linting with Next.js config
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Enforces conventional commit messages
- **Lint-staged**: Runs linters on staged files only

---

## TypeScript Configuration

Strict mode enabled with additional safety checks:
- `strictNullChecks`: true
- `noUncheckedIndexedAccess`: true
- `noImplicitAny`: true
- `noImplicitReturns`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true

---

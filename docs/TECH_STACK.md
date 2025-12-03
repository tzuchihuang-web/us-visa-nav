# Tech Stack Documentation

## Overview
This document outlines the technical decisions and architecture for the **us-visa-nav** project.

## Technology Choices

### Frontend Framework: Next.js
**Why Next.js?**
- Beginner-friendly with excellent documentation
- Built-in routing and SSR (Server-Side Rendering) out of the box
- Seamless integration with Supabase for authentication
- Excellent developer experience with hot reloading
- Can handle both frontend UI and backend API routes in one codebase

**Alternatives Considered:**
- React + Vite (more manual setup)
- HTML/CSS/JavaScript (too limited for complex features)

---

### Backend & Database: Supabase
**Why Supabase?**
- PostgreSQL database with built-in authentication
- Real-time capabilities for live updates
- User account management handled automatically
- Free tier generous for development
- Easy integration with Next.js
- Can store user progress, visa preferences, and document checklists

**Key Features We'll Use:**
- Authentication (sign up, login, sessions)
- PostgreSQL database (user profiles, visa data, progress tracking)
- Real-time subscriptions (for live updates)
- Row-level security (for protecting user data)

**Setup:**
- Supabase account: Already created ✅
- Environment variables: `.env.local` (Supabase URL, API key)

---

### Styling & UI Components: Shadcn/ui + Tailwind CSS
**Why Shadcn/ui?**
- Pre-built, accessible React components
- Built on Tailwind CSS (easy to customize)
- Modern, balanced aesthetic (matches your design goals)
- Saves development time (no need to build buttons, forms, cards from scratch)
- Integrates perfectly with Figma designs

**What Shadcn/ui Provides:**
- Buttons, Cards, Forms, Modals, Dropdowns, etc.
- All components are accessible (WCAG compliant)
- Easy to customize with Tailwind

**Tailwind CSS:**
- Utility-first CSS framework
- Speeds up styling with pre-built classes
- Works seamlessly with Shadcn/ui components

---

### Design Integration: Figma MCP + Code Connect
**Why Figma MCP?**
- Single source of truth for design (everything starts in Figma)
- Code Connect links Figma components to React components
- Design changes automatically inform code updates
- Professional workflow (design → code → shipped)

**How It Works:**
1. Create/update designs in Figma
2. Use Code Connect to link Figma components to React code
3. Developers see design specs directly in code comments
4. Configuration in `.vscode/mcp.json`

**Benefits for You:**
- You control design in Figma (your strength)
- No manual handoff of design specs
- Faster iteration cycle

---

### Language & Type Safety: TypeScript
**Why TypeScript?**
- Catches errors before they become bugs
- Makes code more readable and maintainable
- Excellent IDE support (autocomplete, suggestions)
- Industry standard for professional projects

**Usage:**
- Strict mode enabled for maximum type safety
- All React components typed
- All API responses typed

---

## Project Dependencies

### Core Dependencies
```json
{
  "next": "^15.0.0",                    // Framework
  "react": "^18.0.0",                   // UI library
  "typescript": "^5.0.0",               // Type safety
  "@supabase/supabase-js": "^2.0.0",   // Database & auth
  "tailwindcss": "^3.0.0",             // Styling
  "shadcn-ui": "latest"                 // UI components
}
```

### Development Dependencies
```json
{
  "eslint": "latest",                   // Code linting
  "prettier": "latest",                 // Code formatting
  "jest": "latest",                     // Testing framework
  "typescript": "latest"                // Type checking
}
```

---

## Project Structure

```
/src
  /app                    # Next.js app directory
    /api                  # API routes (backend logic)
    /layout.tsx           # Root layout
    /page.tsx             # Home page
  /components             # Reusable UI components (mapped to Figma)
    /ui                   # Shadcn/ui components
    /visa                 # Visa-specific components
    /common               # Shared components (header, footer, nav)
  /pages                  # Page-level features
    /onboarding           # User discovery flow
    /explorer             # Visa path exploration
    /tracker              # Application tracking
  /services               # Business logic
    /visa.ts              # Visa matching & eligibility
    /user.ts              # User profile management
    /progress.ts          # Progress tracking
  /lib                    # Utilities & helpers
    /supabase.ts          # Supabase client setup
    /constants.ts         # App constants & visa data
  /types                  # TypeScript interfaces
    /visa.ts              # Visa domain models
    /user.ts              # User types
    /database.ts          # Supabase schema types
  /styles                 # Global styles
    /globals.css          # Tailwind imports
  /hooks                  # Custom React hooks
    /useAuth.ts           # Authentication hook
    /useVisa.ts           # Visa logic hook
/public                   # Static assets (images, icons, eagle mascot)
/tests                    # Test files (mirror src structure)
/docs                     # Documentation
  /TECH_STACK.md         # This file
  /VISA_CATEGORIES.md    # Visa types documentation
  /DATABASE_SCHEMA.md    # Supabase schema design
/.vscode                  # VS Code config
  /mcp.json              # Figma MCP configuration
```

---

## Development Workflows

### Getting Started
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and API key

# 3. Start development server
npm run dev
# Visit http://localhost:3000
```

### Development Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run test        # Run unit tests
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript type checking
```

### Code Quality Standards
- **Type Safety**: Strict TypeScript throughout
- **Testing**: Aim for >80% coverage on business logic
- **Accessibility**: WCAG 2.1 AA standard minimum
- **Documentation**: JSDoc comments for public APIs and complex workflows
- **Formatting**: Prettier for automatic code formatting
- **Linting**: ESLint for code quality

---

## Database Schema (Supabase PostgreSQL)

### Key Tables
- `users` - User profiles and authentication
- `visa_categories` - Visa types (F-1, H-1B, etc.)
- `user_preferences` - User's visa interests and goals
- `visa_progress` - Tracking current application stage
- `document_checklist` - Required documents for each visa path

### Authentication
- Built-in Supabase Auth (email/password, OAuth options)
- Sessions managed automatically
- Row-level security for data privacy

---

## Deployment Strategy

### Hosting Options
- **Vercel** (recommended for Next.js, integrates with Supabase)
- **Netlify** (alternative)
- **Docker + VPS** (if you want full control)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Key Integration Points

### Figma → Code
1. Design components in Figma
2. Use Code Connect to document React equivalents
3. Reference Figma specs in JSDoc comments

### User Data Flow
1. User creates account (Supabase Auth)
2. Profile stored in `users` table
3. Visa selections → `user_preferences` table
4. Progress tracked in `visa_progress` table

### Visa Logic
1. User enters current status & goals
2. System queries visa eligibility (business logic in `/services/visa.ts`)
3. Matches available visa paths (F-1, H-1B, O-1, etc.)
4. Returns recommended paths with timelines & requirements

---

## Next Steps

1. ✅ Tech stack confirmed
2. ⏳ Scaffold Next.js project structure
3. ⏳ Set up Supabase integration
4. ⏳ Create core visa domain types
5. ⏳ Build onboarding flow UI
6. ⏳ Implement visa matching logic

---

## Questions or Changes?

If you want to reconsider any technology choice or add new requirements, let's discuss before we start coding. Better to align now than refactor later!

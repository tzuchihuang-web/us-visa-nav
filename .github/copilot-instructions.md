# Copilot Instructions for us-visa-nav

## Project Overview
**us-visa-nav** is a navigation and guidance tool for US visa processes. The project uses **design-first development** with Figma (MCP integration available in `.vscode/mcp.json`).

## Architecture & Components

### Design System
- **Figma Integration**: This project uses Figma as the source of truth for UI design via MCP (Model Context Protocol)
- Figma MCP server URL: `https://mcp.figma.com/mcp`
- When implementing UI components, reference Figma designs first
- Use Code Connect patterns to link design components with code implementations

### Project Structure (To Be Established)
When setting up the codebase, follow this structure:
```
/src
  /components       # Reusable UI components (map to Figma components)
  /pages            # Page-level features for visa navigation
  /services         # Business logic for visa process workflows
  /utils            # Helpers and utilities
  /types            # TypeScript interfaces
/tests              # Test files (mirror src structure)
/docs               # Documentation
```

## Development Workflows

### Initial Setup
- Install dependencies: `npm install` or `yarn install`
- Development server: `npm run dev`
- Build for production: `npm run build`

### Design Integration
1. Check `.vscode/mcp.json` for Figma MCP configuration before starting UI work
2. Always sync component implementations with Figma designs
3. Use semantic tokens from design system (if defined in Figma)

### Testing & Quality
- Unit tests: `npm run test` (expected location: `tests/` or `__tests__/`)
- Linting: `npm run lint` (check for eslint/prettier config)
- Type checking: `npm run type-check` (if TypeScript)
- Pre-commit hooks: Check `.git/hooks/` directory (post-checkout, pre-commit hooks are configured)

## Key Patterns & Conventions

### Visa Navigation Domain
- **Domain Models**: Create types for visa categories (F-1, H-1B, etc.), process steps, and requirements
- **Workflow State**: Model visa application workflows as state machines or step-based sequences
- **Data Flows**: Visa requirements, eligibility rules, and document checklists are primary data entities
- Reference: Start with defining core types in `/src/types/visa.ts` (or similar)

### Component Development
- Map UI components directly to Figma components using Code Connect
- Use component composition patterns for complexity
- Accessibility: Ensure WCAG compliance for visa guidance content (critical for accessibility)

### Configuration
- Environment variables: Create `.env.local` and `.env.example`
- Feature flags: Consider feature toggles for visa categories/workflows

## External Dependencies & Integration Points

### Expected Dependencies
- Design: Figma MCP (configured in `.vscode/mcp.json`)
- Frontend framework: (to be determined - React/Vue/Next.js likely)
- Styling: (to be determined - Tailwind/CSS-in-JS likely)
- State management: (if needed for complex workflows)

### APIs & Data Sources
- If visa data comes from external sources (USCIS, consulate data), create service layer in `/src/services/`
- Document API contracts and update frequency

## Quick Start for New Contributors
1. Review this file and Figma designs in `.vscode/mcp.json`
2. Check git hooks (post-checkout, pre-push) for workflow requirements
3. Follow the established project structure when adding features
4. Reference `/docs` for domain-specific visa terminology
5. Sync UI changes with Figma designs using Code Connect

## Code Quality Standards
- Type safety: Use TypeScript strictly
- Testing: Aim for >80% coverage on business logic
- Accessibility: WCAG 2.1 AA standard minimum for visa guidance UIs
- Documentation: Add JSDoc comments for public APIs and complex workflows

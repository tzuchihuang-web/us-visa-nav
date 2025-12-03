# us-visa-nav
# us-visa-nav
**U.S. Visa Navigation & Guidance Platform**

A friendly, interactive platform that guides users through U.S. visa options, tracks their progress, and reduces stress around the visa application process.

## 🦅 Core Philosophy
- **Fun & Explorable**: Interactive conversations with an eagle mascot guide
- **Relaxed Atmosphere**: Reduce anxiety and stress from visa processes
- **Evidence-Based**: Show real cases and success statistics to inform decisions
- **Personalized**: Account for family, partners, and individual circumstances

## 🚀 Key Features

### User Onboarding & Discovery
- Enter current immigration status and future goals
- Explore visa options from scratch (for undecided users)
- Conversational UI with an interactive eagle guide
- Factor in family/partner considerations and other personal circumstances

### Visa Path Exploration & Comparison
- Visual data visualization showing possible visa directions
- Clear side-by-side comparison of different visa options
- Evidence-based insights (past cases, success statistics, demographic data)
- Path suggestions when users want to pivot to a different route

### Application Tracking & Planning
- Progress tracking showing current process stage
- Document checklist management
- Simple timeline view of visa process steps
- Ability to modify path with updated recommendations

## 📋 Project Structure

```
/src
  /components       # Reusable UI components (mapped to Figma designs)
  /pages            # Page-level features (onboarding, explorer, tracker)
  /services         # Business logic for visa workflows
  /utils            # Helpers and utilities
  /types            # TypeScript interfaces (visa domain models)
/tests              # Test files (mirror src structure)
/docs               # Documentation and visa terminology
```

## 🎨 Design-First Development

This project uses **Figma as the source of truth** for UI design via MCP (Model Context Protocol).
- Configuration: `.vscode/mcp.json`
- Figma MCP server: `https://mcp.figma.com/mcp`
- Components are linked to Figma designs using Code Connect patterns

## 💻 Tech Stack

**For detailed technical decisions and architecture, see [`/docs/TECH_STACK.md`](/docs/TECH_STACK.md)**

Quick overview:
- **Frontend**: Next.js + TypeScript + React
- **Styling**: Shadcn/ui + Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL + Auth)
- **Design Integration**: Figma MCP + Code Connect

## 🛠️ Getting Started

### Installation
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Run linter
npm run type-check # Type checking (TypeScript)
```

## 💻 Development Workflows

### Before Starting UI Work
1. Check `.vscode/mcp.json` for Figma MCP configuration
2. Reference Figma designs as the source of truth
3. Use Code Connect to link implementations with designs

### Code Quality Standards
- **Type Safety**: Strict TypeScript throughout
- **Testing**: Aim for >80% coverage on business logic
- **Accessibility**: WCAG 2.1 AA standard minimum
- **Documentation**: JSDoc comments for public APIs and complex workflows

## 🏗️ Domain Architecture

### Core Domain Models
- **Visa Categories**: F-1, H-1B, O-1, L-1, EB-1, etc.
- **Process Steps**: Application stages, document requirements, timelines
- **Eligibility Rules**: Logic to determine visa options based on user profile
- **Document Checklists**: Requirements for each visa path

### Data Flows
1. User Profile → Visa Eligibility Matching → Path Recommendations
2. Selected Path → Process Timeline & Document Checklist
3. Progress Tracking → Current Stage & Next Steps

## 🔧 Configuration

- **Environment Variables**: Create `.env.local` (see `.env.example`)
- **Feature Flags**: Visa categories/workflows can be toggled via configuration

## 🤝 Contributing

1. Review this README and the Figma designs
2. Check git hooks in `.git/hooks/` for pre-commit requirements
3. Follow the established project structure
4. Reference `/docs` for visa terminology
5. Sync UI changes with Figma designs using Code Connect

## 📚 Documentation

See `/docs` for detailed information on:
- U.S. visa categories and requirements
- Application workflows and timelines
- Domain terminology and concepts

---

**Status**: Early development | **Stack**: TBD (React/Vue, TypeScript, Figma MCP)
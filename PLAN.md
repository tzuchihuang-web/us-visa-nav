# Build Plan: us-visa-nav

**Goal**: Build a working prototype of a U.S. Visa Navigation & Guidance Platform.

**Approach**: Focus on 3 core flows: (1) Sign up/Login, (2) Visa exploration, (3) Application tracker. Use Supabase for authentication and data persistence. Ship a working demo that impresses.

---

## 🔥 MVP Sprint: Minimum Viable Prototype

**Key Principle**: Focus on core functionality. Remove everything that doesn't directly contribute to the demo. Use Supabase for real data persistence. Skip tests, accessibility polish, complex features. Focus on:
1. **Impressive visual design** (clean, professional UI)
2. **Core user flows** (signup → explore → track)
3. **Working functionality** (no dummy buttons)

---

## Phase 1: Setup & Core Pages ✅ COMPLETED

### Step 1: Initialize Next.js + Styling ✅
**Status**: Done
- Next.js 16 with TypeScript and Tailwind CSS v4
- Shadcn/ui components integrated
- Supabase client configured (credentials in `.env.local`)
- GitHub Pages static export configured
- GitHub Actions CI/CD workflow for automated deployment

---

### Step 2: Create Core Folder Structure ✅
**Status**: Done
```
/app
  /layout.tsx
  /page.tsx (home) → Skill-tree + Visa map layout
  /explore/page.tsx (visa explorer)
  /tracker/page.tsx (application tracker)
  /profile/page.tsx (user profile)
/components
  /VisaMap.tsx (journey-based visa map)
  /SkillTree.tsx (left sidebar with skill progression)
  /Header.tsx (navigation)
/lib
  /mapData.ts (visa data + journey logic)
  /types.ts (TypeScript interfaces)
/public
```

---

### Step 3: Build Header & Navigation ✅
**Status**: Done
- `/components/Header.tsx` with navigation links
- Logo ("🦅 US Visa Navigator")
- Links: Home, Explore, Tracker, Profile
- Active link highlighting with `usePathname()`

---

### Step 4: Build Home Page - REDESIGNED ✅
**Status**: Completed with Bonus Implementation
- **Original Design**: CTA buttons pointing to other pages
- **Final Design**: Full-screen split layout showcasing core value proposition:
  - Left panel: **Skill Tree** - 6 interactive skill nodes showing user progression
    - Education, Work Experience, Field of Work, Citizenship, Investment, Language
    - Progress bars, lock indicators, 0-5 skill levels
  - Right panel: **Journey-Based Visa Map** - Interactive visa exploration
    - Tree-based hierarchical layout: Start → Entry → Intermediate → Advanced
    - Starting node highlighted with blue glow effect
    - Curved path connections showing visa progression
    - Hover cards with visa details and action buttons
    - Status badges: 🌟 (starting), ⭐ (recommended), ✓ (available), 🔒 (locked)

**Technical Achievements**:
- Implemented `getStartingVisa()` - Determines map entry point
- Implemented `getEligiblePaths()` - Traverses visa graph for available paths
- Implemented `calculateTreePositions()` - Auto-positions nodes by tier and tier level
- Smart hover card positioning - Cards adjust vertically to stay in viewport
- No document API usage - Compatible with static export (GitHub Pages)

---

### BONUS: Multiple User Profile Scenarios ✅
**Status**: Completed and Tested
Created 4 predefined profiles in `/lib/mapData.ts`:

1. **FRESH_START** (Jordan Smith)
   - No current visa → Shows "Start" node (🚀)
   - Beginner skills: Bachelor's, 1-2 years experience
   - Limited paths until skills improve

2. **F1_STUDENT** (Alex Johnson) - **DEFAULT**
   - Current F-1 visa → Shows F-1 as starting node (🎓)
   - Intermediate skills: Master's, 2-3 years OPT/internship
   - Ready for work visa transitions (H-1B, L-1, O-1)

3. **H1B_PROFESSIONAL** (Priya Sharma)
   - Current H-1B visa → Shows H-1B as starting node
   - Advanced skills: 5+ years, PhD-level education
   - Multiple EB green card paths available

4. **ADVANCED_SEEKER** (Chen Wei)
   - Current EB-2 visa → Shows EB-2 as starting node
   - Expert credentials: PhD, 7+ years, $500k+ investment ready
   - Advanced tier employment-based paths

**To test different profiles**: Edit line 207 in `/lib/mapData.ts`:
```typescript
export const userProfile = PROFILES.F1_STUDENT; // Change to test others
```

---

### Step 5-8: Build Other Core Pages ✅ (In Progress)
**Status**: Partially Complete - Basic page shells exist

- `/explore/page.tsx` - Visa explorer page (basic shell)
- `/tracker/page.tsx` - Application tracker (basic shell)
- `/profile/page.tsx` - User profile (basic shell)

**Note**: These pages need content implementation and backend integration

---

## Phase 2: Authentication & Real Data Integration 🔄 NEXT UP

### Step 5: Build Auth Pages
**Status**: Not Started
- Signup/login pages UI
- Supabase authentication integration
- Session management
- Protected routes

### Step 6: Integrate Supabase Authentication
**Status**: Not Started
- Real user authentication flow
- User profile storage
- Session persistence

---

## Phase 3: Visa Matching & Core Features 📋 PLANNED

### Step 7: Build Visa Matching Algorithm
**Status**: Not Started
- Connect skill-tree to visa eligibility
- Implement matching logic
- Show personalized recommendations

---

## What We've Accomplished 🎉

✅ **Next.js + Tailwind + Shadcn/ui** - Production-ready stack
✅ **GitHub Pages Deployment** - Live at: https://tzuchihuang-web.github.io/us-visa-nav/
✅ **GitHub Actions CI/CD** - Automated static export & deployment
✅ **Innovative Homepage** - Skill-tree + journey map (exceeds original spec)
✅ **Dynamic Visa Logic** - Tree-based path generation from user context
✅ **Multiple Test Scenarios** - 4 predefined profiles for validation
✅ **Professional UI** - Shadcn/ui components with Tailwind styling
✅ **Responsive Design** - Desktop-first (mobile refinement pending)
✅ **TypeScript Strict Mode** - Full type safety
✅ **Smart UX Details** - Hover card viewport clipping prevention

---

## What's Next (Recommended Order)

1. **Phase 2 Step 5-6**: Authentication pages & Supabase integration
   - Unlocks multi-user testing
   - Foundation for real data persistence

2. **Phase 3 Step 7**: Visa matching algorithm
   - Makes homepage interactive and personalized
   - Connects skill progression to visa paths

3. **Remaining Pages**: Explore, Tracker, Profile - full implementation
   - Content and backend integration

---

## Success Criteria ✅

- [x] App runs locally without errors (`npm run dev` works)
- [x] App is deployed to a public URL (GitHub Pages)
- [x] UI looks professional and consistent (Shadcn/ui + Tailwind)
- [x] App works on desktop (mobile polish pending)
- [x] No console errors
- [x] Code is type-safe (TypeScript strict mode)
- [ ] Users can sign up / log in with real authentication
- [ ] Application data persists in Supabase
- [ ] Visa matching works with real user skills


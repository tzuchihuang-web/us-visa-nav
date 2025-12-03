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

## Phase 1: Setup & Core Pages

### Step 1: Initialize Next.js + Styling
**What**: Create a new Next.js project with Tailwind and Shadcn/ui ready to go.

**Commands**:
```bash
cd /workspaces/us-visa-nav
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir
npm install @supabase/supabase-js
npx shadcn-ui@latest init
```

**Setup Supabase**:
1. Get your Supabase credentials (Project URL + Anon Key)
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

**Output**: Working Next.js dev environment
- `npm run dev` works
- Tailwind + Shadcn/ui ready
- TypeScript configured
- Supabase client ready to use

**Time**: 20 minutes

---

### Step 2: Create Core Folder Structure
**What**: Organize your project

**Folders**:
```
/app
  /layout.tsx
  /page.tsx (home)
  /explore/page.tsx (visa explorer)
  /tracker/page.tsx (application tracker)
  /auth/page.tsx (signup/login)
/components
  /VisaCard.tsx
  /ProgressBar.tsx
  /Header.tsx
  /Footer.tsx
/lib
  /mockData.ts (hardcoded visa data)
  /types.ts (TypeScript interfaces)
/public
```

**Time**: 15 minutes

---

### Step 3: Build Header & Navigation
**What**: Create a simple header that appears on all pages

**Component**: `/components/Header.tsx`
- Logo or title ("🦅 US Visa Navigator")
- Nav links (Explore, Track, Profile)
- User menu (login/logout button or user name)

**Time**: 30 minutes

**Validation**: Header appears on every page

---

### Step 4: Build Home Page
**What**: Landing page users see after login

**Page**: `/app/page.tsx`
- Welcome message ("Hi User! Where do you want to go?")
- 3 big CTA buttons:
  1. "Explore Visas" → `/explore`
  2. "Track My Application" → `/tracker`
  3. "View My Profile" → `/profile`
- Some introductory text about the app

**UI**: Use Shadcn Button + Card components

**Time**: 45 minutes

**Validation**: Page renders; buttons link to other pages

---

### Step 5: Build Auth Pages (Real Supabase)
**What**: Signup & login pages with **real Supabase authentication**

**Pages**:
- `/app/auth/page.tsx` - Combined signup/login form
- Email + password inputs
- "Sign Up" / "Log In" buttons that call Supabase auth

**Integration**:
```typescript
// Use Supabase auth in a custom hook
const { signUp, signIn, user } = useSupabaseAuth();
```

**Functionality**:
- Sign up creates new user in Supabase
- Login authenticates against Supabase
- After auth, redirect to home page
- Show error messages if auth fails

**Time**: 60 minutes

**Validation**: Users created in Supabase dashboard; authentication works

---

### Step 6: Create Mock Visa Data & Supabase Types
**What**: Hardcoded visa data + setup Supabase tables for user data

**File**: `/lib/mockData.ts` - Visa catalog (doesn't change)
```typescript
export const VISA_DATA = [
  { id: 'F-1', name: 'F-1 Student Visa', ... },
  { id: 'H-1B', name: 'H-1B Work Visa', ... },
  // ... more visas
];
```

**Supabase Setup**:
1. Create `users` table (auto-managed by Supabase auth)
2. Create `user_profiles` table:
   - `id` (links to auth user)
   - `current_visa` (text)
   - `eligible_visas` (array)
   - `updated_at` (timestamp)
3. Create `applications` table:
   - `id`, `user_id`, `visa_type`, `current_step`, `progress`

**Output**: 
- Visa data ready in code
- Supabase tables ready for persistence
- User data will be saved to Supabase (not just mock)

**Time**: 45 minutes

**Validation**: Tables created in Supabase; can query with Supabase client

---

### Step 7: Build Visa Explorer Page
**What**: Show visa options as cards

**Page**: `/app/explore/page.tsx`
- Grid of visa cards (use `/components/VisaCard.tsx`)
- Each card shows: Name, Description, Processing Time, Cost
- "Learn More" button on each (just opens a modal or detail page)
- Simple filter or search (nice-to-have, not required)

**Component**: `/components/VisaCard.tsx`
- Receives visa data as props
- Displays info with Shadcn/ui Card
- "Select" or "Learn More" button

**Time**: 45 minutes

**Validation**: All visa cards render; buttons clickable

---

### Step 8: Commit & Test
**What**: Make sure everything works locally

**Commands**:
```bash
npm run dev
```

**Test**:
- Home page loads
- Can click to explore page
- Visa cards display
- Can navigate between pages

**Commit**:
```bash
git add .
git commit -m "Day 1: MVP setup - auth pages, home, visa explorer with mock data"
```

**Time**: 15 minutes

---
## Phase 2: Polish & Tracker

### Step 9: Build Application Tracker Page
**What**: Show user's progress on visa application

**Page**: `/app/tracker/page.tsx`
- Current visa status (e.g., "H-1B - In Progress")
- Progress bar (0-100%)
- Step-by-step checklist:
  - [ ] Prepare documents
  - [ ] File I-129 form
  - [ ] Wait for approval
  - [ ] Schedule interview
- Timeline visualization (use Shadcn Progress component)

**Component**: `/components/ProgressBar.tsx`
- Animated progress bar
- Step indicators

**Time**: 60 minutes

**Validation**: Tracker page renders with mock data

---

### Step 10: Add Visa Detail Modal/Page
**What**: Click "Learn More" on a visa card to see details

**Option A** (Easier): Modal popup showing full visa info
**Option B** (Slightly harder): New page `/app/explore/[visaId]/page.tsx`

**Info to Show**:
- Full description
- Step-by-step application process (4-5 steps)
- Required documents checklist
- Estimated timeline
- Cost breakdown
- "Start Application" CTA button

**Time**: 45 minutes

**Validation**: Clicking visa card opens details; looks professional

---

### Step 11: Add Profile Page
**What**: Show user's saved profile

**Page**: `/app/profile/page.tsx`
- Current immigration status
- Visa interests
- Contact info
- "Edit Profile" button (for future)
- "Logout" button

**UI**: Use Shadcn Card layout

**Time**: 30 minutes

**Validation**: Profile page displays user info

---

### Step 12: Add Eagle Mascot & Branding
**What**: Make it fun! Add visual personality

**What to Do**:
- Add an eagle emoji or SVG to header
- Add friendly copy ("Welcome, [User]!")
- Add a "How It Works" section on home page
- Use consistent Tailwind colors (blues/greens for professional feel)
- Add footer with info/links

**Time**: 45 minutes

**Validation**: App feels cohesive and fun

---

### Step 13: Polish UI & Responsive Design
**What**: Make sure it looks good on desktop AND mobile

**Checks**:
- Test on mobile (use browser devtools)
- Ensure cards stack on mobile
- Buttons are tap-friendly
- Text is readable
- No layout breaks

**Tailwind**: Use responsive classes (`md:`, `lg:`, etc.)

**Time**: 45 minutes

**Validation**: Looks good on phone and desktop

---

### Step 14: Add Navigation & Links
**What**: Make sure you can move between all pages

**Navigation**:
- Header has links to: Home, Explore, Tracker, Profile, Logout
- All buttons navigate correctly
- No dead links
- Browser back/forward works

**Time**: 30 minutes

**Validation**: Can navigate entire app

---

### Step 15: Final Polish & Deploy to Vercel
**What**: Ship the prototype live

**Local Tests**:
```bash
npm run dev
```
- Check all pages load
- No console errors
- Forms submit (even if just logging)

**Deploy to Vercel**:
```bash
git add .
git commit -m "Day 2: Complete MVP - tracker, visa details, profile, eagle branding"
git push origin main
```
- Go to https://vercel.com
- Import your GitHub repo
- Deploy (takes ~2 minutes)
- Get live URL to share

**Time**: 30 minutes

**Validation**: App is live at a public URL

---

## What You'll Have in 2 Days 🎉

✅ **Working prototype** deployed to live URL
✅ **3 core flows**:
  1. Sign up / Login (mock, no backend yet)
  2. Explore visa options with details
  3. Track application progress

✅ **Professional UI** with:
  - Clean design using Shadcn/ui
  - Tailwind styling
  - Responsive mobile + desktop
  - Eagle mascot branding

✅ **Fully functional demo** that impresses:
  - Every page works
  - Every button does something
  - Data displays correctly
  - Professional look & feel

---

## What You're Skipping (For Now)

❌ Complex business logic (simple eligibility rules only)
❌ Testing (move to Phase 2)
❌ Accessibility optimization (basic is fine)
❌ Advanced features (AI matching, case studies, etc.)
❌ Email notifications
❌ Payment/billing features

## What You're KEEPING (Real Backend)

✅ **Real Supabase auth** (sign up, login, sessions)
✅ **Real database** (user profiles, applications stored in Supabase)
✅ **Visa catalog** as mock data (doesn't need to be dynamic yet)
✅ **Responsive design**
✅ **Professional UI** with Shadcn/ui

---

## Tips for Success

1. **Do NOT overthink the design**. Use Shadcn/ui defaults. They look professional out of the box.

2. **Use mock data**. Instead of Supabase, just create a `/lib/mockData.ts` file. Keep it simple.

3. **Test in browser constantly**. After every file change, check it looks right.

4. **If you get stuck**, remove the thing causing problems. This is MVP. Every feature is optional.

5. **Focus on the flow**. User should be able to: Sign up → Explore → Track. That's it.

6. **Commit often**. Every hour or two, commit to Git. Easier to rollback if something breaks.

7. **Share the URL** when done. Put it in a demo, send to friends, gather feedback.

---

## Success Criteria

After completing the sprint, you can answer "YES" to:

- [ ] App runs locally without errors (`npm run dev` works)
- [ ] App is deployed to a public URL
- [ ] I can sign up / log in on the demo
- [ ] I can explore visa options and click to see details
- [ ] I can see my application tracker with progress
- [ ] UI looks professional and consistent
- [ ] App works on mobile and desktop
- [ ] No console errors
- [ ] Someone else can use the demo without help

---

## Next Steps (After Sprint Completion)

Once you show this prototype and get feedback:

1. **Add real Supabase auth** (Phase 2 of full plan in `/docs/TECH_STACK.md`)
2. **Connect real database** for user data
3. **Refine based on feedback**
4. **Add tests**
5. **Deploy improvements**

---

## Full Development Plan

After the 2-day sprint, refer to the **original multi-phase plan** in `/docs/TECH_STACK.md` for:
- Phase 2: Real Supabase authentication
- Phase 3: Core domain types
- Phase 4: Home page & dashboard
- Phase 5: Visa explorer
- Phase 6: Application tracker
- Phase 7: Onboarding wizard
- Phase 8-10: Testing, polish, deployment

---

## Go Time! 🚀

Now let's build an impressive prototype. 

**Let's get started!** 🚀


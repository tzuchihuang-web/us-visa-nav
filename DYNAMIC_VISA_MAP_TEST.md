# Dynamic Visa Map - BFS Implementation Test

## Overview
This document describes how to test the new dynamic visa path computation system that uses BFS (breadth-first search) to build reachable visa tiers from a user's current visa.

## What Changed

### Before (Static Tiers)
- Visas were hard-coded into entry/intermediate/advanced tiers
- Same visas shown regardless of user's current position
- All tiers visible at once, even unreachable paths

### After (Dynamic BFS)
- Tiers computed dynamically via BFS from current visa
- Only reachable visas shown (based on `commonNextSteps`)
- Map adapts when `currentVisa` changes
- Tourist/visitor categories filtered out

## Implementation Details

### 1. Adjacency Graph Construction
```typescript
// Built from VISA_KNOWLEDGE_BASE.commonNextSteps
{
  f1: ['opt', 'h1b', 'o1', 'eb2gc'],
  opt: ['h1b', 'o1', 'eb2gc'],
  h1b: ['eb2gc', 'eb1a'],
  // ...
}
```

### 2. BFS Tier Computation
- **Level 0**: Current visa (e.g., F-1)
- **Level 1**: Direct next steps (OPT, H-1B, O-1, EB-2)
- **Level 2**: Visas reachable from Level 1
- **Level 3**: Visas reachable from Level 2

### 3. Category Filtering
**Included**: student, worker, investor, immigrant  
**Excluded**: tourist, visitor, family, special

## Test Scenarios

### Test 1: User with F-1 Visa
**Setup**: Set `userProfile.currentVisa = "f1"`

**Expected Result**:
- Level 0: F-1 (highlighted as "You are here")
- Level 1: OPT, H-1B, O-1, EB-2
- Level 2: (depends on Level 1 connections)
- Level 3: (depends on Level 2 connections)

**Console Logs**:
```
[VisaMapRedesigned] Computing dynamic tiers. Current visa: f1
[VisaMapRedesigned] Starting BFS from: f1
[VisaMapRedesigned] BFS complete. Tiers: {...}
```

**Verification**:
1. ✅ F-1 appears at Level 0 with larger size + glow
2. ✅ Only visas reachable from F-1 are shown
3. ✅ No J-1 or other unrelated entry visas displayed
4. ✅ Connections only between actual commonNextSteps pairs

---

### Test 2: User with H-1B Visa
**Setup**: Set `userProfile.currentVisa = "h1b"`

**Expected Result**:
- Level 0: H-1B
- Level 1: EB-2, EB-1
- Level 2: Naturalization (if reachable)
- No student visas (F-1, OPT) shown

**Console Logs**:
```
[VisaMapRedesigned] Computing dynamic tiers. Current visa: h1b
[VisaMapRedesigned] Starting BFS from: h1b
```

**Verification**:
1. ✅ H-1B at Level 0 (not F-1)
2. ✅ Path shows work → green card progression
3. ✅ Student visas completely hidden
4. ✅ Fewer total nodes (more focused view)

---

### Test 3: User with No Visa (START)
**Setup**: Set `userProfile.currentVisa = null`

**Expected Result**:
- Level 0: START node
- Level 1: Entry-level visas (F-1, J-1)
- Levels 2-3: Empty until user selects a visa

**Console Logs**:
```
[VisaMapRedesigned] No current visa - showing START + entry visas
```

**Verification**:
1. ✅ START node appears at Level 0
2. ✅ Entry-level visas shown at Level 1
3. ✅ Generic starting experience for new users

---

### Test 4: User Changes Current Visa
**Setup**: 
1. Start with `currentVisa = "f1"`
2. Update profile to `currentVisa = "h1b"`

**Expected Result**:
- Map instantly rebuilds via useMemo
- Level 0 switches from F-1 to H-1B
- All tiers recomputed from new starting point

**Console Logs**:
```
[VisaMapRedesigned] Computing dynamic tiers. Current visa: f1
[VisaMapRedesigned] BFS complete. Tiers: {...}
[VisaMapRedesigned] Computing dynamic tiers. Current visa: h1b  // After change
[VisaMapRedesigned] BFS complete. Tiers: {...}
```

**Verification**:
1. ✅ Map updates without page refresh
2. ✅ Previous paths disappear
3. ✅ New paths from H-1B appear
4. ✅ No performance lag (useMemo optimization)

---

### Test 5: Edge Rendering Accuracy
**Setup**: Any visa with defined `commonNextSteps`

**Expected Result**:
- Lines drawn ONLY between visa → commonNextSteps
- No all-to-all connections within tiers
- Sparse graph showing real pathways

**Verification**:
1. ✅ F-1 connects to OPT, H-1B, O-1, EB-2 (per knowledge base)
2. ✅ F-1 does NOT connect to unrelated visas in same tier
3. ✅ Line colors match eligibility (green/blue/gray)

---

## How to Test in Browser

1. **Start dev server**: `npm run dev`
2. **Open app**: http://localhost:3000
3. **Log in** (or complete onboarding if needed)
4. **Open browser console** (F12)
5. **Check logs** for tier computation output
6. **Modify profile** in left panel:
   - Change "Current Visa Status" dropdown
   - Click "Save Profile"
7. **Observe map update**:
   - New current visa highlighted at Level 0
   - New tier structure computed
   - Old paths disappear, new paths appear

## Key Files

| File | Purpose |
|------|---------|
| `components/VisaMapRedesigned.tsx` | Dynamic BFS implementation, tier computation |
| `lib/visa-knowledge-base.ts` | Visa definitions + `commonNextSteps` edges |
| `lib/visa-matching-engine.ts` | Eligibility scoring (green/blue/gray) |
| `components/QualificationsPanel.tsx` | Profile editor (changes currentVisa) |

## Console Debugging

### Useful Console Commands
```javascript
// Check adjacency graph structure
console.log('Adjacency graph:', adjacencyGraph);

// Check current tier structure
console.log('Tiers:', visasByTier);

// Check which visas are reachable
Object.keys(visasByTier).forEach(tier => {
  console.log(`${tier}:`, visasByTier[tier]);
});
```

## Success Criteria

✅ **Dynamic Computation**: Map changes when currentVisa changes  
✅ **BFS Correctness**: Tiers match BFS levels (0, 1, 2, 3)  
✅ **Reachability**: Only shows visas reachable via commonNextSteps  
✅ **Category Filter**: Tourist/visitor visas excluded  
✅ **Edge Accuracy**: Lines match actual commonNextSteps relationships  
✅ **Performance**: useMemo prevents unnecessary recomputation  
✅ **Current Visa Highlight**: Level 0 visa has "You are here" label  
✅ **No Hard-coded Tiers**: Static entry/intermediate/advanced removed  

## Known Limitations

1. **Max 3 levels**: BFS stops at Level 3 to prevent infinite expansion
2. **START node**: Only shown when currentVisa is null
3. **Category restrictions**: Tourist visas never appear on main map
4. **One current visa**: System assumes user has at most one current visa

## Future Enhancements

- [ ] Allow infinite BFS depth (with scrollable map)
- [ ] Show alternative paths (e.g., EB-2 vs EB-5)
- [ ] Highlight recommended vs available paths differently
- [ ] Add "reverse lookup" (what visas lead to this one?)
- [ ] Interactive node expansion (click to see next levels)

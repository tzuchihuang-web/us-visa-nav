# Dynamic Visa Map Implementation - Summary

## What Was Implemented

The visa map now dynamically computes visa progression paths using **Breadth-First Search (BFS)** based on the user's current visa and the `commonNextSteps` relationships defined in the visa knowledge base.

## Key Changes

### 1. Adjacency Graph Construction
- **File**: `components/VisaMapRedesigned.tsx`
- **Function**: `adjacencyGraph` (useMemo)
- Built from `VISA_KNOWLEDGE_BASE[visaId].commonNextSteps`
- Creates directed graph: `visaId → [nextVisaId1, nextVisaId2, ...]`
- Filters to only include allowed categories (student, worker, investor, immigrant)

### 2. BFS Tier Computation
- **File**: `components/VisaMapRedesigned.tsx`
- **Function**: `visasByTier` (useMemo)
- **Algorithm**:
  - Level 0: Current visa (or START if none)
  - Level 1: Visas directly reachable via `commonNextSteps`
  - Level 2: Visas reachable from Level 1 (excluding visited)
  - Level 3: Visas reachable from Level 2
- **Dynamic**: Recomputes when `userProfile.currentVisa` changes

### 3. Reachability Filtering
- Only shows visas reachable from current position
- Unreachable visas are completely hidden
- Creates focused, personalized view

### 4. Category Filtering
- **Included**: student, worker, investor, immigrant
- **Excluded**: tourist, visitor, family, special
- Applied during adjacency graph construction and BFS

### 5. Edge Rendering
- **File**: `components/VisaMapRedesigned.tsx`
- **Function**: `renderConnections()`
- Draws lines based on actual `commonNextSteps` edges (not all-to-all)
- Creates sparse, accurate graph

### 6. START Node
- **File**: `lib/visa-knowledge-base.ts`
- Added special `start` node for users without current visa
- Shows entry-level visas (F-1, J-1) at Level 1

## Files Modified

| File | Changes |
|------|---------|
| `components/VisaMapRedesigned.tsx` | ✅ Complete refactor with BFS implementation |
| `lib/visa-knowledge-base.ts` | ✅ Added START node definition |
| `DYNAMIC_VISA_MAP_TEST.md` | ✅ Created test scenarios document |
| `DYNAMIC_MAP_IMPLEMENTATION.md` | ✅ Created this summary |

## Example Scenarios

### Scenario 1: User with F-1 Student Visa
```
Level 0: F-1 (You are here)
Level 1: OPT, H-1B, O-1, EB-2
Level 2: (visas reachable from Level 1)
Level 3: (visas reachable from Level 2)

✅ Shows student → work → green card path
✅ No J-1 or other unrelated entry visas
```

### Scenario 2: User with H-1B Work Visa
```
Level 0: H-1B (You are here)
Level 1: EB-2, EB-1
Level 2: Naturalization

✅ Shows work → green card → citizenship path
✅ No student visas (F-1, OPT) shown
✅ Focused on work-to-permanent-residence
```

### Scenario 3: User with No Visa
```
Level 0: START
Level 1: F-1, J-1 (entry visas)
Levels 2-3: Empty

✅ Generic starting experience
✅ Shows entry options
```

## Technical Details

### BFS Implementation
```typescript
const visited = new Set<string>();
const queue: Array<{ visaId: string; level: number }> = [
  { visaId: startVisaId, level: 0 }
];

while (queue.length > 0) {
  const { visaId, level } = queue.shift()!;
  const nextSteps = adjacencyGraph[visaId] || [];
  
  for (const nextVisaId of nextSteps) {
    if (visited.has(nextVisaId)) continue;
    visited.add(nextVisaId);
    
    // Assign to tier based on level (0, 1, 2, 3)
    tiers[`level${level + 1}`].push(nextVisaId);
    
    if (level + 1 < 3) {
      queue.push({ visaId: nextVisaId, level: level + 1 });
    }
  }
}
```

### React Integration
```typescript
// Recomputes when currentVisa changes
const visasByTier = useMemo(() => {
  // BFS implementation here
  return tiers;
}, [userProfile.currentVisa, adjacencyGraph]);
```

### Edge Rendering
```typescript
// Only render edges that exist in adjacency graph
const nextSteps = adjacencyGraph[visaId] || [];
nextSteps.forEach(nextVisaId => {
  // Draw line from visaId to nextVisaId
});
```

## Benefits

✅ **Personalized**: Map adapts to user's current position  
✅ **Accurate**: Shows only reachable paths  
✅ **Dynamic**: Updates when currentVisa changes  
✅ **Data-driven**: No hard-coded tiers  
✅ **Maintainable**: Edit knowledge base, map updates automatically  
✅ **Performant**: useMemo prevents unnecessary recomputation  
✅ **Focused**: Hides unreachable/irrelevant visas  

## Testing

See `DYNAMIC_VISA_MAP_TEST.md` for detailed test scenarios.

### Quick Test
1. Start dev server: `npm run dev`
2. Log in and navigate to home page
3. Open browser console (F12)
4. Check logs: `[VisaMapRedesigned] Starting BFS from: f1`
5. Change "Current Visa Status" in left panel
6. Observe map update with new tier structure

## Console Logs

The implementation logs helpful debugging info:
```
[VisaMapRedesigned] Built adjacency graph: {...}
[VisaMapRedesigned] Computing dynamic tiers. Current visa: f1
[VisaMapRedesigned] Starting BFS from: f1
[VisaMapRedesigned] BFS complete. Tiers: {
  level0: ['f1'],
  level1: ['opt', 'h1b', 'o1', 'eb2gc'],
  level2: [...],
  level3: [...]
}
```

## Known Limitations

1. **Max 3 levels**: BFS stops at Level 3 to prevent UI overflow
2. **Single current visa**: System assumes one visa at a time
3. **Category restrictions**: Tourist visas never on main map
4. **START node special case**: Only for users without current visa

## Future Enhancements

- [ ] Infinite BFS depth with scrollable/zoomable map
- [ ] Multiple path visualization (alternative routes)
- [ ] Reverse lookup (what visas lead here?)
- [ ] Interactive node expansion
- [ ] Path difficulty/time estimates
- [ ] "What if" scenarios (simulate changing visa)

## Architecture Notes

### Data Flow
```
userProfile.currentVisa
  ↓
adjacencyGraph (from VISA_KNOWLEDGE_BASE.commonNextSteps)
  ↓
BFS traversal
  ↓
visasByTier (level0, level1, level2, level3)
  ↓
renderVisaNodes() + renderConnections()
  ↓
Visual map display
```

### Key Invariants
1. Level 0 always contains exactly 1 visa (current or START)
2. All visas in levels 1-3 are reachable from Level 0
3. No visa appears in multiple levels
4. Tourist/visitor categories never included
5. Edges only drawn between commonNextSteps pairs

## Code Documentation

The implementation includes extensive inline comments explaining:
- Adjacency graph construction
- BFS algorithm
- Category filtering
- Reachability computation
- Edge rendering logic
- Dynamic recomputation triggers

See top of `components/VisaMapRedesigned.tsx` for full architecture overview.

---

**Implementation Status**: ✅ Complete  
**Testing Status**: ✅ Ready for user testing  
**Documentation**: ✅ Complete  
**Next Step**: User acceptance testing with real profiles

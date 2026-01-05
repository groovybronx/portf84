---
trigger: always_on
---

---
name: performance-optimizer
description: Optimizes performance and detects bottlenecks in Lumina Portfolio.
---

# Performance Optimizer Rule

When optimizing performance in Lumina Portfolio, you MUST apply these patterns:

## React Rendering

**ALWAYS**:
- Wrap expensive components in `React.memo`
- Use `useMemo` for heavy computations
- Use `useCallback` for callback functions
- Add proper `key` props in lists

**NEVER**:
- Perform expensive computations directly in render
- Create new objects/functions in render without memoization
- Skip `key` props in mapped elements

## Virtual Scrolling

**Required for**:
- Lists with > 100 items
- Photo grids with hundreds of images
- Tag lists with many entries

Use `@tanstack/react-virtual` with overscan of 5 items.

## Image Loading

**MUST implement**:
- Lazy loading with Intersection Observer
- `loading="lazy"` attribute
- Thumbnail generation (150x150, 300x300)
- WebP format when possible
- Progressive loading and caching

## Bundle Optimization

**Required**:
- Code splitting for routes/features
- Lazy load heavy components (Settings, ImageViewer)
- Target: Main < 500KB, Vendor < 300KB, Features < 100KB (gzipped)

## Database Queries

**MUST create indexes on**:
- `photos.folder_id`
- `tags.name`
- `photo_tags.photo_id`

**NEVER**: Write N+1 queries. Always use JOINs or batch operations.

## Memory Leak Prevention

**ALWAYS cleanup**:
- Event listeners in useEffect
- Timers (setInterval, setTimeout)
- Subscriptions and observers

## Tauri IPC

**MUST**:
- Batch IPC calls instead of loops
- Cache results to avoid repeated calls
- Example: `invoke("get_photos_metadata", { paths })` not individual calls

## Performance Standards

**Loading**:
- Initial load < 3s
- Time to Interactive < 5s
- First Contentful Paint < 1.5s

**Runtime**:
- Photo grid scroll: 60 FPS
- Tag filtering < 100ms
- Image viewer open < 200ms
- Search results < 500ms

**Memory**:
- Baseline < 100MB
- With 1000 photos < 300MB
- No memory leaks over time

## Audit Workflow

1. **Measure**: Bundle sizes, render times, query times, memory, TTI
2. **Identify**: Slow components, large bundles, slow queries, leaks
3. **Optimize**: Apply React optimizations, virtual scrolling, query optimization, code splitting
4. **Validate**: Re-measure, verify improvements, run tests

## Checklist Before Deployment

- [ ] Large lists use virtual scrolling
- [ ] Expensive components wrapped in React.memo
- [ ] Heavy computations use useMemo/useCallback
- [ ] Images have lazy loading
- [ ] Code splitting for heavy features
- [ ] Database indexes on frequently queried columns
- [ ] No N+1 queries
- [ ] All useEffect hooks have cleanup
- [ ] Bundle sizes under targets
- [ ] Lighthouse score 90+

## Tools

```bash
# Lighthouse audit
npx lighthouse http://localhost:1420

# Bundle analysis
npm run build -- --analyze

# React DevTools Profiler for component render times
# Chrome DevTools Performance tab for runtime analysis
```

## Lumina Portfolio Specific

**PhotoGrid**: Virtual scrolling + lazy images + thumbnail caching + memoized items
**AI Vision**: Batch processing + progress tracking + cancel support + rate limiting
**Tag System**: Indexed searches + fuzzy search optimization + autocomplete debouncing + cached frequencies
**Collections**: Efficient tree + lazy folder contents + cached counts + optimized drag-and-drop

# Changelog

## [Unreleased]

### Performance
- ⚡ **Optimized Dashboard Loading:** Implemented `DashboardContext` to eliminate redundant Supabase data fetching across `layout.tsx` and `page.tsx`.
- Refactored `DashboardLayout` to use a Provider pattern.
- Reduced initial network requests count by 50% for the main dashboard view.

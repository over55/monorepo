# LegacyAttachmentListPage

## Purpose

This component is a **preserved legacy implementation** of the attachment list functionality that was used for Staff attachments before the performance-optimized `EntityAttachmentListPage` was completed.

## Why It Exists

The original Staff attachment list implementation bypassed `EntityAttachmentListPage` due to intermittent performance issues. This legacy version has been preserved as a **failsafe/fallback option** in case similar performance issues arise in the future.

## When to Use

**⚠️ Use this component only as a last resort!**

Prefer `EntityAttachmentListPage` for all new implementations. Only use `LegacyAttachmentListPage` if:

1. You experience critical performance issues with `EntityAttachmentListPage`
2. You need a simpler, more direct implementation for debugging
3. You're troubleshooting complex configuration issues

## Key Differences from EntityAttachmentListPage

| Feature | LegacyAttachmentListPage | EntityAttachmentListPage |
|---------|-------------------------|--------------------------|
| **Abstraction** | Less abstraction, more direct | Highly abstracted, config-driven |
| **Performance** | May have issues with large datasets | Optimized with memoization, AbortController |
| **Logging** | Production console.log statements | Development-only logging |
| **Complexity** | Simpler, easier to understand | More complex, but more powerful |
| **Pagination** | Basic, no cursor support | Full cursor-based pagination |
| **Reusability** | Requires more prop passing | Highly reusable via config object |

## Performance Optimizations Applied to EntityAttachmentListPage

The newer `EntityAttachmentListPage` has the following optimizations that this legacy version lacks:

- ✅ Development-only logging (no production overhead)
- ✅ Optimized memo comparisons (no JSON.stringify)
- ✅ AbortController for request cancellation
- ✅ Stable dependency arrays in useCallback/useMemo
- ✅ Proper cleanup on unmount
- ✅ Cursor-based pagination support
- ✅ Theme-aware (no hardcoded colors)

## Migration Path

If you're using `LegacyAttachmentListPage`:

1. **First**: Try the optimized `EntityAttachmentListPage`
2. **Document**: Record any performance issues you encounter
3. **Report**: Create an issue with performance metrics
4. **Temporary**: Use `LegacyAttachmentListPage` as a temporary workaround
5. **Fix**: Work with the team to address the root cause

## Deprecation Notice

This component is **deprecated** and should not be used for new features. It exists solely as a fallback for existing implementations that may experience performance issues during migration.

## Original Source

Preserved from: `/pages/Admin/Staff/Detail/Attachment/List/Page.jsx`
Date: 2025-10-04
Reason: Performance issues with EntityAttachmentListPage (intermittent)

## See Also

- `EntityAttachmentListPage` - The recommended, optimized version
- `AttachmentsView` - The underlying view component
- Performance optimization documentation

## 2025-05-15 - Password Visibility Toggle Pattern
**Learning:** When adding a password visibility toggle inside an input field, it's critical to add right-padding (e.g., `pr-10`) to the input to prevent text overlap with the icon. Also, the toggle button MUST have `type="button"` to prevent it from submitting the form when clicked or when Enter is pressed while focused.
**Action:** Always verify text overlap with long passwords and check `type` attribute on helper buttons inside forms.

## 2025-05-15 - Standardized Button Loading
**Learning:** Adding `isLoading` to the base `Button` component (using `lucide-react` Loader2) standardizes loading states and prevents layout shifts caused by changing text to "Loading...".
**Action:** Use `isLoading={loading}` instead of conditional text rendering for all async actions.

## 2025-05-16 - Standardized Loading & Accessibility
**Learning:** The `Button` component has built-in `isLoading` support which handles disability state automatically. Refactoring custom spinner implementations to this standardized prop reduces code complexity and ensures consistent behavior. Also, verifying invisible accessibility attributes (like `htmlFor`/ `id` associations) is effectively done via `testing-library` unit tests when visual verification is difficult.
**Action:** Always check component definitions for built-in states before implementing custom ones. Use unit tests to verify a11y attributes.

## 2025-05-15 - Password Visibility Toggle Pattern
**Learning:** When adding a password visibility toggle inside an input field, it's critical to add right-padding (e.g., `pr-10`) to the input to prevent text overlap with the icon. Also, the toggle button MUST have `type="button"` to prevent it from submitting the form when clicked or when Enter is pressed while focused.
**Action:** Always verify text overlap with long passwords and check `type` attribute on helper buttons inside forms.

## 2025-05-15 - Standardized Button Loading
**Learning:** Adding `isLoading` to the base `Button` component (using `lucide-react` Loader2) standardizes loading states and prevents layout shifts caused by changing text to "Loading...".
**Action:** Use `isLoading={loading}` instead of conditional text rendering for all async actions.

## 2025-05-15 - Button Icon Spacing
**Learning:** The `Button` component uses `gap-2` for spacing between icon and text. Manually adding `mr-2` to icons results in double spacing.
**Action:** Remove `mr-2` or margin classes from icons when using them inside the standard `Button` component.

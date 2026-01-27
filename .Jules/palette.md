## 2025-05-15 - Password Visibility Toggle Pattern
**Learning:** When adding a password visibility toggle inside an input field, it's critical to add right-padding (e.g., `pr-10`) to the input to prevent text overlap with the icon. Also, the toggle button MUST have `type="button"` to prevent it from submitting the form when clicked or when Enter is pressed while focused.
**Action:** Always verify text overlap with long passwords and check `type` attribute on helper buttons inside forms.

## 2025-05-15 - Implicit Form Associations
**Learning:** React components (like custom `Input` wrappers) often obscure the need for explicit `id` and `htmlFor` attributes. Just wrapping an input in a label or putting them side-by-side isn't enough for robust accessibility.
**Action:** Always explicitly verify that `Input` components accept an `id` prop and that the corresponding `label` uses `htmlFor` to match it.

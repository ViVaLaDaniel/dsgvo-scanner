## 2025-05-15 - Password Visibility Toggle Pattern
**Learning:** When adding a password visibility toggle inside an input field, it's critical to add right-padding (e.g., `pr-10`) to the input to prevent text overlap with the icon. Also, the toggle button MUST have `type="button"` to prevent it from submitting the form when clicked or when Enter is pressed while focused.
**Action:** Always verify text overlap with long passwords and check `type` attribute on helper buttons inside forms.

## 2025-05-15 - Password Visibility Toggle Pattern
**Learning:** When adding a password visibility toggle inside an input field, it's critical to add right-padding (e.g., `pr-10`) to the input to prevent text overlap with the icon. Also, the toggle button MUST have `type="button"` to prevent it from submitting the form when clicked or when Enter is pressed while focused.
**Action:** Always verify text overlap with long passwords and check `type` attribute on helper buttons inside forms.

## 2025-05-15 - Standardized Button Loading
**Learning:** Adding `isLoading` to the base `Button` component (using `lucide-react` Loader2) standardizes loading states and prevents layout shifts caused by changing text to "Loading...".
**Action:** Use `isLoading={loading}` instead of conditional text rendering for all async actions.

## 2025-05-15 - Button Icon Spacing
**Learning:** The `Button` component uses `gap-2` for spacing between icon and text. Manually adding `mr-2` to icons results in double spacing.
**Action:** Remove `mr-2` or margin classes from icons when using them inside the standard `Button` component.

## 2025-05-15 - Form Accessibility Pattern

**Learning:** Raw `<label>` elements often miss `htmlFor` attributes, breaking screen reader association. The project's `<Label>` component enforces consistent styling but still requires manual `htmlFor` linkage to input `id`s.

**Action:** Always use `<Label htmlFor="id">` paired with `<Input id="id">` instead of raw HTML labels.



## 2025-05-15 - Icon-Only Button Accessibility

**Learning:** Icon-only buttons (like mobile menu toggles) are invisible to screen readers without an accessible name.

**Action:** Always add `aria-label` to buttons that only contain an icon.



## 2025-05-15 - Form Accessibility: React Hook Form

**Learning:** When adding standard accessibility attributes (htmlFor/id) to forms using `react-hook-form`, ensure the `id` prop is explicitly passed to the `Input` component. Also, replace raw `<label>` elements with the `Label` component to ensure consistent design system styling and accessibility behaviors.

**Action:** Always pair `Label` (from ui/label) with `Input`, and ensure `htmlFor` matches `id`.



## 2025-05-24 - Form Label Consistency

**Learning:** Native `<label>` elements lack the accessibility features and consistent styling of the `@radix-ui/react-label` primitive used in the design system.

**Action:** Always use the `Label` component from `@/components/ui/label` instead of native `<label>` tags in forms.



## 2025-05-24 - Input Adornment Buttons

**Learning:** Using raw `<button>` elements for input adornments (like password toggle) breaks focus ring consistency. The `Button` component with `variant="ghost" size="icon"` provides the correct focus states.

**Action:** Use `Button` for input actions, positioning it absolutely with `right-0 top-0 h-full` to align perfectly with input height.



## 2026-02-05 - Dynamic Labels for Toggle Buttons

**Learning:** For buttons that toggle state (like menus), prefer dynamic `aria-label` (e.g., "Menü öffnen" / "Menü schließen") over static labels when the icon changes or the context shifts significantly.

**Action:** Use conditional `aria-label` logic in JSX for toggle components.

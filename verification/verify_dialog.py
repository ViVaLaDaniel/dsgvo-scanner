from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to homepage...")
            page.goto("http://localhost:3000")

            print("Clicking 'Anmelden' button...")
            # Using text="Anmelden" might be ambiguous if there are multiple, but let's try
            # The header one is what we want.
            page.get_by_role("button", name="Anmelden").first.click()

            print("Waiting for dialog to appear...")
            # We look for the dialog content.
            # Currently it has no role="dialog", so we might need to find it by text or class.
            # The AuthModal has "Willkommen zurück" as title.
            dialog = page.get_by_text("Willkommen zurück")
            expect(dialog).to_be_visible()

            # Now let's try to find the dialog container by role
            # This should FAIL before my changes if role is missing
            print("Checking for role='dialog'...")
            dialog_container = page.get_by_role("dialog")

            if dialog_container.count() > 0:
                print("SUCCESS: Found element with role='dialog'")
                # Check for aria-modal
                is_modal = dialog_container.get_attribute("aria-modal")
                print(f"aria-modal attribute: {is_modal}")

                # Take screenshot of the dialog
                page.screenshot(path="verification/dialog_accessible.png")
                print("Screenshot saved to verification/dialog_accessible.png")

                # Check close button label
                # The close button is an icon button (X icon).
                # We can try to find it by label "Dialog schließen"
                close_btn = page.get_by_label("Dialog schließen")
                if close_btn.count() > 0:
                    print("SUCCESS: Found close button with aria-label='Dialog schließen'")
                else:
                    print("FAIL: Did not find close button with aria-label='Dialog schließen'")
            else:
                print("FAIL: Did not find element with role='dialog'")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()

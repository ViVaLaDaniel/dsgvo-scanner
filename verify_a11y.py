from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set viewport to mobile size
        page.set_viewport_size({"width": 375, "height": 667})

        try:
            page.goto("http://localhost:3000")

            # Take a screenshot of what we see initially
            page.screenshot(path="debug_initial.png")

            # Print page title
            print(f"Page Title: {page.title()}")

            # Find the mobile menu button
            # It should have the label "Hauptmenü öffnen" initially
            menu_button = page.get_by_label("Hauptmenü öffnen")

            print("Checking if menu button exists and is visible...")
            expect(menu_button).to_be_visible(timeout=5000)
            print("Menu button found.")

            # Check aria-expanded is false (or "false")
            expanded = menu_button.get_attribute("aria-expanded")
            print(f"Initial aria-expanded: {expanded}")
            if expanded != "false":
                print("ERROR: Expected aria-expanded to be 'false'")
                exit(1)

            # Click the button
            print("Clicking menu button...")
            menu_button.click()

            # Now the label should change to "Menü schließen"
            close_button = page.get_by_label("Menü schließen")
            expect(close_button).to_be_visible()
            print("Close button found (label updated).")

            page.screenshot(path="verification_a11y.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="error_state.png")
            print("Saved error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()

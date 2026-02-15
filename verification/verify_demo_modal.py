from playwright.sync_api import sync_playwright

def verify_demo_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")

            # Click "Demo ansehen" button to open modal
            # There is one in the hero section "Demo ansehen"
            print("Clicking 'Demo ansehen'")
            page.get_by_role("button", name="Demo ansehen").click()

            # Wait for modal to be visible
            page.wait_for_selector("text=Demo anfordern", state="visible")

            # Verify inputs are accessible via labels
            # If htmlFor/id links are broken, this might fail or behave unexpectedly
            print("Filling form...")
            page.get_by_label("Name").fill("Test User")
            page.get_by_label("Firma").fill("Test Company")
            page.get_by_label("E-Mail Adresse").fill("test@example.com")

            # Take a screenshot of the filled form to verify alignment and labels
            page.screenshot(path="verification/demo_modal_form.png")
            print("Screenshot saved to verification/demo_modal_form.png")

            # Submit
            print("Submitting form...")
            submit_button = page.get_by_role("button", name="Jetzt Demo anfragen")
            submit_button.click()

            # Wait for success message
            print("Waiting for success message...")
            page.wait_for_selector("text=Anfrage gesendet!", timeout=5000)

            # Take a screenshot of the success state
            page.screenshot(path="verification/demo_modal_success.png")
            print("Screenshot saved to verification/demo_modal_success.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_demo_modal()

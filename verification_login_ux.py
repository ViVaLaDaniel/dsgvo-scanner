from playwright.sync_api import sync_playwright, expect

def verify_login_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Arrange: Go to the Login page.
        print("Navigating to login page...")
        page.goto("http://localhost:3000/login")

        # 2. Act: Find the password input.
        print("Waiting for password input...")
        password_input = page.locator("#password")
        expect(password_input).to_be_visible()

        print("Initial check: Password input should be type 'password'")
        expect(password_input).to_have_attribute("type", "password")

        # 3. Act: Find the toggle button.
        toggle_button = page.get_by_label("Passwort anzeigen")
        expect(toggle_button).to_be_visible()

        print("Clicking toggle button...")
        toggle_button.click()

        # 4. Assert: Check if input type changed to 'text'
        print("Check: Password input should be type 'text'")
        expect(password_input).to_have_attribute("type", "text")

        # Check if button label changed
        toggle_button_hide = page.get_by_label("Passwort verbergen")
        expect(toggle_button_hide).to_be_visible()

        # 5. Screenshot: Capture the result.
        print("Taking screenshot...")
        page.screenshot(path="verification_login_ux.png")

        browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    verify_login_ux()

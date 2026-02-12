from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to login page
    print("Navigating to login page...")
    try:
        page.goto("http://localhost:3000/login", timeout=60000)
    except Exception as e:
        print(f"Error navigating: {e}")
        browser.close()
        return

    # Wait for the password field
    try:
        page.wait_for_selector("input#password", timeout=10000)
    except Exception as e:
        print(f"Password field not found: {e}")
        # Take full page screenshot for debugging
        page.screenshot(path="verification/error_page.png")
        browser.close()
        return

    # Check label
    label = page.locator("label[for='password']")
    print(f"Label text: {label.text_content()}")

    # Check if the password toggle button exists and has aria-label
    toggle_btn = page.locator("button[aria-label='Passwort anzeigen']")
    if toggle_btn.count() > 0:
        print("Password toggle button found with correct aria-label.")
    else:
        print("Password toggle button NOT found.")

    # Check button classes for positioning (standardized check)
    # We expect 'absolute right-0 top-0 h-full w-10'
    btn_class = toggle_btn.get_attribute("class")
    print(f"Button classes: {btn_class}")

    # Take screenshot of the form area
    page.locator("form").screenshot(path="verification/login_form.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

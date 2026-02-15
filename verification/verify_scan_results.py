from playwright.sync_api import sync_playwright, expect

def verify_scan_results():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the verification page
        page.goto("http://localhost:3000/verify-scan-results")

        # Wait for the page to load
        expect(page.get_by_text("Verification: ScanResultsClient")).to_be_visible()

        # Find a finding and click "Lösung anzeigen"
        solution_button = page.get_by_role("button", name="Lösung anzeigen")
        solution_button.click()

        # Verify the close button exists and has the correct aria-label
        # This confirms the modal is open AND the aria-label is correct
        close_button = page.get_by_role("button", name="Lösungsweg schließen")
        expect(close_button).to_be_visible()

        # Take a screenshot of the modal with the close button
        page.screenshot(path="verification/scan_results_modal.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    verify_scan_results()

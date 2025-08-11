from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the login page.
            page.goto("http://localhost:3000/login")

            # 2. Fill in the email and password.
            page.get_by_label("Email").fill("admin@example.com")
            page.get_by_label("Password").fill("password")

            # 3. Click the login button.
            page.get_by_role("button", name="Login").click()

            # 4. Wait for the redirection to the admin dashboard.
            # The URL should change to include '/admin'.
            expect(page).to_have_url("http://localhost:3000/admin", timeout=10000)

            # 5. Take a screenshot of the admin page.
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Save a screenshot on failure to help with debugging
            page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()

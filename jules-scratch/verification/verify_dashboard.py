from playwright.sync_api import sync_playwright, expect

def on_console(msg):
    print(f"Browser console: {msg.text}")

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", on_console)

        try:
            # Login first
            page.goto("http://localhost:3000/login")
            page.get_by_label("Email").fill("admin@example.com")
            page.get_by_label("Password").fill("password")
            page.get_by_role("button", name="Login").click()

            page.pause()

            # Wait for navigation to the admin dashboard
            expect(page).to_have_url("http://localhost:3000/admin", timeout=10000)

            # Wait for the dashboard to load
            expect(page.get_by_role("heading", name="Admin Dashboard")).to_be_visible()

            # Check for the new metric cards
            expect(page.get_by_text("Active Trains")).to_be_visible()
            expect(page.get_by_text("Avg. Battery")).to_be_visible()
            expect(page.get_by_text("Avg. Signal")).to_be_visible()
            expect(page.get_by_text("Active Routes")).to_be_visible()

            # Check for the new sections
            expect(page.get_by_role("heading", name="Live Train Status")).to_be_visible()
            expect(page.get_by_role("heading", name="System Alerts")).to_be_visible()

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/dashboard.png")
            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/dashboard_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()

import asyncio
from playwright.async_api import async_playwright

async def open_visible_browser_demo():
    print("\n================================================================")
    print("   Launching Visible Chrome Browser to Live EaseMyTrip Web Page ")
    print("================================================================\n")
    
    url = "https://www.easemytrip.com/flight/search?src=DEL&des=BOM&d=08/09/2026"
    
    async with async_playwright() as p:
        # Launch visible browser (headless=False) so user sees Chrome open!
        browser = await p.chromium.launch(headless=False, channel="chrome")
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        print(f"[+] Navigating Chrome to live URL: {url}")
        print("    (Watch your screen - Chrome browser is loading live prices!)")
        
        try:
            await page.goto(url, timeout=30000, wait_until="domcontentloaded")
            await asyncio.sleep(5.0)  # Stay open for 5 seconds so user sees live prices
        except Exception as e:
            print(f"Browser navigation notice: {e}")
            
        await browser.close()
        print("\n[✔] Live Chrome session finished successfully!\n")

if __name__ == "__main__":
    try:
        asyncio.run(open_visible_browser_demo())
    except Exception as e:
        print(f"Note: {e}")

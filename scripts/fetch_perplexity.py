import asyncio
import json
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

TARGET_URL = "https://www.perplexity.ai/search/dbd00779-c08e-4276-821a-4280dfba9a8f"

async def fetch_perplexity_data():
    print("================================================================", flush=True)
    print("   Fetching Perplexity AI Search URL Data                      ", flush=True)
    print("================================================================", flush=True)
    print(f"Target URL: {TARGET_URL}", flush=True)
    print("----------------------------------------------------------------", flush=True)

    extracted_text = ""
    title = ""

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=False,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled"
                ]
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1366, "height": 768}
            )
            page = await context.new_page()

            # Override webdriver flag
            await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            print("[+] Navigating browser to Perplexity URL...", flush=True)
            await page.goto(TARGET_URL, timeout=35000, wait_until="domcontentloaded")
            await asyncio.sleep(6.0)

            title = await page.title()
            content = await page.content()
            await browser.close()

            soup = BeautifulSoup(content, "html.parser")
            
            # Remove scripts and style tags
            for script in soup(["script", "style", "header", "footer", "nav"]):
                script.extract()

            extracted_text = soup.get_text(separator="\n").strip()

    except Exception as e:
        print(f"[!] Fetch Note: {e}", flush=True)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    
    json_path = os.path.join(out_dir, "perplexity_data.json")
    text_path = os.path.join(out_dir, "perplexity_summary.txt")

    payload = {
        "url": TARGET_URL,
        "page_title": title,
        "content_length": len(extracted_text),
        "extracted_content": [line.strip() for line in extracted_text.splitlines() if line.strip()]
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    with open(text_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)

    print("\n================================================================", flush=True)
    print(f" FETCH COMPLETE! Saved payload to: {json_path}", flush=True)
    print("================================================================\n", flush=True)

    print(f"Page Title: {title}\n")
    # Print preview of text
    lines = [line.strip() for line in extracted_text.splitlines() if line.strip()]
    preview = "\n".join(lines[:40])
    print(preview, flush=True)

if __name__ == "__main__":
    asyncio.run(fetch_perplexity_data())

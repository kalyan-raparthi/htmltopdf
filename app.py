from flask import Flask, request, jsonify, send_file
import nest_asyncio
import asyncio
from pyppeteer import launch
import io

nest_asyncio.apply()
app = Flask(__name__)

@app.route('/extract-text', methods=['POST'])
def extract_text():
    data = request.json
    url = data.get('url')
    selector = data.get('selector')

    if not url or not selector:
        return jsonify({'error': 'Missing "url" or "selector".'}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(get_text(url, selector))
    return jsonify(result)

@app.route('/screenshot', methods=['POST'])
def screenshot():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'Missing "url".'}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    image_bytes = loop.run_until_complete(take_screenshot(url))

    return send_file(
        io.BytesIO(image_bytes),
        mimetype='image/png',
        as_attachment=False,
        download_name='screenshot.png'
    )

async def get_text(url, selector):
    browser = await launch(headless=True, args=['--no-sandbox'])
    page = await browser.newPage()
    await page.goto(url, {'waitUntil': 'networkidle2'})
    try:
        content = await page.querySelectorEval(selector, '(el) => el.innerText')
    except Exception:
        content = f'No element found for selector: {selector}'
    await browser.close()
    return {'url': url, 'selector': selector, 'extractedText': content}

async def take_screenshot(url):
    browser = await launch(headless=True, args=['--no-sandbox'])
    page = await browser.newPage()
    await page.goto(url, {'waitUntil': 'networkidle2'})
    image = await page.screenshot({'fullPage': True})
    await browser.close()
    return image

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

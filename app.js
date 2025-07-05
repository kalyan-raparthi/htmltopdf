const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// POST /generate-pdf { "url": "https://example.com" }
app.post('/generate-pdf', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).send('Invalid or missing URL.');
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const filePath = path.join(__dirname, 'download.pdf');
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    await browser.close();

    // Set headers to prompt download
    res.download(filePath, 'download.pdf', (err) => {
      if (err) console.error('Error sending PDF:', err);
      fs.unlinkSync(filePath);  // Clean up temp file
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to generate PDF.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

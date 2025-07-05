const express = require('express');
const bodyParser = require('body-parser');
const wkhtmltopdf = require('wkhtmltopdf');
const { Readable } = require('stream');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/convert', (req, res) => {
    const htmlContent = req.body.html;

    if (!htmlContent) {
        return res.status(400).json({ error: 'No HTML content provided' });
    }

    const htmlStream = new Readable();
    htmlStream.push(htmlContent);
    htmlStream.push(null);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');

    wkhtmltopdf(htmlStream, { pageSize: 'A4' }).pipe(res);
});

app.listen(3000, () => console.log('✅ No-browser PDF API running on http://localhost:3000'));

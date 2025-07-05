```
pip install flask nest_asyncio pyppeteer
```

usage:
```
curl -X POST http://localhost:5000/generate-docx -H "Content-Type: application/json" -d "{\"url\": \"https://www.digitalbiz.tech/blog/2024-10-15-salesforce-cli-to-transfer-metadata-between-orgs/\"}" --output output.docx
```

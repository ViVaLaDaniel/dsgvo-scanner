// scanner.js
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.post('/', (req, res) => {
  const { url, secret } = req.body;

  console.log(`[Mock Scanner] Received scan request for: ${url}`);

  // Simulate a scan
  setTimeout(() => {
    // Simulate some findings
    const findings = [
      'Google Fonts',
      'Google Tag Manager',
      'YouTube Embed',
      'Cookies detected (Unconsented)'
    ];

    const score = 100 - (findings.length * 15);

    console.log(`[Mock Scanner] Scan complete for: ${url}. Score: ${score}`);

    res.json({
      score,
      findings,
      cookies_count: 3
    });
  }, 5000); // Simulate a 5-second scan
});

app.listen(port, () => {
  console.log(`[Mock Scanner] Service listening on port ${port}`);
});

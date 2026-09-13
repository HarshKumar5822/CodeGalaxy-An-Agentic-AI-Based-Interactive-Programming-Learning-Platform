// Run this on YOUR machine (where you have internet access) to check the key directly:
//   node test_gemini_key.js
const https = require('https');
const KEY = "AIzaSyB4Omd_i2ROnkUjtJ4aKgBkjXcx_6F7BaE"; // from backend/.env

const data = JSON.stringify({ contents: [{ parts: [{ text: "Say OK" }] }] });
const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-flash-latest:generateContent?key=${KEY}`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log(body);
  });
});
req.write(data);
req.end();

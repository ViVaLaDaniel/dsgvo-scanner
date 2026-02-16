// load-test.js
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/scan';
const TARGET_URL = 'https://www.example.com'; // The URL to be scanned
const CONCURRENT_REQUESTS = 10; // Number of concurrent requests

async function runLoadTest() {
  console.log(`Starting load test with ${CONCURRENT_REQUESTS} concurrent requests...`);

  const requests = [];
  const startTime = Date.now();

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    requests.push(
      axios.post(API_URL, { url: TARGET_URL, secret: 'my-super-secret-key' })
        .then(response => {
          console.log(`Request ${i + 1} completed with score: ${response.data.score}`);
        })
        .catch(error => {
          console.error(`Request ${i + 1} failed: ${error.message}`);
        })
    );
  }

  await Promise.all(requests);

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const avgTime = totalTime / CONCURRENT_REQUESTS;

  console.log('\n--- Load Test Results ---');
  console.log(`Total requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
  console.log(`Average response time: ${avgTime.toFixed(2)} seconds per request`);
}

runLoadTest();

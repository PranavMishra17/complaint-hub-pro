#!/usr/bin/env node

const http = require('http');

// Test data with different complaint types
const testCases = [
  {
    name: 'Test User 1',
    email: 'test1@example.com',
    complaint: 'This is a billing issue test',
    complaint_type: 'Billing'
  },
  {
    name: 'Test User 2', 
    email: 'test2@example.com',
    complaint: 'This is a technical support issue',
    complaint_type: 'Technical'
  },
  {
    name: 'Test User 3',
    email: 'test3@example.com', 
    complaint: 'This is a service quality issue',
    complaint_type: 'Service'
  }
];

function sendComplaint(testData, testNumber) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/complaints',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 TEST ${testNumber}: Sending complaint with type "${testData.complaint_type}"`);
    console.log('📤 Request data:', JSON.stringify(testData, null, 2));

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📥 Response Status: ${res.statusCode}`);
        console.log('📥 Response Body:', data);
        
        try {
          const responseJson = JSON.parse(data);
          resolve({
            testNumber,
            status: res.statusCode,
            response: responseJson,
            sentType: testData.complaint_type
          });
        } catch (e) {
          resolve({
            testNumber,
            status: res.statusCode,
            response: data,
            sentType: testData.complaint_type
          });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request error:`, e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Complaint Type Tests');
  console.log('🎯 Testing if complaint_type field is properly processed by backend');
  console.log('=' * 60);

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    try {
      const result = await sendComplaint(testCases[i], i + 1);
      results.push(result);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' * 60);

  results.forEach(result => {
    console.log(`\nTest ${result.testNumber}:`);
    console.log(`  Sent complaint_type: "${result.sentType}"`);
    console.log(`  Response status: ${result.status}`);
    console.log(`  Success: ${result.status === 201 ? '✅' : '❌'}`);
    if (result.response && result.response.data) {
      console.log(`  Generated ID: ${result.response.data.id || 'N/A'}`);
      console.log(`  Tracking ID: ${result.response.data.trackingId || 'N/A'}`);
    }
  });

  console.log('\n🔍 Check the backend logs above to see the comprehensive logging output!');
  console.log('📝 Look for lines starting with "📝 CreateComplaint:" to see field analysis');
}

// Run the tests
runTests().catch(console.error);
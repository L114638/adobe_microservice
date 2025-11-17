const fetch = require('node-fetch');

async function testToken() {
    const bearerToken = "YOUR_TOKEN_HERE";
    
    // Test 1: Check AEM API access
    console.log('Testing AEM API access...');
    const response = await fetch('https://author-p25321-e288205.adobeaemcloud.com/api/assets.json', {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    if (response.ok) {
        const data = await response.json();
        console.log('✅ Token is valid!');
        console.log('Response:', JSON.stringify(data, null, 2));
    } else {
        const error = await response.text();
        console.error('❌ Token invalid or no access');
        console.error('Error:', error);
    }
}

testToken();
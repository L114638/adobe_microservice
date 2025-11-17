const DirectBinary = require('@adobe/aem-upload');
const path = require('path');
const fs = require('fs');

const targetUrl = 'https://author-p25321-e288205.adobeaemcloud.com/content/dam/mcds';
const bearerToken = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3NjMzNzE4OTQ4NDlfNzMwN2Q3MWMtNWFjMi00MzYyLWExZTgtMThiZTQ2NjgxNjE3X3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJjbS1wMjUzMjEtZTI4ODIwNS1pbnRlZ3JhdGlvbi0xIiwidXNlcl9pZCI6IjJFRjAyMUFCNjhBNDQwOTQwQTQ5NUNDQ0B0ZWNoYWNjdC5hZG9iZS5jb20iLCJhcyI6Imltcy1uYTEiLCJhYV9pZCI6IjJFRjAyMUFCNjhBNDQwOTQwQTQ5NUNDQ0B0ZWNoYWNjdC5hZG9iZS5jb20iLCJjdHAiOjAsImZnIjoiWjZZM1dSVlpGTE01UURVS0ZBUVZJSEFBR009PT09PT0iLCJtb2kiOiI1NjE5MjQyYyIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsImNyZWF0ZWRfYXQiOiIxNzYzMzcxODk0ODQ5Iiwic2NvcGUiOiJyZWFkX3BjLmRtYV9hZW1fYW1zLG9wZW5pZCxBZG9iZUlELHJlYWRfb3JnYW5pemF0aW9ucyxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQifQ.Sp3pe9OPpGdslh_X6RKZBuJ2MwL1iXXAgI10TLVPOICVKM9YlIt2pFxrI8e4R_ZrGB_3SLln-KEAdCRuJ-31Yz3oNihqeZexbhV3sIdZgKzv1F2jCUJaC5oh-AMxfVVUvJPCy3YxnWWLSPJw2yD3gZlFoEGIe1L5xY6pa3F8D7Bg0P-mD-Ab3npPORmsqbSigFzZjhZXXqBzLaX7cdoHzHxVH-pM9LtfAFeRVmGKwyKM3d41BnoSdi6TCefz_KAirwLVaf2j78ECWGhMjGcj9K7u2RdXMx2UnMHS_WoG5uAx4eoIcQ_IdMlMRJUb02DRx5lc-8To_W26nFpY9SF2zw";

// Verify file exists
const filePath = path.resolve(__dirname, 'speed.png');
console.log('Checking file:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    console.error('Current directory:', __dirname);
    console.error('Files in directory:', fs.readdirSync(__dirname));
    process.exit(1);
}

const fileStats = fs.statSync(filePath);
console.log('✅ File found:', fileStats.size, 'bytes');

const uploadFiles = [
    {
        fileName: 'speed.png',
        fileSize: fileStats.size,
        filePath: filePath
    }
];

console.log('Configuration:');
console.log('- Target URL:', targetUrl);
console.log('- File:', uploadFiles[0].fileName);
console.log('- Size:', uploadFiles[0].fileSize, 'bytes');
console.log('- Token (first 50 chars):', bearerToken.substring(0, 50) + '...');
console.log('\nStarting upload...\n');

const upload = new DirectBinary.DirectBinaryUpload();
const options = new DirectBinary.DirectBinaryUploadOptions()
    .withUrl(targetUrl)
    .withUploadFiles(uploadFiles)
    .withHttpOptions({
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    });

upload.uploadFiles(options)
    .then(result => {
        console.log('\n✅ Upload successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Check detailed results
        if (result.detailedResult) {
            result.detailedResult.forEach((detail, index) => {
                console.log(`\nFile ${index + 1}:`);
                console.log('- Name:', uploadFiles[index].fileName);
                console.log('- Status:', detail.result.errors ? 'Failed' : 'Success');
                if (detail.result.errors) {
                    console.log('- Errors:', JSON.stringify(detail.result.errors, null, 2));
                }
            });
        }
    })
    .catch(err => {
        console.error('\n❌ Upload failed');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        
        // Additional error details
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    });
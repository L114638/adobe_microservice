const DirectBinary = require('@adobe/aem-upload');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// ============================================
// CONFIGURATION - From AEM Cloud Service Integration
// ============================================
const CLIENT_ID = 'cm-p25321-e288205-integration-1';
const CLIENT_SECRET = 'p8e-L09EVA8FagTZiXMdICJTbR9qaG7h7IpD';
const TECHNICAL_ACCOUNT_ID = '2EF021AB68A440940A495CCC@techacct.adobe.com';
const ORG_ID = 'FD6415F354EEF3250A4C98A4@AdobeOrg';
const METASCOPES = 'ent_aem_cloud_api';

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1+mqEc/+/UkzM3PJnhJM0d7cKGCJOcJ7xFX74Me/Yf1mYLxd
G4OgM+RDyRc+jci/8UW42rDY+2xcVw3xYA4iTylFjpKci7gViCrSqmbcirvINSyT
fr+S+SFqgrS32qNrvSXD4sjaMDRn7xkyD2QU1mqZVl9AioFqXq55Lo32PiqRQIBx
YvqlVIPCMRoc/j/MRECL2RxodE7XL36gMSO3l4MdVNKsXdUXTgNJfRP6NPM5Ss84
wBMV6VFTxLovHTgJwJj9EdCwvmKsqp2kPUhKchpa3WwrpjHvwSwk56H9huflvVio
vIJWi2mDaXBwjm/Z4DpGQP9n8UZ7+ov+vlGHtwIDAQABAoIBAF6cp8eyazw2TVdo
j5rSzhLRI4wV8Uv8Kxv3ya3QGc8oqSoOoIYkAZl7lzCRHPooU+O3967s+8gAzd3f
4DuFNgeWQEKfgDXBbr4CddnxxQaODscuR1utOwwsVm38HuyR2+5AlDvWY7Xn4Ptn
AQa5hmAGyjaM+s02tJPUxIlf792BHvi9za/prklpgNo1WyFFBa4neOAHcx3a3Pli
iaN1SgKdZcFY8XjlR6fYVAF2WBllTgaHHKbSDL2fBXu3xNxl4kFHzyZc4Vzdc/21
7J1m47ayl7y1zPN9iXotjZBxfNfyK3Qa+qlTj61IcWclroWcUOoGugx9VTuet1yg
bwtOSsECgYEA/usS9oNdURu7g01FRQaFVR/EbBataaZqQ1RanBNhL0I0JvlBzH/V
uOr9i55aBI18cuxyys4sacJLZNi9mL7/mpcLsifcLKDOGIL6ehWy89xxM7p9d0IL
bSSrj3s4dVtDS5Gd8XidDESNsyGcWyIkbIDDAA7vGrTENluJ3XA+9fECgYEA2NQ3
okuALXPr3V7UIunNjSHoQ0dFaLG0xZhuPrf8f3SaUf1fG5OOglZB4PDNKjJ6eHWZ
bZ/mv2kCO6Gl+J6g2aRNBFRENkvWkoWl47hWcm+8mZWFRQpcjsXfheCFJ5ksKHCr
IHyNguSIfqW4wWdHAEbrUcqFYlrMzeiI+GQLECcCgYEA3WOhG3CpGajhKD5ye2kX
YP9u4oSrZIb/4Kug6c226Ikxq+tr5sPbBHcpbhk/ipaqT1DkvRdj4RG50sKdnsu6
RzMJGFef0y5w7z7JdD/mI/3+XnOHRYyZSdfAG6NjPCDfiADWUAF1O1NKURlOpqM3
SPhm4mUV6Xa2tZK4YBV8yLECgYBxWxDywfHy0UWf57GTxxN1EyLv+VSqFS1il/wa
wek5YOZEsueD7TJ1pU6voHRB+T3Zt/FMRGpH60gFkM7KGXQSFDlHaB55HFDDLSe6
02YuUYgR6v9PRsl4wq3GucgjGYriYXS1eSgqI/vP6ieaxLlzxZ/ElNICx2GGzGi/
It49xQKBgQCUlHump41zCWnF6RrEvg5Edfkslb41QVpv79XVU8f4MsEQjWiJe4gd
d2HfDzZwukzy92N6jA1jZXSnIm4ncd/mpTwE2sWfTbw6I129hgJgGkcRx5/Mb+qy
H96ok2DBfKbiyrxXipS/EzqnmxezkLDDWMKow8zUwS32AXyUPcFImw==
-----END RSA PRIVATE KEY-----`;

const AEM_HOST = 'https://author-p25321-e288205.adobeaemcloud.com';
const TARGET_PATH = '/content/dam/mcds';
const FILE_NAME = 'speed.png'; // File to upload from scripts folder

// ============================================
// STEP 1: Generate Access Token (JWT Method)
// ============================================
async function generateToken() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Generating Access Token (JWT)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Client ID:', CLIENT_ID);
    console.log('Technical Account:', TECHNICAL_ACCOUNT_ID);
    console.log('Organization:', ORG_ID);
    console.log('Metascopes:', METASCOPES);
    console.log('');

    try {
        // Step 1a: Create JWT
        console.log('Creating JWT token...');
        const jwtPayload = {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
            iss: ORG_ID,
            sub: TECHNICAL_ACCOUNT_ID,
            aud: `https://ims-na1.adobelogin.com/c/${CLIENT_ID}`,
            [`https://ims-na1.adobelogin.com/s/${METASCOPES}`]: true
        };

        const jwtToken = jwt.sign(jwtPayload, PRIVATE_KEY, { algorithm: 'RS256' });
        console.log('✅ JWT created');
        console.log('JWT (first 50 chars):', jwtToken.substring(0, 50) + '...');
        console.log('');

        // Step 1b: Exchange JWT for Access Token
        console.log('Exchanging JWT for access token...');
        const response = await fetch('https://ims-na1.adobelogin.com/ims/exchange/jwt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                jwt_token: jwtToken
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token exchange failed: ${response.status} ${error}`);
        }


        const result = await response.json();

        console.log('✅ Access Token Generated Successfully!');
        console.log('Token Type:', result.token_type);
        console.log('Expires In:', Math.floor(result.expires_in / 1000 / 60 / 60), 'hours');
        console.log('Token (first 50 chars):', result.access_token.substring(0, 50) + '...');
        console.log('result.access_token:', result.access_token);

        return result.access_token;

    } catch (error) {
        console.error('❌ Token generation failed:', error.message);
        throw error;
    }
}

// ============================================
// STEP 2: Verify File Exists
// ============================================
function verifyFile() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Verifying File');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const filePath = path.resolve(__dirname, FILE_NAME);
    console.log('File Path:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error('❌ File not found!');
        console.log('Available files in directory:');
        fs.readdirSync(__dirname).forEach(file => console.log('  -', file));
        throw new Error(`File not found: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    console.log('✅ File found!');
    console.log('File Size:', fileStats.size, 'bytes (', Math.round(fileStats.size / 1024), 'KB)');
    console.log('');

    return {
        fileName: FILE_NAME,
        fileSize: fileStats.size,
        filePath: filePath
    };
}

// ============================================
// STEP 3: Test AEM Connection
// ============================================
async function testAEMConnection(bearerToken) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Testing AEM Connection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing:', `${AEM_HOST}/api/assets.json`);

    try {
        const response = await fetch(`${AEM_HOST}/api/assets.json`, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        });

        console.log('Response Status:', response.status, response.statusText);

        if (response.ok) {
            console.log('✅ AEM connection successful!');
            console.log('');
            return true;
        } else {
            const error = await response.text();
            console.error('❌ AEM connection failed:', error);
            throw new Error(`AEM connection failed: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// ============================================
// STEP 4: Check Target Folder
// ============================================
async function checkTargetFolder(bearerToken) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Checking Target Folder');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Checking:', `${AEM_HOST}${TARGET_PATH}`);

    try {
        const response = await fetch(`${AEM_HOST}${TARGET_PATH}.json`, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        });

        if (response.status === 404) {
            console.log('⚠️  Folder does not exist!');
            console.log('Using /content/dam instead');
            console.log('');
            return '/content/dam';
        } else if (response.ok) {
            console.log('✅ Target folder exists!');
            console.log('');
            return TARGET_PATH;
        } else {
            console.log('⚠️  Could not verify folder, trying anyway...');
            console.log('');
            return TARGET_PATH;
        }
    } catch (error) {
        console.log('⚠️  Error checking folder:', error.message);
        console.log('Proceeding with upload anyway...');
        console.log('');
        return TARGET_PATH;
    }
}

// ============================================
// STEP 5: Upload File
// ============================================
async function uploadFile(bearerToken, fileInfo, targetPath) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 5: Uploading File');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Target URL:', `${AEM_HOST}${targetPath}`);
    console.log('File:', fileInfo.fileName);
    console.log('Size:', fileInfo.fileSize, 'bytes');
    console.log('');

    try {
        const uploadFiles = [{
            fileName: fileInfo.fileName,
            fileSize: fileInfo.fileSize,
            filePath: fileInfo.filePath
        }];

        const upload = new DirectBinary.DirectBinaryUpload();
        const options = new DirectBinary.DirectBinaryUploadOptions()
            .withUrl(`${AEM_HOST}${targetPath}`)
            .withUploadFiles(uploadFiles)
            .withHttpOptions({
                headers: {
                    'Authorization': `Bearer ${bearerToken}`
                }
            });

        console.log('Starting upload...');
        const result = await upload.uploadFiles(options);

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('UPLOAD RESULTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Total Files:', result.totalFiles);
        console.log('Completed:', result.totalCompleted);
        console.log('Errors:', result.totalErrors);
        console.log('');

        if (result.detailedResult) {
            result.detailedResult.forEach((detail, index) => {
                console.log(`File ${index + 1}: ${uploadFiles[index].fileName}`);
                
                if (detail.result.errors && detail.result.errors.length > 0) {
                    console.log('❌ Status: FAILED');
                    console.log('Errors:');
                    detail.result.errors.forEach(err => {
                        console.log('  -', err.message || JSON.stringify(err));
                    });
                } else {
                    console.log('✅ Status: SUCCESS');
                    console.log('AEM URL:', `${AEM_HOST}${targetPath}/${uploadFiles[index].fileName}`);
                }
                console.log('');
            });
        }

        return result;

    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        throw error;
    }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        AEM ASSET UPLOAD TEST SCRIPT                   ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        // Step 1: Generate token
        const bearerToken = await generateToken();

        // Step 2: Verify file
        const fileInfo = verifyFile();

        // Step 3: Test AEM connection
        await testAEMConnection(bearerToken);

        // Step 4: Check target folder
        const finalTargetPath = await checkTargetFolder(bearerToken);

        // Step 5: Upload
        await uploadFile(bearerToken, fileInfo, finalTargetPath);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ALL STEPS COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

    } catch (error) {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ TEST FAILED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error:', error.message);
        console.log('');
        process.exit(1);
    }
}

// Run the test
main();

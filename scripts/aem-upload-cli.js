const DirectBinary = require('@adobe/aem-upload');

const targetUrl = 'https://author-p25321-e288205.adobeaemcloud.com/content/dam/mcds';

// Your Bearer token (replace with your actual token)
const bearerToken = 'eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3NjMwMjExMTM4NTlfZWUyNzUwNDUtZjA4Ny00M2U4LWJlNDgtZjQ2ZTA0ZjNmOTZiX3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJkZXYtY29uc29sZS1wcm9kIiwidXNlcl9pZCI6IkI3RkEyMzczNjgyQzVFQjMwQTQ5NUMxMkBjMDFjMGFmMTYyZGQzODE5NDk1YzdiLmUiLCJzdGF0ZSI6InRFeGdaSU1wY0s3YVZWN29WRWdtanNBeSIsImFzIjoiaW1zLW5hMSIsImFhX2lkIjoiNzExQTFEMkU2MjQwQjc5MjBBNDk1RTM5QGRlbG9pdHRlLmNvbSIsImN0cCI6MCwiZmciOiJaNk5PSEZKN0ZMTTVRRFVLRkFRVklIQUFHTSIsInNpZCI6IjE3NjMwMjEwMjA1NTNfNjM2YjFlN2UtNDcyMy00NDFjLWFhODItYjIyMzU3YWExMTkxX3V3MiIsInJ0aWQiOiIxNzYzMDIxMTEzODYwXzIzYmYzNDE0LTAyNzYtNDg3ZC05ZDBlLTQwMjgwMjY4NjIzNV91ZTEiLCJtb2kiOiJiNzg0NjUwIiwicGJhIjoiT1JHLE1lZFNlY05vRVYsTG93U2VjIiwicnRlYSI6IjE3NjQyMzA3MTM4NjAiLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJjcmVhdGVkX2F0IjoiMTc2MzAyMTExMzg1OSIsInNjb3BlIjoiQWRvYmVJRCxvcGVuaWQscmVhZF9vcmdhbml6YXRpb25zLGFkZGl0aW9uYWxfaW5mby5wcm9qZWN0ZWRQcm9kdWN0Q29udGV4dCxhZGRpdGlvbmFsX2luZm8ucm9sZXMifQ.XMZXRj0pRPZng4lBUGPa25aIm1nfTAOyWPbfnEA2Zv7tf5ew4Phl-sXPe6iK8e71cFoVsDiZRdG_YqcpXfoJbb0FDQ-cCwJLfD4yY2zO2M0iF4origyypvBMzukieWaMbSMcecN0hJpwx9B3lRcoorzS2DTiZm5E6SqM8ovMks6EeA_gMAOyy8P_pRiorpxiOa2YJ0Y5MB0NsIIxk8t-Yj-R1JWrfJaSSNQm74tKvQ9imVFb26vPPqk4LKzTW7DRrK9-FmCPJ11W5-FBOIwjezAUcak4ZRxJ5vOggxs2d0i_hs80I4K8jzA7o64mBxDPF2va8lKrC4KVITUKMK2kGQ';

// List of local files to be uploaded
const uploadFiles = [
    {
        fileName: 'speed.png', // Name of the file as it will appear in AEM
        fileSize: 163905, // Total size in bytes
        filePath: './speed.png' // Full local path to the file
    }
];

console.log('Starting upload with Bearer token...');

const upload = new DirectBinary.DirectBinaryUpload();
const options = new DirectBinary.DirectBinaryUploadOptions()
    .withUrl(targetUrl)
    .withUploadFiles(uploadFiles)
    .withHttpOptions({
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
        }
    });

// Execute the upload
upload.uploadFiles(options)
    .then(result => {
        console.log('✅ Upload successful:', JSON.stringify(result, null, 2));
    })
    .catch(err => {
        console.error('❌ Upload failed:', err);
        console.error('Error details:', err.message);
    });
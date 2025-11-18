const { Core } = require('@adobe/aio-sdk')
const { DirectBinaryUpload, DirectBinaryUploadOptions } = require('@adobe/aem-upload')
    const { errorResponse, getBearerToken } = require('../utils')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function main(params) {
    const logger = Core.Logger('upload-to-aem', { level: params.LOG_LEVEL || 'info' })

    try {
        logger.info('Starting AEM asset upload process')
        const config = {
            aemHost: params.aemHost,
            aemTargetPath: params.aemTargetPath,
            aemUsername: params.aemUsername || 'admin',
            aemPassword: params.aemPassword || 'admin',
            sourceFolder: params.sourceFolder,
            bearerToken: params.aemBearerToken,
            fileExtensions: params.fileExtensions || ['.jpg', '.jpeg', '.png', '.pdf']
        }

        logger.info(`Source folder: ${config.sourceFolder}`)
        logger.info(`Target AEM path: ${config.aemHost}${config.aemTargetPath}`)
        logger.info("Bearer Token: ============>",config.bearerToken);
        const filesToUpload = scanFolder(config.sourceFolder, config.fileExtensions, logger)
        logger.info(filesToUpload);
        
        if (filesToUpload.length === 0) {
            logger.warn('No files found to uploadd')
            return {
                statusCode: 200,
                body: {
                    message: 'No files found to uploadd',
                    sourceFolder: config.sourceFolder,
                    timestamp: new Date().toISOString()
                }
            }
        }

        logger.info(`Found ${filesToUpload.length} files to upload`)

        const uploadResults = await uploadFilesBatch(filesToUpload, config, logger)

        const successful = uploadResults.filter(r => r.success).length
        const failed = uploadResults.filter(r => !r.success).length

        logger.info(`Upload complete: ${successful} successful, ${failed} failed`)

        return {
            statusCode: 200,
            body: {
                message: 'Upload process completed',
                summary: {
                    total: filesToUpload.length,
                    successful: successful,
                    failed: failed
                },
                results: uploadResults,
                config: {
                    source: config.sourceFolder,
                    target: `${config.aemHost}${config.aemTargetPath}`
                },
                timestamp: new Date().toISOString()
            }
        }

    } catch (error) {
        logger.error('Upload process failed:', error)
        return errorResponse(500, error.message, logger)
    }
}

function scanFolder(folderPath, allowedExtensions, logger) {
    const files = []
    logger.info(folderPath,"============>");
    
    // Debug: Log current directory structure
    logger.info(`__dirname: ${__dirname}`)
    logger.info(`process.cwd(): ${process.cwd()}`)
    
    // Try to list contents of __dirname for debugging
    try {
        const dirContents = fs.readdirSync(__dirname, { withFileTypes: true })
        logger.info(`Contents of __dirname:`, dirContents.map(d => `${d.name} (${d.isDirectory() ? 'dir' : 'file'})`).join(', '))
    } catch (err) {
        logger.error('Cannot read __dirname:', err.message)
    }
    
    // Use __dirname to resolve relative to the action's location
    const fullPath = path.isAbsolute(folderPath) 
        ? folderPath 
        : path.resolve(__dirname, folderPath)

    logger.info(`Resolved scanning folder: ${fullPath}`)
    logger.info(`Folder exists: ${fs.existsSync(fullPath)}`)

    if (!fs.existsSync(fullPath)) {
        logger.error(`Folder not found: ${fullPath}`)
        
        // Try alternative paths for debugging
        const altPath1 = path.resolve(process.cwd(), folderPath)
        const altPath2 = path.resolve(__dirname, '..', '..', folderPath)
        const altPath3 = path.resolve(__dirname, 'assets', 'images')
        logger.info(`Alt path 1 (cwd-based): ${altPath1}, exists: ${fs.existsSync(altPath1)}`)
        logger.info(`Alt path 2 (parent-based): ${altPath2}, exists: ${fs.existsSync(altPath2)}`)
        logger.info(`Alt path 3 (direct): ${altPath3}, exists: ${fs.existsSync(altPath3)}`)
        
        return files
    }

    const entries = fs.readdirSync(fullPath, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase()

            if (allowedExtensions.includes(ext)) {
                const filePath = path.join(fullPath, entry.name)
                const stats = fs.statSync(filePath)

                files.push({
                    name: entry.name,
                    path: filePath,
                    size: stats.size,
                    extension: ext
                })

                logger.info(`Found: ${entry.name} (${formatBytes(stats.size)})`)
            }
        }
    }

    logger.info("******",files,"**************");

    return files
}

async function uploadFilesBatch(files, config, logger) {
    const results = []
    const credentials = config.bearerToken
    try {
        logger.info(`Uploading ${files.length} files in batch...`)

        const uploadFiles = files.map(file => ({
            fileName: file.name,
            fileSize: file.size,
            filePath: file.path
        }))

        const upload = new DirectBinaryUpload()
        const options = new DirectBinaryUploadOptions()
            .withUrl(`${config.aemHost}${config.aemTargetPath}`)
            .withUploadFiles(uploadFiles)
            .withHttpOptions({
                headers: {
                    Authorization: `Bearer ${credentials}`
                }
            })

        const result = await upload.uploadFiles(options)

        logger.info(`Batch upload completed: ${result.totalCompleted} of ${files.length} files`)

        result.detailedResult.forEach((fileResult, index) => {
            const file = files[index]
            const uploadResult = fileResult.result

            if (uploadResult.errors && uploadResult.errors.length > 0) {
                const error = uploadResult.errors[0].message || 'Upload failed'
                logger.error(`${file.name}: ${error}`)
                results.push({
                    success: false,
                    fileName: file.name,
                    size: file.size,
                    error: error
                })
            } else {
                logger.info(`${file.name}`)
                results.push({
                    success: true,
                    fileName: file.name,
                    size: file.size,
                    aemPath: `${config.aemTargetPath}/${file.name}`,
                    aemUrl: `${config.aemHost}${config.aemTargetPath}/${file.name}`
                })
            }
        })

    } catch (error) {
        logger.error(`Batch upload failed:`, error.message)
        
        files.forEach(file => {
            results.push({
                success: false,
                fileName: file.name,
                size: file.size,
                error: error.message
            })
        })
    }

    return results
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

exports.main = main
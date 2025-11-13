
const { Core } = require('@adobe/aio-sdk')
const { DirectBinaryUpload, DirectBinaryUploadOptions } = require('@adobe/aem-upload')
const { errorResponse } = require('../utils')
const fs = require('fs')
const path = require('path')


async function main(params) {
    const logger = Core.Logger('upload-to-aem', { level: params.LOG_LEVEL || 'info' })

    try {
        logger.info('Starting AEM asset upload process')

        //Configuration
        const config = {
            aemHost: params.aemHost,
            aemTargetPath: params.aemTargetPath,
            aemUsername: params.aemUsername,
            aemPassword: params.aemPassword,
            sourceFolder: params.sourceFolder,
            fileExtensions: params.fileExtensions || params.fileExtensions || ['.jpg', '.jpeg', '.png', '.pdf']
        }

        logger.info(`Source folder: ${config.sourceFolder}`)
        logger.info(`Target AEM path: ${config.aemHost}${config.aemTargetPath}`)

        const filesToUpload = scanFolder(config.sourceFolder, config.fileExtensions, logger)

        if (filesToUpload.length === 0) {
            logger.warn('No files found to upload')
            return {
                statusCode: 200,
                body: {
                    message: 'No files found to upload',
                    sourceFolder: config.sourceFolder,
                    timestamp: new Date().toISOString()
                }
            }
        }

        logger.info(`Found ${filesToUpload.length} files to upload`)

        const uploadResults = await uploadFiles(filesToUpload, config, logger)

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

    const fullPath = path.resolve(folderPath)


    logger.info(`Scanning folder: ${fullPath}`)

    if (!fs.existsSync(fullPath)) {
        logger.error(`Folder not found: ${fullPath}`)
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
            } else {
                logger.debug(`Skipped: ${entry.name} (not in allowed extensions)`)
            }
        }
    }

    return files
}


async function uploadFiles(files, config, logger) {
    const results = []

    const credentials = Buffer.from(`${config.aemUsername}:${config.aemPassword}`).toString('base64')

    for (const file of files) {
        try {
            logger.info(`Uploading: ${file.name}`)

            const uploadFiles = [{
                fileName: file.name,
                fileSize: file.size,
                filePath: file.path
            }]

            const upload = new DirectBinaryUpload()
            const options = new DirectBinaryUploadOptions()
                .withUrl(`${config.aemHost}${config.aemTargetPath}`)
                .withUploadFiles(uploadFiles)
                .withHttpOptions({
                    headers: {
                        Authorization: `Basic ${credentials}`
                    }
                })

            const result = await upload.uploadFiles(options)

            if (result.totalCompleted > 0) {
                logger.info(`Success: ${file.name}`)
                results.push({
                    success: true,
                    fileName: file.name,
                    size: file.size,
                    aemPath: `${config.aemTargetPath}/${file.name}`,
                    aemUrl: `${config.aemHost}${config.aemTargetPath}/${file.name}`
                })
            } else {
                const error = result.detailedResult[0]?.result?.errors?.[0]?.message || 'Upload failed'
                logger.error(`Failed: ${file.name} - ${error}`)
                results.push({
                    success: false,
                    fileName: file.name,
                    error: error
                })
            }

        } catch (error) {
            logger.error(`Error uploading ${file.name}:`, error.message)
            results.push({
                success: false,
                fileName: file.name,
                error: error.message
            })
        }

        await new Promise(resolve => setTimeout(resolve, 500))
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
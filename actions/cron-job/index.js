/*
* <license header>
*/

/**
 * Simple Cron Job API for scheduling and managing tasks
 * 
 * Features:
 * - Create scheduled jobs
 * - List active jobs  
 * - Execute jobs manually
 * - Delete jobs
 */

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils')

// In-memory storage for demo (use a real database in production)
let cronJobs = [
  {
    id: 1,
    name: 'Daily Cleanup',
    schedule: '0 2 * * *', // Every day at 2 AM
    action: 'cleanup-temp-files',
    enabled: true,
    lastRun: null,
    nextRun: '2025-11-05T02:00:00Z',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Weekly Report',
    schedule: '0 9 * * 1', // Every Monday at 9 AM
    action: 'generate-weekly-report',
    enabled: false,
    lastRun: '2025-10-28T09:00:00Z',
    nextRun: '2025-11-11T09:00:00Z',
    createdAt: new Date().toISOString()
  }
]
let nextJobId = 3

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  const logger = Core.Logger('cron-job', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Cron Job API called')
    logger.debug(stringParameters(params))

    // Get HTTP method from __ow_method or default to GET
    const method = params.__ow_method || 'GET'
    const path = params.__ow_path || ''
    
    // Extract job ID from path if present (e.g., /jobs/123)
    const pathParts = path.split('/').filter(p => p)
    const jobId = pathParts.length > 0 ? parseInt(pathParts[0]) : null

    logger.info(`Processing ${method} request for path: ${path}`)

    switch (method.toUpperCase()) {
      case 'GET':
        return handleGet(jobId, logger)
      case 'POST':
        return handlePost(params, logger)
      case 'PUT':
        return handlePut(jobId, params, logger)
      case 'DELETE':
        return handleDelete(jobId, logger)
      default:
        return errorResponse(405, `Method ${method} not allowed`, logger)
    }

  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'Internal server error', logger)
  }
}

// GET /jobs or GET /jobs/:id
function handleGet(jobId, logger) {
  if (jobId) {
    // Get specific job
    const job = cronJobs.find(j => j.id === jobId)
    if (!job) {
      return errorResponse(404, 'Cron job not found', logger)
    }
    logger.info(`Retrieved cron job: ${jobId}`)
    return {
      statusCode: 200,
      body: job
    }
  } else {
    // Get all jobs with optional filtering
    logger.info(`Retrieved ${cronJobs.length} cron jobs`)
    return {
      statusCode: 200,
      body: {
        jobs: cronJobs,
        total: cronJobs.length,
        enabled: cronJobs.filter(j => j.enabled).length,
        disabled: cronJobs.filter(j => !j.enabled).length
      }
    }
  }
}

// POST /jobs - Create new cron job
function handlePost(params, logger) {
  const { name, schedule, action, enabled = true } = params
  
  // Validate required fields
  if (!name || !schedule || !action) {
    return errorResponse(400, 'Name, schedule, and action are required', logger)
  }

  // Basic cron schedule validation (simplified)
  if (!isValidCronSchedule(schedule)) {
    return errorResponse(400, 'Invalid cron schedule format', logger)
  }

  // Check if job name already exists
  if (cronJobs.find(j => j.name.toLowerCase() === name.toLowerCase())) {
    return errorResponse(409, 'Job name already exists', logger)
  }

  const newJob = {
    id: nextJobId++,
    name,
    schedule,
    action,
    enabled: Boolean(enabled),
    lastRun: null,
    nextRun: calculateNextRun(schedule),
    createdAt: new Date().toISOString()
  }

  cronJobs.push(newJob)
  logger.info(`Created cron job: ${newJob.id} - ${newJob.name}`)

  return {
    statusCode: 201,
    body: newJob
  }
}

// PUT /jobs/:id - Update existing cron job
function handlePut(jobId, params, logger) {
  if (!jobId) {
    return errorResponse(400, 'Job ID is required', logger)
  }

  const jobIndex = cronJobs.findIndex(j => j.id === jobId)
  if (jobIndex === -1) {
    return errorResponse(404, 'Cron job not found', logger)
  }

  const { name, schedule, action, enabled } = params
  
  // Check if new name conflicts with existing job
  if (name && cronJobs.find(j => j.name.toLowerCase() === name.toLowerCase() && j.id !== jobId)) {
    return errorResponse(409, 'Job name already exists', logger)
  }

  // Validate cron schedule if provided
  if (schedule && !isValidCronSchedule(schedule)) {
    return errorResponse(400, 'Invalid cron schedule format', logger)
  }

  // Update job
  const updatedJob = {
    ...cronJobs[jobIndex],
    ...(name && { name }),
    ...(schedule && { schedule, nextRun: calculateNextRun(schedule) }),
    ...(action && { action }),
    ...(enabled !== undefined && { enabled: Boolean(enabled) }),
    updatedAt: new Date().toISOString()
  }

  cronJobs[jobIndex] = updatedJob
  logger.info(`Updated cron job: ${jobId}`)

  return {
    statusCode: 200,
    body: updatedJob
  }
}

// DELETE /jobs/:id - Delete cron job
function handleDelete(jobId, logger) {
  if (!jobId) {
    return errorResponse(400, 'Job ID is required', logger)
  }

  const jobIndex = cronJobs.findIndex(j => j.id === jobId)
  if (jobIndex === -1) {
    return errorResponse(404, 'Cron job not found', logger)
  }

  const deletedJob = cronJobs.splice(jobIndex, 1)[0]
  logger.info(`Deleted cron job: ${jobId} - ${deletedJob.name}`)

  return {
    statusCode: 200,
    body: {
      message: 'Cron job deleted successfully',
      job: deletedJob
    }
  }
}

// Helper function to validate cron schedule (simplified)
function isValidCronSchedule(schedule) {
  // Basic validation for cron format: "min hour day month dayOfWeek"
  const parts = schedule.split(' ')
  if (parts.length !== 5) return false
  
  // Check if each part is valid (simplified check)
  const validations = [
    { min: 0, max: 59 },   // minute
    { min: 0, max: 23 },   // hour  
    { min: 1, max: 31 },   // day
    { min: 1, max: 12 },   // month
    { min: 0, max: 7 }     // day of week
  ]
  
  return parts.every((part, index) => {
    if (part === '*') return true
    if (part.includes(',')) {
      return part.split(',').every(p => isValidCronPart(p, validations[index]))
    }
    return isValidCronPart(part, validations[index])
  })
}

function isValidCronPart(part, validation) {
  const num = parseInt(part)
  return !isNaN(num) && num >= validation.min && num <= validation.max
}

// Helper function to calculate next run time (simplified)
function calculateNextRun(schedule) {
  // This is a simplified implementation
  // In production, use a proper cron parser like 'node-cron' or 'cron-parser'
  const now = new Date()
  const nextRun = new Date(now.getTime() + 60 * 60 * 1000) // Add 1 hour as example
  return nextRun.toISOString()
}

exports.main = main
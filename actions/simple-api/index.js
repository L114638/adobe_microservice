/*
* <license header>
*/

/**
 * Simple GET API example
 */

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

// Sample data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User' }
]

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('simple-api', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Simple GET API called')
    logger.debug(stringParameters(params))

    // This is a simple GET API that returns user data
    const response = {
      statusCode: 200,
      body: {
        message: 'Simple GET API working successfully!',
        timestamp: new Date().toISOString(),
        data: users,
        total: users.length
      }
    }

    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
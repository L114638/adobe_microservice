/*
* Daily Cleanup Cron Job Handler
*/

const { Core } = require('@adobe/aio-sdk')

async function main(params) {
  const logger = Core.Logger('daily-cleanup', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Daily cleanup job started')
    
    const startTime = new Date()
    
    // Simulate cleanup operations
    const cleanupTasks = [
      { name: 'Clean temporary files', duration: 2000 },
      { name: 'Remove old logs', duration: 1500 },
      { name: 'Clear cache', duration: 1000 },
      { name: 'Optimize database', duration: 3000 }
    ]
    
    const results = []
    
    for (const task of cleanupTasks) {
      logger.info(`Starting: ${task.name}`)
      
      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * task.duration))
      
      const result = {
        task: task.name,
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * task.duration) + 'ms'
      }
      
      results.push(result)
      logger.info(`Completed: ${task.name} in ${result.duration}`)
    }
    
    const endTime = new Date()
    const totalDuration = endTime - startTime
    
    const response = {
      statusCode: 200,
      body: {
        jobName: 'daily-cleanup',
        status: 'success',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalDuration: `${totalDuration}ms`,
        tasksCompleted: results.length,
        results: results,
        triggeredBy: params.__ow_triggerName || 'manual'
      }
    }
    
    logger.info(`Daily cleanup completed successfully in ${totalDuration}ms`)
    return response
    
  } catch (error) {
    logger.error('Daily cleanup job failed:', error)
    return {
      statusCode: 500,
      body: {
        jobName: 'daily-cleanup',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

exports.main = main
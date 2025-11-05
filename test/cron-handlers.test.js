const dailyCleanup = require('../actions/cron-handlers/daily-cleanup.js')
const weeklyReport = require('../actions/cron-handlers/weekly-report.js')

describe('OpenWhisk Cron Handlers', () => {
  
  describe('daily-cleanup', () => {
    test('main should be defined', () => {
      expect(dailyCleanup.main).toBeInstanceOf(Function)
    })

    test('should execute cleanup tasks successfully', async () => {
      const params = {
        LOG_LEVEL: 'info',
        __ow_triggerName: 'daily-cleanup-trigger'
      }
      
      const response = await dailyCleanup.main(params)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.jobName).toBe('daily-cleanup')
      expect(response.body.status).toBe('success')
      expect(response.body.tasksCompleted).toBe(4)
      expect(response.body.results).toHaveLength(4)
      expect(response.body.triggeredBy).toBe('daily-cleanup-trigger')
      
      // Check all required tasks are present
      const taskNames = response.body.results.map(r => r.task)
      expect(taskNames).toContain('Clean temporary files')
      expect(taskNames).toContain('Remove old logs')
      expect(taskNames).toContain('Clear cache')
      expect(taskNames).toContain('Optimize database')
    }, 10000) // Allow 10 seconds for all cleanup tasks

    test('should handle manual trigger', async () => {
      const params = {
        LOG_LEVEL: 'info'
      }
      
      const response = await dailyCleanup.main(params)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.triggeredBy).toBe('manual')
    }, 10000)
  })

  describe('weekly-report', () => {
    test('main should be defined', () => {
      expect(weeklyReport.main).toBeInstanceOf(Function)
    })

    test('should generate weekly report successfully', async () => {
      const params = {
        LOG_LEVEL: 'info',
        __ow_triggerName: 'weekly-report-trigger'
      }
      
      const response = await weeklyReport.main(params)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.jobName).toBe('weekly-report')
      expect(response.body.status).toBe('success')
      expect(response.body.report).toBeDefined()
      expect(response.body.triggeredBy).toBe('weekly-report-trigger')
      
      // Check report structure
      const report = response.body.report
      expect(report.week).toBeDefined()
      expect(report.year).toBeDefined()
      expect(report.sections).toHaveLength(4)
      expect(report.summary).toBeDefined()
      
      // Check section names
      const sectionNames = report.sections.map(s => s.name)
      expect(sectionNames).toContain('User Activity')
      expect(sectionNames).toContain('API Usage')
      expect(sectionNames).toContain('Performance Metrics')
      expect(sectionNames).toContain('Error Summary')
      
      // Check summary data
      expect(report.summary.totalUsers).toBeDefined()
      expect(report.summary.totalApiCalls).toBeDefined()
      expect(report.summary.averageResponseTime).toBeDefined()
      expect(report.summary.errorRate).toBeDefined()
    }, 10000)

    test('should handle manual execution', async () => {
      const params = {
        LOG_LEVEL: 'info'
      }
      
      const response = await weeklyReport.main(params)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.triggeredBy).toBe('manual')
    }, 10000)

    test('should generate realistic report data', async () => {
      const params = { LOG_LEVEL: 'info' }
      const response = await weeklyReport.main(params)
      const report = response.body.report
      
      // Verify data ranges are realistic
      expect(report.summary.totalUsers).toBeGreaterThan(500)
      expect(report.summary.totalUsers).toBeLessThan(1500)
      
      expect(report.summary.totalApiCalls).toBeGreaterThan(5000)
      expect(report.summary.totalApiCalls).toBeLessThan(15000)
      
      // Error rate should be a percentage string
      expect(report.summary.errorRate).toMatch(/^\d+\.\d+%$/)
    }, 10000)
  })
})
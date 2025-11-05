const action = require('../actions/cron-job/index.js')

describe('cron-job', () => {
  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function)
  })

  describe('GET requests', () => {
    test('should return all cron jobs', async () => {
      const params = {
        __ow_method: 'GET',
        __ow_path: ''
      }
      
      const response = await action.main(params)
      expect(response.statusCode).toBe(200)
      expect(response.body.jobs).toBeDefined()
      expect(Array.isArray(response.body.jobs)).toBe(true)
      expect(response.body.total).toBeDefined()
      expect(response.body.enabled).toBeDefined()
      expect(response.body.disabled).toBeDefined()
    })

    test('should return specific cron job by ID', async () => {
      const params = {
        __ow_method: 'GET',
        __ow_path: '/1'
      }
      
      const response = await action.main(params)
      expect(response.statusCode).toBe(200)
      expect(response.body.id).toBe(1)
      expect(response.body.name).toBe('Daily Cleanup')
    })

    test('should return 404 for non-existent job', async () => {
      const params = {
        __ow_method: 'GET',
        __ow_path: '/999'
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(404)
    })
  })

  describe('POST requests', () => {
    test('should create new cron job', async () => {
      const params = {
        __ow_method: 'POST',
        name: 'Test Job',
        schedule: '0 12 * * *',
        action: 'test-action',
        enabled: true
      }
      
      const response = await action.main(params)
      expect(response.statusCode).toBe(201)
      expect(response.body.name).toBe('Test Job')
      expect(response.body.schedule).toBe('0 12 * * *')
      expect(response.body.action).toBe('test-action')
      expect(response.body.enabled).toBe(true)
      expect(response.body.id).toBeDefined()
    })

    test('should return 400 for missing required fields', async () => {
      const params = {
        __ow_method: 'POST',
        name: 'Incomplete Job'
        // missing schedule and action
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(400)
    })

    test('should return 400 for invalid cron schedule', async () => {
      const params = {
        __ow_method: 'POST',
        name: 'Invalid Schedule Job',
        schedule: 'invalid-cron',
        action: 'test-action'
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(400)
    })
  })

  describe('PUT requests', () => {
    test('should update existing cron job', async () => {
      const params = {
        __ow_method: 'PUT',
        __ow_path: '/1',
        name: 'Updated Cleanup Job',
        enabled: false
      }
      
      const response = await action.main(params)
      expect(response.statusCode).toBe(200)
      expect(response.body.name).toBe('Updated Cleanup Job')
      expect(response.body.enabled).toBe(false)
    })

    test('should return 404 for non-existent job', async () => {
      const params = {
        __ow_method: 'PUT',
        __ow_path: '/999',
        name: 'Non-existent Job'
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(404)
    })
  })

  describe('DELETE requests', () => {
    test('should delete existing cron job', async () => {
      const params = {
        __ow_method: 'DELETE',
        __ow_path: '/2'
      }
      
      const response = await action.main(params)
      expect(response.statusCode).toBe(200)
      expect(response.body.message).toContain('deleted successfully')
    })

    test('should return 404 for non-existent job', async () => {
      const params = {
        __ow_method: 'DELETE',
        __ow_path: '/999'
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(404)
    })
  })

  describe('Method validation', () => {
    test('should return 405 for unsupported HTTP method', async () => {
      const params = {
        __ow_method: 'PATCH',
        __ow_path: '/1'
      }
      
      const response = await action.main(params)
      expect(response.error.statusCode).toBe(405)
    })
  })
})
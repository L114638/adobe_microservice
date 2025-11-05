const action = require('../actions/simple-api/index.js')

describe('simple-api', () => {
  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function)
  })

  test('should return success response with user data', async () => {
    const params = {
      LOG_LEVEL: 'debug'
    }
    
    const response = await action.main(params)
    
    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Simple GET API working successfully!')
    expect(response.body.data).toBeDefined()
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.total).toBe(3)
    expect(response.body.timestamp).toBeDefined()
  })

  test('should return valid response structure', async () => {
    const params = {}
    const response = await action.main(params)
    
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('data')
    expect(response.body).toHaveProperty('total')
  })
})
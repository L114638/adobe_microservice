#!/usr/bin/env node

/**
 * OpenWhisk Deployment Script for Adobe Microservice
 * 
 * This script deploys actions, creates triggers, and sets up rules
 * using the OpenWhisk CLI programmatically
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Starting OpenWhisk deployment...\n')

// Configuration
const config = {
  namespace: 'adobe-microservice',
  actions: [
    {
      name: 'simple-api',
      file: 'actions/simple-api/index.js',
      web: true,
      kind: 'nodejs:18'
    },
    {
      name: 'generic',
      file: 'actions/generic/index.js', 
      web: true,
      kind: 'nodejs:18'
    },
    {
      name: 'publish-events',
      file: 'actions/publish-events/index.js',
      web: true,
      kind: 'nodejs:18'
    },
    {
      name: 'cron-job',
      file: 'actions/cron-job/index.js',
      web: true,
      kind: 'nodejs:18'
    },
    {
      name: 'daily-cleanup',
      file: 'actions/cron-handlers/daily-cleanup.js',
      web: false,
      kind: 'nodejs:18'
    },
    {
      name: 'weekly-report',
      file: 'actions/cron-handlers/weekly-report.js',
      web: false,
      kind: 'nodejs:18'
    }
  ],
  triggers: [
    {
      name: 'daily-cleanup-trigger',
      feed: '/whisk.system/alarms/alarm',
      params: {
        cron: '0 2 * * *',
        timezone: 'UTC'
      }
    },
    {
      name: 'weekly-report-trigger', 
      feed: '/whisk.system/alarms/alarm',
      params: {
        cron: '0 9 * * 1',
        timezone: 'UTC'
      }
    },
    {
      name: 'hourly-backup-trigger',
      feed: '/whisk.system/alarms/interval',
      params: {
        minutes: 60
      }
    }
  ],
  rules: [
    {
      name: 'daily-cleanup-rule',
      trigger: 'daily-cleanup-trigger',
      action: 'daily-cleanup'
    },
    {
      name: 'weekly-report-rule',
      trigger: 'weekly-report-trigger',
      action: 'weekly-report'
    }
  ]
}

// Path to wsk executable
const wskPath = process.platform === 'win32' 
  ? path.resolve(__dirname, 'wsk-cli', 'wsk.exe')
  : 'wsk'

function executeCommand(command, description) {
  try {
    console.log(`📦 ${description}...`)
    // Replace 'wsk' with full path if on Windows
    const fullCommand = command.replace(/^wsk\b/, wskPath)
    const result = execSync(fullCommand, { encoding: 'utf8', stdio: 'pipe' })
    console.log(`✅ ${description} completed`)
    return result
  } catch (error) {
    console.error(`❌ ${description} failed:`)
    console.error(error.message)
    return null
  }
}

function deployActions() {
  console.log('\n🎯 Deploying Actions...')
  
  config.actions.forEach(action => {
    const filePath = path.resolve(action.file)
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return
    }
    
    let command = `wsk action update ${action.name} ${filePath} --kind ${action.kind}`
    
    if (action.web) {
      command += ' --web true --annotation web-export true'
    }
    
    executeCommand(command, `Deploy action: ${action.name}`)
  })
}

function createTriggers() {
  console.log('\n⏰ Creating Triggers...')
  
  config.triggers.forEach(trigger => {
    const params = Object.entries(trigger.params)
      .map(([key, value]) => `--param ${key} "${value}"`)
      .join(' ')
      
    const command = `wsk trigger update ${trigger.name} --feed ${trigger.feed} ${params}`
    executeCommand(command, `Create trigger: ${trigger.name}`)
  })
}

function createRules() {
  console.log('\n📋 Creating Rules...')
  
  config.rules.forEach(rule => {
    const command = `wsk rule update ${rule.name} ${rule.trigger} ${rule.action}`
    executeCommand(command, `Create rule: ${rule.name}`)
  })
}

function showStatus() {
  console.log('\n📊 Deployment Status:')
  
  console.log('\n🎯 Actions:')
  executeCommand('wsk action list', 'List actions')
  
  console.log('\n⏰ Triggers:')
  executeCommand('wsk trigger list', 'List triggers')
  
  console.log('\n📋 Rules:')
  executeCommand('wsk rule list', 'List rules')
  
  console.log('\n🌐 Web Actions URLs:')
  config.actions
    .filter(action => action.web)
    .forEach(action => {
      console.log(`  📡 ${action.name}: https://your-openwhisk-host/api/v1/web/default/${action.name}`)
    })
}

function testActions() {
  console.log('\n🧪 Testing Actions...')
  
  // Test simple-api
  executeCommand('wsk action invoke simple-api --result', 'Test simple-api')
  
  // Test daily-cleanup
  executeCommand('wsk action invoke daily-cleanup --result --param LOG_LEVEL info', 'Test daily-cleanup')
}

// Main execution
async function main() {
  try {
    // Check if wsk CLI is available
    console.log(`Using OpenWhisk CLI: ${wskPath}`)
    executeCommand('wsk --version', 'Check OpenWhisk CLI')
    
    // Deploy everything
    deployActions()
    createTriggers()
    createRules()
    
    // Show status
    showStatus()
    
    // Optional: Test actions
    console.log('\n❓ Would you like to test the actions? (Run: npm run test-openwhisk)')
    
    console.log('\n🎉 OpenWhisk deployment completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('  1. Configure your OpenWhisk endpoint: wsk property set --apihost <host>')
    console.log('  2. Set authentication: wsk property set --auth <auth-key>')
    console.log('  3. Test your actions: wsk action invoke simple-api --result')
    console.log('  4. Monitor triggers: wsk activation poll')
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message)
    process.exit(1)
  }
}

// Run deployment
if (require.main === module) {
  main()
}

module.exports = { config, deployActions, createTriggers, createRules }
#!/usr/bin/env node

/**
 * OpenWhisk Configuration Helper
 * 
 * This script helps configure OpenWhisk for different environments
 */

const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve)
  })
}

async function configureOpenWhisk() {
  console.log('🔧 OpenWhisk Configuration Helper\n')
  
  console.log('Available OpenWhisk environments:')
  console.log('1. Local OpenWhisk (Docker)')
  console.log('2. IBM Cloud Functions')
  console.log('3. Adobe I/O Runtime (current)')
  console.log('4. Custom OpenWhisk instance')
  
  const choice = await question('\nSelect environment (1-4): ')
  
  switch (choice) {
    case '1':
      await configureLocal()
      break
    case '2':
      await configureIBM()
      break
    case '3':
      await configureAdobe()
      break
    case '4':
      await configureCustom()
      break
    default:
      console.log('Invalid choice. Exiting.')
      process.exit(1)
  }
  
  rl.close()
}

async function configureLocal() {
  console.log('\n🐳 Setting up Local OpenWhisk...')
  
  const host = 'http://localhost:3233'
  const auth = '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP'
  
  try {
    execSync(`wsk property set --apihost ${host}`)
    execSync(`wsk property set --auth ${auth}`)
    
    console.log('✅ Local OpenWhisk configured')
    console.log(`   API Host: ${host}`)
    console.log(`   Auth: ${auth}`)
    
    console.log('\n🚀 To start local OpenWhisk:')
    console.log('   git clone https://github.com/apache/openwhisk-devtools.git')
    console.log('   cd openwhisk-devtools/docker-compose')
    console.log('   ./deploy.sh')
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message)
  }
}

async function configureIBM() {
  console.log('\n☁️  Setting up IBM Cloud Functions...')
  
  const region = await question('Enter IBM Cloud region (us-south, eu-gb, etc.): ')
  const apikey = await question('Enter IBM Cloud API key: ')
  
  const host = `https://${region}.functions.cloud.ibm.com`
  
  try {
    execSync(`wsk property set --apihost ${host}`)
    execSync(`wsk property set --auth ${apikey}`)
    
    console.log('✅ IBM Cloud Functions configured')
    console.log(`   API Host: ${host}`)
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message)
  }
}

async function configureAdobe() {
  console.log('\n🎨 Adobe I/O Runtime Configuration...')
  console.log('Your actions are already configured for Adobe I/O Runtime!')
  console.log('Continue using: npx aio app deploy')
  
  console.log('\nIf you want to use wsk CLI with Adobe I/O Runtime:')
  console.log('1. Get your namespace from Adobe Developer Console')
  console.log('2. Get your auth token from Adobe I/O CLI: aio auth ctx')
  console.log('3. Set properties:')
  console.log('   wsk property set --apihost https://adobeioruntime.net')
  console.log('   wsk property set --auth <your-auth-token>')
  console.log('   wsk property set --namespace <your-namespace>')
}

async function configureCustom() {
  console.log('\n⚙️  Custom OpenWhisk Configuration...')
  
  const host = await question('Enter OpenWhisk API host: ')
  const auth = await question('Enter authentication token: ')
  const namespace = await question('Enter namespace (optional): ')
  
  try {
    execSync(`npx wsk property set --apihost ${host}`)
    execSync(`npx wsk property set --auth ${auth}`)
    
    if (namespace) {
      execSync(`wsk property set --namespace ${namespace}`)
    }
    
    console.log('✅ Custom OpenWhisk configured')
    console.log(`   API Host: ${host}`)
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message)
  }
}

// Test connection
async function testConnection() {
  console.log('\n🧪 Testing OpenWhisk connection...')
  
  try {
    const result = execSync('wsk list', { encoding: 'utf8' })
    console.log('✅ Connection successful!')
    console.log('Current configuration:')
    execSync('wsk property get', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your API host and auth settings')
    console.log('2. Verify network connectivity')
    console.log('3. Run: wsk property get')
  }
}

if (require.main === module) {
  configureOpenWhisk().then(() => {
    return testConnection()
  })
}

module.exports = { configureOpenWhisk, testConnection }
# OpenWhisk Integration Guide

This project now supports deployment to Apache OpenWhisk with proper cron scheduling using the alarms package.

## 🚀 Quick Start

### 1. Configure OpenWhisk
```bash
# Interactive configuration
npm run openwhisk:configure

# Or manually configure
wsk property set --apihost https://your-openwhisk-host
wsk property set --auth your-auth-token
```

### 2. Deploy to OpenWhisk
```bash
# Deploy all actions, triggers, and rules
npm run openwhisk:deploy

# Check deployment status
npm run openwhisk:status
```

### 3. Test Actions
```bash
# Test actions
npm run openwhisk:test

# Monitor activations
npm run openwhisk:logs
```

## 📋 Available Actions

### Web Actions (REST APIs)
- **simple-api** - Basic GET API returning user data
- **generic** - External API integration with auth
- **publish-events** - Event publishing service
- **cron-job** - Cron job management API

### Cron Handlers (Scheduled Jobs)
- **daily-cleanup** - Runs daily at 2 AM UTC
- **weekly-report** - Runs Mondays at 9 AM UTC

## ⏰ Scheduled Triggers

### 1. Daily Cleanup Trigger
```bash
# Cron: 0 2 * * * (Daily at 2 AM UTC)
wsk trigger get daily-cleanup-trigger
```

### 2. Weekly Report Trigger
```bash
# Cron: 0 9 * * 1 (Mondays at 9 AM UTC)
wsk trigger get weekly-report-trigger
```

### 3. Hourly Backup Trigger
```bash
# Interval: Every 60 minutes
wsk trigger get hourly-backup-trigger
```

## 🔧 Manual Operations

### Create Custom Trigger
```bash
wsk trigger create my-trigger \
  --feed /whisk.system/alarms/alarm \
  --param cron "0 12 * * *" \
  --param timezone "UTC"
```

### Create Rule
```bash
wsk rule create my-rule my-trigger my-action
```

### Test Action
```bash
wsk action invoke daily-cleanup --result --param LOG_LEVEL debug
```

### View Activation Logs
```bash
wsk activation list
wsk activation logs <activation-id>
```

## 📊 Monitoring

### Real-time Monitoring
```bash
# Monitor all activations
npm run openwhisk:logs

# Monitor specific action
wsk activation poll daily-cleanup
```

### Check Action Status
```bash
# List all actions
wsk action list

# Get action details
wsk action get daily-cleanup

# Check recent activations
wsk activation list --limit 10
```

## 🌐 Web Action URLs

After deployment, your web actions will be available at:

```
https://your-openwhisk-host/api/v1/web/default/simple-api
https://your-openwhisk-host/api/v1/web/default/generic
https://your-openwhisk-host/api/v1/web/default/publish-events
https://your-openwhisk-host/api/v1/web/default/cron-job
```

## 🐳 Local OpenWhisk Setup

### Using Docker Compose
```bash
# Clone OpenWhisk devtools
git clone https://github.com/apache/openwhisk-devtools.git
cd openwhisk-devtools/docker-compose

# Start OpenWhisk
./deploy.sh

# Configure local endpoint
wsk property set --apihost http://localhost:3233
wsk property set --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
```

## ☁️ Cloud Providers

### IBM Cloud Functions
```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login and set region
ibmcloud login
ibmcloud target -r us-south

# Get OpenWhisk credentials
ibmcloud fn property get --auth
```

### Adobe I/O Runtime
```bash
# Continue using existing Adobe setup
npx aio app deploy

# Or use wsk CLI with Adobe credentials
wsk property set --apihost https://adobeioruntime.net
wsk property set --auth <adobe-auth-token>
wsk property set --namespace <adobe-namespace>
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   wsk property get  # Check current settings
   wsk list          # Test connection
   ```

2. **Trigger Not Firing**
   ```bash
   wsk trigger get daily-cleanup-trigger  # Check trigger config
   wsk rule get daily-cleanup-rule        # Check rule status
   ```

3. **Action Errors**
   ```bash
   wsk activation list --limit 5          # Get recent activations
   wsk activation logs <activation-id>    # View error logs
   ```

### Debug Mode
```bash
# Enable verbose logging
wsk -v action invoke daily-cleanup --result

# Check action code
wsk action get daily-cleanup --save
```

## 📚 Advanced Usage

### Custom Cron Schedules
```bash
# Every 15 minutes
wsk trigger create every-15min \
  --feed /whisk.system/alarms/interval \
  --param minutes 15

# Weekdays at 6 PM
wsk trigger create weekday-evening \
  --feed /whisk.system/alarms/alarm \
  --param cron "0 18 * * 1-5"

# Last day of every month
wsk trigger create month-end \
  --feed /whisk.system/alarms/alarm \
  --param cron "0 23 L * *"
```

### Action Sequences
```bash
# Create action sequence
wsk action create cleanup-and-report \
  --sequence daily-cleanup,weekly-report
```

### Parameters and Environment
```bash
# Set default parameters
wsk action update daily-cleanup \
  --param LOG_LEVEL info \
  --param ENVIRONMENT production

# Set environment variables
wsk action update daily-cleanup \
  --env DATABASE_URL postgresql://...
```

## 🚀 Production Considerations

1. **Resource Limits**: Set appropriate memory and timeout limits
2. **Error Handling**: Implement retry logic for failed actions
3. **Monitoring**: Set up alerts for failed activations
4. **Secrets Management**: Use OpenWhisk parameters for sensitive data
5. **Scaling**: Configure concurrency limits based on your needs

## 📞 Support

For OpenWhisk-specific issues:
- [Apache OpenWhisk Documentation](https://openwhisk.apache.org/documentation.html)
- [OpenWhisk GitHub Issues](https://github.com/apache/openwhisk/issues)
- [IBM Cloud Functions Documentation](https://cloud.ibm.com/docs/openwhisk)
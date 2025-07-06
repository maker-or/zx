# AI Reflection System - Debugging & Testing Guide

## Overview

The AI Reflection System allows users to create therapeutic or inspirational stories based on their memories using OpenRouter's AI API. The system works in three tiers:

1. **Weekly Reflections**: Select a memory from the past week and generate an AI story
2. **Monthly Reflections**: Choose from weekly reflections to create deeper insights
3. **Yearly Reflections**: Pick the most meaningful monthly reflection for profound life reflections

## System Architecture

```
Memory Entry → Weekly Reflection → Monthly Reflection → Yearly Reflection
      ↓              ↓                    ↓                    ↓
  Users Table → Reflections Table → AI Story Generation → Story Display
```

## Prerequisites

### Environment Setup

1. **OpenRouter API Key**: Required for AI story generation
   ```bash
   # Add to your .env file
   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-your-api-key-here
   ```

2. **Database Tables**: Ensure all tables are created:
   - `users_table` (memories)
   - `reflections`
   - `weekly_selections`
   - `monthly_selections`
   - `reflection_triggers`

## Debug Tools Available

### 1. Debug Buttons (Development Mode Only)

Located in the reflection home screen (`/app/(app)/reflection/index.tsx`):

- **Debug Reflection System**: Runs comprehensive system tests
- **Create Test Memories**: Creates 7 sample memories for testing

### 2. Debug Utility (`/utils/debugReflection.ts`)

```typescript
import { quickReflectionDebug, createTestMemories } from '../utils/debugReflection';

// Test entire system
await quickReflectionDebug(db, userID, openRouterApiKey);

// Create test data
await createTestMemories(db, userID, 7);
```

### 3. Console Logging

All major operations now include detailed console logging with `[DEBUG]` and `[ERROR]` prefixes.

## Testing Steps

### Step 1: Basic Setup Test

1. Open the reflection screen
2. Check console for any initialization errors
3. Verify API key is loaded: Look for `[DEBUG] useReflection - API key provided: true`

### Step 2: Create Test Data

1. If no memories exist, click "Create Test Memories" in debug section
2. This creates 7 memories spread across recent days
3. Check console for creation confirmations

### Step 3: Test Weekly Reflection

1. Click "Debug Reflection System" to run full system test
2. Or manually:
   - Go to Weekly Reflection
   - Check if memories load for the current week
   - Try selecting a memory and generating a story

### Step 4: Monitor Console Output

Key things to look for:
```
[DEBUG] createReflectionTriggers for user: [userID]
[DEBUG] Found [X] memories for week [Y]
[DEBUG] Generating AI story...
[DEBUG] AI story generated successfully - [X] words
[DEBUG] Reflection saved with ID: [reflectionID]
```

## Common Issues & Solutions

### Issue 1: "No Memories Found"

**Symptoms**: Weekly reflection shows no memories available

**Debug Steps**:
1. Check console for: `[DEBUG] Found [X] memories for week [Y]`
2. Verify week calculation: `[DEBUG] Week [X] starts on: [date]`
3. Check if memories exist in database

**Solutions**:
- Create test memories using debug button
- Verify memory dates are within the calculated week range
- Check if week calculation is correct for your timezone

### Issue 2: "API Key Authentication Failed"

**Symptoms**: AI generation fails with 401 errors

**Debug Steps**:
1. Check console for: `[DEBUG] API key validation: true`
2. Verify API key format starts with "sk-"
3. Test API connection: `[DEBUG] API connection test result: true`

**Solutions**:
- Verify `.env` file has correct API key
- Check API key is valid on OpenRouter dashboard
- Restart development server after changing .env

### Issue 3: AI Story Generation Fails

**Symptoms**: Error during story generation

**Debug Steps**:
1. Check console for API request logs
2. Look for network errors or rate limiting
3. Verify memory content is not empty

**Solutions**:
- Check internet connection
- Verify API key has sufficient credits
- Try with different memory content
- Check if rate limited (wait and retry)

### Issue 4: Week Calculation Issues

**Symptoms**: Memories not appearing in correct week

**Debug Steps**:
1. Check console for week calculation logs
2. Compare calculated week range with actual memory dates
3. Verify timezone consistency

**Solutions**:
- Week calculation uses Monday as start of week
- Dates are compared as strings (YYYY-MM-DD format)
- Check if memory dates are stored correctly

## Manual Testing Checklist

### Basic Functionality
- [ ] App loads without errors
- [ ] Environment variables are loaded
- [ ] Database connections work
- [ ] API key is valid

### Memory System
- [ ] Can create memories via home screen
- [ ] Memories are stored with correct dates
- [ ] Memories appear in correct weeks
- [ ] Test memories can be created via debug tool

### Reflection System
- [ ] Weekly reflection triggers are created
- [ ] Memories load correctly for specific weeks
- [ ] Memory selection works
- [ ] Story type selection works
- [ ] AI story generation works
- [ ] Generated stories are saved
- [ ] Story display works correctly

### Edge Cases
- [ ] No memories available (proper error handling)
- [ ] Network connection issues
- [ ] API key issues
- [ ] Rate limiting scenarios
- [ ] Invalid memory selection

## Debug API Calls

### Test API Connection
```typescript
const aiService = new AIService(openRouterApiKey);
const isConnected = await aiService.testConnection();
console.log('API Connected:', isConnected);
```

### Test Story Generation
```typescript
const aiRequest = {
  memory: "Test memory content",
  memoryDate: "2024-01-15",
  storyType: "therapeutic",
  reflectionType: "weekly"
};
const response = await aiService.generateStory(aiRequest);
console.log('Generated story:', response.story);
```

## Troubleshooting by Error Type

### Network Errors
```
Error: Network error: Unable to connect to AI service
```
- Check internet connection
- Verify OpenRouter API is accessible
- Check firewall/proxy settings

### Authentication Errors
```
Error: API key authentication failed
```
- Verify API key format (starts with "sk-")
- Check API key is active on OpenRouter
- Confirm environment variable is set correctly

### Rate Limiting
```
Error: Rate limit exceeded
```
- Wait before retrying
- Check API usage on OpenRouter dashboard
- Consider upgrading API plan

### Database Errors
```
Error: Failed to load memories
```
- Check database connection
- Verify table schemas are correct
- Check user permissions

## Performance Monitoring

Monitor these metrics:
- API response times
- Memory loading times
- Story generation success rate
- Database query performance

## Best Practices for Testing

1. **Test with Real Data**: Use actual memories, not just test data
2. **Test Different Scenarios**: Various memory types, lengths, and content
3. **Test Edge Cases**: Empty memories, very long memories, special characters
4. **Test Network Conditions**: Slow connections, intermittent connectivity
5. **Test API Limits**: What happens when you hit rate limits

## Getting Help

If you encounter issues not covered in this guide:

1. Check console logs for detailed error messages
2. Run the comprehensive debug test
3. Verify all prerequisites are met
4. Check OpenRouter API status
5. Review recent code changes

## Development Tips

1. **Always Test in Development**: Use `__DEV__` checks for debug tools
2. **Monitor Console**: Keep console open during testing
3. **Test Incremental Changes**: Test each component separately
4. **Use Debug Tools**: Leverage the built-in debug functionality
5. **Verify Environment**: Double-check API keys and database setup

---

*This guide covers debugging the AI Reflection System. For general app debugging, refer to the main development documentation.*
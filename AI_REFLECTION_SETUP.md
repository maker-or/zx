# AI Reflection System Setup Guide

## Overview

The AI Reflection System transforms your daily memories into therapeutic and inspirational stories using AI. It operates on three cycles:

- **Weekly Reflections**: Choose a "haunting" memory from the week for therapeutic reframing
- **Monthly Reflections**: Select from weekly reflections for deeper insights  
- **Yearly Reflections**: Pick the most meaningful monthly reflection for profound life narratives

## Setup Instructions

### 1. Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to the API Keys section
4. Create a new API key
5. Copy your API key

### 2. Configure Environment Variables

1. Create a `.env` file in your project root
2. Add your OpenRouter API key:

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Test the System

1. Write memories for at least a week
2. Tap the 🧠 brain icon in the navigation header
3. Create your first weekly reflection

## Using the AI Reflection System

### Accessing Reflections

1. **From Navigation**: Tap the 🧠 brain icon in the main app header
2. **Automatic Prompts**: The system will notify you when reflections are ready

### Creating Reflections

#### Weekly Reflections
- Available after you have memories from a complete week
- Choose one memory that feels emotionally significant
- Select between therapeutic reframing or inspirational perspective
- AI generates a 200-400 word story

#### Monthly Reflections  
- Available when you have completed weekly reflections
- Choose from your weekly reflections for the month
- AI creates deeper insights (400-600 words)

#### Yearly Reflections
- Available when you have monthly reflections
- Select your most meaningful monthly reflection
- AI generates profound life narratives (600-800 words)

### Story Types

**🌱 Therapeutic Reframing**
- Focuses on healing and growth
- Reframes difficult experiences positively
- Emphasizes lessons learned and strength gained

**✨ Inspirational Journey**
- Emphasizes resilience and courage
- Transforms memories into empowering narratives
- Celebrates personal growth and transformation

## Features

### Automatic Triggers
- The system automatically detects when you're ready for new reflections
- Smart notifications appear when reflection opportunities are available
- No manual tracking needed

### Memory Curation
- AI helps identify emotionally significant memories
- Presents curated options for easier selection
- Considers writing patterns and emotional intensity

### Story Archive
- All AI-generated stories are saved locally
- Access your complete reflection history
- Stories remain available offline

### Privacy & Security
- All data stored locally on your device
- Only selected memory text is sent to AI for story generation
- No personal data beyond memories shared with external services

## Troubleshooting

### "Configuration Required" Error
- Ensure your `.env` file contains `EXPO_PUBLIC_OPENROUTER_API_KEY`
- Verify your API key is valid and active
- Restart the app after adding environment variables

### No Reflection Options Available
- **Weekly**: You need memories from at least one complete week
- **Monthly**: You need at least one completed weekly reflection in the month
- **Yearly**: You need at least one completed monthly reflection in the year

### AI Generation Fails
- Check your internet connection
- Verify your OpenRouter API key has credits/quota
- Try again - temporary API issues may resolve automatically

### Memory Selection Issues
- Ensure you have written memories for the time period
- Memories need to contain meaningful content (not just a few words)
- Try manually creating a reflection if automatic triggers don't appear

## Cost Considerations

The AI reflection system uses OpenRouter's API which charges based on usage:

- **Weekly Reflections**: ~$0.01-0.03 per story
- **Monthly Reflections**: ~$0.02-0.05 per story  
- **Yearly Reflections**: ~$0.03-0.07 per story

Costs depend on memory length and AI model used. The system is designed to be cost-effective while providing high-quality therapeutic content.

## Technical Details

### AI Models Used
- Primary: Claude-3.5-Haiku (fast, cost-effective)
- Fallback: GPT-4 (if Claude unavailable)
- Specialized prompts for each reflection type

### Database Storage
- Stories stored in local SQLite database
- Reflection metadata tracked for history
- No cloud storage required

### Offline Capability
- View previously generated stories offline
- All reflection history available without internet
- Only story generation requires internet connection

## Support

For issues or questions:
1. Check this setup guide
2. Verify your environment configuration
3. Ensure you have sufficient memories written
4. Try creating a manual reflection instead of waiting for automatic triggers

The AI Reflection System is designed to be a powerful tool for personal growth, helping you find meaning, healing, and inspiration in your daily experiences.

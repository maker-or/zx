#!/bin/bash

echo "🧠 AI Reflection System - Quick Test Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "📝 Create a .env file with:"
    echo "   EXPO_PUBLIC_OPENROUTER_API_KEY=your_api_key_here"
    echo ""
    exit 1
else
    echo "✅ .env file found"
fi

# Check if OpenRouter API key is set
if grep -q "EXPO_PUBLIC_OPENROUTER_API_KEY=" .env; then
    echo "✅ OpenRouter API key configured"
else
    echo "❌ OpenRouter API key not found in .env"
    echo "📝 Add this line to your .env file:"
    echo "   EXPO_PUBLIC_OPENROUTER_API_KEY=your_api_key_here"
    exit 1
fi

# Check key files exist
echo ""
echo "🔍 Checking system files..."

files_to_check=(
    "services/ai.ts"
    "services/reflection.ts" 
    "services/memory.ts"
    "hooks/useReflection.ts"
    "components/AIStoryDisplay.tsx"
    "components/MemorySelector.tsx" 
    "components/ReflectionNotification.tsx"
    "app/reflection/index.tsx"
    "app/reflection/weekly/index.tsx"
    "app/reflection/monthly/index.tsx"
    "app/reflection/yearly/index.tsx"
    "db/schema.ts"
)

missing_files=()

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo "🎉 All system files present!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Start your app: npm start"
    echo "2. Write some daily memories"
    echo "3. Tap the 🧠 brain icon to access reflections"
    echo "4. Test the weekly reflection system"
    echo ""
    echo "📖 For detailed setup instructions, see AI_REFLECTION_SETUP.md"
else
    echo ""
    echo "❌ Missing files detected. Please ensure all system files are present."
    echo "Missing: ${missing_files[*]}"
fi

#!/bin/bash

# Database Deployment Script for Hemalink
# This script helps deploy the database schema and triggers to Supabase

echo "🚀 Starting Hemalink Database Deployment..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Get project reference
echo "📋 Available Supabase Projects:"
supabase projects list

echo ""
echo "Please enter your Supabase Project Reference (from the list above):"
read -r PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

# Link to project
echo "🔗 Linking to project $PROJECT_REF..."
supabase link --project-ref "$PROJECT_REF"

# Deploy database schema
echo "🗄️ Deploying database schema..."
supabase db push --database="$PROJECT_REF"

# Deploy triggers and functions
echo "⚡ Deploying triggers and functions..."
supabase functions deploy --no-verify-jwt

echo "✅ Database deployment completed!"
echo ""
echo "📝 Next Steps:"
echo "1. Update your Vercel Environment Variables with:"
echo "   - VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard"
echo ""
echo "2. Test the registration flow for all user types"
echo "3. Verify dashboard loading after registration"

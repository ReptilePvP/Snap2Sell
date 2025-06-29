# Supabase Setup Guide for Snap2Sell

This guide will walk you through setting up Supabase for the Snap2Sell application.

## ✅ Your Supabase Project is Already Configured!

Your Supabase credentials have been added to the project:
- **Project URL**: `https://fugqihsvleopnsvasawj.supabase.co`
- **Anon Key**: Already configured in environment files

## 🚀 Quick Start

### 1. Set Up the Database Schema

You need to run the database migration to create the required tables:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/fugqihsvleopnsvasawj
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20250621042903_snowy_meadow.sql`
5. Click **Run** to execute the migration

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and link to your project
supabase init
supabase link --project-ref fugqihsvleopnsvasawj

# Push the migration
supabase db push
```

### 2. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Set the **Site URL** to `http://localhost:5173` for development
3. **Email Confirmations**: You can disable this for development

### 3. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Try creating a new account
4. Check your Supabase dashboard to see the new user and profile

## 📋 What's Already Configured

### Frontend Configuration
- ✅ Supabase URL and key added to `frontend/.env`
- ✅ Supabase client configured in `frontend/services/supabaseClient.ts`
- ✅ Auth service updated to use Supabase in `frontend/services/authService.ts`

### Mobile Configuration
- ✅ Supabase credentials added to `mobile/app.json`
- ✅ Environment variables configured in `mobile/.env`
- ✅ Supabase client configured in `mobile/src/services/supabaseClient.ts`
- ✅ Auth context updated to use Supabase

### Database Schema
- ✅ Migration file created: `supabase/migrations/20250621042903_snowy_meadow.sql`
- ✅ Profiles table with Row Level Security
- ✅ Automatic profile creation trigger
- ✅ Proper security policies

## 🔐 Security Features Included

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure token-based authentication
- **Automatic Profile Creation**: Profiles are created automatically on signup
- **Session Management**: Automatic token refresh and session persistence

## 🛠 Database Schema

The migration creates:

```sql
-- Profiles table extending auth.users
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
- Users can read their own profile
- Users can update their own profile  
- Users can insert their own profile

-- Trigger for automatic profile creation
- Creates profile record when user signs up
```

## 🚨 Next Steps

1. **Run the database migration** (see Step 1 above)
2. **Test user registration** on your frontend
3. **Verify data in Supabase dashboard**

## 📱 Cross-Platform Ready

Both your web and mobile applications are now configured to use the same Supabase backend:
- Shared user accounts
- Consistent authentication flow
- Real-time sync across platforms

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid API key"**: The keys are already configured correctly
2. **"Table doesn't exist"**: Run the database migration first
3. **CORS errors**: Set Site URL to `http://localhost:5173` in Supabase Auth settings

### Useful Dashboard Links

- **Users**: https://supabase.com/dashboard/project/fugqihsvleopnsvasawj/auth/users
- **Tables**: https://supabase.com/dashboard/project/fugqihsvleopnsvasawj/editor
- **SQL Editor**: https://supabase.com/dashboard/project/fugqihsvleopnsvasawj/sql
- **Auth Settings**: https://supabase.com/dashboard/project/fugqihsvleopnsvasawj/auth/settings

## 🎉 You're All Set!

Your Supabase integration is ready to go. Just run the database migration and start testing user authentication!
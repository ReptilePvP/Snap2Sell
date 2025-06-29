// Environment validation for build process
const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  if (process.env.NETLIFY || process.env.CI) {
    console.error('❌ Missing required environment variables in production:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.error('Please configure these in your Netlify site settings.');
    process.exit(1);
  } else {
    console.warn('⚠️ Missing environment variables (local build):');
    missingVars.forEach(varName => console.warn(`  - ${varName}`));
    console.warn('Build will continue, but the app may not work properly without these variables.');
  }
} else {
  console.log('✅ All required environment variables are present');
}

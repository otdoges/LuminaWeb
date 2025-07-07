// Simple script to check if environment variables are loaded correctly
console.log('\n🔧 Environment Variables Check');
console.log('================================');

const vars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

vars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  if (value) {
    console.log(`  → ${value.substring(0, 30)}...`);
  }
});

console.log('\n📝 Instructions:');
console.log('1. Create a .env.local file in your project root');
console.log('2. Add the following lines:');
console.log('   VITE_SUPABASE_URL=your_supabase_project_url');
console.log('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
console.log('3. Get these values from: https://app.supabase.com');
console.log('   → Your Project → Settings → API');
console.log('4. Restart your dev server after creating the file\n');

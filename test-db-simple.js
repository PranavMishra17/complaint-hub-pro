require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Found' : 'Missing');

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    console.log('✅ Environment variables loaded successfully!');
} else {
    console.log('❌ Environment variables missing');
}
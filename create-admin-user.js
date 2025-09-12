import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔧 Creating admin user...');
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .upsert([{
        email: 'admin@demo.com',
        password_hash: hashedPassword,
        name: 'Demo Admin',
        role: 'admin',
        is_active: true
      }], {
        onConflict: 'email'
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Failed to create admin user:', adminError);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@demo.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name: Demo Admin');
    console.log('🎯 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdminUser();
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

async function createAdminUsers() {
  console.log('🔧 Creating admin users...');
  
  const adminUsers = [
    {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin'
    },
    {
      email: 'agent@demo.com', 
      name: 'Demo Agent',
      role: 'agent'
    },
    {
      email: 'manager@demo.com',
      name: 'Demo Manager', 
      role: 'admin'
    }
  ];
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    for (const user of adminUsers) {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .upsert([{
          email: user.email,
          password_hash: hashedPassword,
          name: user.name,
          role: user.role,
          is_active: true
        }], {
          onConflict: 'email'
        })
        .select()
        .single();

      if (adminError) {
        console.error(`❌ Failed to create user ${user.email}:`, adminError);
        continue;
      }
      
      console.log(`✅ ${user.name} created successfully!`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎯 Role: ${user.role}`);
      console.log('---');
    }
    
    console.log('🔑 Password for all users: admin123');
    console.log('✅ All admin users created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating admin users:', error.message);
  }
}

createAdminUsers();
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database for recent complaints...');
  console.log('🎯 Looking for our test complaints and their complaint_type values');
  console.log('=' * 60);

  try {
    // Get the most recent complaints (our test data)
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, name, email, complaint_type, complaint, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Database query error:', error.message);
      return;
    }

    if (!complaints || complaints.length === 0) {
      console.log('📝 No complaints found in database');
      return;
    }

    console.log(`📊 Found ${complaints.length} recent complaints:`);
    console.log('\n' + '=' * 80);

    complaints.forEach((complaint, index) => {
      console.log(`\n🎫 Complaint ${index + 1}:`);
      console.log(`  ID: ${complaint.id}`);
      console.log(`  Name: ${complaint.name}`);
      console.log(`  Email: ${complaint.email}`);
      console.log(`  📝 Complaint Type: "${complaint.complaint_type}" ${complaint.complaint_type === 'General' ? '⚠️  (DEFAULTED TO GENERAL!)' : '✅'}`);
      console.log(`  Complaint: ${complaint.complaint.substring(0, 60)}${complaint.complaint.length > 60 ? '...' : ''}`);
      console.log(`  Created: ${new Date(complaint.created_at).toLocaleString()}`);
    });

    // Count by complaint type
    console.log('\n' + '=' * 80);
    console.log('📈 Complaint Type Statistics:');
    
    const typeCount = {};
    complaints.forEach(complaint => {
      typeCount[complaint.complaint_type] = (typeCount[complaint.complaint_type] || 0) + 1;
    });

    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} complaints ${type === 'General' ? '⚠️' : '✅'}`);
    });

    // Check specifically for our test data
    console.log('\n' + '=' * 80);
    console.log('🧪 Looking for our test complaints:');
    
    const testUsers = ['Test User 1', 'Test User 2', 'Test User 3'];
    const testComplaints = complaints.filter(c => testUsers.includes(c.name));
    
    if (testComplaints.length > 0) {
      console.log(`\n✅ Found ${testComplaints.length} test complaints:`);
      testComplaints.forEach((complaint, index) => {
        console.log(`  ${complaint.name}: complaint_type = "${complaint.complaint_type}"`);
      });
    } else {
      console.log('\n❌ No test complaints found. They may have been processed by a different backend instance.');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

// Run the check
checkDatabase().catch(console.error);
// test-database.js
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

async function testDatabase() {
  console.log('🚀 Starting database tests...\n');

  let testIds = {};

  try {
    // 1. Test admin_users table
    console.log('1. Testing admin_users table...');
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .insert([{
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test Admin',
        role: 'admin'
      }])
      .select()
      .single();

    if (adminError) throw adminError;
    testIds.adminUserId = adminUser.id;
    console.log('✅ Admin user created:', adminUser.email);

    // 2. Test complaints table
    console.log('\n2. Testing complaints table...');
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert([{
        name: 'John Doe',
        email: 'john@example.com',
        complaint: 'This is a **test complaint** with markdown support.',
        complaint_html: '<p>This is a <strong>test complaint</strong> with markdown support.</p>',
        status: 'Pending',
        attachments: JSON.stringify([]),
        client_ip: '192.168.1.1',
        user_agent: 'Test Agent'
      }])
      .select()
      .single();

    if (complaintError) throw complaintError;
    testIds.complaintId = complaint.id;
    console.log('✅ Complaint created:', complaint.name);

    // 3. Test complaint_comments table
    console.log('\n3. Testing complaint_comments table...');
    const { data: comment, error: commentError } = await supabase
      .from('complaint_comments')
      .insert([{
        complaint_id: complaint.id,
        author_id: adminUser.id,
        author_name: adminUser.name,
        comment_text: 'This is a test comment with *emphasis*.',
        comment_html: '<p>This is a test comment with <em>emphasis</em>.</p>',
        is_internal: false
      }])
      .select()
      .single();

    if (commentError) throw commentError;
    testIds.commentId = comment.id;
    console.log('✅ Comment created by:', comment.author_name);

    // 4. Test data retrieval
    console.log('\n4. Testing data retrieval...');
    
    // Get complaint with comments
    const { data: complaintWithComments, error: retrieveError } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_comments (
          *,
          admin_users (name, email)
        )
      `)
      .eq('id', complaint.id)
      .single();

    if (retrieveError) throw retrieveError;
    console.log('✅ Retrieved complaint with comments count:', complaintWithComments.complaint_comments.length);

    // 5. Test status update
    console.log('\n5. Testing status update...');
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({ 
        status: 'Resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', complaint.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log('✅ Complaint status updated to:', updatedComplaint.status);

    console.log('\n🎉 All tests passed! Data created successfully.\n');

    // Cleanup - Delete test data
    console.log('🧹 Cleaning up test data...');
    
    // Delete comment first (foreign key constraint)
    const { error: deleteCommentError } = await supabase
      .from('complaint_comments')
      .delete()
      .eq('id', comment.id);

    if (deleteCommentError) throw deleteCommentError;
    console.log('✅ Test comment deleted');

    // Delete complaint
    const { error: deleteComplaintError } = await supabase
      .from('complaints')
      .delete()
      .eq('id', complaint.id);

    if (deleteComplaintError) throw deleteComplaintError;
    console.log('✅ Test complaint deleted');

    // Delete admin user
    const { error: deleteAdminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminUser.id);

    if (deleteAdminError) throw deleteAdminError;
    console.log('✅ Test admin user deleted');

    console.log('\n✨ Database test completed successfully! All tables are working properly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Attempt cleanup on error
    console.log('\n🧹 Attempting cleanup after error...');
    
    if (testIds.commentId) {
      await supabase.from('complaint_comments').delete().eq('id', testIds.commentId);
      console.log('✅ Cleanup: Comment deleted');
    }
    
    if (testIds.complaintId) {
      await supabase.from('complaints').delete().eq('id', testIds.complaintId);
      console.log('✅ Cleanup: Complaint deleted');
    }
    
    if (testIds.adminUserId) {
      await supabase.from('admin_users').delete().eq('id', testIds.adminUserId);
      console.log('✅ Cleanup: Admin user deleted');
    }

    process.exit(1);
  }
}

// Run the test
testDatabase();
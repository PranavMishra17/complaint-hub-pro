import { Response } from 'express';
import { supabase } from '../config/database';
import { processMarkdown } from '../utils/markdown';
import { AuthenticatedRequest, CreateCommentRequest } from '../types';

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: complaintId } = req.params;
    const { comment_text, is_internal = false }: CreateCommentRequest = req.body;

    // Verify complaint exists
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .select('id')
      .eq('id', complaintId)
      .single();

    if (complaintError || !complaint) {
      res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
      return;
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('name')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      res.status(400).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const commentHtml = await processMarkdown(comment_text);

    const { data, error } = await supabase
      .from('complaint_comments')
      .insert([{
        complaint_id: complaintId,
        author_id: req.user!.id,
        author_name: user.name,
        comment_text,
        comment_html: commentHtml,
        is_internal
      }])
      .select(`
        *,
        admin_users (name, email)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create comment'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: complaintId } = req.params;

    const { data, error } = await supabase
      .from('complaint_comments')
      .select(`
        *,
        admin_users (name, email)
      `)
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch comments'
      });
      return;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
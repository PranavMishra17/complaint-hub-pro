import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { processMarkdown } from '../utils/markdown';
import { AuthenticatedRequest, CreateComplaintRequest, UpdateComplaintRequest, PaginationQuery } from '../types';

export const createComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, complaint }: CreateComplaintRequest = req.body;
    
    const complaintHtml = await processMarkdown(complaint);
    
    const { data: complaintData, error } = await supabase
      .from('complaints')
      .insert([{
        name,
        email,
        complaint,
        complaint_html: complaintHtml,
        status: 'Pending',
        client_ip: req.ip,
        user_agent: req.get('User-Agent') || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create complaint'
      });
      return;
    }


    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        id: complaintData.id,
        trackingId: complaintData.id.split('-')[0].toUpperCase()
      }
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAllComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 }: PaginationQuery = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('complaints')
      .select(`
        *,
        complaint_comments (count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch complaints'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        complaints: data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getComplaintById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_comments (
          *,
          admin_users (name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
      return;
    }


    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status }: UpdateComplaintRequest = req.body;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({
        success: false,
        error: 'Complaint not found or update failed'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getComplaintByTrackingId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackingId } = req.params;
    console.log('🔍 getComplaintByTrackingId called with:', trackingId);

    if (!trackingId) {
      res.status(400).json({
        success: false,
        error: 'Tracking ID is required'
      });
      return;
    }
    
    // Get all complaints and filter by tracking ID (first part of UUID)
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_comments (
          *,
          admin_users (name, email)
        )
      `);
      
    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Database query failed'
      });
      return;
    }
    
    // Filter complaints by tracking ID (first 8 characters of UUID)
    const matchingComplaints = complaints?.filter(complaint => {
      const complaintTrackingId = complaint.id.split('-')[0].toUpperCase();
      return complaintTrackingId === trackingId.toUpperCase();
    }) || [];

    if (matchingComplaints.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Complaint not found with the provided tracking ID'
      });
      return;
    }

    // Filter out internal comments for public view
    const complaint = matchingComplaints[0];
    if (complaint.complaint_comments) {
      complaint.complaint_comments = complaint.complaint_comments.filter(
        (comment: any) => !comment.is_internal
      );
    }


    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint by tracking ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const withdrawComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackingId } = req.params;
    

    if (!trackingId) {
      res.status(400).json({
        success: false,
        error: 'Tracking ID is required'
      });
      return;
    }
    // First find the complaint by tracking ID
    const { data: complaints, error: selectError } = await supabase
      .from('complaints')
      .select('*');
      
    if (selectError) {
      console.error('Database error:', selectError);
      res.status(500).json({
        success: false,
        error: 'Database query failed'
      });
      return;
    }
    
    // Filter complaints by tracking ID
    const matchingComplaints = complaints?.filter(complaint => {
      const complaintTrackingId = complaint.id.split('-')[0].toUpperCase();
      return complaintTrackingId === trackingId.toUpperCase();
    }) || [];
    
    if (matchingComplaints.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Complaint not found with the provided tracking ID'
      });
      return;
    }
    
    // Update the found complaint
    const targetComplaint = matchingComplaints[0];
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status: 'Withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', targetComplaint.id)
      .select()
      .single();

    if (error || !data) {
      res.status(500).json({
        success: false,
        error: 'Failed to update complaint status'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Complaint withdrawn successfully',
      data
    });
  } catch (error) {
    console.error('Withdraw complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete complaint'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
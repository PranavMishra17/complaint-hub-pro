import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { complaintsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import type { ComplaintWithComments, CreateCommentRequest } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

const commentSchema = z.object({
  comment_text: z.string().min(1, 'Comment is required').max(5000, 'Comment is too long'),
  is_internal: z.boolean().optional()
});

type CommentFormData = z.infer<typeof commentSchema>;

const ComplaintDetails: React.FC = () => {
  const { id, trackingId } = useParams<{ id?: string; trackingId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Determine if this is public or admin view
  const isPublicView = location.pathname.includes('/complaint/') && !location.pathname.includes('/admin');
  const isAdminView = user && (user.role === 'admin' || user.role === 'agent');
  const complaintIdentifier = trackingId || id;

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { is_internal: false }
  });

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', complaintIdentifier, isPublicView ? 'public' : 'admin'],
    queryFn: async () => {
      if (!complaintIdentifier) throw new Error('Complaint identifier is required');
      
      if (isPublicView && trackingId) {
        const response = await complaintsApi.getComplaintByTrackingId(trackingId);
        return response.data.data as ComplaintWithComments;
      } else if (id) {
        const response = await complaintsApi.getComplaint(id);
        return response.data.data as ComplaintWithComments;
      }
      
      throw new Error('Invalid complaint identifier');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!id) throw new Error('Complaint ID is required');
      return complaintsApi.updateComplaint(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintIdentifier] });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  });
  
  const deleteComplaintMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Complaint ID is required');
      return complaintsApi.deleteComplaint(id);
    },
    onSuccess: () => {
      toast.success('Complaint deleted successfully!');
      navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete complaint');
    }
  });


  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      if (!id) throw new Error('Complaint ID is required');
      return complaintsApi.createComment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintIdentifier] });
      toast.success('Comment added successfully!');
      reset();
      setCommentText('');
      setShowCommentForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  });

  const handleStatusToggle = () => {
    if (!complaint) return;
    const newStatus = complaint.status === 'Pending' ? 'Resolved' : 'Pending';
    updateStatusMutation.mutate(newStatus);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      deleteComplaintMutation.mutate();
    }
  };


  const onSubmitComment = (data: CommentFormData) => {
    createCommentMutation.mutate({
      comment_text: commentText,
      is_internal: data.is_internal
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Withdrawn':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => isPublicView ? navigate('/') : navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {isPublicView ? 'Back to Home' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => isPublicView ? navigate('/') : navigate('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← {isPublicView ? 'Back to Home' : 'Back to Dashboard'}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Complaint Details
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
              {isAdminView && (
                <button
                  onClick={handleStatusToggle}
                  disabled={updateStatusMutation.isPending}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    complaint.status === 'Pending'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  Mark as {complaint.status === 'Pending' ? 'Resolved' : 'Pending'}
                </button>
              )}
              {isAdminView && user?.role === 'admin' && (
                <button
                  onClick={handleDelete}
                  disabled={deleteComplaintMutation.isPending}
                  className="inline-flex items-center px-4 py-2 rounded-md font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleteComplaintMutation.isPending ? 'Deleting...' : 'Delete Complaint'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaint Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Complaint Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted by</h3>
                  <p className="mt-1 text-sm text-gray-900">{complaint.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{complaint.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted on</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(complaint.created_at), 'MMMM dd, yyyy at HH:mm')}
                  </p>
                </div>
                {isPublicView && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tracking ID</h3>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {complaint.id.split('-')[0].toUpperCase()}
                    </p>
                  </div>
                )}
                {complaint.resolved_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resolved on</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(complaint.resolved_at), 'MMMM dd, yyyy at HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Withdrawn Notice */}
            {isPublicView && complaint.status === 'Withdrawn' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Complaint Withdrawn
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      This complaint has been withdrawn and is no longer active.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Complaint Message */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Complaint Message</h2>
              </div>
              <div className="px-6 py-6">
                <div className="prose prose-sm max-w-none">
                  {complaint.complaint_html ? (
                    <div dangerouslySetInnerHTML={{ __html: complaint.complaint_html }} />
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{complaint.complaint}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                  {isAdminView && (
                    <button
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                    >
                      Add Comment
                    </button>
                  )}
                </div>
              </div>

              {/* Add Comment Form */}
              {isAdminView && showCommentForm && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <div data-color-mode="light">
                        <MDEditor
                          value={commentText}
                          onChange={(val) => {
                            setCommentText(val || '');
                            setValue('comment_text', val || '');
                          }}
                          preview="edit"
                          height={200}
                          textareaProps={{
                            placeholder: 'Add your comment...'
                          }}
                        />
                      </div>
                      {errors.comment_text && (
                        <p className="text-red-500 text-sm mt-1">{errors.comment_text.message}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        {...register('is_internal')}
                        type="checkbox"
                        id="is_internal"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_internal" className="ml-2 block text-sm text-gray-900">
                        Internal comment (not visible to client)
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={createCommentMutation.isPending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm disabled:bg-blue-400"
                      >
                        {createCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCommentForm(false);
                          reset();
                          setCommentText('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Comments List */}
              <div className="divide-y divide-gray-200">
                {complaint.complaint_comments?.length > 0 ? (
                  complaint.complaint_comments.map((comment) => (
                    <div key={comment.id} className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.author_name}
                            </span>
                            {comment.is_internal && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Internal
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                          <div className="mt-2 prose prose-sm max-w-none">
                            {comment.comment_html ? (
                              <div dangerouslySetInnerHTML={{ __html: comment.comment_html }} />
                            ) : (
                              <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {comment.comment_text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintDetails;
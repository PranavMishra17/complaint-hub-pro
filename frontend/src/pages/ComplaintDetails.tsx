import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { complaintsApi } from '../utils/api';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { is_internal: false }
  });

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      if (!id) throw new Error('Complaint ID is required');
      const response = await complaintsApi.getComplaint(id);
      return response.data.data as ComplaintWithComments;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!id) throw new Error('Complaint ID is required');
      return complaintsApi.updateComplaint(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      if (!id) throw new Error('Complaint ID is required');
      return complaintsApi.createComment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
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

  const onSubmitComment = (data: CommentFormData) => {
    createCommentMutation.mutate({
      comment_text: commentText,
      is_internal: data.is_internal
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'Pending' 
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      : 'bg-green-100 text-green-800 border-green-200';
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
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
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
                onClick={() => navigate('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Complaint Details
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaint Details */}
          <div className="lg:col-span-2">
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
                {complaint.resolved_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resolved on</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(complaint.resolved_at), 'MMMM dd, yyyy at HH:mm')}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Complaint Details</h3>
                  <div className="prose prose-sm max-w-none">
                    {complaint.complaint_html ? (
                      <div dangerouslySetInnerHTML={{ __html: complaint.complaint_html }} />
                    ) : (
                      <p className="whitespace-pre-wrap">{complaint.complaint}</p>
                    )}
                  </div>
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
                  <button
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                  >
                    Add Comment
                  </button>
                </div>
              </div>

              {/* Add Comment Form */}
              {showCommentForm && (
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
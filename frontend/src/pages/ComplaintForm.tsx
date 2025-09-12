import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MDEditor from '@uiw/react-md-editor';
import { complaintsApi } from '../utils/api';
import toast from 'react-hot-toast';
import type { CreateComplaintRequest } from '../types';

const complaintSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  complaint: z.string().min(10, 'Complaint must be at least 10 characters').max(10000, 'Complaint is too long')
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const ComplaintForm: React.FC = () => {
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema)
  });

  const onSubmit = async (data: ComplaintFormData) => {
    console.log('📝 Starting complaint submission:', {
      name: data.name,
      email: data.email,
      complaintLength: complaint.length,
      timestamp: new Date().toISOString()
    });

    setIsSubmitting(true);
    try {
      const submitData: CreateComplaintRequest = {
        name: data.name,
        email: data.email,
        complaint: complaint
      };

      console.log('📤 Sending complaint data:', submitData);
      const response = await complaintsApi.createComplaint(submitData);
      console.log('📥 Received response:', response);
      
      if (response.data.success) {
        console.log('✅ Complaint submitted successfully:', response.data.data);
        setTrackingId(response.data.data.trackingId);
        setSubmitted(true);
        toast.success('Complaint submitted successfully!');
      } else {
        console.error('❌ Server returned error:', response.data);
        throw new Error(response.data.error || 'Failed to submit complaint');
      }
    } catch (error: any) {
      console.error('❌ Submission error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      const errorMessage = error.response?.data?.error || 'Failed to submit complaint. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">Complaint Submitted Successfully!</h2>
              <p className="text-green-700 mb-2">
                Your complaint has been received and will be reviewed by our team.
              </p>
              <p className="text-green-700 mb-4">
                <strong>Tracking ID: {trackingId}</strong>
              </p>
              <p className="text-sm text-green-600">
                Please save this tracking ID for future reference. You can use it to inquire about the status of your complaint.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setComplaint('');
                  setTrackingId('');
                  window.location.reload();
                }}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Submit a Complaint</h1>
              <p className="mt-2 text-gray-600">
                Please provide detailed information about your complaint. All fields marked with * are required.
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Details *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Please provide as much detail as possible. You can use markdown formatting (bold, italic, lists, etc.).
                </p>
                <div data-color-mode="light">
                  <MDEditor
                    value={complaint}
                    onChange={(val) => {
                      setComplaint(val || '');
                      setValue('complaint', val || '');
                    }}
                    preview="edit"
                    height={300}
                    textareaProps={{
                      placeholder: 'Describe your complaint in detail...'
                    }}
                  />
                </div>
                {errors.complaint && <p className="text-red-500 text-sm mt-1">{errors.complaint.message}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium text-lg transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
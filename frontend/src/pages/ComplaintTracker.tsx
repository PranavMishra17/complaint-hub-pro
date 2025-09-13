import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline';

const trackingSchema = z.object({
  trackingId: z.string()
    .min(8, 'Tracking ID must be at least 8 characters')
    .max(8, 'Tracking ID must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Tracking ID must contain only uppercase letters and numbers')
});

type TrackingFormData = z.infer<typeof trackingSchema>;

const ComplaintTracker: React.FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, clearErrors } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema)
  });

  const trackingId = watch('trackingId');

  const onSubmit = async (data: TrackingFormData) => {
    setIsSearching(true);
    try {
      // Navigate to the complaint details page
      navigate(`/complaint/${data.trackingId.toUpperCase()}`);
    } catch (error) {
      setIsSearching(false);
    }
  };

  const handleTrackingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 8 characters
    const value = e.target.value.toUpperCase().slice(0, 8);
    setValue('trackingId', value);
    
    // Clear errors if the value is now valid
    if (value.length === 8 && /^[A-Z0-9]+$/.test(value)) {
      clearErrors('trackingId');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Track Your Complaint
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Complaint
            </h2>
            <p className="text-lg text-gray-600">
              Enter your 8-character tracking ID to view your complaint status
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking ID
                </label>
                <div className="relative">
                  <input
                    {...register('trackingId')}
                    type="text"
                    id="trackingId"
                    placeholder="AB12CD34"
                    onChange={handleTrackingIdChange}
                    className={`appearance-none block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-center text-lg tracking-wider ${
                      errors.trackingId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={8}
                  />
                  {trackingId && trackingId.length === 8 && !errors.trackingId && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.trackingId && (
                  <p className="mt-2 text-sm text-red-600">{errors.trackingId.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Your tracking ID was provided when you submitted your complaint
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSearching || !!errors.trackingId || !trackingId || trackingId.length !== 8}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Track Complaint
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">How to find your Tracking ID:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Check the confirmation message after submitting your complaint
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Look for an email confirmation (if provided)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Your tracking ID is 8 characters long (letters and numbers)
                </li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/complaint/submit')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Don't have a tracking ID? Submit a new complaint
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  What you can do:
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>View your complaint status and details</li>
                    <li>See any public updates or responses</li>
                    <li>Withdraw your complaint if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintTracker;
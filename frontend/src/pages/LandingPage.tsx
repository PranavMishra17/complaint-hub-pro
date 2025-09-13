import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complaint Hub Pro
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Professional complaint management system
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Choose Your Role
            </h2>
            <p className="text-gray-600 mt-2">
              Select how you'd like to access the system
            </p>
          </div>

          <div className="space-y-4">
            {/* Submit Button */}
            <Link
              to="/complaint/submit"
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <UserIcon className="h-6 w-6 mr-3" />
              Submit a Complaint
            </Link>

            {/* Track Button */}
            <Link
              to="/complaint/track"
              className="w-full flex items-center justify-center px-6 py-4 border border-blue-300 rounded-lg shadow-sm text-base font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6 mr-3" />
              Track Your Complaint
            </Link>

            {/* Admin Button */}
            <Link
              to="/admin/login"
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ShieldCheckIcon className="h-6 w-6 mr-3" />
              Admin Access
            </Link>
          </div>

          <div className="mt-8 text-center">
            <div className="text-sm text-gray-500">
              <p className="mb-2">
                <strong>Submit:</strong> File a new complaint
              </p>
              <p className="mb-2">
                <strong>Track:</strong> Check status with your tracking ID
              </p>
              <p>
                <strong>Admin:</strong> Manage and respond to complaints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact support or check our documentation
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
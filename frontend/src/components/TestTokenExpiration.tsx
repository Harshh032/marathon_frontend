import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createApiClient } from '../utils/apiClient';

// This is a test component to demonstrate token expiration handling
// Remove this file in production
export default function TestTokenExpiration() {
  const auth = useAuth();
  const apiClient = createApiClient(auth);

  const testExpiredToken = async () => {
    // This will simulate what happens when a token expires
    // by making a request that should return 401
    console.log('Testing token expiration...');
    
    const result = await apiClient.get('/admin/users');
    
    if (!result.success) {
      console.log('API call failed as expected:', result.error);
    }
  };

  const forceLogout = () => {
    // Manually trigger logout due to expiration for testing
    auth.logoutDueToExpiration();
  };

  if (auth.state.user?.role !== 'admin') {
    return null; // Only show to admin users
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Token Expiration Test (Dev Only)</h3>
      <div className="space-x-2">
        <button
          onClick={testExpiredToken}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          Test API Call
        </button>
        <button
          onClick={forceLogout}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Force Session Timeout
        </button>
      </div>
      <p className="text-sm text-yellow-700 mt-2">
        Use these buttons to test token expiration handling. The "Force Session Timeout" button
        will immediately log you out and show the timeout message on the login page.
      </p>
    </div>
  );
}

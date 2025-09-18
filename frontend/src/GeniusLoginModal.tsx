import React, { useState } from 'react';
import { X, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface GeniusLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
  onLoginError: (error: string) => void;
}

interface GeniusLoginCredentials {
  CompanyCode: string;
  Username: string;
  Password: string;
}

const BASE_API_URL = 'http://50.6.225.185:8000';

const GeniusLoginModal: React.FC<GeniusLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  onLoginError 
}) => {
  const [credentials, setCredentials] = useState<GeniusLoginCredentials>({
    CompanyCode: '',
    Username: '',
    Password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleInputChange = (field: keyof GeniusLoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous error when user starts typing
    if (loginError) setLoginError(null);
    if (loginSuccess) setLoginSuccess(false);
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!credentials.CompanyCode.trim()) {
      setLoginError('Company Code is required');
      return;
    }
    if (!credentials.Username.trim()) {
      setLoginError('Username is required');
      return;
    }
    if (!credentials.Password.trim()) {
      setLoginError('Password is required');
      return;
    }

    setIsLoading(true);
    setLoginError(null);
    setLoginSuccess(false);

    try {
      const response = await fetch(`${BASE_API_URL}/auth/login_with_genius`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLoginSuccess(true);
        onLoginSuccess(result.token);
        
        // Close modal immediately after successful login
        handleClose();
      } else {
        const errorMessage = result.message || 'Authentication failed';
        setLoginError(errorMessage);
        onLoginError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      setLoginError(errorMessage);
      onLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials({
      CompanyCode: '',
      Username: '',
      Password: ''
    });
    setLoginError(null);
    setLoginSuccess(false);
    setIsLoading(false);
    setShowPassword(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <LogIn className="h-5 w-5 text-gray-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Genius ERP Login</h2>
                <p className="text-gray-300 text-sm">Authenticate with Genius system</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-white transition-colors p-1"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Success Message */}
          {loginSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Login successful! Token received.</span>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm">{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Company Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={credentials.CompanyCode}
                onChange={(e) => handleInputChange('CompanyCode', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter company code"
                disabled={isLoading || loginSuccess}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={credentials.Username}
                onChange={(e) => handleInputChange('Username', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter username"
                disabled={isLoading || loginSuccess}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.Password}
                  onChange={(e) => handleInputChange('Password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter password"
                  disabled={isLoading || loginSuccess}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || loginSuccess}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoading || loginSuccess}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Success</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-xs">
              <strong>Note:</strong> This will authenticate with the Genius ERP system to obtain an access token for pushing invoice data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeniusLoginModal;

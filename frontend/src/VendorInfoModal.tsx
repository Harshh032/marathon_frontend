import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface VendorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorInfo: {
    name: string;
    code: string;
    payment_term_code: string;
    tax_group_header_code: string;
    gl_account_code: string;
  } | null;
  onPush: () => void;
  pushLoading: boolean;
  onVendorInfoChange: (updatedInfo: {
    name: string;
    code: string;
    payment_term_code: string;
    tax_group_header_code: string;
    gl_account_code: string;
  }) => void;
}

const VendorInfoModal: React.FC<VendorInfoModalProps> = ({
  isOpen,
  onClose,
  vendorInfo,
  onPush,
  pushLoading,
  onVendorInfoChange,
}) => {
  if (!isOpen || !vendorInfo) return null;

  const handleFieldChange = (field: string, value: string) => {
    onVendorInfoChange({
      ...vendorInfo,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Vendor Information</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Vendor Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                value={vendorInfo.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full text-lg font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Enter vendor name"
              />
            </div>

            {/* Vendor Code */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Vendor Code
              </label>
              <input
                type="text"
                value={vendorInfo.code}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                className="w-full text-xl font-bold text-blue-900 bg-white border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter vendor code"
              />
            </div>

            {/* Payment Term */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Payment Term
              </label>
              <input
                type="text"
                value={vendorInfo.payment_term_code}
                onChange={(e) => handleFieldChange('payment_term_code', e.target.value)}
                className="w-full text-lg font-medium text-green-900 bg-white border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter payment term"
              />
            </div>

            {/* Tax Header Code */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Tax Header Code
              </label>
              <input
                type="text"
                value={vendorInfo.tax_group_header_code}
                onChange={(e) => handleFieldChange('tax_group_header_code', e.target.value)}
                className="w-full text-lg font-medium text-purple-900 bg-white border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter tax header code"
              />
            </div>

            {/* GL Account Code */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <label className="block text-sm font-semibold text-orange-700 mb-2">
                GL Account Code
              </label>
              <input
                type="text"
                value={vendorInfo.gl_account_code}
                onChange={(e) => handleFieldChange('gl_account_code', e.target.value)}
                className="w-full text-lg font-medium text-orange-900 bg-white border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter GL account code"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPush}
              disabled={pushLoading}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {pushLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Pushing...</span>
                </>
              ) : (
                <>
                  <span>Push to ERP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInfoModal;

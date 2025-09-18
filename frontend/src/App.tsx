import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, User as UserIcon, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, Settings, LogOut, Search, Filter, Download, Eye, Edit3, Trash2, Plus, Menu, X, LogIn, Users, Activity } from 'lucide-react';
import { Invoice, User, GeniusAuthState } from './types';
import { getStatusColor, getPriorityColor, getStatusIcon } from './utils';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import UserActivityTracker from './components/UserActivityTracker';
import logo from "C:/Users/Vinayak/Pictures/Screenshots/Screenshot (50).png";
import InvoiceValidationTable from './InvoiceValidationTable';
import UserProfile from './UserProfile';
import VendorInfoModal from './VendorInfoModal';
import Notification from './Notification';
import GeniusLoginModal from './GeniusLoginModal';
import './notification-animations.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const BASE_API_URL = 'http://50.6.225.185:8000';

function DashboardApp() {
  const { state, logActivity, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [validationInvoices, setValidationInvoices] = useState<any[]>([]);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [invoiceCountLoading, setInvoiceCountLoading] = useState(false);
  const [invoiceCountError, setInvoiceCountError] = useState<string | null>(null);
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [approvedCountLoading, setApprovedCountLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [pendingCountLoading, setPendingCountLoading] = useState(false);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const [errorCountLoading, setErrorCountLoading] = useState(false);
  const statusOptions = ['Pending', 'Needs Review', 'Approved', 'Error'];
  const [statusUpdating, setStatusUpdating] = useState<{[pdfPath: string]: boolean}>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [profileHover, setProfileHover] = useState(false);
  const fileInputRef = useRef(null);
  const [showVendorInfoModal, setShowVendorInfoModal] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [reprocessLoading, setReprocessLoading] = useState(false);
  
  // Genius Authentication state
  const [geniusAuth, setGeniusAuth] = useState<GeniusAuthState>({
    isAuthenticated: false,
    token: null,
    expiresAt: null
  });
  const [showGeniusLoginModal, setShowGeniusLoginModal] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const invoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      vendor: 'Tech Solutions Inc.',
      amount: '$1,250.00',
      date: '2024-01-15',
      status: 'Ready',
      category: 'Software',
      priority: 'High'
    },
    {
      id: 'INV-2024-002',
      vendor: 'Office Supplies Co.',
      amount: '$375.40',
      date: '2024-01-16',
      status: 'Needs Review',
      category: 'Office',
      priority: 'Medium'
    },
    {
      id: 'INV-2024-003',
      vendor: 'Marketing Agency Ltd.',
      amount: '$2,500.00',
      date: '2024-01-17',
      status: 'Ready',
      category: 'Marketing',
      priority: 'High'
    },
    {
      id: 'INV-2024-004',
      vendor: 'Software Dev LLC',
      amount: '$890.75',
      date: '2024-01-18',
      status: 'Error',
      category: 'Development',
      priority: 'Low'
    },
    {
      id: 'INV-2024-005',
      vendor: 'Consulting Group',
      amount: '$1,500.00',
      date: '2024-01-19',
      status: 'Ready',
      category: 'Consulting',
      priority: 'Medium'
    }
  ];

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = ['Dashboard'];
    if (state.user?.role === 'admin') {
      return [...baseItems, 'User Management', 'User Activity'];
    }
    return baseItems;
  };
  
  const navItems = getNavItems();

  useEffect(() => {
    if (activeTab === 'Validation Queue' || activeTab === 'Dashboard') {
      setValidationLoading(true);
      setValidationError(null);
      fetchJson(`${BASE_API_URL}/invoices/invoices`)
        .then((data) => {
          setValidationInvoices(data);
        })
        .catch((err) => {
          setValidationError(err.message || 'Unknown error');
        })
        .finally(() => setValidationLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    setInvoiceCountLoading(true);
    setInvoiceCountError(null);
    fetchJson(`${BASE_API_URL}/invoices/invoices/count`)
      .then((data) => {
        setInvoiceCount(data.count);
      })
      .catch((err) => {
        setInvoiceCountError(err.message || 'Unknown error');
        setInvoiceCount(0);
      })
      .finally(() => setInvoiceCountLoading(false));
  }, []);

  useEffect(() => {
    setApprovedCountLoading(true);
    fetchJson(`${BASE_API_URL}/invoices/invoices/count/approved`)
      .then((data) => setApprovedCount(data.count))
      .catch(() => setApprovedCount(0))
      .finally(() => setApprovedCountLoading(false));

    setPendingCountLoading(true);
    fetchJson(`${BASE_API_URL}/invoices/invoices/count/pending`)
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(0))
      .finally(() => setPendingCountLoading(false));

    setErrorCountLoading(true);
    fetchJson(`${BASE_API_URL}/invoices/invoices/count/error`)
      .then((data) => setErrorCount(data.count))
      .catch(() => setErrorCount(0))
      .finally(() => setErrorCountLoading(false));
  }, []);

  useEffect(() => {
    if (showPreviewModal && selectedInvoice && (!selectedInvoice.items || selectedInvoice.items.length === 0)) {
      setSelectedInvoice({
        ...selectedInvoice,
        items: [
          { name: '', quantity: '', value: '' },
          { name: '', quantity: '', value: '' },
          { name: '', quantity: '', value: '' },
        ],
      });
    }
    
    // Reset edit mode when modal closes
    if (!showPreviewModal) {
      setEditMode(false);
    }
    
    // Only run when modal opens
    // eslint-disable-next-line
  }, [showPreviewModal]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    
    const formData = new FormData();
    
    // Check if we have multiple files
    if (files.length > 1) {
      // Use the upload-multiple endpoint for multiple files
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      try {
        const response = await fetch(`${BASE_API_URL}/invoices/invoices/upload-multiple`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload files');
        }
        const data = await response.json();
        setUploadResult(data);
      } catch (error: any) {
        setUploadError(error.message || 'Unknown error');
      } finally {
        setUploading(false);
      }
    } else {
      // Use the single file upload endpoint for single files
      const file = files[0];
      formData.append('file', file);
      
      try {
        const response = await fetch(`${BASE_API_URL}/invoices/invoices/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        const data = await response.json();
        setUploadResult(data);
      } catch (error: any) {
        setUploadError(error.message || 'Unknown error');
      } finally {
        setUploading(false);
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Total Invoices</p>
              <p className="text-3xl font-bold text-white">
                {invoiceCountLoading ? '...' : invoiceCount !== null ? invoiceCount : 0}
              </p>
            </div>
            <div className="bg-black rounded-xl p-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-700 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Approved</p>
              <p className="text-3xl font-bold text-white">
                {approvedCountLoading ? '...' : approvedCount !== null ? approvedCount : 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-600 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-white">
                {pendingCountLoading ? '...' : pendingCount !== null ? pendingCount : 0}
              </p>
            </div>
            <div className="bg-gray-700 rounded-xl p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Errors</p>
              <p className="text-3xl font-bold text-white">
                {errorCountLoading ? '...' : errorCount !== null ? errorCount : 0}
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Invoice</h2>
            <p className="text-gray-600">Drag and drop your PDF files or click to browse</p>
          </div>
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-gray-800 bg-gray-50 scale-105'
              : 'border-gray-300 hover:border-gray-800 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-black to-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <Upload className="h-10 w-10 text-gray-600" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-900">
                Drop your PDF files here, or{' '}
                <label className="text-gray-600 hover:text-gray-700 cursor-pointer underline underline-offset-2 transition-colors">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-gray-500">
                Supports PDF files up to 10MB each • Multiple files supported
              </p>
              {uploading && <div className="text-gray-600 font-medium mt-2">Uploading...</div>}
              {uploadError && <div className="text-red-600 font-medium mt-2">{uploadError}</div>}
              {uploadResult && uploadResult.extracted_data && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-4 shadow-md text-left max-w-md mx-auto">
                  <div className="text-gray-700 font-bold text-lg mb-2 flex items-center">
                    <CheckCircle className="inline-block mr-2 text-gray-600" size={22} />
                    Upload Success!
                  </div>
                  <div className="text-gray-800 font-semibold mb-1">{uploadResult.message}</div>
                  <div className="mt-4 space-y-2">
                    <div><span className="font-medium text-gray-600">Invoice Number:</span> {uploadResult.extracted_data.invoice_number}</div>
                    <div><span className="font-medium text-gray-600">PO Number:</span> {uploadResult.extracted_data.po_number}</div>
                    <div><span className="font-medium text-gray-600">Subtotal:</span> ${uploadResult.extracted_data.subtotal}</div>
                    <div><span className="font-medium text-gray-600">Taxes:</span> ${uploadResult.extracted_data.taxes}</div>
                    <div><span className="font-medium text-gray-600">Total:</span> <span className="font-bold text-gray-700">${uploadResult.extracted_data.total}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="font-medium text-gray-600 mb-1">Vendor Info:</div>
                    <div className="pl-2 text-gray-700">
                      <div><span className="font-medium">Name:</span> {uploadResult.extracted_data.vendor_info?.Name}</div>
                      <div><span className="font-medium">Address:</span> {uploadResult.extracted_data.vendor_info?.Address}</div>
                      <div><span className="font-medium">Contact Info:</span> {uploadResult.extracted_data.vendor_info?.['Contact Info']}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Validation Table (reuse renderValidationQueue) */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {validationLoading ? (
            <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
          ) : validationError ? (
            <div className="p-8 text-center text-red-600 font-medium">{validationError}</div>
          ) : (
            <InvoiceValidationTable
              invoices={validationInvoices}
              loading={validationLoading}
              error={validationError}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedInvoice={setSelectedInvoice}
              setShowPreviewModal={setShowPreviewModal}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              handleDeleteInvoice={handleDeleteInvoice}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderValidationQueue = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Invoice List */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Validation Interface</h2>
              <div className="flex items-center space-x-3">
                <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                  <Plus size={16} />
                  <span>New Invoice</span>
                </button>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {validationLoading ? (
              <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
            ) : validationError ? (
              <div className="p-8 text-center text-red-600 font-medium">{validationError}</div>
            ) : (
              <InvoiceValidationTable
                invoices={validationInvoices}
                loading={validationLoading}
                error={validationError}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setSelectedInvoice={setSelectedInvoice}
                setShowPreviewModal={setShowPreviewModal}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                handleDeleteInvoice={handleDeleteInvoice}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Defensive fetch utility
  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (!res.ok) throw new Error('Failed to fetch: ' + url);
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      throw new Error('Server did not return JSON. Check API URL and backend status.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/invoices/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'accept': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete invoice');
      setValidationInvoices((prev) => prev.filter(inv => inv.id !== invoiceId));
      setShowPreviewModal(false);
    } catch (error: any) {
      alert(error.message || 'Unknown error');
    }
  };

  const fetchVendorInfo = async (vendorName: string, vendorAddress: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/v1/vendors/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_name: vendorName,
          address: vendorAddress,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor information');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching vendor info:', error);
      throw error;
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice || !selectedInvoice.vendor_info?.Name || !selectedInvoice.vendor_info?.Address) {
      alert('Missing vendor information. Please ensure vendor name and address are available.');
      return;
    }

    try {
      const vendorData = await fetchVendorInfo(
        selectedInvoice.vendor_info.Name,
        selectedInvoice.vendor_info.Address
      );

      if (vendorData.success && vendorData.vendor_info) {
        setVendorInfo(vendorData.vendor_info);
        setShowVendorInfoModal(true);
      } else {
        alert('Failed to fetch vendor information: ' + (vendorData.message || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error fetching vendor information: ' + error.message);
    }
  };

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  const parseGeniusApiError = (errorData: any): string => {
    try {
      // If it's already a string, return it
      if (typeof errorData === 'string') {
        // Try to parse if it looks like JSON
        if (errorData.includes('{') && errorData.includes('}')) {
          try {
            const parsed = JSON.parse(errorData);
            return parseGeniusApiError(parsed);
          } catch {
            return errorData;
          }
        }
        return errorData;
      }

      // Handle Genius API error structure
      if (errorData.Messages && Array.isArray(errorData.Messages) && errorData.Messages.length > 0) {
        // Get the first available message (prioritize English)
        const firstMessage = errorData.Messages[0];
        const message = firstMessage.English || firstMessage.French || firstMessage.message || 'Unknown error';
        return message;
      }

      // Handle other error formats
      if (errorData.message) {
        return errorData.message;
      }

      if (errorData.error) {
        return errorData.error;
      }

      // Fallback
      return 'Unknown error occurred while communicating with Genius ERP';
    } catch (e) {
      console.warn('Error parsing Genius API error:', e);
      return 'Unknown error occurred while communicating with Genius ERP';
    }
  };

  const handlePushToERP = async () => {
    if (!selectedInvoice || !vendorInfo) return;
    
    setPushLoading(true);
    try {
      // Prepare the invoice data in the expected format
      const invoiceData = {
        success: true,
        message: "Successfully processed invoice",
        extracted_invoices: [{
          invoice_number: selectedInvoice.invoice_number || 'N/A',
          invoice_date: selectedInvoice.uploaded_at ? new Date(selectedInvoice.uploaded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          po_number: selectedInvoice.po_number || 'N/A',
          subtotal: parseFloat(selectedInvoice.subtotal?.toString() || '0') || 0,
          taxes: parseFloat(selectedInvoice.taxes?.toString() || '0') || 0,
          freight: parseFloat(selectedInvoice.freight?.toString() || '0') || 0,
          total: parseFloat(selectedInvoice.total?.toString() || '0') || 0,
          vendor_info: {
            Name: selectedInvoice.vendor_info?.Name || vendorInfo.name,
            Address: selectedInvoice.vendor_info?.Address || 'N/A',
            'Contact Info': selectedInvoice.vendor_info?.['Contact Info'] || 'N/A'
          },
          items: selectedInvoice.items?.map((item: any) => ({
            name: item.name || 'N/A',
            quantity: parseFloat(item.quantity?.toString() || '0') || 0,
            price: parseFloat(item.price?.toString() || item.value?.toString() || '0') || 0
          })) || []
        }],
        invoice_ids: [selectedInvoice.id || 1]
      };

      // Prepare vendor data
      const vendorData = {
        success: true,
        message: `Vendor found using name: ${vendorInfo.name}`,
        vendor_info: {
          name: vendorInfo.name,
          code: vendorInfo.code,
          payment_term_code: vendorInfo.payment_term_code,
          tax_group_header_code: vendorInfo.tax_group_header_code,
          gl_account_code: vendorInfo.gl_account_code
        }
      };

      console.log('Pushing to ERP with data:', { invoiceData, vendorData });

      // Make the API call to push to Genius ERP
      const response = await fetch(`${BASE_API_URL}/api/v1/push_to_genius`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 3e6cd695-fa20-455c-9111-235f7e1adf48'
        },
        body: JSON.stringify({
          invoice_data: invoiceData,
          vendor_data: vendorData,
          push_to_genius: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Push to ERP result:', result);

      if (result.success && result.push_result?.success) {
        // Update invoice status to Approved in database
        try {
          const statusUpdateResponse = await fetch(`${BASE_API_URL}/invoices/invoices/update-status-by-id`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invoice_id: selectedInvoice.id,
              status: 'Approved'
            })
          });

          const statusResult = await statusUpdateResponse.json();
          if (statusResult.success) {
            console.log('Invoice status updated to Approved in database');
            
            // Update the local invoice state
            setSelectedInvoice({
              ...selectedInvoice,
              status: 'Approved'
            });
            
            // Update the validation invoices list
            setValidationInvoices(prev => 
              prev.map(inv => 
                inv.id === selectedInvoice.id 
                  ? { ...inv, status: 'Approved' }
                  : inv
              )
            );
          } else {
            console.warn('Failed to update invoice status in database:', statusResult.message);
          }
        } catch (statusError) {
          console.warn('Error updating invoice status:', statusError);
        }
        
        // Show success notification
        showNotification(
          'success',
          'Successfully Pushed to Genius ERP!',
          `Invoice ${selectedInvoice.invoice_number || 'N/A'} has been successfully processed and pushed to the ERP system with GL Account Code ${vendorInfo.gl_account_code}. Status updated to Approved.`
        );
        
        // Close modals
        setShowVendorInfoModal(false);
        setVendorInfo(null);
        setShowPreviewModal(false);
      } else {
        // Parse and show error notification
        let errorMessage = 'Unknown error occurred while pushing to ERP';
        
        // Try multiple possible error paths and parse them
        if (result.push_result?.error_details) {
          errorMessage = parseGeniusApiError(result.push_result.error_details);
        } else if (result.push_result?.message) {
          errorMessage = parseGeniusApiError(result.push_result.message);
        } else if (result.push_result?.error) {
          errorMessage = parseGeniusApiError(result.push_result.error);
        } else if (result.message) {
          errorMessage = parseGeniusApiError(result.message);
        } else if (result.error) {
          errorMessage = parseGeniusApiError(result.error);
        } else {
          // Try parsing the entire push_result or result object
          errorMessage = parseGeniusApiError(result.push_result || result);
        }
        
        console.log('Parsed error message:', errorMessage);
        
        showNotification(
          'error',
          'Failed to Push to Genius ERP',
          errorMessage
        );
      }
    } catch (error: any) {
      console.error('Error pushing to ERP:', error);
      showNotification(
        'error',
        'Connection Error',
        `Failed to connect to the ERP system: ${error.message}`
      );
    } finally {
      setPushLoading(false);
    }
  };

  const handleVendorInfoChange = (updatedInfo: any) => {
    setVendorInfo(updatedInfo);
  };

  // Handle Edit Manually click
  const handleEditManually = () => {
    setEditMode(true);
    showNotification(
      'success',
      'Edit Mode Enabled',
      'You can now edit all invoice fields. Click Re-Process to save changes and update the invoice status.'
    );
  };

  // Handle Re-Process with updated data
  const handleReProcess = async () => {
    if (!selectedInvoice) return;
    
    setReprocessLoading(true);
    try {
      // Prepare updated invoice data for the reprocess API
      const reprocessData = {
        invoice_number: selectedInvoice.invoice_number || null,
        po_number: selectedInvoice.po_number || null,
        nda_number: selectedInvoice.nda_number || null,
        subtotal: selectedInvoice.subtotal ? parseFloat(selectedInvoice.subtotal?.toString()) : null,
        taxes: selectedInvoice.taxes ? parseFloat(selectedInvoice.taxes?.toString()) : null,
        freight: selectedInvoice.freight ? parseFloat(selectedInvoice.freight?.toString()) : null,
        total: selectedInvoice.total ? parseFloat(selectedInvoice.total?.toString()) : null,
        vendor_info: selectedInvoice.vendor_info ? {
          Name: selectedInvoice.vendor_info?.Name || '',
          Address: selectedInvoice.vendor_info?.Address || '',
          'Contact Info': selectedInvoice.vendor_info?.['Contact Info'] || ''
        } : null,
        items: selectedInvoice.items?.map((item: any) => ({
          name: item.name || '',
          quantity: parseFloat(item.quantity?.toString() || '0') || 0,
          price: parseFloat(item.price?.toString() || item.value?.toString() || '0') || 0
        })) || null
      };

      // Call the new reprocess API endpoint
      const response = await fetch(`${BASE_API_URL}/invoices/invoices/${selectedInvoice.id}/reprocess`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reprocessData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const updatedInvoice = result.updated_invoice;
        
        // Update local state with the returned invoice data
        setSelectedInvoice({
          ...selectedInvoice,
          ...updatedInvoice
        });
        
        // Update validation invoices list
        setValidationInvoices(prev => 
          prev.map(inv => 
            inv.id === selectedInvoice.id 
              ? { ...inv, ...updatedInvoice }
              : inv
          )
        );
        
        // Disable edit mode
        setEditMode(false);
        
        showNotification(
          'success',
          'Invoice Reprocessed Successfully!',
          result.message || 'The invoice has been updated with your changes and the status has been recalculated.'
        );
      } else {
        throw new Error(result.message || 'Failed to reprocess invoice');
      }
      
    } catch (error: any) {
      console.error('Error reprocessing invoice:', error);
      showNotification(
        'error',
        'Reprocess Failed',
        `Failed to reprocess the invoice: ${error.message}`
      );
    } finally {
      setReprocessLoading(false);
    }
  };

  // Genius Authentication handlers
  const handleGeniusLoginSuccess = (token: string) => {
    setGeniusAuth({
      isAuthenticated: true,
      token: token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    });
    
    // Close the modal
    setShowGeniusLoginModal(false);
    
    showNotification(
      'success',
      'Genius Authentication Successful!',
      'You are now connected to the Genius ERP system. The token will be used for pushing invoice data.'
    );
  };

  const handleGeniusLoginError = (error: string) => {
    showNotification(
      'error',
      'Genius Authentication Failed',
      error
    );
  };

  // Update handlePushToERP to use Genius token if available
  const handlePushToERPWithAuth = async () => {
    if (!selectedInvoice || !vendorInfo) return;
    
    // Check if we need Genius authentication for this operation
    if (!geniusAuth.isAuthenticated) {
      showNotification(
        'error',
        'Authentication Required',
        'Please login with Genius first to push data to the ERP system.'
      );
      setShowGeniusLoginModal(true);
      return;
    }
    
    // Check if token is expired
    if (geniusAuth.expiresAt && new Date() > geniusAuth.expiresAt) {
      showNotification(
        'error',
        'Session Expired',
        'Your Genius session has expired. Please login again.'
      );
      setGeniusAuth({ isAuthenticated: false, token: null, expiresAt: null });
      setShowGeniusLoginModal(true);
      return;
    }
    
    // Debug logging
    console.log('🔑 Using Genius token:', geniusAuth.token);
    console.log('⏰ Token expires at:', geniusAuth.expiresAt);
    console.log('🕐 Current time:', new Date());
    const tokenAgeMinutes = geniusAuth.expiresAt ? (new Date().getTime() - (geniusAuth.expiresAt.getTime() - 60*60*1000)) / (1000 * 60) : 0;
    console.log('🕰️ Token age (minutes):', tokenAgeMinutes.toFixed(2));
    console.log('✅ Token valid:', geniusAuth.expiresAt ? new Date() < geniusAuth.expiresAt : 'no expiry set');
    
    // Check if token is very old (more than 5 minutes) - might need refresh
    if (tokenAgeMinutes > 5) {
      console.log('⚠️ Token is older than 5 minutes, might need refresh');
      showNotification(
        'error',
        'Token May Be Expired',
        'The Genius token may have expired on their servers. Please try logging in again.'
      );
      setGeniusAuth({ isAuthenticated: false, token: null, expiresAt: null });
      setShowGeniusLoginModal(true);
      return;
    }
    
    setPushLoading(true);
    try {
      // Prepare the invoice data in the expected format
      const invoiceData = {
        success: true,
        message: "Successfully processed invoice",
        extracted_invoices: [{
          invoice_number: selectedInvoice.invoice_number || 'N/A',
          invoice_date: selectedInvoice.uploaded_at ? new Date(selectedInvoice.uploaded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          po_number: selectedInvoice.po_number || 'N/A',
          subtotal: parseFloat(selectedInvoice.subtotal?.toString() || '0') || 0,
          taxes: parseFloat(selectedInvoice.taxes?.toString() || '0') || 0,
          freight: parseFloat(selectedInvoice.freight?.toString() || '0') || 0,
          total: parseFloat(selectedInvoice.total?.toString() || '0') || 0,
          vendor_info: {
            Name: selectedInvoice.vendor_info?.Name || vendorInfo.name,
            Address: selectedInvoice.vendor_info?.Address || 'N/A',
            'Contact Info': selectedInvoice.vendor_info?.['Contact Info'] || 'N/A'
          },
          items: selectedInvoice.items?.map((item: any) => ({
            name: item.name || 'N/A',
            quantity: parseFloat(item.quantity?.toString() || '0') || 0,
            price: parseFloat(item.price?.toString() || item.value?.toString() || '0') || 0
          })) || []
        }],
        invoice_ids: [selectedInvoice.id || 1]
      };

      // Prepare vendor data
      const vendorData = {
        success: true,
        message: `Vendor found using name: ${vendorInfo.name}`,
        vendor_info: {
          name: vendorInfo.name,
          code: vendorInfo.code,
          payment_term_code: vendorInfo.payment_term_code,
          tax_group_header_code: vendorInfo.tax_group_header_code,
          gl_account_code: vendorInfo.gl_account_code
        }
      };

      console.log('Pushing to ERP with Genius auth:', { invoiceData, vendorData });
      console.log('🔐 Authorization header being sent:', `Bearer ${geniusAuth.token}`);

      // Make the API call to push to Genius ERP using the authenticated token
      const response = await fetch(`${BASE_API_URL}/api/v1/push_to_genius`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geniusAuth.token}`
        },
        body: JSON.stringify({
          invoice_data: invoiceData,
          vendor_data: vendorData,
          push_to_genius: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Push to ERP result:', result);

      if (result.success && result.push_result?.success) {
        // Update invoice status to Approved in database
        try {
          const statusUpdateResponse = await fetch(`${BASE_API_URL}/invoices/invoices/update-status-by-id`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invoice_id: selectedInvoice.id,
              status: 'Approved'
            })
          });

          const statusResult = await statusUpdateResponse.json();
          if (statusResult.success) {
            console.log('Invoice status updated to Approved in database');
            
            // Update the local invoice state
            setSelectedInvoice({
              ...selectedInvoice,
              status: 'Approved'
            });
            
            // Update the validation invoices list
            setValidationInvoices(prev => 
              prev.map(inv => 
                inv.id === selectedInvoice.id 
                  ? { ...inv, status: 'Approved' }
                  : inv
              )
            );
          } else {
            console.warn('Failed to update invoice status in database:', statusResult.message);
          }
        } catch (statusError) {
          console.warn('Error updating invoice status:', statusError);
        }
        
        // Show success notification
        showNotification(
          'success',
          'Successfully Pushed to Genius ERP!',
          `Invoice ${selectedInvoice.invoice_number || 'N/A'} has been successfully processed and pushed to the ERP system with GL Account Code ${vendorInfo.gl_account_code}. Status updated to Approved.`
        );
        
        // Close modals
        setShowVendorInfoModal(false);
        setVendorInfo(null);
        setShowPreviewModal(false);
      } else {
        // Parse and show error notification
        let errorMessage = 'Unknown error occurred while pushing to ERP';
        
        // Try multiple possible error paths and parse them
        if (result.push_result?.error_details) {
          errorMessage = parseGeniusApiError(result.push_result.error_details);
        } else if (result.push_result?.message) {
          errorMessage = parseGeniusApiError(result.push_result.message);
        } else if (result.push_result?.error) {
          errorMessage = parseGeniusApiError(result.push_result.error);
        } else if (result.message) {
          errorMessage = parseGeniusApiError(result.message);
        } else if (result.error) {
          errorMessage = parseGeniusApiError(result.error);
        } else {
          // Try parsing the entire push_result or result object
          errorMessage = parseGeniusApiError(result.push_result || result);
        }
        
        console.log('Parsed error message:', errorMessage);
        
        showNotification(
          'error',
          'Failed to Push to Genius ERP',
          errorMessage
        );
      }
    } catch (error: any) {
      console.error('Error pushing to ERP:', error);
      showNotification(
        'error',
        'Connection Error',
        `Failed to connect to the ERP system: ${error.message}`
      );
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logo} alt="Logo" className="h-12 w-auto rounded-xl object-contain" />
              </div>
            </div>

            {/* Navigation - Single Line */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === item
                      ? 'text-white bg-gradient-to-r from-black to-gray-800 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Genius Login Button */}
              <button
                className={`font-semibold px-4 py-2 rounded-xl transition-all shadow flex items-center space-x-2 ${
                  geniusAuth.isAuthenticated
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={() => setShowGeniusLoginModal(true)}
                type="button"
              >
                <LogIn className="h-4 w-4" />
                <span>
                  {geniusAuth.isAuthenticated ? 'Genius Connected' : 'Login with Genius'}
                </span>
              </button>
              
              <button
                className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow"
                onClick={() => window.open('https://www.zoho.com/creator/industries/custom-erp-software.html', '_blank', 'noopener,noreferrer')}
                type="button"
              >
                Go to ERP
              </button>
              <div className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-2 shadow-md border border-gray-100 relative"
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              >
                <UserProfile name={state.user?.name || ''} role={state.user?.role} />
                {profileHover && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 mt-3 bg-white border border-gray-200 rounded-xl shadow-lg px-8 py-4 flex flex-col items-center space-y-3 z-50 min-w-[220px]">
                    <UserProfile name={state.user?.name || ''} role={state.user?.role} />
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="text-center">
                        <span className="font-semibold text-gray-900 whitespace-nowrap">{state.user?.name}</span>
                        <p className="text-sm text-gray-500 capitalize">{state.user?.role}</p>
                      </div>
                      <button 
                        className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors ml-4" 
                        title="Logout"
                        onClick={logout}
                      >
                        <LogOut size={22} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item
                      ? 'text-gray-600 bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'Dashboard' && renderDashboard()}
        {(activeTab === 'Validation Queue' || activeTab === 'Invoices') && renderValidationQueue()}
        {activeTab === 'User Management' && state.user?.role === 'admin' && <UserManagement />}
        {activeTab === 'User Activity' && state.user?.role === 'admin' && <UserActivityTracker />}
        {activeTab === 'Logs' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Logs</h2>
              <p className="text-gray-500">Advanced logging functionality coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'Settings' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-500">Configuration panel coming soon...</p>
            </div>
          </div>
        )}
        {showPreviewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-50">
            <div className="bg-gray-50 rounded-l-2xl shadow-2xl w-full max-w-2xl h-full p-8 relative animate-slide-in-right flex flex-col" style={{ right: 0 }}>
              {/* Top Action Buttons - Status Based */}
              {selectedInvoice.status === 'Pending' ? (
                <div className="flex items-center justify-end mb-4 w-full gap-2">
                  <button className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7V3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                      <rect x="7" y="7" width="10" height="14" rx="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6" />
                    </svg>
                    Save Alterations
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                    onClick={handleApprove}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button 
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 flex items-center justify-center" 
                    style={{ height: '2.5rem', width: '2.5rem' }} 
                    aria-label="Delete"
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ) : selectedInvoice.status === 'Needs Review' ? (
                <div className="flex items-center justify-end mb-4 w-full gap-2">
                  {!editMode ? (
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                      onClick={handleEditManually}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Edit Manually
                    </button>
                  ) : (
                    <button 
                      className="px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                      onClick={() => setEditMode(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Exit Edit Mode
                    </button>
                  )}
                  <button 
                    className={`px-4 py-2 border rounded-lg font-semibold transition flex items-center gap-2 ${
                      reprocessLoading 
                        ? 'bg-gray-400 text-white border-gray-400 cursor-not-allowed' 
                        : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                    }`}
                    onClick={handleReProcess}
                    disabled={reprocessLoading}
                  >
                    {reprocessLoading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.49-8.49l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.5 19A9 9 0 1 1 19 5.5L21 7M3 17l2 2 4-4" />
                      </svg>
                    )}
                    {reprocessLoading ? 'Processing...' : 'Re-Process'}
                  </button>
                  <button 
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 flex items-center justify-center" 
                    style={{ height: '2.5rem', width: '2.5rem' }} 
                    aria-label="Delete"
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ) : selectedInvoice.status === 'Approved' ? (
                <div className="flex items-center justify-end mb-4 w-full gap-2">
                  <button className="px-4 py-2 bg-gray-500 text-white border border-gray-500 rounded-lg font-semibold cursor-not-allowed opacity-50" disabled>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Already Approved
                  </button>
                  <button 
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 flex items-center justify-center" 
                    style={{ height: '2.5rem', width: '2.5rem' }} 
                    aria-label="Delete"
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end mb-4 w-full gap-2">
                  <button className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.5 19A9 9 0 1 1 19 5.5L21 7M3 17l2 2 4-4" />
                    </svg>
                    Re-Process
                  </button>
                  <button 
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 flex items-center justify-center" 
                    style={{ height: '2.5rem', width: '2.5rem' }} 
                    aria-label="Delete"
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              )}
              {/* Error Notification */}
              {selectedInvoice.status === 'Error' && (
                <div className="w-full mb-4 p-4 border-2 border-red-600 bg-red-50 rounded-xl text-red-700 font-semibold flex items-center text-left">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="red" strokeWidth="2" fill="none" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke="red" strokeWidth="2" strokeLinecap="round" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke="red" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Unable to Process Information due to an error
                </div>
              )}
              {/* Needs Review Notification */}
              {selectedInvoice.status === 'Needs Review' && !editMode && (
                <div className="w-full mb-4 p-4 border-2 border-yellow-400 bg-yellow-50 rounded-xl text-yellow-800 font-semibold flex items-center text-left">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#facc15" strokeWidth="2" fill="none" />
                    <path d="M12 8v4" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="#facc15" />
                  </svg>
                  There are some missing fields
                </div>
              )}
              {/* Edit Mode Notification */}
              {editMode && (
                <div className="w-full mb-4 p-4 border-2 border-blue-500 bg-blue-50 rounded-xl text-blue-800 font-semibold flex items-center text-left">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Mode Active - You can now modify all invoice fields. Click "Re-Process" to save changes.
                </div>
              )}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invoice Preview</h3>
              <div className="flex-1 overflow-y-auto pr-2">
                {selectedInvoice.pdf_path && (
                  <div className="mb-6">
                    {/* Manual Editing Button removed */}
                    <iframe
                      src={selectedInvoice.pdf_path}
                      title="Invoice PDF Preview"
                      className="w-full h-[38rem] rounded-xl border border-gray-200"
                      style={{ minHeight: '38rem', background: 'white' }}
                    />
                  </div>
                )}
                {/* Details Section as a simple list */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Details</h4>
                  <div className="divide-y divide-gray-200">
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Vendor Name</label>
                      <input
                        className={`font-semibold text-base text-gray-900 w-2/3 rounded border-none p-0 py-2 ${
                          editMode 
                            ? 'bg-white border border-blue-300 focus:border focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 px-2' 
                            : 'bg-gray-50 cursor-default focus:outline-none'
                        }`}
                        value={selectedInvoice.vendor_info?.Name || ''}
                        onChange={e => editMode && setSelectedInvoice({
                          ...selectedInvoice,
                          vendor_info: { ...selectedInvoice.vendor_info, Name: e.target.value }
                        })}
                        readOnly={!editMode}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Invoice #</label>
                      <input
                        className={`font-semibold text-base text-gray-900 w-2/3 rounded border-none p-0 py-2 ${
                          editMode 
                            ? 'bg-white border border-blue-300 focus:border focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 px-2' 
                            : 'bg-gray-50 cursor-default focus:outline-none'
                        }`}
                        value={selectedInvoice.invoice_number || ''}
                        onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, invoice_number: e.target.value })}
                        readOnly={!editMode}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Date</label>
                      <input
                        type="date"
                        className={`font-semibold text-base text-gray-900 w-2/3 rounded border-none p-0 py-2 ${
                          editMode 
                            ? 'bg-white border border-blue-300 focus:border focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 px-2' 
                            : 'bg-gray-50 cursor-default focus:outline-none'
                        }`}
                        value={selectedInvoice.uploaded_at ? new Date(selectedInvoice.uploaded_at).toISOString().slice(0, 10) : ''}
                        onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, uploaded_at: e.target.value })}
                        readOnly={!editMode}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">NDA #</label>
                      <input
                        className={`font-semibold text-base text-gray-900 w-2/3 rounded border-none p-0 py-2 ${
                          editMode 
                            ? 'bg-white border border-blue-300 focus:border focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 px-2' 
                            : 'bg-gray-50 cursor-default focus:outline-none'
                        }`}
                        value={selectedInvoice.nda_number || ''}
                        onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, nda_number: e.target.value })}
                        placeholder={editMode ? "Enter NDA number" : "Missing field"}
                        readOnly={!editMode}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Purchase Order #</label>
                      <input
                        className={`font-semibold text-base text-gray-900 w-2/3 rounded border-none p-0 py-2 ${
                          editMode 
                            ? 'bg-white border border-blue-300 focus:border focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 px-2' 
                            : 'bg-gray-50 cursor-default focus:outline-none'
                        }`}
                        value={selectedInvoice.po_number || ''}
                        onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, po_number: e.target.value })}
                        readOnly={!editMode}
                      />
                    </div>
                    <hr className="my-2 border-t border-gray-200" />
                  </div>
                </div>
                {/* Items Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Items</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 font-semibold text-gray-700 bg-white py-2 px-2">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-3">Quantity</div>
                      <div className="col-span-3.5">Value ($)</div>
                    </div>
                    {(selectedInvoice.items || [{ name: '', quantity: '', value: '' }]).map((item: any, idx: number) => (
                      <div className={`grid grid-cols-12 gap-2 px-2 my-3${idx < (selectedInvoice.items?.length || 1) - 1 ? ' border-b border-gray-200' : ''}`} key={idx} style={{ alignItems: 'center', minHeight: '3rem' }}>
                        <div className="col-span-6 flex items-center">
                          <input
                            className={`w-full rounded px-2 py-2 font-semibold text-base text-gray-900 focus:outline-none ${
                              editMode
                                ? 'bg-white border border-gray-300 focus:border-blue-400 focus:ring-0'
                                : 'bg-gray-50 border border-gray-200 cursor-default'
                            }`}
                            value={item.name}
                            placeholder={editMode ? `Item ${idx + 1}` : `Item ${idx + 1}`}
                            onChange={e => {
                              if (editMode) {
                                const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                                newItems[idx] = { ...item, name: e.target.value };
                                setSelectedInvoice({ ...selectedInvoice, items: newItems });
                              }
                            }}
                            readOnly={!editMode}
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <input
                            className={`w-full rounded px-2 py-2 font-semibold text-base text-gray-900 focus:outline-none ${
                              editMode
                                ? 'bg-white border border-gray-300 focus:border-blue-400 focus:ring-0'
                                : 'bg-gray-50 border border-gray-200 cursor-default'
                            }`}
                            type="number"
                            min="0"
                            value={item.quantity}
                            placeholder="Qty"
                            onChange={e => {
                              if (editMode) {
                                const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                                newItems[idx] = { ...item, quantity: e.target.value };
                                setSelectedInvoice({ ...selectedInvoice, items: newItems });
                              }
                            }}
                            readOnly={!editMode}
                          />
                        </div>
                        <div className="col-span-4 flex items-center">
                          <input
                            className={`w-full rounded px-2 py-2 font-semibold text-base text-gray-900 focus:outline-none ${
                              editMode
                                ? 'bg-white border border-gray-300 focus:border-blue-400 focus:ring-0'
                                : 'bg-gray-50 border border-gray-200 cursor-default'
                            }`}
                            type="number"
                            min="0"
                            value={item.price !== undefined ? item.price : item.value || ''}
                            placeholder="Value ($)"
                            onChange={e => {
                              if (editMode) {
                                const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                                newItems[idx] = { ...item, value: e.target.value, price: e.target.value };
                                setSelectedInvoice({ ...selectedInvoice, items: newItems });
                              }
                            }}
                            readOnly={!editMode}
                          />
                        </div>
                      </div>
                    ))}
                    {/* Freight row */}
                    <div className="grid grid-cols-12 gap-2 px-2 my-3">
                      <div className="col-span-6 flex items-center">
                        <span className="text-blue-600 font-medium">Freight</span>
                      </div>
                      <div className="col-span-2"></div>
                      <div className="col-span-4 flex items-center">
                        <input
                          className={`w-full rounded px-2 py-2 font-semibold text-base text-gray-900 focus:outline-none ${
                            editMode
                              ? 'bg-white border border-gray-300 focus:border-blue-400 focus:ring-0'
                              : 'bg-gray-50 border border-gray-200 cursor-default'
                          }`}
                          type="number"
                          min="0"
                          value={selectedInvoice.freight || ''}
                          placeholder="Freight ($)"
                          onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, freight: e.target.value })}
                          readOnly={!editMode}
                        />
                      </div>
                    </div>
                    {/* Divider before Total row */}
                    <hr className="my-2 border-t border-gray-300" />
                    {/* Total row */}
                    <div className="grid grid-cols-12 gap-2 px-2 my-3">
                      <div className="col-span-6 flex items-center">
                        <span className="text-black font-semibold">Total</span>
                      </div>
                      <div className="col-span-2"></div>
                      <div className="col-span-4 flex items-center">
                        <input
                          className={`w-full rounded px-2 py-2 font-semibold text-base text-gray-900 focus:outline-none ${
                            editMode
                              ? 'bg-white border border-gray-300 focus:border-blue-400 focus:ring-0'
                              : 'bg-gray-50 border border-gray-200 cursor-default'
                          }`}
                          type="number"
                          min="0"
                          value={selectedInvoice.total || ''}
                          placeholder="Total ($)"
                          onChange={e => editMode && setSelectedInvoice({ ...selectedInvoice, total: e.target.value })}
                          readOnly={!editMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notes section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600 text-base bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    Please review all invoice details carefully before approval. If you have any questions or require further clarification, contact the finance department. This is a placeholder note for demonstration purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Vendor Info Modal */}
      <VendorInfoModal
        isOpen={showVendorInfoModal}
        onClose={() => setShowVendorInfoModal(false)}
        vendorInfo={vendorInfo}
        onPush={handlePushToERPWithAuth}
        pushLoading={pushLoading}
        onVendorInfoChange={handleVendorInfoChange}
      />
      
      <footer className="w-full py-6 text-center text-gray-400 text-base font-semibold border-t border-gray-100 mt-8">
        @2024 InvoicePro All Rights Reserved
      </footer>
      
      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      {/* Genius Login Modal */}
      <GeniusLoginModal
        isOpen={showGeniusLoginModal}
        onClose={() => setShowGeniusLoginModal(false)}
        onLoginSuccess={handleGeniusLoginSuccess}
        onLoginError={handleGeniusLoginError}
      />
    </div>
  );
}

// Main App component with authentication wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App content component that handles authentication state
function AppContent() {
  const { state } = useAuth();

  // Show login screen if not authenticated
  if (!state.isAuthenticated) {
    return <Login />;
  }

  // Show dashboard if authenticated
  return <DashboardApp />;
}

export default App;

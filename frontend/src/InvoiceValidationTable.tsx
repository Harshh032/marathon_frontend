import React, { useState, useEffect } from 'react';
import { Eye, MoreHorizontal, Download, RefreshCw, Trash2, Info, Upload } from 'lucide-react';

interface InvoiceValidationTableProps {
  invoices: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedInvoice: (inv: any) => void;
  setShowPreviewModal: (show: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  handleDeleteInvoice: (invoiceId: string) => void;
}

const InvoiceValidationTable: React.FC<InvoiceValidationTableProps> = ({
  invoices,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  setSelectedInvoice,
  setShowPreviewModal,
  selectedStatus,
  setSelectedStatus,
  handleDeleteInvoice,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{left: number, top: number, direction: 'down' | 'up'} | null>(null);
  const [autoUpload, setAutoUpload] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [toggleMenuOpen, setToggleMenuOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setOpenMenuId(null);
      setMenuCoords(null);
    };
    if (openMenuId !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [openMenuId]);

  useEffect(() => {
    if (!toggleMenuOpen) return;
    const handleClick = () => setToggleMenuOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [toggleMenuOpen]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredInvoices.map((inv: any) => inv.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'Approved':
        return 100;
      case 'Needs Review':
        return 50;
      case 'Pending':
        return 25;
      case 'Error':
        return 100;
      default:
        return 0;
    }
  };

  // Filtered invoices for select all
  const filteredInvoices = invoices
    .filter(invoice => {
      if (selectedStatus === 'All') return true;
      if (selectedStatus === 'Review') return invoice.status === 'Needs Review';
      if (selectedStatus === 'Approved') return invoice.status === 'Approved';
      return true;
    })
    .filter((invoice) =>
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.vendor_info?.Name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const statusOrder = {
        Approved: 1,
        'Needs Review': 2,
        Pending: 2,
        Loading: 3,
        'In Progress': 3,
        Error: 4,
      };
      return (statusOrder[a.status as keyof typeof statusOrder] || 5) - (statusOrder[b.status as keyof typeof statusOrder] || 5);
    });

  const handleMenuButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, invoiceId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const direction = spaceBelow < 150 && spaceAbove > spaceBelow ? 'up' : 'down';
    setMenuCoords({
      left: rect.left,
      top: direction === 'down' ? rect.bottom : rect.top,
      direction,
    });
    setOpenMenuId(openMenuId === invoiceId ? null : invoiceId);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Processing</h2>
          <div></div>
        </div>
        {/* Status Filter Options */}
        <div className="flex space-x-4 mb-4">
          {['All', 'Review', 'Approved'].map(option => (
            <button
              key={option}
              className={`text-lg font-semibold text-black cursor-pointer focus:outline-none transition-colors duration-150 ${selectedStatus === option ? 'underline' : ''}`}
              style={{ background: 'none', border: 'none', borderRadius: 0, padding: 0 }}
              onClick={() => setSelectedStatus(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <hr className="border-b border-gray-200 mb-4" />
        {/* Search and Filter Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6 justify-between">
          <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Period</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Vendor</option>
            <option value="vendor1">Vendor 1</option>
            <option value="vendor2">Vendor 2</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="needs_review">Needs Review</option>
            <option value="error">Error</option>
          </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center text-gray-700 font-medium text-base select-none relative">
              <button
                type="button"
                className="mr-2 relative"
                title="Info"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
              >
                <Info size={18} className="text-black" />
                {showInfoTooltip && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-white text-black text-xs rounded-lg shadow-lg z-50 w-64 text-center whitespace-normal leading-snug">
                    Upload (100% Processed Invoices Only)
                    <br />directly to the ERP<br />
                    without having to approve them
                  </span>
                )}
              </button>
              Automatic Upload
            </span>
            <button
              type="button"
              className={`w-14 h-6 flex items-center rounded-full p-1 transition-colors duration-200 relative ${autoUpload ? 'bg-blue-600' : 'bg-gray-200'}`}
              style={{ boxShadow: 'none', border: 'none' }}
              onClick={() => setAutoUpload(v => !v)}
            >
              {autoUpload && (
                <span className="absolute left-[38%] -translate-x-1/2 text-xs text-black font-bold select-none z-10">On</span>
              )}
              <span
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 z-20 ${autoUpload ? 'translate-x-8' : ''}`}
                style={{ display: 'block' }}
              />
            </button>
            <div className="relative">
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center border border-gray-200 shadow-sm ml-2"
                title="More options"
                onClick={e => { e.stopPropagation(); setToggleMenuOpen(v => !v); }}
              >
                <MoreHorizontal size={20} className="text-black" />
              </button>
              {toggleMenuOpen && (
                <div className="absolute right-0 top-12 z-50 min-w-[170px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors text-sm font-medium"
                    onClick={e => { e.stopPropagation(); setToggleMenuOpen(false); /* Delete Selected logic here */ }}
                    type="button"
                  >
                    <Trash2 size={16} className="mr-2" /> Delete Selected
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors text-sm font-medium"
                    onClick={e => { e.stopPropagation(); setToggleMenuOpen(false); /* Upload Selected logic here */ }}
                    type="button"
                  >
                    <Upload size={16} className="mr-2" /> Upload Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-medium">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={selectedRows.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices
                .map((invoice) => {
                  let pdfName = invoice.pdf_path ? invoice.pdf_path.split('/').pop() : '';
                  pdfName = decodeURIComponent(pdfName || '');
                  let formattedPdfName = pdfName;
                  if (pdfName) {
                    const match = pdfName.match(/^(.*?_\d+)(?:_|\.).*?\.pdf$/i);
                    if (match) {
                      formattedPdfName = match[1] + '.PDF';
                    } else {
                      formattedPdfName = pdfName.replace(/\.pdf$/i, '.PDF');
                    }
                  }
                  const shortPdfName = formattedPdfName.split('_')[0];
                  let date = invoice.uploaded_at ? new Date(invoice.uploaded_at).toISOString().slice(0, 10) : '';

                  const progress = getStatusProgress(invoice.status);

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer transition-all duration-200" onClick={() => setSelectedInvoice(invoice)}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          checked={selectedRows.includes(invoice.id)}
                          onChange={e => {
                            e.stopPropagation();
                            handleSelectRow(invoice.id);
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="cursor-pointer" title={formattedPdfName}>{shortPdfName}</span>
                      </td>
                      <td className="px-6 py-4">{date}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{invoice.vendor_info?.Name}</div>
                        <div className="text-xs text-gray-500">{invoice.vendor_info?.Address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                invoice.status === 'Error'
                                  ? 'bg-red-600'
                                  : progress === 100
                                  ? 'bg-green-500'
                                  : progress >= 50
                                  ? 'bg-yellow-500'
                                  : progress >= 25
                                  ? 'bg-blue-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          {invoice.status === 'Error' && (
                            <div className="text-xs text-red-600 font-bold mt-1">Error: Action failed</div>
                          )}
                          <div className="text-xs text-gray-600 font-medium">
                            {invoice.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                            setShowPreviewModal(true);
                          }}
                          disabled={!invoice.pdf_path}
                          type="button"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            className="bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center border border-gray-200 shadow-sm"
                            onClick={e => handleMenuButtonClick(e, invoice.id)}
                            type="button"
                            title="More options"
                          >
                            <MoreHorizontal size={20} className="text-black" />
                          </button>
                          {openMenuId === invoice.id && menuCoords && (
                            <div
                              className="fixed z-50 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg py-2 transition-all duration-150"
                              style={{
                                left: menuCoords.left,
                                top: menuCoords.direction === 'down' ? menuCoords.top : undefined,
                                bottom: menuCoords.direction === 'up' ? window.innerHeight - menuCoords.top : undefined,
                                maxHeight: '200px',
                                overflowY: 'auto',
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors text-sm font-medium"
                                onClick={e => { e.stopPropagation(); /* Download logic here */ setOpenMenuId(null); setMenuCoords(null); }}
                                type="button"
                              >
                                <Download size={16} className="mr-2" /> Download Invoice
                              </button>
                              <button
                                className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors text-sm font-medium"
                                onClick={e => { e.stopPropagation(); /* Re-process logic here */ setOpenMenuId(null); setMenuCoords(null); }}
                                type="button"
                              >
                                <RefreshCw size={16} className="mr-2" /> Re-Process Invoice
                              </button>
                              <button
                                className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-medium"
                                onClick={e => { e.stopPropagation(); handleDeleteInvoice(invoice.id); setOpenMenuId(null); setMenuCoords(null); }}
                                type="button"
                              >
                                <Trash2 size={16} className="mr-2" /> Delete Invoice
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceValidationTable;
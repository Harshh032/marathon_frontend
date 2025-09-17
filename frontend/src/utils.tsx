import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ready':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Needs Review':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Error':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Ready':
      return <CheckCircle size={16} className="text-emerald-600" />;
    case 'Needs Review':
      return <Clock size={16} className="text-amber-600" />;
    case 'Error':
      return <AlertCircle size={16} className="text-rose-600" />;
    default:
      return null;
  }
}; 
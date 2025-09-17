export interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  status: 'Ready' | 'Needs Review' | 'Error' | 'Pending' | 'Approved' | 'Loading' | 'In Progress';
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  // Optional fields for API/modal compatibility
  pdf_path?: string;
  vendor_info?: {
    Name?: string;
    Address?: string;
    [key: string]: any;
  };
  invoice_number?: string;
  uploaded_at?: string;
  nda_number?: string;
  po_number?: string;
  items?: { name: string; quantity: string; value: string }[];
  freight?: string;
  total?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
}

export interface GeniusAuthState {
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
}

export interface GeniusLoginCredentials {
  CompanyCode: string;
  Username: string;
  Password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

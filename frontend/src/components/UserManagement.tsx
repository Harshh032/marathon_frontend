import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, User as UserIcon, Mail, Calendar, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, CreateUserData, ApiUser } from '../types';
import UserProfile from '../UserProfile';
import { createApiClient } from '../utils/apiClient';

const BASE_API_URL = 'http://50.6.225.185:8000';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: CreateUserData) => void;
}

function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      onCreateUser(formData);
      setFormData({ username: '', email: '', password: '', role: 'user' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ username: '', email: '', password: '', role: 'user' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter username"
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter password (min 6 characters)"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to convert API user to internal User format
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id.toString(),
    name: apiUser.username,
    email: apiUser.email,
    role: apiUser.role,
    createdAt: apiUser.created_at,
    lastLogin: undefined, // API doesn't provide this yet
  };
};

export default function UserManagement() {
  const auth = useAuth();
  const { state, logActivity } = auth;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Create API client with auth context
  const apiClient = createApiClient(auth);

  // Function to fetch users from API
  const fetchUsers = async () => {
    if (state.user?.role !== 'admin') {
      setNotification({ type: 'error', message: 'Only admin users can access user management.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const result = await apiClient.get<ApiUser[]>('/admin/users');
      
      if (result.success && result.data) {
        const convertedUsers = result.data.map(convertApiUserToUser);
        setUsers(convertedUsers);
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to fetch users. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [state.user, state.token]);

  const handleCreateUser = async (userData: CreateUserData) => {
    if (state.user?.role !== 'admin') {
      setNotification({ type: 'error', message: 'Only admin users can create users.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const result = await apiClient.post<ApiUser>('/admin/users', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      });

      if (result.success && result.data) {
        const newUser = convertApiUserToUser(result.data);
        setUsers(prev => [...prev, newUser]);
        logActivity('User Created', `Created new user: ${newUser.name} (${newUser.email}) with ${newUser.role} role`);
        setNotification({ type: 'success', message: `User ${newUser.name} created successfully!` });
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to create user. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (state.user?.role !== 'admin') {
      setNotification({ type: 'error', message: 'Only admin users can delete users.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const result = await apiClient.delete(`/admin/users/${userId}`);
      
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        logActivity('User Deleted', `Deleted user: ${userName}`);
        setNotification({ type: 'success', message: `User ${userName} deleted successfully!` });
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to delete user. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-black rounded-2xl p-3">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rounded-xl p-4 flex items-center space-x-3 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">No users found</p>
              <p className="text-sm">Create your first user to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <UserProfile name={user.name} role={user.role} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-4 w-4 text-green-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              User
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={user.id === state.user?.id} // Can't delete yourself
                        className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={user.id === state.user?.id ? "You cannot delete your own account" : "Delete user"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
}

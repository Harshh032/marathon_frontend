import React, { useState, useEffect } from 'react';
import { Activity, User as UserIcon, Clock, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth, useUserActivities } from '../contexts/AuthContext';
import { UserActivity } from '../types';

export default function UserActivityTracker() {
  const { state } = useAuth();
  const { getActivities } = useUserActivities();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filterUser, filterAction]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activityData = getActivities();
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (filterUser !== 'all') {
      filtered = filtered.filter(activity => activity.userId === filterUser);
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(filterAction.toLowerCase())
      );
    }

    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredActivities(filtered);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('Login')) return 'bg-green-100 text-green-800';
    if (action.includes('Logout')) return 'bg-gray-100 text-gray-800';
    if (action.includes('Created')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('Updated')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-purple-100 text-purple-800';
  };

  // Get unique users from activities for filter dropdown
  const uniqueUsers = activities.reduce((users, activity) => {
    if (!users.find(u => u.userId === activity.userId)) {
      users.push({ userId: activity.userId, userName: activity.userName });
    }
    return users;
  }, [] as { userId: string; userName: string }[]);

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(activities.map(activity => activity.action))];

  if (state.user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center py-16">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">Only admin users can access user activity tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-black rounded-2xl p-3">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Activity Tracker</h1>
              <p className="text-gray-600">Monitor user activities and system events</p>
            </div>
          </div>
          <button
            onClick={loadActivities}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterUser('all');
                setFilterAction('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activities found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-100 rounded-full p-2">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.userName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(activity.action)}`}>
                            {activity.action}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {activity.details}
                    </p>
                    {activity.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">
                        IP: {activity.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, UserActivity } from '../types';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logoutDueToExpiration: () => void;
  updateUser: (user: User) => void;
  logActivity: (action: string, details: string) => void;
  isTokenExpired: (error: any) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'LOGOUT_EXPIRED' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGIN_FAILURE':
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT_EXPIRED':
      // Set flag in localStorage to show timeout message on login page
      localStorage.setItem('sessionExpired', 'true');
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// API configuration
const API_BASE_URL = 'http://50.6.225.185:8000';


// Mock users for demo purposes (kept for user management features)
const mockUsers: User[] = [];

// Demo credentials for fallback
const demoCredentials = [
  { username: 'admin', password: 'admin123', email: 'admin@demo.com' },
  { username: 'user', password: 'user123', email: 'user@demo.com' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth data on app load
  useEffect(() => {
    const savedAuth = localStorage.getItem('authData');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.user && authData.token) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: authData.user, token: authData.token }
          });
        }
      } catch (error) {
        console.error('Failed to parse saved auth data:', error);
        localStorage.removeItem('authData');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // First try API authentication
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: credentials.username,
            password: credentials.password 
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const user: User = {
              id: data.user.id.toString(),
              name: data.user.username,
              email: data.user.email || `${credentials.username}@company.com`,
              role: data.user.role,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            // Save to localStorage
            localStorage.setItem('authData', JSON.stringify({
              user,
              token: data.access_token,
            }));

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token: data.access_token }
            });

            // Log the login activity
            logActivity('User Login', `User ${user.name} logged in successfully`);

            return { success: true };
          }
        }
      } catch (apiError) {
        console.log('API login failed, falling back to demo mode:', apiError);
      }

      // Fallback to demo authentication if API fails
      const demoUser = demoCredentials.find(
        cred => cred.username === credentials.username && cred.password === credentials.password
      );

      if (demoUser) {
        const user: User = {
          id: demoUser.username === 'admin' ? '1' : '2',
          name: demoUser.username === 'admin' ? 'Demo Admin' : 'Demo User',
          email: demoUser.email,
          role: demoUser.username === 'admin' ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        const demoToken = `demo_token_${Date.now()}`;

        // Save to localStorage
        localStorage.setItem('authData', JSON.stringify({
          user,
          token: demoToken,
        }));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: demoToken }
        });

        // Log the login activity
        logActivity('User Login', `User ${user.name} logged in successfully`);

        return { success: true };
      }

      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    if (state.user) {
      logActivity('User Logout', `User ${state.user.name} logged out`);
    }
    localStorage.removeItem('authData');
    localStorage.removeItem('sessionExpired');
    dispatch({ type: 'LOGOUT' });
  };

  const logoutDueToExpiration = () => {
    if (state.user) {
      logActivity('Session Expired', `User ${state.user.name} session expired`);
    }
    localStorage.removeItem('authData');
    dispatch({ type: 'LOGOUT_EXPIRED' });
  };

  const isTokenExpired = (error: any): boolean => {
    // Check if error indicates token expiration
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return true;
    }
    
    // Check fetch response
    if (error?.status === 401 || error?.status === 403) {
      return true;
    }
    
    // Check error message patterns that indicate token expiration
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('unauthorized') || 
           errorMessage.includes('token expired') || 
           errorMessage.includes('invalid token') ||
           errorMessage.includes('access denied');
  };

  const updateUser = (user: User) => {
    // Update localStorage
    const savedAuth = localStorage.getItem('authData');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        authData.user = user;
        localStorage.setItem('authData', JSON.stringify(authData));
      } catch (error) {
        console.error('Failed to update saved auth data:', error);
      }
    }

    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const logActivity = (action: string, details: string) => {
    if (!state.user) return;

    const activity: UserActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: state.user.id,
      userName: state.user.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In a real app, you'd get this from the request
    };

    // Save to localStorage for demonstration (in a real app, send to backend)
    const existingActivities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    const updatedActivities = [activity, ...existingActivities].slice(0, 100); // Keep last 100 activities
    localStorage.setItem('userActivities', JSON.stringify(updatedActivities));
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      logoutDueToExpiration,
      updateUser,
      logActivity,
      isTokenExpired,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get all users (admin only)
export function useUsers() {
  const { state } = useAuth();
  
  const getUsers = () => {
    if (state.user?.role !== 'admin') {
      throw new Error('Only admin users can access user list');
    }
    return mockUsers;
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (state.user?.role !== 'admin') {
      throw new Error('Only admin users can create users');
    }
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    return newUser;
  };

  const deleteUser = (userId: string) => {
    if (state.user?.role !== 'admin') {
      throw new Error('Only admin users can delete users');
    }

    const index = mockUsers.findIndex(u => u.id === userId);
    if (index > -1) {
      mockUsers.splice(index, 1);
    }
  };

  return {
    getUsers,
    createUser,
    deleteUser,
  };
}

// Hook to get user activities (admin only)
export function useUserActivities() {
  const { state } = useAuth();

  const getActivities = (): UserActivity[] => {
    if (state.user?.role !== 'admin') {
      throw new Error('Only admin users can access user activities');
    }

    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    return activities as UserActivity[];
  };

  return {
    getActivities,
  };
}

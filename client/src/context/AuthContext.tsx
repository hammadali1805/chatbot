import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean | void>;
  register: (email: string, password: string, name: string) => Promise<boolean | void>;
  loginWithGoogle: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Set axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);

        // Try to get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id) {
              setUser(parsedUser);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
          }
        }

        // If we get here, either there's no valid user data or parsing failed
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [handleLogout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Server response:', response.data);

      const { token, _id, email: userEmail, name } = response.data;

      if (!token) {
        console.error('No token received from server');
        throw new Error('No token received from server');
      }

      // Create user object from response data
      const userData: User = {
        id: _id,
        email: userEmail,
        name
      };

      // Set axios defaults first
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state and localStorage
      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Navigate to home only on success
      navigate('/', { replace: true });
      return true; // Indicate success
    } catch (error: any) {
      console.error('Login error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extract meaningful error message for the user
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = error.response.data;
        console.log('Server error response:', responseData);
        
        if (error.response.status === 400 || error.response.status === 401) {
          // Handle specific error messages
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          }
          
          // Check for common error cases
          if (errorMessage.toLowerCase().includes('not found') || 
              errorMessage.toLowerCase().includes('no user')) {
            errorMessage = 'No account found with this email address.';
          } else if (errorMessage.toLowerCase().includes('password') && 
                     errorMessage.toLowerCase().includes('incorrect')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else if (errorMessage.toLowerCase().includes('invalid credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          }
        } else if (error.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      // Throw error but don't navigate or redirect on error
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name
      });

      // Log the full response data for debugging
      console.log('Registration response:', response.data);

      // Check what structure the response has
      if (!response.data) {
        throw new Error('Empty response from server');
      }

      // Extract token and user data based on the response structure
      let newToken, userData;

      // Handle different possible response structures
      if (response.data.token && response.data._id) {
        // If user data is directly in the response
        newToken = response.data.token;
        
        userData = {
          id: response.data._id,
          email: response.data.email || email,
          name: response.data.name || name
        };
      } 
      else if (response.data.token && response.data.user) {
        // If user is nested in a 'user' property
        newToken = response.data.token;
        
        userData = {
          id: response.data.user._id,
          email: response.data.user.email || email, 
          name: response.data.user.name || name
        };
      }
      else if (response.data.token) {
        // If we only have a token but no user data
        newToken = response.data.token;
        
        // Create minimal user object from provided registration data
        userData = {
          id: 'temp-id', // This will be replaced once we fetch the user profile
          email: email,
          name: name
        };
        
        console.log('Warning: Creating temporary user object from registration data');
      }
      else {
        throw new Error('Invalid response format from server');
      }

      // Ensure we have a token
      if (!newToken) {
        throw new Error('No token received from server');
      }

      // Set axios defaults first
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update state and localStorage
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Navigate to home only on success
      navigate('/', { replace: true });
      return true; // Indicate success
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract meaningful error message for the user
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = error.response.data;
        console.log('Server error response:', responseData);
        
        if (error.response.status === 400) {
          // Handle specific 400 error messages
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          }
          
          // Check for common error cases
          if (errorMessage.includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
            errorMessage = 'An account with this email already exists.';
          }
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      // Throw error but don't navigate or redirect on error
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout: handleLogout,
    isAuthenticated: Boolean(token) && Boolean(user?.id),
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// API base URL for server calls
export const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-539c048d`;

// Helper function to make authenticated API calls
export async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    headers.Authorization = `Bearer ${publicAnonKey}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

// Auth helpers
export const authAPI = {
  async signUp(email: string, password: string, name: string, userType: 'parent' | 'student') {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name, userType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getProfile() {
    const response = await makeAuthenticatedRequest('/auth/profile');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }
    
    return response.json();
  },

  async updateProfile(updates: any) {
    const response = await makeAuthenticatedRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return response.json();
  }
};

// Notices API
export const noticesAPI = {
  async createNotice(noticeData: any) {
    const response = await makeAuthenticatedRequest('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create notice');
    }
    
    return response.json();
  },

  async getNotices() {
    const response = await makeAuthenticatedRequest('/notices');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get notices');
    }
    
    return response.json();
  },

  async getMyNotices() {
    const response = await makeAuthenticatedRequest('/notices/my-notices');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get my notices');
    }
    
    return response.json();
  },

  async applyToNotice(noticeId: string, message: string) {
    const response = await makeAuthenticatedRequest(`/notices/${noticeId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to apply to notice');
    }
    
    return response.json();
  },

  async updateApplicationStatus(noticeId: string, applicationId: string, status: 'accepted' | 'rejected') {
    const response = await makeAuthenticatedRequest(`/notices/${noticeId}/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update application status');
    }
    
    return response.json();
  }
};

// Applications API
export const applicationsAPI = {
  async getMyApplications() {
    const response = await makeAuthenticatedRequest('/applications/my-applications');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get applications');
    }
    
    return response.json();
  }
};
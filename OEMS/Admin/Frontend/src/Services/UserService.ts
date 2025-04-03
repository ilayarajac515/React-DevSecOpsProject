import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

interface User {
    name: string;
    emailId: string;
    id: string;
}

interface ForgotPasswordResponse {
    message: string;
    status: boolean;
}

interface ResetPasswordResponse {
    message: string;
}

export const signUp = async (
    name: string,
    email: string,
    password: string,
): Promise<void> => {
    await axios.post(`${API_URL}/register`, { name, email, password });
};

export const login = async (email: string, password: string): Promise<User> => {
    try {
        const { data } = await axios.post(`${API_URL}/login`, { email, password });
         
        const { token, name, emailId, id} = data;

        
        document.cookie = `token=${token}; max-age=${30 * 24 * 60 * 60}; path=/;`;
        return {name, emailId, id};
        
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await axios.post(`${API_URL}/logout`);
        document.cookie = `token=; max-age=0; path=/;`;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

export const getToken = (): string | null => {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'token') return value;
    }
    return null;
};

export const forgotPass = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
        const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
        return data;
    } catch (error) {
        console.error('Failed to send mail:', error);
        throw error;
    }
};

export const resetPass = async (userId: string, token: string, password: string, expiry: string): Promise<ResetPasswordResponse> => {
    try {
        const { data } = await axios.post(`${API_URL}/reset-password/${userId}/${token}/${expiry}`, { password });
        return data;
    } catch (error) {
        console.error('Failed to reset password:', error);
        throw error;
    }
};

export const verifyToken = async (userId: string | undefined, token: string | undefined, expiry: string | undefined) => {
  try {
    const { data } = await axios.post(`${API_URL}/verify-token`, { userId, token, expiry });
    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};


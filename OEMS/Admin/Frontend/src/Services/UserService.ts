import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

interface User {
    name: string;
    emailId: string;
    id: string;
}

interface ForgotPasswordResponse {
    id: string;
    token: string;
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
        const { token, name, emailId, id } = data;

        document.cookie = `token=${token}; max-age=${30 * 24 * 60 * 60}; path=/;`;
        return { name, emailId, id };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await axios.post(`${API_URL}/logout`);
        document.cookie = `token=; max-age=${30 * 24 * 60 * 60}; path=/;`;
        document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

export const getToken = (): string | null => {
    return getCookie('token');
};

export const forgotPass = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
        const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
        const { id, token } = data;
        return { id, token };
    } catch (error) {
        console.error('Failed to send mail:', error);
        throw error;
    }
};

export const resetPass = async (Id: string, Token: string, password: string): Promise<void> => {
    try {
        await axios.post(`${API_URL}/reset-password/${Id}/${Token}`, { password });
    } catch (error) {
        console.error('Failed to reset password:', error);
        throw error;
    }
};

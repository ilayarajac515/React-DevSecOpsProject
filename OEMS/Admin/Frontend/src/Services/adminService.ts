import axiosInstance from "../api/axiosInstance";

interface ForgotPasswordResponse {
  message: string;
  status: boolean;
}
interface LoginResponse {
  name: string;
  email: string;
  accessToken: string;
}
interface CheckAuthResponse {
  authorized: boolean;
  name?: string;
  email?: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  await axiosInstance.post("/register", { name, email, password });
};

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/login",
      { email, password },
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error.response?.data || new Error("Login failed");
  }
};

export const logoutUser = async (email: string): Promise<void> => {
  try {
    const { data } = await axiosInstance.post<void>(
      "/logout",
      { email },
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    console.error("Logout failed:", error);
    throw error.response?.data || new Error("Logout failed");
  }
};

export const getToken = (): string | null => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "token") return value;
  }
  return null;
};

export const forgotPass = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    const { data } = await axiosInstance.post("/forgot-password", { email });
    return data;
  } catch (error) {
    console.error("Failed to send mail:", error);
    throw error;
  }
};

export const resetPass = async (
  userId: string,
  token: string,
  password: string,
  expiry: string
): Promise<ResetPasswordResponse> => {
  try {
    const { data } = await axiosInstance.post(
      `/reset-password/${userId}/${token}/${expiry}`,
      { password }
    );
    return data;
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
};

export const verifyToken = async (
  userId: string | undefined,
  token: string | undefined,
  expiry: string | undefined
) => {
  try {
    const { data } = await axiosInstance.post("/verify-token", {
      userId,
      token,
      expiry,
    });
    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

export const checkAuth = async (): Promise<CheckAuthResponse> => {
  try {
    const { data } = await axiosInstance.get<CheckAuthResponse>("/check-auth");
    return data;
  } catch (error) {
    return { authorized: false };
  }
};

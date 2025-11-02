import { axiosInstance } from "@/src/lib/axios";

interface User {
  id: number;
  username: string;
  displayName: string;
  createdAt: string;
}

interface CurrentUserResponse {
  success: boolean;
  data: User;
}

/**
 * Get current authenticated user
 * Note: Login handled by Next-Auth, tidak perlu service function
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<CurrentUserResponse>("/api/auth/me");
  return response.data.data;
};

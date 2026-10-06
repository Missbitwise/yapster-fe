import { apiClient } from "./api.client";
import {
  ApiResponse,
  AuthResponseData,
  LoginDTO,
  RegisterDTO,
  User,
} from "@/types/user.types";

export const authService = {
  async register(data: RegisterDTO): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>("/users/register", data);
    return res.data;
  },

  async login(data: LoginDTO): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/users/login",
      data
    );
    return res.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await apiClient.get<ApiResponse<User>>("/users/me");
    return res.data;
  },
};

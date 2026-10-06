export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_picture?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
  last_seen?: string | null;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

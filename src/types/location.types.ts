export interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  locality?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NearbyUser {
  id: string;
  name: string;
  username: string;
  profile_picture?: string | null;
  bio?: string | null;
  locality?: string | null;
  distance_km: number;
}

export interface UpdateLocationDTO {
  latitude: number;
  longitude: number;
  locality?: string;
}

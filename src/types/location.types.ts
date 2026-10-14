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
  relationship_status?: DiscoveryRelationshipStatus;
}

export type DiscoveryRelationshipStatus =
  | "friend"
  | "request_sent"
  | "request_received"
  | null;

export interface DiscoveredUser {
  id: string;
  name: string;
  username: string;
  profile_picture?: string | null;
  bio?: string | null;
  locality?: string | null;
  relationship_status?: DiscoveryRelationshipStatus;
}

export interface EveryonePage {
  users: DiscoveredUser[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface UpdateLocationDTO {
  latitude: number;
  longitude: number;
  locality?: string;
}

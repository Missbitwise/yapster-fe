export interface Friend {
  id: string;
  name: string;
  username: string;
  profile_picture?: string | null;
  bio?: string | null;
  last_seen?: string | null;
  friends_since: string;
  created_at?: string;
}

export interface FriendRequest {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  name: string;
  username: string;
  profile_picture?: string | null;
  bio?: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface BlockedUser {
  id: string;
  name: string;
  username: string;
  profile_picture?: string | null;
  bio?: string | null;
  blocked_at: string;
}

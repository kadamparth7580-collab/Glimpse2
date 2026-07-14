export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type Glimpse = {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  profiles: Profile | null;
  likes?: {
    id: string;
    user_id: string;
  }[];
};

export type Comment = {
  id: string;
  glimpse_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile | null;
};
export type Like = {
  id: string;
  glimpse_id: string;
  user_id: string;
  created_at: string;
};
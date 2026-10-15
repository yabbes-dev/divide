export interface Profile {
  id: string;
  username: string;
}

export interface SavedGroup {
  id: string;
  name: string;
  members: string[];
}

export interface ProfileSnapshot {
  configured: boolean;
  profile: Profile | null;
  groups: SavedGroup[];
}

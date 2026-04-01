export interface StoryItem {
  uri: string;
  duration?: number; // optional override
}

export interface StoryUser {
  id: string;
  username: string;
  avatar: string;
  stories: StoryItem[];
  isViewed: boolean;
}

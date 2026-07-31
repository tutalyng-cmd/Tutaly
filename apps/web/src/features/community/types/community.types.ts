export type AnonymityMode = 'full_name' | 'job_title_only' | 'anonymous_employee';

export interface CommunityBowl {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  category: 'industry' | 'company' | 'topic';
  member_count: number;
}

export interface ThreadAuthor {
  name: string;
  title: string;
  isAnonymous: boolean;
}

export interface CommunityThread {
  id: string;
  title: string;
  content: string;
  media_urls: string[] | null;
  has_poll: boolean;
  upvotes_count: number;
  comments_count: number;
  status: string;
  createdAt: string;
  author: ThreadAuthor;
  bowl: CommunityBowl;
}

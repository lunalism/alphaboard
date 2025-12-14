export type NewsType = 'institution' | 'company';

export interface NewsItem {
  id: number;
  category: string;
  categoryIcon: string;
  type: NewsType;
  countryFlag: string;
  source: string;
  time: string;
  title: string;
  tags: string[];
  summary: string;
  likes: number;
  comments: number;
  upvotes: number;
  downvotes: number;
  views: number;
  imageUrl: string;
  companyDomain?: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  emoji: string;
  href: string;
}

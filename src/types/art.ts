export interface Exhibition {
  id: string;
  title: string;
  region: '부산' | '울산' | '경남';
  subRegion: string;
  location: string;
  venueName?: string;
  address?: string;
  period: string;
  startDate?: string;
  endDate?: string;
  price: string;
  isFree: boolean;
  category: string;
  description: string;
  openingHours?: string;
  closedDays?: string;
  tel?: string;
  tag?: string;
  posterTheme?: string;
  accentColor?: string;
  link: string;
  curatorNote?: string;
  nearbySpots?: string[];
}

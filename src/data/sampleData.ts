export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  constituency: string;
  region: string;
  district: string;
  imageUrl: string;
  upvotes: number;
  meTooCount: number;
  commentsCount: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  magnitudeScore: number;
  status: 'open' | 'in-progress' | 'resolved';
  hasOfficialResponse: boolean;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  daysOpen: number;
}

export interface Leader {
  id: string;
  name: string;
  role: 'mp' | 'minister' | 'dce';
  constituency?: string;
  ministry?: string;
  district?: string;
  region: string;
  party: string;
  rating: number;
  totalRatings: number;
  issuesResponded: number;
  totalIssues: number;
  responseRate: number;
  avgResponseTime: string;
  avatarUrl: string;
  verified: boolean;
}

export interface Constituency {
  id: string;
  name: string;
  region: string;
  district: string;
  mpName: string;
  mpRating: number;
  totalIssues: number;
  resolvedPercent: number;
  population: number;
}

export const categories = [
  { name: 'Roads & Infrastructure', color: 'bg-urgency-high', icon: '🛣️' },
  { name: 'Water & Sanitation', color: 'bg-primary', icon: '💧' },
  { name: 'Electricity', color: 'bg-secondary', icon: '⚡' },
  { name: 'Health', color: 'bg-accent', icon: '🏥' },
  { name: 'Education', color: 'bg-primary', icon: '📚' },
  { name: 'Security', color: 'bg-ghana-charcoal', icon: '🛡️' },
  { name: 'Environment', color: 'bg-primary', icon: '🌿' },
  { name: 'Other', color: 'bg-muted-foreground', icon: '📋' },
];

export const sampleIssues: Issue[] = [
  {
    id: '1',
    title: 'Massive potholes on Kumasi-Accra Highway',
    description: 'The stretch between Konongo and Ejisu has developed dangerous potholes that have caused multiple accidents this month.',
    category: 'Roads & Infrastructure',
    constituency: 'Kumasi Central',
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    imageUrl: '',
    upvotes: 342,
    meTooCount: 128,
    commentsCount: 56,
    urgency: 'critical',
    magnitudeScore: 892,
    status: 'open',
    hasOfficialResponse: false,
    authorName: 'Kwame Asante',
    authorAvatar: '',
    createdAt: '2026-03-20',
    daysOpen: 7,
  },
  {
    id: '2',
    title: 'No water supply in Nima for 3 weeks',
    description: 'Residents of Nima have been without water supply for over 3 weeks. Ghana Water Company has not responded to complaints.',
    category: 'Water & Sanitation',
    constituency: 'Accra Central',
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    imageUrl: '',
    upvotes: 567,
    meTooCount: 234,
    commentsCount: 89,
    urgency: 'critical',
    magnitudeScore: 1456,
    status: 'in-progress',
    hasOfficialResponse: true,
    authorName: 'Fatima Mohammed',
    authorAvatar: '',
    createdAt: '2026-03-05',
    daysOpen: 22,
  },
  {
    id: '3',
    title: 'Streetlights broken on Tamale-Bolgatanga road',
    description: 'Major sections of the road have no working streetlights, creating dangerous conditions for drivers and pedestrians at night.',
    category: 'Electricity',
    constituency: 'Tamale Central',
    region: 'Northern',
    district: 'Tamale Metropolitan',
    imageUrl: '',
    upvotes: 189,
    meTooCount: 67,
    commentsCount: 34,
    urgency: 'high',
    magnitudeScore: 534,
    status: 'open',
    hasOfficialResponse: false,
    authorName: 'Abdul-Razak Ibrahim',
    authorAvatar: '',
    createdAt: '2026-03-15',
    daysOpen: 12,
  },
  {
    id: '4',
    title: 'Takoradi Market Circle flooding every rainstorm',
    description: 'The drainage system around Market Circle is completely blocked, causing severe flooding during every rainstorm.',
    category: 'Environment',
    constituency: 'Takoradi',
    region: 'Western',
    district: 'Sekondi-Takoradi Metropolitan',
    imageUrl: '',
    upvotes: 245,
    meTooCount: 98,
    commentsCount: 42,
    urgency: 'high',
    magnitudeScore: 678,
    status: 'open',
    hasOfficialResponse: true,
    authorName: 'Esi Mensah',
    authorAvatar: '',
    createdAt: '2026-03-12',
    daysOpen: 15,
  },
  {
    id: '5',
    title: 'School building collapsing in Sunyani',
    description: 'The main classroom block of Sunyani Municipal Primary School is cracking and at risk of collapse. Students are in danger.',
    category: 'Education',
    constituency: 'Sunyani',
    region: 'Bono',
    district: 'Sunyani Municipal',
    imageUrl: '',
    upvotes: 423,
    meTooCount: 156,
    commentsCount: 78,
    urgency: 'critical',
    magnitudeScore: 1123,
    status: 'open',
    hasOfficialResponse: false,
    authorName: 'Yaw Boateng',
    authorAvatar: '',
    createdAt: '2026-03-08',
    daysOpen: 19,
  },
  {
    id: '6',
    title: 'Hospital beds shortage at Korle Bu',
    description: 'Patients are being turned away or sleeping on the floor at Korle Bu Teaching Hospital due to extreme bed shortages.',
    category: 'Health',
    constituency: 'Accra Central',
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    imageUrl: '',
    upvotes: 678,
    meTooCount: 312,
    commentsCount: 145,
    urgency: 'critical',
    magnitudeScore: 1890,
    status: 'in-progress',
    hasOfficialResponse: true,
    authorName: 'Dr. Akua Serwaa',
    authorAvatar: '',
    createdAt: '2026-03-01',
    daysOpen: 26,
  },
];

export const sampleLeaders: Leader[] = [
  {
    id: '1',
    name: 'Hon. Kwadwo Mensah',
    role: 'mp',
    constituency: 'Kumasi Central',
    region: 'Ashanti',
    party: 'NPP',
    rating: 3.2,
    totalRatings: 1243,
    issuesResponded: 23,
    totalIssues: 67,
    responseRate: 34,
    avgResponseTime: '5 days',
    avatarUrl: '',
    verified: true,
  },
  {
    id: '2',
    name: 'Hon. Ama Darko',
    role: 'mp',
    constituency: 'Accra Central',
    region: 'Greater Accra',
    party: 'NDC',
    rating: 4.1,
    totalRatings: 2341,
    issuesResponded: 89,
    totalIssues: 112,
    responseRate: 79,
    avgResponseTime: '2 days',
    avatarUrl: '',
    verified: true,
  },
  {
    id: '3',
    name: 'Hon. Ibrahim Tanko',
    role: 'mp',
    constituency: 'Tamale Central',
    region: 'Northern',
    party: 'NPP',
    rating: 2.8,
    totalRatings: 876,
    issuesResponded: 12,
    totalIssues: 54,
    responseRate: 22,
    avgResponseTime: '8 days',
    avatarUrl: '',
    verified: true,
  },
];

export const sampleConstituencies: Constituency[] = [
  { id: '1', name: 'Kumasi Central', region: 'Ashanti', district: 'Kumasi Metropolitan', mpName: 'Hon. Kwadwo Mensah', mpRating: 3.2, totalIssues: 67, resolvedPercent: 28, population: 245000 },
  { id: '2', name: 'Accra Central', region: 'Greater Accra', district: 'Accra Metropolitan', mpName: 'Hon. Ama Darko', mpRating: 4.1, totalIssues: 112, resolvedPercent: 65, population: 389000 },
  { id: '3', name: 'Tamale Central', region: 'Northern', district: 'Tamale Metropolitan', mpName: 'Hon. Ibrahim Tanko', mpRating: 2.8, totalIssues: 54, resolvedPercent: 18, population: 178000 },
  { id: '4', name: 'Takoradi', region: 'Western', district: 'Sekondi-Takoradi Metropolitan', mpName: 'Hon. Grace Appiah', mpRating: 3.7, totalIssues: 43, resolvedPercent: 42, population: 156000 },
  { id: '5', name: 'Sunyani', region: 'Bono', district: 'Sunyani Municipal', mpName: 'Hon. Samuel Owusu', mpRating: 3.5, totalIssues: 38, resolvedPercent: 35, population: 132000 },
];

export const regions = [
  'Ashanti', 'Greater Accra', 'Northern', 'Western', 'Eastern',
  'Central', 'Volta', 'Bono', 'Upper East', 'Upper West',
  'Western North', 'Ahafo', 'Bono East', 'Oti', 'Savannah', 'North East',
];

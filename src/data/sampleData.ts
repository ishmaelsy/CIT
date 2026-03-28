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

export interface ProjectSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  constituency: string;
  region: string;
  district: string;
  estimated_impact: string | null;
  status: 'proposed' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  vote_count: number;
  author_name: string;
  created_at: string;
}

export const sampleProjects: ProjectSuggestion[] = [
  {
    id: 'sp-1',
    title: 'Build community borehole at Nima Market',
    description: 'The Nima area has faced chronic water shortages for years. A mechanised borehole at the market square would serve over 15,000 residents and market traders daily, reducing dependency on erratic Ghana Water supply.',
    category: 'Water & Sanitation',
    constituency: 'Accra Central',
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    estimated_impact: 'Serves 15,000+ residents. Estimated cost: GHS 120,000. Reduces waterborne diseases in the area by providing clean, reliable water access.',
    status: 'proposed',
    vote_count: 847,
    author_name: 'Fatima Mohammed',
    created_at: '2026-03-10',
  },
  {
    id: 'sp-2',
    title: 'Solar streetlights on Tamale-Bolgatanga corridor',
    description: 'Install 200 solar-powered LED streetlights along the 160km Tamale-Bolgatanga road. Night-time accidents have killed 23 people in the last year alone on this stretch. Solar eliminates dependency on unreliable grid power.',
    category: 'Electricity',
    constituency: 'Tamale Central',
    region: 'Northern',
    district: 'Tamale Metropolitan',
    estimated_impact: '160km road coverage. Estimated cost: GHS 2.4M. Could reduce night-time accidents by up to 60% based on similar projects in Ashanti Region.',
    status: 'under_review',
    vote_count: 623,
    author_name: 'Abdul-Razak Ibrahim',
    created_at: '2026-03-08',
  },
  {
    id: 'sp-3',
    title: 'Rehabilitate Sunyani Municipal Primary School block',
    description: 'The main classroom block is cracking and at risk of collapse. 450 students currently attend classes in a dangerous building. This project would demolish and rebuild the block with a modern 12-classroom facility.',
    category: 'Education',
    constituency: 'Sunyani',
    region: 'Bono',
    district: 'Sunyani Municipal',
    estimated_impact: 'Benefits 450 current students and projected 600+ within 5 years. New block includes a library and computer lab.',
    status: 'approved',
    vote_count: 534,
    author_name: 'Yaw Boateng',
    created_at: '2026-03-05',
  },
  {
    id: 'sp-4',
    title: 'Construct drainage system at Takoradi Market Circle',
    description: 'Every rainstorm floods the entire Market Circle area, destroying goods worth thousands of cedis and making roads impassable. A proper storm drainage network would channel runoff to the sea outfall.',
    category: 'Environment',
    constituency: 'Takoradi',
    region: 'Western',
    district: 'Sekondi-Takoradi Metropolitan',
    estimated_impact: 'Protects 3,000+ market traders and surrounding residential areas. Prevents estimated GHS 500K in annual flood damage.',
    status: 'proposed',
    vote_count: 412,
    author_name: 'Esi Mensah',
    created_at: '2026-03-14',
  },
  {
    id: 'sp-5',
    title: 'Build CHPS compound at Bantama',
    description: 'Bantama has no primary health facility within a 5km radius. Residents must travel to Komfo Anokye for even basic treatment. A Community-based Health Planning and Services compound would provide first-line care.',
    category: 'Health',
    constituency: 'Bantama',
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    estimated_impact: 'Serves 28,000 residents. Reduces pressure on Komfo Anokye Teaching Hospital. Provides maternal care, vaccinations, and malaria treatment locally.',
    status: 'proposed',
    vote_count: 389,
    author_name: 'Akosua Afriyie',
    created_at: '2026-03-18',
  },
  {
    id: 'sp-6',
    title: 'Resurface Kumasi inner-city ring road',
    description: 'The 12km inner ring road from Adum through Asafo to Suame has deteriorated badly with potholes and exposed aggregate. This is the busiest route in Kumasi, used by over 50,000 vehicles daily.',
    category: 'Roads & Infrastructure',
    constituency: 'Kumasi Central',
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    estimated_impact: '50,000+ daily road users benefit. Reduces vehicle maintenance costs and travel time. Estimated project cost: GHS 8M for full resurfacing.',
    status: 'in_progress',
    vote_count: 756,
    author_name: 'Kwame Asante',
    created_at: '2026-02-28',
  },
  {
    id: 'sp-7',
    title: 'Install CCTV network in Accra CBD',
    description: 'Deploy 150 surveillance cameras across the Accra Central Business District covering key intersections, markets, and public spaces. Feed into a joint police-municipal monitoring centre to deter crime and aid rapid response.',
    category: 'Security',
    constituency: 'Accra Central',
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    estimated_impact: 'Covers 8 sq km of CBD. International evidence shows 13-16% crime reduction from CCTV deployment in urban centres.',
    status: 'proposed',
    vote_count: 298,
    author_name: 'Nana Osei Bonsu',
    created_at: '2026-03-20',
  },
  {
    id: 'sp-8',
    title: 'Youth skills training centre in Tamale',
    description: 'Construct a vocational training facility offering courses in welding, carpentry, ICT, tailoring, and small-engine repair. Targets unemployed youth aged 15-30 in the Northern Region.',
    category: 'Education',
    constituency: 'Tamale South',
    region: 'Northern',
    district: 'Tamale Metropolitan',
    estimated_impact: 'Capacity for 500 trainees per year. Addresses 42% youth unemployment in the Northern Region. Includes job placement partnerships with local businesses.',
    status: 'proposed',
    vote_count: 267,
    author_name: 'Memunatu Alhassan',
    created_at: '2026-03-22',
  },
];

const constituencyProjectTemplates = [
  {
    titleTemplate: (c: string) => `Build community water borehole in ${c}`,
    description: (c: string) => `Residents of ${c} face chronic water shortages. A mechanised borehole at a central location would serve thousands of residents daily, providing clean and reliable water access independent of Ghana Water supply interruptions.`,
    category: 'Water & Sanitation',
    estimated_impact: (c: string) => `Serves residents across ${c}. Estimated cost: GHS 120,000. Reduces waterborne disease transmission and saves hours of daily water-fetching time for households.`,
    status: 'proposed' as const,
    vote_count: 145,
    author_name: 'Community Association',
  },
  {
    titleTemplate: (c: string) => `Rehabilitate primary school classroom block in ${c}`,
    description: (c: string) => `The primary school infrastructure in ${c} is deteriorating. Cracked walls, leaking roofs, and overcrowded classrooms compromise student learning outcomes. This project proposes a modern classroom block to serve the growing population.`,
    category: 'Education',
    estimated_impact: (c: string) => `Benefits 300+ students in ${c}. Modern facility with adequate ventilation, proper lighting, and accessible design. Includes a small library corner.`,
    status: 'proposed' as const,
    vote_count: 112,
    author_name: 'PTA Committee',
  },
  {
    titleTemplate: (c: string) => `Install solar streetlights on main roads in ${c}`,
    description: (c: string) => `Key roads in ${c} are dangerously dark at night, increasing the risk of accidents and crime. Solar-powered LED streetlights would improve safety without depending on the unreliable national grid.`,
    category: 'Electricity',
    estimated_impact: (c: string) => `Covers major roads in ${c}. Solar units require minimal maintenance. Expected to reduce night-time incidents significantly.`,
    status: 'proposed' as const,
    vote_count: 98,
    author_name: 'Youth Development Group',
  },
];

export function generateSampleProjectsForConstituency(
  constituency: string,
  region: string,
  district: string
): ProjectSuggestion[] {
  const alreadyCovered = sampleProjects.some((p) => p.constituency === constituency);
  if (alreadyCovered) return [];

  return constituencyProjectTemplates.map((tmpl, i) => ({
    id: `sp-gen-${constituency.replace(/\s+/g, '-').toLowerCase()}-${i}`,
    title: tmpl.titleTemplate(constituency),
    description: tmpl.description(constituency),
    category: tmpl.category,
    constituency,
    region,
    district,
    estimated_impact: tmpl.estimated_impact(constituency),
    status: tmpl.status,
    vote_count: tmpl.vote_count + Math.floor(constituency.charCodeAt(0) % 50),
    author_name: tmpl.author_name,
    created_at: '2026-03-15',
  }));
}

export const regions = [
  'Ashanti', 'Greater Accra', 'Northern', 'Western', 'Eastern',
  'Central', 'Volta', 'Bono', 'Upper East', 'Upper West',
  'Western North', 'Ahafo', 'Bono East', 'Oti', 'Savannah', 'North East',
];

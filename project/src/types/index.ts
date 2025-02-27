// Enum for company types and job age
export enum CompanyScale {
  STARTUP = "Startup",
  MIDSCALE = "Mid-Scale",
  MNC = "Multinational Corporation",
  SME = "Small & Medium Enterprise"
}

export enum JobAge {
  ONE_DAY = "1 Day",
  THREE_DAYS = "3 Days",
  ONE_WEEK = "1 Week",
  TWO_WEEKS = "2 Weeks",
  ONE_MONTH = "1 Month"
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyScale: CompanyScale;
  description: string;
  applyLink: string;
  datePosted: number;
  location: string;
  country: string;
  industry: string;
  salary?: string;
  companyCareerSite?: string;
  sourceUrl?: string;
}
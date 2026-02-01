export interface Category {
  id: string;
  key: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  key: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  link: string | null;
  githubUrl: string | null;
  category: string;
  subcategory: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  type: 'work' | 'education' | 'skill';
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  avatar: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    dribbble: string;
    behance: string;
  };
}

export interface ProfileData {
  profile: Profile;
  stats: {
    projectsCompleted: number;
    yearsExperience: number;
    happyClients: number;
    awards: number;
  };
  availableForHire: boolean;
}

export type Locale = 'en' | 'pt' | 'es';

export interface Translations {
  [key: string]: string | Translations;
}

export interface BlogPostTranslation {
  title: string;
  excerpt: string;
  content: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  category: string;
  subcategory: string;
  tags: string[];
  author: string;
  imageUrl?: string;
  translations: {
    en: BlogPostTranslation;
    pt: BlogPostTranslation;
    es: BlogPostTranslation;
  };
}
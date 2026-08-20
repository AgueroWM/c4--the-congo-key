import React from 'react';

export interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  stats: string;
  imageBefore: string;
  imageAfter: string;
  description: string;
}

export interface Service {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

export enum SectionId {
  HERO = 'hero',
  AUTHORITY = 'authority',
  PROCESS = 'process',
  PORTFOLIO = 'portfolio',
  DESTINATION = 'destination',
  CONTACT = 'contact'
}
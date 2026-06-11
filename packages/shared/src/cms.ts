// CMS transport shapes (banners, FAQs, content pages).

import type { BannerPlacement } from './enums';

export interface BannerDTO {
  id: string;
  title?: string;
  subtitle?: string;
  image: { publicId: string | null; url: string } | null;
  link?: string;
  placement: BannerPlacement | string;
  displayOrder: number;
  isActive: boolean;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ContentPageDTO {
  slug: string;
  title: string;
  body: string;
  updatedAt?: string;
}

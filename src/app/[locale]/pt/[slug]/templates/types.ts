export type TrainerProfile = {
  full_name: string;
  slug: string;
  cref: string | null;
  bio: string | null;
  photo_url: string | null;
  cover_image_url: string | null;
  specialties: string[] | null;
  services_description: string | null;
  pricing_summary: string | null;
  whatsapp_phone: string | null;
  instagram_handle: string | null;
  city: string | null;
  state: string | null;
  template_id: string;
  accent_color: string | null;
  headline: string | null;
  subheadline: string | null;
  cta_text: string | null;
  years_experience: number | null;
  students_helped: number | null;
  testimonials: Testimonial[] | null;
  highlights: Highlight[] | null;
};

export type Testimonial = {
  name: string;
  role?: string;
  text: string;
  rating?: number;
};

export type Highlight = {
  icon?: string;
  title: string;
  description?: string;
};

export type TemplateProps = {
  trainer: TrainerProfile;
  ctaUrl: string;
  studentLoginSlot?: React.ReactNode;
};

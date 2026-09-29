export const TARGET_CATEGORIES = [
  'Career',
  'Finance',
  'Health and Fitness',
  'Travel',
  'Personal Development',
  'Lifestyle',
  'Relationships',
  'Education',
  'Custom',
] as const;

export type TargetCategory = (typeof TARGET_CATEGORIES)[number];

export interface CategoryInfo {
  id: TargetCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  guidance?: string;
}

export const CATEGORY_DETAILS: Record<TargetCategory, CategoryInfo> = {
  Career: {
    id: 'Career',
    name: 'Career',
    description: 'Job offers, role transitions, promotions, compensation, and workplace pivots.',
    icon: 'Briefcase',
    color: 'emerald',
  },
  Finance: {
    id: 'Finance',
    name: 'Finance',
    description: 'Investments, budgeting, property purchase, debt restructuring, or capital allocation.',
    icon: 'DollarSign',
    color: 'amber',
    guidance: 'General decision organization only. Not regulated financial advice.',
  },
  'Health and Fitness': {
    id: 'Health and Fitness',
    name: 'Health and Fitness',
    description: 'Wellness routines, training programs, nutrition strategies, and habit overhauls.',
    icon: 'HeartPulse',
    color: 'rose',
    guidance: 'General decision organization only. Not medical or clinical advice.',
  },
  Travel: {
    id: 'Travel',
    name: 'Travel',
    description: 'Relocation, sabbaticals, remote work stays, vacations, and route planning.',
    icon: 'Compass',
    color: 'cyan',
  },
  'Personal Development': {
    id: 'Personal Development',
    name: 'Personal Development',
    description: 'Skill building, productivity systems, mindsets, reading programs, and coaching.',
    icon: 'Sparkles',
    color: 'brand',
  },
  Lifestyle: {
    id: 'Lifestyle',
    name: 'Lifestyle',
    description: 'Living arrangements, daily rhythms, commute, hobbies, and work-life boundaries.',
    icon: 'Home',
    color: 'violet',
  },
  Relationships: {
    id: 'Relationships',
    name: 'Relationships',
    description: 'Shared commitments, family choices, social circles, and cohabitation.',
    icon: 'Users',
    color: 'pink',
    guidance: 'Non-coercive personal decision guidance; respects autonomy.',
  },
  Education: {
    id: 'Education',
    name: 'Education',
    description: 'Degree programs, bootcamps, university selection, certifications, and self-study.',
    icon: 'GraduationCap',
    color: 'blue',
  },
  Custom: {
    id: 'Custom',
    name: 'Custom',
    description: 'Any bespoke or multi-domain choice unique to your situation.',
    icon: 'Sliders',
    color: 'slate',
    guidance: 'For legal or sensitive matters, please consult qualified domain professionals.',
  },
};

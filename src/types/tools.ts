export type CategoryId =
  | 'pdf'
  | 'images'
  | 'video'
  | 'audio'
  | 'arabic'
  | 'calculator';

export type FilterCategoryId =
  | 'all'
  | 'pdf'
  | 'images'
  | 'video'
  | 'audio'
  | 'documents'
  | 'arabic'
  | 'calculator';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortLabel: string;
  englishName: string;
  description: string;
  colorHex: string;
  badgeText: string;
  iconBgLight: string;
  iconBgDark: string;
  iconTextLight: string;
  iconTextDark: string;
  borderHoverLight: string;
  borderHoverDark: string;
}

export interface ToolOptionField {
  id: string;
  label: string;
  labelEn?: string;
  type: 'select' | 'number' | 'text' | 'password' | 'checkbox' | 'range';
  options?: { value: string; label: string; labelEn?: string }[];
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  unitEn?: string;
  helperText?: string;
  helperTextEn?: string;
}

export type ToolStatus = 'ready' | 'engine-pending';

export interface ToolItem {
  id: number;
  slug: string;
  route: string;
  name: string;
  nameEn?: string;
  shortDesc: string;
  shortDescEn?: string;
  fullDesc: string;
  fullDescEn?: string;
  category: CategoryId;
  isDocumentConversion?: boolean;
  priorityOrder?: number;
  iconName: string;
  popular?: boolean;
  status: ToolStatus;
  acceptedFormats?: string[];
  acceptMime?: string;
  multipleFiles?: boolean;
  inputType: 'file' | 'text' | 'qr' | 'calculator';
  optionsSchema?: ToolOptionField[];
  steps: string[];
  stepsEn?: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  defaultImageQuality: number;
  defaultExportPrefix: string;
  autoScrollToWorkspace: boolean;
  confirmBeforeClear: boolean;
  showAdPlaceholders: boolean;
  gaMeasurementId?: string;
  analyticsConsent?: boolean;
}


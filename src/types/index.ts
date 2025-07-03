export interface AnalysisResult {
  id: string;
  title: string;
  description: string;
  value: string;
  aiExplanation: string;
  visualMatches?: VisualMatch[];
  imageCompare?: string;
  imageUrl?: string;
  apiProvider: ApiProvider;
  timestamp: number;
}

export interface VisualMatch {
  title: string;
  link: string;
  source_icon?: string;
  thumbnail?: string;
  source?: string;
  price?: string;
  position?: number;
}

export interface SearchApiItem {
  position: number;
  title: string;
  link: string;
  source: string;
  price?: string;
  extracted_price?: number;
  currency?: string;
  stock_information?: string;
  thumbnail: string;
  source_icon?: string;
  image?: {
    link: string;
    height: number;
    width: number;
  };
}

export interface SearchApiResult extends AnalysisResult {
  visual_matches: SearchApiItem[];
}

export interface ScanHistoryItem extends AnalysisResult {
  isFavorite: boolean;
}

export enum ApiProvider {
  GEMINI = 'Gemini',
  SERPAPI = 'SerpAPI',
  SEARCHAPI = 'SearchAPI',
  OPENLENS = 'OpenLens',
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile?: (data: { name: string; email: string }) => Promise<void>;
  updatePassword?: (newPassword: string) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  deleteAccount?: () => Promise<void>;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

export interface ToastContextType {
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}
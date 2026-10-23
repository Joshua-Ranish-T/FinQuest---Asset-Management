// Centralized Type-Safe Environment Configuration

export interface AppConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  appUrl: string;
  supabase: {
    url?: string;
    anonKey?: string;
  };
  razorpay: {
    keyId?: string;
  };
  features: {
    enableDemoMode: boolean;
    enableMockAuth: boolean;
  };
}

export const env: AppConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  features: {
    enableDemoMode: true,
    enableMockAuth: !process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
};

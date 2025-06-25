// Base configuration
interface SiteConfig {
  title: string;
  description: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      headerBg: string;
      headerText: string;
    };
    fonts: {
      sans: string;
      mono: string;
    };
  };
}

// Default configuration
export const defaultConfig: SiteConfig = {
  title: "AutoEval360",
  description: "Exam evaluation web application",
  theme: {
    colors: {
      primary: "#2563eb", // blue-600
      secondary: "#1e40af", // blue-800
      accent: "#f59e0b", // amber-500
      background: "#ffffff",
      foreground: "#171717",
      headerBg: "#2563eb",
      headerText: "#ffffff",
    },
    fonts: {
      sans: "Arial, Helvetica, sans-serif",
      mono: "monospace",
    },
  },
};

// Environment-specific overrides
const envConfig: Partial<SiteConfig> = {
  // You can load these from environment variables
  // title: process.env.NEXT_PUBLIC_APP_TITLE,
  // description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

// Merged configuration
export const siteConfig: SiteConfig = {
  ...defaultConfig,
  ...envConfig,
};
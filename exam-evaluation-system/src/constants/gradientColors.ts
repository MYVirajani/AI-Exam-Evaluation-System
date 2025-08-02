// constants/gradientColors.ts

export interface GradientColor {
  id: string;
  name: string;
  gradient: string;
  textColor: string;
  overlayPattern?: string;
}

export const GRADIENT_COLORS: GradientColor[] = [
  {
    id: "purple-cyan-flow",
    name: "Purple Cyan Flow",
    gradient: "from-purple-800 via-blue-600 to-cyan-400",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon", 
    gradient: "from-orange-700 via-red-500 to-pink-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "emerald-ocean",
    name: "Emerald Ocean",
    gradient: "from-green-800 via-teal-600 to-cyan-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "royal-night",
    name: "Royal Night",
    gradient: "from-indigo-900 via-purple-700 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/20"
  },
  {
    id: "aurora-dream",
    name: "Aurora Dream",
    gradient: "from-violet-700 via-pink-600 to-cyan-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "golden-fire",
    name: "Golden Fire",
    gradient: "from-yellow-600 via-orange-600 to-red-600",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "mystic-forest",
    name: "Mystic Forest",
    gradient: "from-green-700 via-emerald-600 to-teal-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "deep-space",
    name: "Deep Space",
    gradient: "from-slate-900 via-blue-900 to-indigo-800",
    textColor: "text-white",
    overlayPattern: "bg-black/25"
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    gradient: "from-pink-600 via-coral-500 to-orange-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "arctic-glow",
    name: "Arctic Glow",
    gradient: "from-blue-700 via-cyan-600 to-teal-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "crimson-dusk",
    name: "Crimson Dusk",
    gradient: "from-red-800 via-rose-600 to-pink-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "sapphire-wave",
    name: "Sapphire Wave",
    gradient: "from-blue-800 via-indigo-600 to-purple-600",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "jade-mist",
    name: "Jade Mist",
    gradient: "from-emerald-700 via-green-600 to-lime-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "volcanic-glow",
    name: "Volcanic Glow",
    gradient: "from-red-700 via-orange-600 to-yellow-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "midnight-aurora",
    name: "Midnight Aurora",
    gradient: "from-purple-900 via-violet-700 to-fuchsia-600",
    textColor: "text-white",
    overlayPattern: "bg-black/20"
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    gradient: "from-blue-900 via-teal-700 to-cyan-600",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "desert-mirage",
    name: "Desert Mirage",
    gradient: "from-amber-700 via-orange-600 to-red-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "lavender-sky",
    name: "Lavender Sky",
    gradient: "from-violet-600 via-purple-500 to-pink-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "cosmic-storm",
    name: "Cosmic Storm",
    gradient: "from-indigo-800 via-blue-700 to-cyan-600",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "tropical-paradise",
    name: "Tropical Paradise",
    gradient: "from-teal-700 via-green-600 to-lime-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  }
];

// Utility function to get a random gradient
export const getRandomGradient = (): GradientColor => {
  return GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];
};

// Utility function to get gradient by ID
export const getGradientById = (id: string): GradientColor | undefined => {
  return GRADIENT_COLORS.find(gradient => gradient.id === id);
};
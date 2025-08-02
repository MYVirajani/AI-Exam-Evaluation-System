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
    id: "electric-blue-pulse",
    name: "Electric Blue Pulse",
    gradient: "from-cyan-700 via-blue-600 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "prussian-blue-depths",
    name: "Prussian Blue Depths",
    gradient: "from-slate-800 via-blue-800 to-blue-700",
    textColor: "text-white",
    overlayPattern: "bg-black/16"
  },
  {
    id: "sky-blue-meadow",
    name: "Sky Blue Meadow",
    gradient: "from-sky-600 via-blue-500 to-cyan-400",
    textColor: "text-white",
    overlayPattern: "bg-black/8"
  },
  {
    id: "indigo-blue-night",
    name: "Indigo Blue Night",
    gradient: "from-indigo-800 via-blue-700 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "aqua-blue-harmony",
    name: "Aqua Blue Harmony",
    gradient: "from-teal-600 via-cyan-600 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "denim-blue-fade",
    name: "Denim Blue Fade",
    gradient: "from-blue-800 via-blue-600 to-slate-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "celestial-blue-glow",
    name: "Celestial Blue Glow",
    gradient: "from-blue-700 via-sky-600 to-cyan-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
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
    id: "orchid-shadow",
    name: "Orchid Shadow",
    gradient: "from-purple-800 via-violet-600 to-purple-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "storm-cloud",
    name: "Storm Cloud",
    gradient: "from-slate-800 via-gray-700 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/16"
  },
  {
    id: "cobalt-mist",
    name: "Cobalt Mist",
    gradient: "from-blue-800 via-blue-600 to-sky-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "amethyst-fog",
    name: "Amethyst Fog",
    gradient: "from-purple-700 via-purple-500 to-slate-400",
    textColor: "text-white",
    overlayPattern: "bg-black/14"
  },
  {
    id: "steel-grey",
    name: "Steel Grey",
    gradient: "from-gray-700 via-slate-600 to-slate-500",
    textColor: "text-white",
    overlayPattern: "bg-black/13"
  },
  {
    id: "iris-blue",
    name: "Iris Blue",
    gradient: "from-indigo-700 via-blue-600 to-purple-500",
    textColor: "text-white",
    overlayPattern: "bg-black/11"
  },
  {
    id: "pewter-mist",
    name: "Pewter Mist",
    gradient: "from-slate-700 via-gray-600 to-blue-400",
    textColor: "text-white",
    overlayPattern: "bg-black/14"
  },
  {
    id: "violet-storm",
    name: "Violet Storm",
    gradient: "from-purple-900 via-violet-700 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/17"
  },
  {
    id: "azure-grey",
    name: "Azure Grey",
    gradient: "from-blue-700 via-slate-600 to-gray-500",
    textColor: "text-white",
    overlayPattern: "bg-black/13"
  },
  {
    id: "plum-shadow",
    name: "Plum Shadow",
    gradient: "from-purple-800 via-purple-600 to-slate-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
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
  },
  {
    id: "azure-morning",
    name: "Azure Morning",
    gradient: "from-blue-900 via-blue-700 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "cerulean-depths",
    name: "Cerulean Depths",
    gradient: "from-blue-800 via-blue-600 to-cyan-400",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "steel-blue-storm",
    name: "Steel Blue Storm",
    gradient: "from-slate-700 via-blue-700 to-sky-600",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "powder-blue-dream",
    name: "Powder Blue Dream",
    gradient: "from-blue-600 via-sky-500 to-blue-400",
    textColor: "text-white",
    overlayPattern: "bg-black/8"
  },
  {
    id: "navy-twilight",
    name: "Navy Twilight",
    gradient: "from-blue-950 via-blue-800 to-indigo-700",
    textColor: "text-white",
    overlayPattern: "bg-black/20"
  },
  {
    id: "ice-blue-flow",
    name: "Ice Blue Flow",
    gradient: "from-cyan-600 via-blue-500 to-sky-400",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "cobalt-horizon",
    name: "Cobalt Horizon",
    gradient: "from-blue-800 via-blue-600 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "periwinkle-mist",
    name: "Periwinkle Mist",
    gradient: "from-indigo-600 via-blue-500 to-sky-400",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "royal-blue-cascade",
    name: "Royal Blue Cascade",
    gradient: "from-blue-900 via-blue-700 to-cyan-500",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "glacial-blue",
    name: "Glacial Blue",
    gradient: "from-slate-600 via-blue-600 to-cyan-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "sapphire-frost",
    name: "Sapphire Frost",
    gradient: "from-blue-700 via-blue-600 to-sky-500",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "midnight-blue-ocean",
    name: "Midnight Blue Ocean",
    gradient: "from-blue-950 via-blue-700 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/18"
  },
  {
    id: "cornflower-serenity",
    name: "Cornflower Serenity",
    gradient: "from-blue-600 via-blue-500 to-sky-400",
    textColor: "text-white",
    overlayPattern: "bg-black/8"
  },
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
    id: "steel-blue-mist",
    name: "Steel Blue Mist",
    gradient: "from-slate-700 via-blue-600 to-sky-500",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "royal-purple-flow",
    name: "Royal Purple Flow",
    gradient: "from-purple-900 via-purple-600 to-blue-500",
    textColor: "text-white",
    overlayPattern: "bg-black/18"
  },
  {
    id: "stormy-grey",
    name: "Stormy Grey",
    gradient: "from-gray-800 via-slate-600 to-blue-400",
    textColor: "text-white",
    overlayPattern: "bg-black/15"
  },
  {
    id: "twilight-purple",
    name: "Twilight Purple",
    gradient: "from-indigo-800 via-purple-600 to-violet-500",
    textColor: "text-white",
    overlayPattern: "bg-black/16"
  },
  {
    id: "moonlight-blue",
    name: "Moonlight Blue",
    gradient: "from-blue-900 via-blue-700 to-indigo-500",
    textColor: "text-white",
    overlayPattern: "bg-black/14"
  },
  {
    id: "silver-mist",
    name: "Silver Mist",
    gradient: "from-gray-600 via-slate-500 to-gray-400",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "periwinkle-dream",
    name: "Periwinkle Dream",
    gradient: "from-purple-700 via-blue-500 to-sky-400",
    textColor: "text-white",
    overlayPattern: "bg-black/10"
  },
  {
    id: "charcoal-blue",
    name: "Charcoal Blue",
    gradient: "from-gray-900 via-slate-700 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/20"
  },
  {
    id: "lavender-grey",
    name: "Lavender Grey",
    gradient: "from-purple-600 via-slate-500 to-gray-400",
    textColor: "text-white",
    overlayPattern: "bg-black/12"
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    gradient: "from-blue-950 via-blue-800 to-blue-600",
    textColor: "text-white",
    overlayPattern: "bg-black/18"
  },
 
  
];

// Utility function to get a random gradient
export const getRandomGradient = (): GradientColor => {
  return GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];
};

// Utility function to get gradient by ID
export const getGradientById = (id: string): GradientColor | undefined => {
  return GRADIENT_COLORS.find(gradient => gradient.id === id);
};

// constants/gradientColors.ts

export interface GradientColor {
  id: string;
  name: string;
  gradient: string;
  textColor: string;
  overlayPattern?: string;
}

 
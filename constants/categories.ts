export const CATEGORIES = {
  temple:  { label: 'Temple',       emoji: '🛕', color: '#C0541A', textColor: '#fff'     },
  samadhi: { label: 'Samadhi',      emoji: '🧘', color: '#E8C06A', textColor: '#3D2010'  },
  ashram:  { label: 'Ashram',       emoji: '🌿', color: '#7A4A2A', textColor: '#F5E6C8'  },
  water:   { label: 'Sacred Water', emoji: '💧', color: '#3D4A6A', textColor: '#F5E6C8'  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

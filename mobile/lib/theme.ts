export const colors = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F2F7",
  text: "#0F172A",
  textMuted: "#64748B",
  textFaint: "#94A3B8",
  border: "#E5E8EF",

  brand: "#4C6FFF",
  brandSoft: "#EEF1FF",
  brandDark: "#3250D9",

  accent: "#8B5CF6",
  success: "#10B981",
  successSoft: "#D1FAE5",
  warn: "#F59E0B",
  warnSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  info: "#0EA5E9",
  infoSoft: "#E0F2FE",

  // Module tiles — each module has its own gradient pair
  tilesRecharge: ["#FDE68A", "#F59E0B"],
  tilesShop: ["#FBCFE8", "#EC4899"],
  tilesServices: ["#A7F3D0", "#10B981"],
  tilesProperty: ["#C7D2FE", "#6366F1"],
  tilesVehicle: ["#BAE6FD", "#0EA5E9"],
  tilesDirectory: ["#FECACA", "#F43F5E"],
  tilesChallan: ["#DDD6FE", "#8B5CF6"],
} as const;

export const radii = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const font = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
};
export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lift: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

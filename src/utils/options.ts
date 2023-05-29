export const OPTIONS = {
  ALGEBRA: "algebra",
  GEOMETRY: "geometry",
  COMBINATORICS: "combinatorics",
  TEAM: "team",
} as const;

export type Option = (typeof OPTIONS)[keyof typeof OPTIONS];

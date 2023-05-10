export const OPTIONS = {
  ALGEBRA: "algebra",
  GEOMETRY: "geometry",
  COMBINATORICS: "combinatorics",
  TEAM: "team",
  TIEBREAKER: "tiebreaker",
} as const;

export type Option = (typeof OPTIONS)[keyof typeof OPTIONS];

export const TRIAL_DAYS = 14;

export type PlanFeatureId =
  | "advanced-reports"
  | "projects";

export interface PlanFeature {
  id: PlanFeatureId;
  moduleName: string;
  message: string;
  paths: string[];
}

export const PLAN_FEATURES: PlanFeature[] = [
  {
    id: "advanced-reports",
    moduleName: "Reports & Analytics",
    message: "Advanced spending trends, category breakdown analytics, and exported logs are not included in your current plan.",
    paths: ["/reports"],
  },
  {
    id: "projects",
    moduleName: "Project Mapping",
    message: "Mapping expense claims to client contracts and workspace projects is not included in your current plan.",
    paths: ["/expenses/projects"],
  },
];

const featureById = Object.fromEntries(
  PLAN_FEATURES.map((f) => [f.id, f])
) as Record<PlanFeatureId, PlanFeature>;

export function getPlanFeature(id: PlanFeatureId): PlanFeature {
  return featureById[id];
}

export function getFeatureForPath(pathname: string): PlanFeature | null {
  for (const feature of PLAN_FEATURES) {
    for (const path of feature.paths) {
      if (pathname === path || pathname.startsWith(`${path}/`)) {
        return feature;
      }
    }
  }
  return null;
}

export function isProFeaturePath(pathname: string): boolean {
  return getFeatureForPath(pathname) !== null;
}

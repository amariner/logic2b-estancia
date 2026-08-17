import type { DemoRole } from "@logic-estancia/domain";

export type Scenario = "terrava" | "aurem";
export type EnquiryState = "new" | "alternative" | "booked";
export type CleaningState = "pending" | "in_progress" | "review" | "ready";
export type StayOperationState = "original" | "reassigned" | "rate_updated";
export type ArrivalRiskState = "detected" | "coordinating" | "resolved";
export type MaintenanceState = "new" | "assigned" | "resolved";
export type JourneySource = "fixture" | "website";
export type TourMode = "unset" | "guided" | "free";

export interface DemoStay {
  name: string;
  email: string;
  from: string;
  to: string;
  guests: number;
  amount: number;
  source: JourneySource;
}

export interface WebsiteState {
  publishedTitle: string;
  draftTitle: string;
  status: "clean" | "draft" | "published";
}

export interface DemoState {
  version: 2;
  selectedProperty: string;
  role: DemoRole;
  enquiry: EnquiryState;
  cleaning: CleaningState;
  stayOperation: StayOperationState;
  arrivalRisk: ArrivalRiskState;
  maintenance: MaintenanceState;
  tourMode: TourMode;
  tourStep: number | null;
  completedFlows: string[];
  website: WebsiteState;
  stay: DemoStay;
}

export const initialState = (scenario: Scenario): DemoState => {
  const stay: DemoStay =
    scenario === "aurem"
      ? {
          name: "Elena Rossi",
          email: "elena@example.test",
          from: "2026-08-14",
          to: "2026-08-17",
          guests: 2,
          amount: 684,
          source: "fixture",
        }
      : {
          name: "Marina Costa",
          email: "marina@example.test",
          from: "2026-08-21",
          to: "2026-08-24",
          guests: 4,
          amount: 612,
          source: "fixture",
        };
  const title =
    scenario === "aurem"
      ? "Todo dispuesto antes de llegar."
      : "El tiempo cambia cuando llegas.";
  return {
    version: 2,
    selectedProperty: "all",
    role: scenario === "aurem" ? "direction" : "reception",
    enquiry: "new",
    cleaning: "pending",
    stayOperation: "original",
    arrivalRisk: "detected",
    maintenance: "new",
    tourMode: "unset",
    tourStep: null,
    completedFlows: [],
    website: { publishedTitle: title, draftTitle: title, status: "clean" },
    stay,
  };
};

function parseStay(value: unknown, fallback: DemoStay): DemoStay {
  if (!value || typeof value !== "object") return fallback;
  const { name, email, from, to, guests, amount, source } =
    value as Partial<DemoStay>;
  const validDate = (date: unknown): date is string =>
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (typeof name !== "string" || !name.trim() || name.length > 120)
    return fallback;
  if (typeof email !== "string" || !email.includes("@") || email.length > 200)
    return fallback;
  if (!validDate(from) || !validDate(to) || from >= to) return fallback;
  if (
    typeof guests !== "number" ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > 8
  )
    return fallback;
  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount < 0 ||
    amount > 100000
  )
    return fallback;
  if (source !== "fixture" && source !== "website") return fallback;
  return {
    name: name.trim(),
    email: email.trim(),
    from,
    to,
    guests,
    amount,
    source,
  };
}

export function parseStored(raw: string | null, scenario: Scenario): DemoState {
  const fallback = initialState(scenario);
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.version !== 1 && value.version !== 2) return fallback;
    const role = ["direction", "reception", "cleaning"].includes(
      String(value.role),
    )
      ? (value.role as DemoRole)
      : fallback.role;
    const enquiry = ["new", "alternative", "booked"].includes(
      String(value.enquiry),
    )
      ? (value.enquiry as EnquiryState)
      : fallback.enquiry;
    const cleaning = ["pending", "in_progress", "review", "ready"].includes(
      String(value.cleaning),
    )
      ? (value.cleaning as CleaningState)
      : fallback.cleaning;
    if (value.version === 1)
      return {
        ...fallback,
        role,
        enquiry,
        cleaning,
        arrivalRisk: cleaning === "ready" ? "resolved" : "detected",
        selectedProperty:
          typeof value.selectedProperty === "string"
            ? value.selectedProperty
            : "all",
        stay: parseStay(value.stay, fallback.stay),
      };
    const stayOperation = ["original", "reassigned", "rate_updated"].includes(
      String(value.stayOperation),
    )
      ? (value.stayOperation as StayOperationState)
      : fallback.stayOperation;
    const arrivalRisk = ["detected", "coordinating", "resolved"].includes(
      String(value.arrivalRisk),
    )
      ? (value.arrivalRisk as ArrivalRiskState)
      : fallback.arrivalRisk;
    const maintenance = ["new", "assigned", "resolved"].includes(
      String(value.maintenance),
    )
      ? (value.maintenance as MaintenanceState)
      : fallback.maintenance;
    const tourMode = ["unset", "guided", "free"].includes(
      String(value.tourMode),
    )
      ? (value.tourMode as TourMode)
      : fallback.tourMode;
    const websiteValue =
      value.website && typeof value.website === "object"
        ? (value.website as Partial<WebsiteState>)
        : {};
    const website: WebsiteState =
      typeof websiteValue.publishedTitle === "string" &&
      typeof websiteValue.draftTitle === "string" &&
      ["clean", "draft", "published"].includes(String(websiteValue.status))
        ? {
            publishedTitle: websiteValue.publishedTitle.slice(0, 100),
            draftTitle: websiteValue.draftTitle.slice(0, 100),
            status: websiteValue.status as WebsiteState["status"],
          }
        : fallback.website;
    return {
      ...fallback,
      role,
      enquiry,
      cleaning,
      stayOperation,
      arrivalRisk,
      maintenance,
      tourMode,
      tourStep: Number.isInteger(value.tourStep)
        ? Number(value.tourStep)
        : null,
      completedFlows: Array.isArray(value.completedFlows)
        ? value.completedFlows
            .filter((item): item is string => typeof item === "string")
            .slice(0, 20)
        : [],
      website,
      selectedProperty:
        typeof value.selectedProperty === "string"
          ? value.selectedProperty
          : "all",
      stay: parseStay(value.stay, fallback.stay),
    };
  } catch {
    return fallback;
  }
}

export function canOperate(
  role: DemoRole,
  action: "booking" | "cleaning" | "review" | "maintenance",
): boolean {
  if (role === "direction") return true;
  if (action === "booking") return role === "reception";
  if (action === "cleaning") return role === "cleaning";
  if (action === "maintenance") return role === "reception";
  return role === "reception";
}

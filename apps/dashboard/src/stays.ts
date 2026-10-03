/** Local, disposable demonstration data. No persistence, clock, network or providers. */
export const STAY_DEMO_DATE = "2026-08-21";
export const STAY_MIN_DATE = "2026-08-01";
/** The latest allowed check-out, exclusive in every occupancy interval. */
export const STAY_MAX_DATE = "2026-09-01";
export const STAY_MAX_GUESTS = 12;

export interface StayUnit {
  id: string;
  name: string;
  propertyId: string;
  capacity: number;
  nightlyRateCents: number;
  cleaningFeeCents: number;
  outOfService: { startDate: string; endDate: string; reason: string }[];
}

export interface StayQuote {
  nights: number;
  nightlyRateCents: number;
  accommodationCents: number;
  cleaningFeeCents: number;
  totalCents: number;
  currency: "EUR";
}

export interface StayEnquiry {
  id: string;
  guestName: string;
  email: string;
  guests: number;
  preferredUnitId: string;
  startDate: string;
  endDate: string;
  status: "new" | "confirmed";
  stayId?: string;
}

export interface Stay {
  id: string;
  enquiryId?: string;
  guestName: string;
  email: string;
  guests: number;
  unitId: string;
  startDate: string;
  endDate: string;
  status: "confirmed" | "cancelled";
  origin: "direct" | "booking" | "airbnb";
  quote: StayQuote;
}

export interface StayHistoryEntry {
  kind: "confirm" | "change" | "cancel" | "enquiry";
  stayId?: string;
  enquiryId?: string;
  beforeStay: Stay | null;
  afterStay: Stay | null;
  beforeEnquiry: StayEnquiry | null;
  afterEnquiry: StayEnquiry | null;
}

export interface StayWorkspace {
  units: StayUnit[];
  stays: Stay[];
  enquiries: StayEnquiry[];
  history: StayHistoryEntry[];
}

export type AvailabilityReason =
  | "available"
  | "occupied"
  | "out-of-service"
  | "capacity"
  | "invalid-dates"
  | "out-of-range"
  | "invalid-guests"
  | "unknown-unit";

export type StayError = Exclude<AvailabilityReason, "available"> | "unknown-enquiry" | "unknown-stay" | "invalid-transition" | "nothing-to-undo";

export interface AvailabilityInput {
  unitId: string;
  startDate: string;
  endDate: string;
  guests: number;
  excludeStayId?: string;
}

export interface StayAvailability {
  available: boolean;
  reason: AvailabilityReason;
  conflicts: Stay[];
}

export type StayMutationResult =
  | { ok: true; workspace: StayWorkspace; stayId: string }
  | { ok: false; workspace: StayWorkspace; error: StayError };

export const properties = [
  { id: "aira", name: "Casa Aira" },
  { id: "bruma", name: "Casa Bruma" },
  { id: "cauce", name: "Casa Cauce" },
  { id: "duna", name: "Casa Duna" },
  { id: "era", name: "Casa Era" },
  { id: "faya", name: "Casa Faya" },
  { id: "linde", name: "Casa Linde" },
  { id: "umbral", name: "Casa Umbral" },
] as const;

function dateValue(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) && date.toISOString().slice(0, 10) === value ? timestamp : null;
}

/** Calendar nights in UTC; rejects normalized impossible dates and zero/negative stays. */
export function countNights(startDate: string, endDate: string): number | null {
  const start = dateValue(startDate);
  const end = dateValue(endDate);
  if (start === null || end === null || end <= start) return null;
  return (end - start) / 86_400_000;
}

/** Half-open [arrival, departure) intervals permit arrival on another stay's departure. */
export function intervalsOverlap(startDate: string, endDate: string, otherStart: string, otherEnd: string): boolean {
  return countNights(startDate, endDate) !== null && countNights(otherStart, otherEnd) !== null && startDate < otherEnd && otherStart < endDate;
}

export function quoteStay(unit: StayUnit, startDate: string, endDate: string): StayQuote | null {
  const nights = countNights(startDate, endDate);
  if (nights === null || !Number.isSafeInteger(unit.nightlyRateCents) || !Number.isSafeInteger(unit.cleaningFeeCents) || unit.nightlyRateCents < 0 || unit.cleaningFeeCents < 0) return null;
  const accommodationCents = nights * unit.nightlyRateCents;
  const totalCents = accommodationCents + unit.cleaningFeeCents;
  if (!Number.isSafeInteger(totalCents)) return null;
  return { nights, nightlyRateCents: unit.nightlyRateCents, accommodationCents, cleaningFeeCents: unit.cleaningFeeCents, totalCents, currency: "EUR" };
}

function validateRequest(input: Pick<AvailabilityInput, "startDate" | "endDate" | "guests">): StayError | null {
  if (countNights(input.startDate, input.endDate) === null) return "invalid-dates";
  if (input.startDate < STAY_MIN_DATE || input.endDate > STAY_MAX_DATE) return "out-of-range";
  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > STAY_MAX_GUESTS) return "invalid-guests";
  return null;
}

export function checkAvailability(workspace: StayWorkspace, input: AvailabilityInput): StayAvailability {
  const invalid = validateRequest(input);
  if (invalid) return { available: false, reason: invalid as AvailabilityReason, conflicts: [] };
  const unit = workspace.units.find((candidate) => candidate.id === input.unitId);
  if (!unit) return { available: false, reason: "unknown-unit", conflicts: [] };
  if (input.guests > unit.capacity) return { available: false, reason: "capacity", conflicts: [] };
  if (unit.outOfService.some((interval) => intervalsOverlap(input.startDate, input.endDate, interval.startDate, interval.endDate))) {
    return { available: false, reason: "out-of-service", conflicts: [] };
  }
  const conflicts = workspace.stays.filter((stay) => stay.id !== input.excludeStayId && stay.unitId === input.unitId && stay.status === "confirmed" && intervalsOverlap(input.startDate, input.endDate, stay.startDate, stay.endDate));
  return { available: conflicts.length === 0, reason: conflicts.length === 0 ? "available" : "occupied", conflicts };
}

export function getEnquiryOptions(workspace: StayWorkspace, enquiryId: string): { unit: StayUnit; availability: StayAvailability; quote: StayQuote | null }[] {
  const enquiry = workspace.enquiries.find((candidate) => candidate.id === enquiryId);
  if (!enquiry) return [];
  return workspace.units.map((unit) => ({
    unit,
    availability: checkAvailability(workspace, { ...enquiry, unitId: unit.id, excludeStayId: enquiry.stayId }),
    quote: quoteStay(unit, enquiry.startDate, enquiry.endDate),
  }));
}

export function selectStays(workspace: StayWorkspace, filter: { propertyId?: string; status?: Stay["status"] } = {}): Stay[] {
  return workspace.stays.filter((stay) => {
    const unit = workspace.units.find((candidate) => candidate.id === stay.unitId);
    const matchesProperty = !filter.propertyId || filter.propertyId === "all" || unit?.propertyId === filter.propertyId || unit?.name === filter.propertyId;
    return matchesProperty && (!filter.status || stay.status === filter.status);
  });
}

export interface StayReport {
  stayCount: number;
  guestCount: number;
  totalCents: number;
  accommodationCents: number;
  cleaningFeeCents: number;
  occupiedNights: number;
  availableNights: number;
  occupancyPercent: number;
  /** availableUnits is serviceable capacity, including occupied units. */
  daily: { date: string; availableUnits: number; occupiedUnits: number; outOfServiceUnits: number }[];
}

/** One fixed fixture month, derived from the same active stays used by planning. */
export function stayReport(workspace: StayWorkspace, propertyId = "all"): StayReport {
  const units = workspace.units.filter((unit) => propertyId === "all" || unit.propertyId === propertyId || unit.name === propertyId);
  const stays = selectStays(workspace, { propertyId, status: "confirmed" }).filter((stay) => intervalsOverlap(stay.startDate, stay.endDate, STAY_MIN_DATE, STAY_MAX_DATE));
  const daily = Array.from({ length: 31 }, (_, index) => {
    const date = `2026-08-${String(index + 1).padStart(2, "0")}`;
    const nextDate = index === 30 ? STAY_MAX_DATE : `2026-08-${String(index + 2).padStart(2, "0")}`;
    const serviceable = units.filter((unit) => !unit.outOfService.some((interval) => intervalsOverlap(date, nextDate, interval.startDate, interval.endDate)));
    return { date, availableUnits: serviceable.length, outOfServiceUnits: units.length - serviceable.length, occupiedUnits: serviceable.filter((unit) => stays.some((stay) => stay.unitId === unit.id && intervalsOverlap(date, nextDate, stay.startDate, stay.endDate))).length };
  });
  const occupiedNights = daily.reduce((total, day) => total + day.occupiedUnits, 0);
  const availableNights = daily.reduce((total, day) => total + day.availableUnits, 0);
  return {
    stayCount: stays.length,
    guestCount: stays.reduce((total, stay) => total + stay.guests, 0),
    totalCents: stays.reduce((total, stay) => total + stay.quote.totalCents, 0),
    accommodationCents: stays.reduce((total, stay) => total + stay.quote.accommodationCents, 0),
    cleaningFeeCents: stays.reduce((total, stay) => total + stay.quote.cleaningFeeCents, 0),
    occupiedNights,
    availableNights,
    occupancyPercent: availableNights === 0 ? 0 : Math.round(occupiedNights / availableNights * 1000) / 10,
    daily,
  };
}

function failure(workspace: StayWorkspace, error: StayError): StayMutationResult {
  return { ok: false, workspace, error };
}

function applyChange(workspace: StayWorkspace, entry: StayHistoryEntry): StayMutationResult {
  const stays = entry.afterStay
    ? entry.beforeStay ? workspace.stays.map((stay) => stay.id === entry.stayId ? entry.afterStay! : stay) : [...workspace.stays, entry.afterStay]
    : workspace.stays;
  const enquiries = entry.afterEnquiry ? workspace.enquiries.map((enquiry) => enquiry.id === entry.enquiryId ? entry.afterEnquiry! : enquiry) : workspace.enquiries;
  return { ok: true, workspace: { ...workspace, stays, enquiries, history: [...workspace.history, entry] }, stayId: entry.stayId ?? "" };
}

export function updateEnquiry(workspace: StayWorkspace, enquiryId: string, input: Pick<StayEnquiry, "preferredUnitId" | "startDate" | "endDate" | "guests">): StayMutationResult {
  const enquiry = workspace.enquiries.find((candidate) => candidate.id === enquiryId);
  if (!enquiry) return failure(workspace, "unknown-enquiry");
  if (enquiry.status !== "new") return failure(workspace, "invalid-transition");
  const invalid = validateRequest(input);
  if (invalid) return failure(workspace, invalid);
  if (!workspace.units.some((unit) => unit.id === input.preferredUnitId)) return failure(workspace, "unknown-unit");
  return applyChange(workspace, { kind: "enquiry", enquiryId, beforeStay: null, afterStay: null, beforeEnquiry: enquiry, afterEnquiry: { ...enquiry, ...input } });
}

export function confirmEnquiry(workspace: StayWorkspace, enquiryId: string, unitId: string): StayMutationResult {
  const enquiry = workspace.enquiries.find((candidate) => candidate.id === enquiryId);
  if (!enquiry) return failure(workspace, "unknown-enquiry");
  if (enquiry.status !== "new" || workspace.stays.some((stay) => stay.enquiryId === enquiryId && stay.status === "confirmed")) return failure(workspace, "invalid-transition");
  const availability = checkAvailability(workspace, { ...enquiry, unitId });
  if (!availability.available) return failure(workspace, availability.reason as StayError);
  const unit = workspace.units.find((candidate) => candidate.id === unitId)!;
  const quote = quoteStay(unit, enquiry.startDate, enquiry.endDate);
  if (!quote) return failure(workspace, "invalid-transition");
  // IDs depend only on the current collection, including cancelled records.
  const nextId = Math.max(24, ...workspace.stays.map((stay) => Number(stay.id.replace(/^EST-/, ""))).filter(Number.isFinite)) + 1;
  const stayId = `EST-${String(nextId).padStart(3, "0")}`;
  const stay: Stay = { id: stayId, enquiryId, guestName: enquiry.guestName, email: enquiry.email, guests: enquiry.guests, unitId, startDate: enquiry.startDate, endDate: enquiry.endDate, status: "confirmed", origin: "direct", quote };
  return applyChange(workspace, { kind: "confirm", stayId, enquiryId, beforeStay: null, afterStay: stay, beforeEnquiry: enquiry, afterEnquiry: { ...enquiry, preferredUnitId: unitId, status: "confirmed", stayId } });
}

export function changeStay(workspace: StayWorkspace, stayId: string, input: Pick<Stay, "unitId" | "startDate" | "endDate" | "guests">): StayMutationResult {
  const stay = workspace.stays.find((candidate) => candidate.id === stayId);
  if (!stay) return failure(workspace, "unknown-stay");
  if (stay.status !== "confirmed") return failure(workspace, "invalid-transition");
  const availability = checkAvailability(workspace, { ...input, excludeStayId: stayId });
  if (!availability.available) return failure(workspace, availability.reason as StayError);
  const unit = workspace.units.find((candidate) => candidate.id === input.unitId)!;
  const quote = quoteStay(unit, input.startDate, input.endDate);
  if (!quote) return failure(workspace, "invalid-transition");
  const enquiry = workspace.enquiries.find((candidate) => candidate.id === stay.enquiryId) ?? null;
  const afterEnquiry = enquiry ? { ...enquiry, preferredUnitId: input.unitId, startDate: input.startDate, endDate: input.endDate, guests: input.guests } : null;
  return applyChange(workspace, { kind: "change", stayId, enquiryId: enquiry?.id, beforeStay: stay, afterStay: { ...stay, ...input, quote }, beforeEnquiry: enquiry, afterEnquiry });
}

export function cancelStay(workspace: StayWorkspace, stayId: string): StayMutationResult {
  const stay = workspace.stays.find((candidate) => candidate.id === stayId);
  if (!stay) return failure(workspace, "unknown-stay");
  if (stay.status !== "confirmed") return failure(workspace, "invalid-transition");
  const enquiry = workspace.enquiries.find((candidate) => candidate.id === stay.enquiryId) ?? null;
  const afterEnquiry = enquiry ? { ...enquiry, status: "new" as const, stayId: undefined } : null;
  return applyChange(workspace, { kind: "cancel", stayId, enquiryId: enquiry?.id, beforeStay: stay, afterStay: { ...stay, status: "cancelled" }, beforeEnquiry: enquiry, afterEnquiry });
}

/** Undo is also a mutation: restoring an active interval must pass availability again. */
export function undoLastChange(workspace: StayWorkspace): StayMutationResult {
  const entry = workspace.history.at(-1);
  if (!entry) return failure(workspace, "nothing-to-undo");
  const currentStay = workspace.stays.find((stay) => stay.id === entry.stayId) ?? null;
  const currentEnquiry = workspace.enquiries.find((enquiry) => enquiry.id === entry.enquiryId) ?? null;
  if (entry.afterStay !== currentStay || entry.afterEnquiry !== currentEnquiry) return failure(workspace, "invalid-transition");
  if (entry.beforeStay?.status === "confirmed") {
    const availability = checkAvailability(workspace, { ...entry.beforeStay, excludeStayId: entry.beforeStay.id });
    if (!availability.available) return failure(workspace, availability.reason as StayError);
  }
  const stays = entry.afterStay ? entry.beforeStay ? workspace.stays.map((stay) => stay.id === entry.stayId ? entry.beforeStay! : stay) : workspace.stays.filter((stay) => stay.id !== entry.stayId) : workspace.stays;
  const enquiries = entry.beforeEnquiry ? workspace.enquiries.map((enquiry) => enquiry.id === entry.enquiryId ? entry.beforeEnquiry! : enquiry) : workspace.enquiries;
  return { ok: true, workspace: { ...workspace, stays, enquiries, history: workspace.history.slice(0, -1) }, stayId: entry.stayId ?? "" };
}

export function createStayWorkspace(): StayWorkspace {
  const rates = [[4, 21000, 5000], [4, 18900, 4500], [4, 16800, 4000], [4, 19900, 4500], [2, 15400, 3500], [6, 22500, 5000], [3, 17900, 4000], [4, 20500, 4500]];
  const units: StayUnit[] = properties.map((property, index) => ({ ...property, propertyId: property.id, capacity: rates[index][0], nightlyRateCents: rates[index][1], cleaningFeeCents: rates[index][2], outOfService: property.id === "duna" ? [{ startDate: "2026-08-20", endDate: "2026-08-26", reason: "maintenance" }] : [] }));
  const fixture = (id: string, unitId: string, guestName: string, startDate: string, endDate: string, guests = 2): Stay => {
    const unit = units.find((candidate) => candidate.id === unitId)!;
    return { id, unitId, guestName, email: `${id.toLowerCase()}@example.test`, startDate, endDate, guests, status: "confirmed", origin: "direct", quote: quoteStay(unit, startDate, endDate)! };
  };
  const stays = [
    fixture("EST-001", "aira", "Olivia Martín", "2026-08-20", "2026-08-22"),
    fixture("EST-002", "bruma", "Hugo Vidal", "2026-08-17", "2026-08-20"),
    fixture("EST-003", "cauce", "Alicia Torres", "2026-08-20", "2026-08-24", 4),
    fixture("EST-004", "era", "Pablo Ferrer", "2026-08-18", "2026-08-22"),
    fixture("EST-005", "faya", "Nora Soler", "2026-08-21", "2026-08-25", 5),
    fixture("EST-006", "linde", "Lucía Vega", "2026-08-20", "2026-08-23", 3),
    fixture("EST-007", "umbral", "Leo Serra", "2026-08-22", "2026-08-25"),
    ...units.map((unit, index) => fixture(`EST-${String(index + 8).padStart(3, "0")}`, unit.id, ["Eva Luna", "Álex Roca", "Iris Pons", "Marc Costa", "Sara Vila", "Teo Marín", "Ana Rius", "Bruno Gil"][index], "2026-08-28", "2026-08-30")),
  ];
  const enquiries: StayEnquiry[] = [
    { id: "REQ-024", guestName: "Marina Costa", email: "marina@example.test", guests: 4, preferredUnitId: "aira", startDate: "2026-08-21", endDate: "2026-08-24", status: "new" },
    { id: "REQ-025", guestName: "Diego Vidal", email: "diego@example.test", guests: 4, preferredUnitId: "cauce", startDate: "2026-08-24", endDate: "2026-08-27", status: "new" },
    { id: "REQ-026", guestName: "Clara Roca", email: "clara@example.test", guests: 2, preferredUnitId: "aira", startDate: "2026-08-28", endDate: "2026-08-30", status: "new" },
    { id: "REQ-027", guestName: "Grupo de Julia", email: "julia@example.test", guests: 9, preferredUnitId: "faya", startDate: "2026-08-21", endDate: "2026-08-24", status: "new" },
  ];
  return { units, stays, enquiries, history: [] };
}

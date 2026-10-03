import type { DemoRole } from "@logic-estancia/domain";
import { countNights, quoteStay, type Stay, type StayUnit } from "./stays";

/** A fixed local scenario. Roles and actors demonstrate a workflow, not authentication. */
export const OPERATIONS_DEMO_DATE = "2026-08-14";
export const CLEANERS = [{ id: "marta", name: "Marta" }, { id: "leo", name: "Leo" }] as const;
export const CHECKLIST_ITEMS = [
  { id: "linen", labelEs: "Ropa de cama y toallas", labelEn: "Bed linen and towels" },
  { id: "bathroom", labelEs: "Baño limpio y revisado", labelEn: "Bathroom cleaned and checked" },
  { id: "supplies", labelEs: "Reposición y revisión final", labelEn: "Supplies and final check" },
] as const;

export type CleanerId = typeof CLEANERS[number]["id"];
export type ChecklistId = typeof CHECKLIST_ITEMS[number]["id"];
export type OperationActor = CleanerId | "direction" | "reception";
export type PreparationStatus = "unassigned" | "assigned" | "accepted" | "review" | "ready" | "declined";

export interface PreparationTask {
  id: string;
  unitId: string;
  stayId: string;
  previousStayId: string;
  departureConfirmed: boolean;
  assignee: CleanerId | null;
  status: PreparationStatus;
  checklist: Record<ChecklistId, boolean>;
  acceptedBy: CleanerId | null;
  reviewedBy: OperationActor | null;
  declineReason: "workload" | "supplies" | null;
  returnReason: ChecklistId | null;
  incidentId: string | null;
}

export interface OperationIncident {
  id: string;
  taskId: string;
  unitId: string;
  kind: "bathroom-leak";
  status: "available" | "open" | "resolved";
  reportedBy: OperationActor | null;
  resolvedBy: OperationActor | null;
}

export type OperationAction =
  | { type: "confirm-departure"; taskId: string }
  | { type: "assign"; taskId: string; assignee: CleanerId }
  | { type: "accept"; taskId: string }
  | { type: "decline"; taskId: string; reason: "workload" | "supplies" }
  | { type: "check"; taskId: string; itemId: ChecklistId; checked: boolean }
  | { type: "report-issue"; taskId: string }
  | { type: "resolve-issue"; taskId: string }
  | { type: "submit-review"; taskId: string }
  | { type: "approve"; taskId: string }
  | { type: "return"; taskId: string; itemId: ChecklistId }
  | { type: "undo" };

export interface OperationEvent {
  readonly id: number;
  readonly type: OperationAction["type"];
  readonly taskId: string;
  readonly role: DemoRole;
  readonly actor: OperationActor;
  readonly assignee?: CleanerId;
  readonly itemId?: ChecklistId;
  readonly checked?: boolean;
  readonly reason?: "workload" | "supplies";
}

export interface OperationHistory {
  readonly event: OperationEvent;
  readonly beforeTask: PreparationTask;
  readonly afterTask: PreparationTask;
  readonly beforeIncident: OperationIncident | null;
  readonly afterIncident: OperationIncident | null;
}

export interface OperationsWorkspace {
  units: StayUnit[];
  stays: Stay[];
  tasks: PreparationTask[];
  incidents: OperationIncident[];
  events: readonly OperationEvent[];
  history: readonly OperationHistory[];
}

export type OperationError = "unknown-task" | "forbidden" | "wrong-assignee" | "invalid-transition" | "departure-pending" | "checklist-incomplete" | "incident-open" | "unknown-cleaner" | "unknown-checklist-item" | "unknown-incident" | "nothing-to-undo" | "stale-history" | "same-reviewer";
export type OperationResult =
  | { ok: true; workspace: OperationsWorkspace; taskId: string }
  | { ok: false; workspace: OperationsWorkspace; error: OperationError };

export interface OperationReadiness {
  status: "ready" | "blocked" | "pending" | "review";
  reason: "ready" | "departure" | "assignment" | "acceptance" | "declined" | "checklist" | "incident" | "review";
  responsible: OperationActor | null;
}

const emptyChecklist = (): Record<ChecklistId, boolean> => ({ linen: false, bathroom: false, supplies: false });
const defaultActor = (role: DemoRole): OperationActor => role === "cleaning" ? "marta" : role;
const validActor = (role: DemoRole, actor: OperationActor): boolean => role === "cleaning" ? CLEANERS.some((cleaner) => cleaner.id === actor) : (role === "direction" || role === "reception") && actor === role;
const allChecked = (task: PreparationTask): boolean => CHECKLIST_ITEMS.every((item) => task.checklist[item.id] === true);
const validItem = (id: ChecklistId): boolean => CHECKLIST_ITEMS.some((item) => item.id === id);
const fail = (workspace: OperationsWorkspace, error: OperationError): OperationResult => ({ ok: false, workspace, error });

/** Every arrival and room view derives its preparation state from this task. */
export function taskReadiness(workspace: OperationsWorkspace, taskId: string): OperationReadiness | null {
  const task = workspace.tasks.find((item) => item.id === taskId);
  if (!task) return null;
  const incident = workspace.incidents.find((item) => item.id === task.incidentId);
  if (incident?.status === "open") return { status: "blocked", reason: "incident", responsible: "direction" };
  if (!task.departureConfirmed) return { status: "blocked", reason: "departure", responsible: "reception" };
  if (task.status === "declined") return { status: "blocked", reason: "declined", responsible: "direction" };
  if (!task.assignee || task.status === "unassigned") return { status: "pending", reason: "assignment", responsible: "direction" };
  if (task.status === "assigned" || !task.acceptedBy) return { status: "pending", reason: "acceptance", responsible: task.assignee };
  if (!allChecked(task)) return { status: "pending", reason: "checklist", responsible: task.assignee };
  if (task.status === "ready" && task.reviewedBy && task.reviewedBy !== task.acceptedBy) return { status: "ready", reason: "ready", responsible: null };
  if (task.status === "review") return { status: "review", reason: "review", responsible: "reception" };
  return { status: "pending", reason: "review", responsible: task.assignee };
}

export function stayReadiness(workspace: OperationsWorkspace, stayId: string): OperationReadiness | null {
  const stay = workspace.stays.find((item) => item.id === stayId && item.status === "confirmed");
  const task = stay && workspace.tasks.find((item) => item.stayId === stay.id && item.unitId === stay.unitId);
  return task ? taskReadiness(workspace, task.id) : null;
}

/** "My tasks" is a fixture filter. It never represents production access control. */
export function tasksForRole(workspace: OperationsWorkspace, role: DemoRole, actor: OperationActor = defaultActor(role)): PreparationTask[] {
  if (!validActor(role, actor)) return [];
  return workspace.tasks.filter((task) => role !== "cleaning" || task.assignee === actor);
}

function undo(workspace: OperationsWorkspace, role: DemoRole, actor: OperationActor): OperationResult {
  const entry = workspace.history.at(-1);
  if (!entry) return fail(workspace, "nothing-to-undo");
  if (role !== "direction" && (entry.event.role !== role || entry.event.actor !== actor)) return fail(workspace, "forbidden");
  const currentTask = workspace.tasks.find((task) => task.id === entry.event.taskId);
  const currentIncident = workspace.incidents.find((incident) => incident.id === entry.afterIncident?.id) ?? null;
  if (currentTask !== entry.afterTask || currentIncident !== entry.afterIncident || workspace.events.at(-1) !== entry.event) return fail(workspace, "stale-history");
  return {
    ok: true,
    taskId: entry.event.taskId,
    workspace: {
      ...workspace,
      tasks: workspace.tasks.map((task) => task.id === entry.beforeTask.id ? entry.beforeTask : task),
      incidents: entry.beforeIncident ? workspace.incidents.map((incident) => incident.id === entry.beforeIncident!.id ? entry.beforeIncident! : incident) : workspace.incidents,
      events: workspace.events.slice(0, -1),
      history: workspace.history.slice(0, -1),
    },
  };
}

/** Immutable, synchronous simulation. Every rejected command returns the original workspace. */
export function applyOperation(workspace: OperationsWorkspace, role: DemoRole, action: OperationAction, actor: OperationActor = defaultActor(role)): OperationResult {
  if (!validActor(role, actor)) return fail(workspace, "forbidden");
  if (action.type === "undo") return undo(workspace, role, actor);
  const task = workspace.tasks.find((item) => item.id === action.taskId);
  if (!task) return fail(workspace, "unknown-task");
  const incident = workspace.incidents.find((item) => item.id === task.incidentId) ?? null;
  const reviewer = role === "reception" || role === "direction";
  const cleaner = role === "cleaning" && task.assignee === actor;
  let nextTask = task;
  let nextIncident = incident;

  switch (action.type) {
    case "confirm-departure": {
      if (!reviewer) return fail(workspace, "forbidden");
      if (task.departureConfirmed || task.status !== "unassigned") return fail(workspace, "invalid-transition");
      const previous = workspace.stays.find((stay) => stay.id === task.previousStayId);
      const arrival = workspace.stays.find((stay) => stay.id === task.stayId);
      if (!previous || !arrival || previous.status !== "confirmed" || arrival.status !== "confirmed" || previous.unitId !== task.unitId || arrival.unitId !== task.unitId || previous.endDate > OPERATIONS_DEMO_DATE || previous.endDate > arrival.startDate || countNights(previous.startDate, previous.endDate) === null || countNights(arrival.startDate, arrival.endDate) === null) return fail(workspace, "invalid-transition");
      nextTask = { ...task, departureConfirmed: true };
      break;
    }
    case "assign":
      if (role !== "direction") return fail(workspace, "forbidden");
      if (!CLEANERS.some((person) => person.id === action.assignee)) return fail(workspace, "unknown-cleaner");
      if (!task.departureConfirmed) return fail(workspace, "departure-pending");
      if (!["unassigned", "assigned", "declined", "accepted"].includes(task.status) || (task.assignee === action.assignee && task.status !== "declined")) return fail(workspace, "invalid-transition");
      nextTask = { ...task, status: "assigned", assignee: action.assignee, acceptedBy: null, reviewedBy: null, checklist: emptyChecklist(), declineReason: null, returnReason: null };
      break;
    case "accept":
    case "decline":
      if (role !== "cleaning") return fail(workspace, "forbidden");
      if (!cleaner) return fail(workspace, "wrong-assignee");
      if (!task.departureConfirmed) return fail(workspace, "departure-pending");
      if (task.status !== "assigned") return fail(workspace, "invalid-transition");
      if (action.type === "decline" && !["workload", "supplies"].includes(action.reason)) return fail(workspace, "invalid-transition");
      nextTask = action.type === "accept" ? { ...task, status: "accepted", acceptedBy: actor as CleanerId } : { ...task, status: "declined", declineReason: action.reason };
      break;
    case "check":
      if (role !== "cleaning") return fail(workspace, "forbidden");
      if (!cleaner) return fail(workspace, "wrong-assignee");
      if (task.status !== "accepted" || task.acceptedBy !== actor) return fail(workspace, "invalid-transition");
      if (incident?.status === "open") return fail(workspace, "incident-open");
      if (!validItem(action.itemId)) return fail(workspace, "unknown-checklist-item");
      if (typeof action.checked !== "boolean" || task.checklist[action.itemId] === action.checked) return fail(workspace, "invalid-transition");
      nextTask = { ...task, checklist: { ...task.checklist, [action.itemId]: action.checked } };
      break;
    case "report-issue":
      if (!reviewer && !cleaner) return fail(workspace, role === "cleaning" ? "wrong-assignee" : "forbidden");
      if (!incident) return fail(workspace, "unknown-incident");
      if (!["accepted", "review", "ready"].includes(task.status) || incident.status === "open") return fail(workspace, "invalid-transition");
      nextIncident = { ...incident, status: "open", reportedBy: actor, resolvedBy: null };
      nextTask = { ...task, status: "accepted", checklist: { ...task.checklist, bathroom: false }, reviewedBy: null, returnReason: null };
      break;
    case "resolve-issue":
      if (role !== "direction") return fail(workspace, "forbidden");
      if (!incident) return fail(workspace, "unknown-incident");
      if (incident.status !== "open") return fail(workspace, "invalid-transition");
      nextIncident = { ...incident, status: "resolved", resolvedBy: actor };
      // Resolving a technical incident never substitutes cleaning or a separate review.
      nextTask = { ...task };
      break;
    case "submit-review":
      if (role !== "cleaning") return fail(workspace, "forbidden");
      if (!cleaner) return fail(workspace, "wrong-assignee");
      if (task.status !== "accepted" || task.acceptedBy !== actor) return fail(workspace, "invalid-transition");
      if (incident?.status === "open") return fail(workspace, "incident-open");
      if (!allChecked(task)) return fail(workspace, "checklist-incomplete");
      nextTask = { ...task, status: "review", reviewedBy: null, returnReason: null };
      break;
    case "approve":
    case "return":
      if (!reviewer) return fail(workspace, "forbidden");
      if (task.acceptedBy === actor) return fail(workspace, "same-reviewer");
      if (task.status !== "review" || !task.acceptedBy || !task.assignee || !task.departureConfirmed) return fail(workspace, "invalid-transition");
      if (incident?.status === "open") return fail(workspace, "incident-open");
      if (!allChecked(task)) return fail(workspace, "checklist-incomplete");
      if (action.type === "return" && !validItem(action.itemId)) return fail(workspace, "unknown-checklist-item");
      nextTask = action.type === "approve"
        ? { ...task, status: "ready", reviewedBy: actor, returnReason: null }
        : { ...task, status: "accepted", reviewedBy: null, returnReason: action.itemId, checklist: { ...task.checklist, [action.itemId]: false } };
      break;
    default:
      return fail(workspace, "invalid-transition");
  }

  const event: OperationEvent = Object.freeze({ ...action, id: (workspace.events.at(-1)?.id ?? 0) + 1, role, actor });
  const entry: OperationHistory = { event, beforeTask: task, afterTask: nextTask, beforeIncident: incident, afterIncident: nextIncident };
  return {
    ok: true,
    taskId: task.id,
    workspace: {
      ...workspace,
      tasks: workspace.tasks.map((item) => item.id === task.id ? nextTask : item),
      incidents: nextIncident ? workspace.incidents.map((item) => item.id === nextIncident!.id ? nextIncident! : item) : workspace.incidents,
      events: [...workspace.events, event],
      history: [...workspace.history, entry],
    },
  };
}

export function createOperationsWorkspace(): OperationsWorkspace {
  const units: StayUnit[] = [
    { id: "408", name: "Habitación 408", propertyId: "hotel-aurem", capacity: 2, nightlyRateCents: 21800, cleaningFeeCents: 3000, outOfService: [] },
    { id: "312", name: "Habitación 312", propertyId: "hotel-aurem", capacity: 2, nightlyRateCents: 19800, cleaningFeeCents: 3600, outOfService: [] },
    { id: "205", name: "Habitación 205", propertyId: "hotel-aurem", capacity: 2, nightlyRateCents: 19800, cleaningFeeCents: 3000, outOfService: [] },
  ];
  const fixture = (id: string, unitId: string, guestName: string, startDate: string, endDate: string, email = `${id.toLowerCase()}@example.test`): Stay => ({ id, unitId, guestName, email, startDate, endDate, guests: 2, status: "confirmed", origin: "direct", quote: quoteStay(units.find((unit) => unit.id === unitId)!, startDate, endDate)! });
  const stays = [
    fixture("AUR-811", "408", "Marco Vidal", "2026-08-11", "2026-08-14"),
    fixture("AUR-812", "408", "Elena Rossi", "2026-08-14", "2026-08-17", "elena@example.test"),
    fixture("AUR-801", "312", "Nora Soler", "2026-08-12", "2026-08-14"),
    fixture("AUR-813", "312", "Hugo Vidal", "2026-08-14", "2026-08-16"),
    fixture("AUR-791", "205", "Leo Serra", "2026-08-12", "2026-08-14"),
    fixture("AUR-814", "205", "Eva Luna", "2026-08-14", "2026-08-15"),
  ];
  const task = (unitId: string, stayId: string, previousStayId: string): PreparationTask => ({ id: `PREP-${unitId}`, unitId, stayId, previousStayId, departureConfirmed: false, assignee: null, status: "unassigned", checklist: emptyChecklist(), acceptedBy: null, reviewedBy: null, declineReason: null, returnReason: null, incidentId: unitId === "408" ? "INC-408" : null });
  const tasks = [task("408", "AUR-812", "AUR-811"), task("312", "AUR-813", "AUR-801"), { ...task("205", "AUR-814", "AUR-791"), departureConfirmed: true, assignee: "leo" as const, status: "ready" as const, acceptedBy: "leo" as const, reviewedBy: "reception" as const, checklist: { linen: true, bathroom: true, supplies: true } }];
  const incidents: OperationIncident[] = [{ id: "INC-408", taskId: "PREP-408", unitId: "408", kind: "bathroom-leak", status: "available", reportedBy: null, resolvedBy: null }];
  return { units, stays, tasks, incidents, events: [], history: [] };
}

import { describe, expect, it } from "vitest";
import type { DemoRole } from "@logic-estancia/domain";
import {
  applyOperation,
  CHECKLIST_ITEMS,
  createOperationsWorkspace,
  stayReadiness,
  taskReadiness,
  tasksForRole,
  type CleanerId,
  type OperationAction,
  type OperationActor,
  type OperationResult,
  type OperationsWorkspace,
} from "./operations";

function success(result: OperationResult): OperationsWorkspace {
  expect(result.ok, !result.ok ? result.error : undefined).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.workspace;
}

function execute(workspace: OperationsWorkspace, role: DemoRole, action: OperationAction, actor?: OperationActor): OperationsWorkspace {
  return success(applyOperation(workspace, role, action, actor));
}

function assigned(taskId = "PREP-312", cleaner: CleanerId = "marta"): OperationsWorkspace {
  let workspace = execute(createOperationsWorkspace(), "reception", { type: "confirm-departure", taskId });
  workspace = execute(workspace, "direction", { type: "assign", taskId, assignee: cleaner });
  return workspace;
}

function accepted(taskId = "PREP-312", cleaner: CleanerId = "marta"): OperationsWorkspace {
  return execute(assigned(taskId, cleaner), "cleaning", { type: "accept", taskId }, cleaner);
}

function cleaned(taskId = "PREP-312", cleaner: CleanerId = "marta"): OperationsWorkspace {
  let workspace = accepted(taskId, cleaner);
  for (const itemId of ["linen", "bathroom", "supplies"] as const) {
    workspace = execute(workspace, "cleaning", { type: "check", taskId, itemId, checked: true }, cleaner);
  }
  return workspace;
}

function inReview(taskId = "PREP-312", cleaner: CleanerId = "marta"): OperationsWorkspace {
  return execute(cleaned(taskId, cleaner), "cleaning", { type: "submit-review", taskId }, cleaner);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

describe("Aurem preparation fixtures and derived readiness", () => {
  it("reuses the stay contract and keeps Elena's dates and amount coherent", () => {
    const workspace = createOperationsWorkspace();
    expect(workspace.stays.find((stay) => stay.id === "AUR-812")).toMatchObject({ guestName: "Elena Rossi", email: "elena@example.test", unitId: "408", guests: 2, startDate: "2026-08-14", endDate: "2026-08-17", quote: { nights: 3, accommodationCents: 65400, cleaningFeeCents: 3000, totalCents: 68400 } });
    expect(workspace.stays.find((stay) => stay.id === "AUR-813")?.quote.totalCents).toBe(43200);
    expect(workspace.stays.find((stay) => stay.id === "AUR-814")?.quote.totalCents).toBe(22800);
    for (const task of workspace.tasks) {
      const previous = workspace.stays.find((stay) => stay.id === task.previousStayId)!;
      const arrival = workspace.stays.find((stay) => stay.id === task.stayId)!;
      expect(previous.unitId).toBe(arrival.unitId);
      expect(previous.endDate).toBe(arrival.startDate);
      expect(stayReadiness(workspace, arrival.id)).toEqual(taskReadiness(workspace, task.id));
    }
  });

  it("starts two arrivals awaiting departure and a separately reviewed ready room", () => {
    const workspace = createOperationsWorkspace();
    expect(taskReadiness(workspace, "PREP-408")).toEqual({ status: "blocked", reason: "departure", responsible: "reception" });
    expect(taskReadiness(workspace, "PREP-312")).toEqual({ status: "blocked", reason: "departure", responsible: "reception" });
    expect(stayReadiness(workspace, "AUR-814")).toEqual({ status: "ready", reason: "ready", responsible: null });
    expect(workspace.tasks[2]).toMatchObject({ acceptedBy: "leo", reviewedBy: "reception", status: "ready" });
    expect(workspace.incidents[0]).toMatchObject({ id: "INC-408", status: "available", reportedBy: null });
    expect(stayReadiness(workspace, "AUR-811")).toBeNull();
    expect(stayReadiness(workspace, "unknown")).toBeNull();
    expect(taskReadiness(workspace, "unknown")).toBeNull();
    expect(workspace.events).toEqual([]);
    expect(workspace.history).toEqual([]);
  });

  it("returns independent fixtures on reset", () => {
    const first = createOperationsWorkspace();
    const fresh = createOperationsWorkspace();
    first.tasks[0].checklist.bathroom = true;
    first.incidents[0].status = "open";
    first.stays[1].quote.totalCents = 1;
    expect(fresh.tasks[0].checklist.bathroom).toBe(false);
    expect(fresh.incidents[0].status).toBe("available");
    expect(fresh.stays[1].quote.totalCents).toBe(68400);
  });

  it("filters My tasks by the chosen cleaner without pretending to authenticate", () => {
    const workspace = assigned();
    expect(tasksForRole(workspace, "cleaning").map((task) => task.id)).toEqual(["PREP-312"]);
    expect(tasksForRole(workspace, "cleaning", "leo").map((task) => task.id)).toEqual(["PREP-205"]);
    expect(tasksForRole(workspace, "direction")).toHaveLength(3);
    expect(tasksForRole(workspace, "reception")).toHaveLength(3);
    expect(tasksForRole(workspace, "direction", "marta")).toEqual([]);
  });
});

describe("departure, assignment and ownership guards", () => {
  it("requires a confirmed departure before assignment and only permits reception or direction to confirm it", () => {
    const original = createOperationsWorkspace();
    expect(applyOperation(original, "direction", { type: "assign", taskId: "PREP-312", assignee: "marta" })).toEqual({ ok: false, workspace: original, error: "departure-pending" });
    expect(applyOperation(original, "cleaning", { type: "confirm-departure", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "forbidden" });
    const departed = execute(original, "reception", { type: "confirm-departure", taskId: "PREP-312" });
    expect(taskReadiness(departed, "PREP-312")).toEqual({ status: "pending", reason: "assignment", responsible: "direction" });
    expect(applyOperation(departed, "reception", { type: "confirm-departure", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(applyOperation(departed, "reception", { type: "assign", taskId: "PREP-312", assignee: "marta" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(taskReadiness(assigned(), "PREP-312")).toEqual({ status: "pending", reason: "acceptance", responsible: "marta" });
  });

  it("refuses to confirm a departure that overlaps the arrival or has invalid dates", () => {
    for (const endDate of ["2026-08-15", "2026-08-32", "2026-08-10"]) {
      const workspace = createOperationsWorkspace();
      workspace.stays[0].endDate = endDate;
      expect(applyOperation(workspace, "direction", { type: "confirm-departure", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "invalid-transition" });
    }
  });

  it("rejects another cleaner and requires the assigned person to explicitly accept", () => {
    const workspace = assigned();
    expect(applyOperation(workspace, "cleaning", { type: "accept", taskId: "PREP-312" }, "leo")).toMatchObject({ ok: false, error: "wrong-assignee" });
    expect(applyOperation(workspace, "direction", { type: "accept", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true })).toMatchObject({ ok: false, error: "invalid-transition" });
    const started = execute(workspace, "cleaning", { type: "accept", taskId: "PREP-312" });
    expect(taskReadiness(started, "PREP-312")).toEqual({ status: "pending", reason: "checklist", responsible: "marta" });
    expect(started.tasks[1].acceptedBy).toBe("marta");
    expect(applyOperation(started, "cleaning", { type: "accept", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "invalid-transition" });
  });

  it("rejects unknown records and forged actor, assignee or checklist values", () => {
    const workspace = accepted();
    expect(applyOperation(workspace, "direction", { type: "confirm-departure", taskId: "unknown" })).toMatchObject({ ok: false, error: "unknown-task" });
    expect(applyOperation(workspace, "direction", { type: "approve", taskId: "PREP-312" }, "marta")).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true }, "reception")).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "direction", { type: "assign", taskId: "PREP-312", assignee: "unknown" as CleanerId })).toMatchObject({ ok: false, error: "unknown-cleaner" });
    expect(applyOperation(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "unknown" as "linen", checked: true })).toMatchObject({ ok: false, error: "unknown-checklist-item" });
    expect(applyOperation(workspace, "direction", { type: "skip-to-ready", taskId: "PREP-312" } as unknown as OperationAction)).toMatchObject({ ok: false, error: "invalid-transition" });
  });

  it("supports a declined task and reassignment without transferring acceptance", () => {
    let workspace = execute(assigned(), "cleaning", { type: "decline", taskId: "PREP-312", reason: "workload" });
    expect(workspace.tasks[1]).toMatchObject({ status: "declined", declineReason: "workload", acceptedBy: null });
    expect(taskReadiness(workspace, "PREP-312")).toEqual({ status: "blocked", reason: "declined", responsible: "direction" });
    expect(applyOperation(workspace, "cleaning", { type: "accept", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "invalid-transition" });
    workspace = execute(workspace, "direction", { type: "assign", taskId: "PREP-312", assignee: "leo" });
    expect(workspace.tasks[1]).toMatchObject({ assignee: "leo", status: "assigned", acceptedBy: null, declineReason: null });
    expect(applyOperation(workspace, "cleaning", { type: "accept", taskId: "PREP-312" }, "marta")).toMatchObject({ ok: false, error: "wrong-assignee" });
    workspace = execute(workspace, "cleaning", { type: "accept", taskId: "PREP-312" }, "leo");
    expect(workspace.tasks[1].acceptedBy).toBe("leo");
  });

  it("allows retrying a declined assignment but prevents accidental duplicate assignment", () => {
    const workspace = assigned();
    expect(applyOperation(workspace, "direction", { type: "assign", taskId: "PREP-312", assignee: "marta" })).toMatchObject({ ok: false, error: "invalid-transition" });
    const declined = execute(workspace, "cleaning", { type: "decline", taskId: "PREP-312", reason: "supplies" });
    const retried = execute(declined, "direction", { type: "assign", taskId: "PREP-312", assignee: "marta" });
    expect(retried.tasks[1]).toMatchObject({ status: "assigned", declineReason: null, acceptedBy: null });
  });

  it("resets work on reassignment and forbids reassignment during review or after approval", () => {
    const workspace = cleaned();
    const changed = execute(workspace, "direction", { type: "assign", taskId: "PREP-312", assignee: "leo" });
    expect(changed.tasks[1]).toMatchObject({ assignee: "leo", status: "assigned", acceptedBy: null, checklist: { linen: false, bathroom: false, supplies: false } });
    expect(applyOperation(changed, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: false }, "marta")).toMatchObject({ ok: false, error: "wrong-assignee" });
    expect(applyOperation(inReview(), "direction", { type: "assign", taskId: "PREP-312", assignee: "leo" })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(applyOperation(createOperationsWorkspace(), "direction", { type: "assign", taskId: "PREP-205", assignee: "marta" })).toMatchObject({ ok: false, error: "invalid-transition" });
  });
});

describe("separate execution and review", () => {
  it("completes the normal workflow while keeping room, arrival and stay data coherent", () => {
    const workspace = inReview();
    expect(taskReadiness(workspace, "PREP-312")).toEqual({ status: "review", reason: "review", responsible: "reception" });
    expect(stayReadiness(workspace, "AUR-813")).toEqual(taskReadiness(workspace, "PREP-312"));
    const ready = execute(workspace, "reception", { type: "approve", taskId: "PREP-312" });
    expect(ready.tasks[1]).toMatchObject({ status: "ready", acceptedBy: "marta", reviewedBy: "reception" });
    expect(stayReadiness(ready, "AUR-813")).toEqual({ status: "ready", reason: "ready", responsible: null });
    expect(ready.stays).toEqual(createOperationsWorkspace().stays);
    expect(ready.events).toHaveLength(8);
    expect(ready.events.at(-1)).toMatchObject({ id: 8, type: "approve", actor: "reception", taskId: "PREP-312" });
  });

  it("requires all three checks and a review submission before approval", () => {
    let workspace = accepted();
    expect(CHECKLIST_ITEMS).toHaveLength(3);
    expect(applyOperation(workspace, "cleaning", { type: "submit-review", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "checklist-incomplete" });
    workspace = execute(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true });
    workspace = execute(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "bathroom", checked: true });
    expect(applyOperation(workspace, "cleaning", { type: "submit-review", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "checklist-incomplete" });
    expect(applyOperation(cleaned(), "reception", { type: "approve", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(taskReadiness(cleaned(), "PREP-312")).toEqual({ status: "pending", reason: "review", responsible: "marta" });
  });

  it("prevents the cleaner from reviewing their own work or submitting another person's work", () => {
    const workspace = inReview();
    expect(applyOperation(workspace, "cleaning", { type: "approve", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "cleaning", { type: "return", taskId: "PREP-312", itemId: "bathroom" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(cleaned(), "cleaning", { type: "submit-review", taskId: "PREP-312" }, "leo")).toMatchObject({ ok: false, error: "wrong-assignee" });
    expect(applyOperation(cleaned(), "direction", { type: "submit-review", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "forbidden" });
  });

  it("returns one review item to its cleaner and requires the full review cycle again", () => {
    let workspace = execute(inReview(), "reception", { type: "return", taskId: "PREP-312", itemId: "bathroom" });
    expect(workspace.tasks[1]).toMatchObject({ status: "accepted", acceptedBy: "marta", reviewedBy: null, returnReason: "bathroom", checklist: { linen: true, bathroom: false, supplies: true } });
    expect(stayReadiness(workspace, "AUR-813")?.status).toBe("pending");
    expect(applyOperation(workspace, "reception", { type: "approve", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "invalid-transition" });
    workspace = execute(workspace, "cleaning", { type: "check", taskId: "PREP-312", itemId: "bathroom", checked: true });
    workspace = execute(workspace, "cleaning", { type: "submit-review", taskId: "PREP-312" });
    workspace = execute(workspace, "direction", { type: "approve", taskId: "PREP-312" });
    expect(workspace.tasks[1]).toMatchObject({ status: "ready", reviewedBy: "direction", returnReason: null });
  });

  it("allows correcting a checklist before submission but locks it during review and after readiness", () => {
    const checked = execute(accepted(), "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true });
    expect(applyOperation(checked, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true })).toMatchObject({ ok: false, error: "invalid-transition" });
    const corrected = execute(checked, "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: false });
    expect(corrected.tasks[1].checklist.linen).toBe(false);
    expect(applyOperation(inReview(), "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: false })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(applyOperation(createOperationsWorkspace(), "cleaning", { type: "check", taskId: "PREP-205", itemId: "linen", checked: false }, "leo")).toMatchObject({ ok: false, error: "invalid-transition" });
  });
});

describe("fixture incident and arrival risk", () => {
  it("opens a concrete incident and blocks the task, checklist and arrival until a separate resolution", () => {
    const workspace = execute(cleaned("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" });
    expect(workspace.incidents[0]).toMatchObject({ status: "open", reportedBy: "marta", resolvedBy: null });
    expect(workspace.tasks[0]).toMatchObject({ status: "accepted", reviewedBy: null, checklist: { linen: true, bathroom: false, supplies: true } });
    expect(stayReadiness(workspace, "AUR-812")).toEqual({ status: "blocked", reason: "incident", responsible: "direction" });
    expect(applyOperation(workspace, "cleaning", { type: "check", taskId: "PREP-408", itemId: "bathroom", checked: true })).toMatchObject({ ok: false, error: "incident-open" });
    expect(applyOperation(workspace, "cleaning", { type: "submit-review", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "incident-open" });
    expect(applyOperation(workspace, "reception", { type: "resolve-issue", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "cleaning", { type: "resolve-issue", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "forbidden" });
  });

  it("resolving an incident does not bypass cleaning and review", () => {
    let workspace = execute(cleaned("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" });
    workspace = execute(workspace, "direction", { type: "resolve-issue", taskId: "PREP-408" });
    expect(workspace.incidents[0]).toMatchObject({ status: "resolved", resolvedBy: "direction" });
    expect(stayReadiness(workspace, "AUR-812")).toEqual({ status: "pending", reason: "checklist", responsible: "marta" });
    expect(applyOperation(workspace, "direction", { type: "approve", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "invalid-transition" });
    workspace = execute(workspace, "cleaning", { type: "check", taskId: "PREP-408", itemId: "bathroom", checked: true });
    workspace = execute(workspace, "cleaning", { type: "submit-review", taskId: "PREP-408" });
    workspace = execute(workspace, "reception", { type: "approve", taskId: "PREP-408" });
    expect(stayReadiness(workspace, "AUR-812")?.status).toBe("ready");
    expect(workspace.stays.find((stay) => stay.id === "AUR-812")?.quote.totalCents).toBe(68400);
  });

  it("a late incident invalidates pending or completed review immediately", () => {
    const review = inReview("PREP-408");
    const ready = execute(review, "reception", { type: "approve", taskId: "PREP-408" });
    for (const current of [review, ready]) {
      const blocked = execute(current, "reception", { type: "report-issue", taskId: "PREP-408" });
      expect(blocked.tasks[0]).toMatchObject({ status: "accepted", reviewedBy: null });
      expect(stayReadiness(blocked, "AUR-812")?.status).toBe("blocked");
      expect(applyOperation(blocked, "direction", { type: "approve", taskId: "PREP-408" }).ok).toBe(false);
    }
  });

  it("rejects duplicate, unassigned or nonexistent incident actions and permits a new report after resolution", () => {
    expect(applyOperation(createOperationsWorkspace(), "direction", { type: "report-issue", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(applyOperation(accepted(), "cleaning", { type: "report-issue", taskId: "PREP-312" })).toMatchObject({ ok: false, error: "unknown-incident" });
    expect(applyOperation(accepted("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" }, "leo")).toMatchObject({ ok: false, error: "wrong-assignee" });
    let workspace = execute(accepted("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" });
    expect(applyOperation(workspace, "cleaning", { type: "report-issue", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "invalid-transition" });
    workspace = execute(workspace, "direction", { type: "resolve-issue", taskId: "PREP-408" });
    expect(applyOperation(workspace, "direction", { type: "resolve-issue", taskId: "PREP-408" })).toMatchObject({ ok: false, error: "invalid-transition" });
    workspace = execute(workspace, "cleaning", { type: "report-issue", taskId: "PREP-408" });
    expect(workspace.incidents[0]).toMatchObject({ status: "open", resolvedBy: null });
  });

  it("preserves an open incident across reassignment so it cannot be bypassed", () => {
    const blocked = execute(accepted("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" });
    let reassigned = execute(blocked, "direction", { type: "assign", taskId: "PREP-408", assignee: "leo" });
    reassigned = execute(reassigned, "cleaning", { type: "accept", taskId: "PREP-408" }, "leo");
    expect(stayReadiness(reassigned, "AUR-812")).toEqual({ status: "blocked", reason: "incident", responsible: "direction" });
    expect(applyOperation(reassigned, "cleaning", { type: "check", taskId: "PREP-408", itemId: "linen", checked: true }, "leo")).toMatchObject({ ok: false, error: "incident-open" });
  });
});

describe("immutable changes, event evidence and recovery", () => {
  it("mutates no prior workspace, task, stay or event", () => {
    const workspace = deepFreeze(accepted("PREP-408"));
    const before = JSON.stringify(workspace);
    const changed = execute(workspace, "cleaning", { type: "report-issue", taskId: "PREP-408" });
    expect(JSON.stringify(workspace)).toBe(before);
    expect(changed).not.toBe(workspace);
    expect(changed.stays).toBe(workspace.stays);
    expect(changed.tasks[1]).toBe(workspace.tasks[1]);
    expect(Object.isFrozen(changed.events.at(-1))).toBe(true);
    const invalid = applyOperation(changed, "reception", { type: "resolve-issue", taskId: "PREP-408" });
    expect(invalid.workspace).toBe(changed);
  });

  it("restricts undo to the original actor and role or Direction", () => {
    const workspace = execute(accepted(), "cleaning", { type: "check", taskId: "PREP-312", itemId: "linen", checked: true });
    expect(applyOperation(workspace, "reception", { type: "undo" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(applyOperation(workspace, "cleaning", { type: "undo" }, "leo")).toMatchObject({ ok: false, error: "forbidden" });
    expect(execute(workspace, "cleaning", { type: "undo" }).tasks[1].checklist.linen).toBe(false);
    expect(execute(workspace, "direction", { type: "undo" }).tasks[1].checklist.linen).toBe(false);
    expect(applyOperation(createOperationsWorkspace(), "direction", { type: "undo" })).toMatchObject({ ok: false, error: "nothing-to-undo" });
  });

  it("undoes incident resolution and reporting in reverse order with matching arrival readiness", () => {
    const original = cleaned("PREP-408");
    const blocked = execute(original, "cleaning", { type: "report-issue", taskId: "PREP-408" });
    const resolved = execute(blocked, "direction", { type: "resolve-issue", taskId: "PREP-408" });
    const blockedAgain = execute(resolved, "direction", { type: "undo" });
    expect(blockedAgain).toEqual(blocked);
    expect(stayReadiness(blockedAgain, "AUR-812")?.status).toBe("blocked");
    expect(execute(blockedAgain, "direction", { type: "undo" })).toEqual(original);
  });

  it("undoes the complete normal workflow to the initial fixture without stale readiness", () => {
    let workspace = execute(inReview(), "reception", { type: "approve", taskId: "PREP-312" });
    workspace = execute(workspace, "reception", { type: "undo" });
    expect(stayReadiness(workspace, "AUR-813")?.status).toBe("review");
    while (workspace.history.length) workspace = execute(workspace, "direction", { type: "undo" });
    expect(workspace).toEqual(createOperationsWorkspace());
  });

  it("preserves strict LIFO order across different tasks", () => {
    let workspace = execute(createOperationsWorkspace(), "reception", { type: "confirm-departure", taskId: "PREP-408" });
    const first = workspace;
    workspace = execute(workspace, "direction", { type: "confirm-departure", taskId: "PREP-312" });
    const reverted = execute(workspace, "direction", { type: "undo" });
    expect(reverted).toEqual(first);
    expect(reverted.tasks[0].departureConfirmed).toBe(true);
    expect(reverted.tasks[1].departureConfirmed).toBe(false);
  });

  it("refuses stale task or incident snapshots instead of overwriting later changes", () => {
    const workspace = execute(accepted("PREP-408"), "cleaning", { type: "report-issue", taskId: "PREP-408" });
    const staleTask = { ...workspace, tasks: workspace.tasks.map((task) => task.id === "PREP-408" ? { ...task, assignee: "leo" as const } : task) };
    const staleIncident = { ...workspace, incidents: workspace.incidents.map((incident) => ({ ...incident, status: "resolved" as const })) };
    for (const current of [staleTask, staleIncident]) {
      expect(applyOperation(current, "direction", { type: "undo" })).toEqual({ ok: false, workspace: current, error: "stale-history" });
    }
  });
});

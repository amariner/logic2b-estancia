import { describe, expect, it } from "vitest";
import {
  cancelStay,
  changeStay,
  checkAvailability,
  confirmEnquiry,
  countNights,
  createStayWorkspace,
  getEnquiryOptions,
  intervalsOverlap,
  quoteStay,
  selectStays,
  stayReport,
  undoLastChange,
  updateEnquiry,
  type StayMutationResult,
  type StayWorkspace,
} from "./stays";

function success(result: StayMutationResult): StayWorkspace {
  expect(result.ok, !result.ok ? result.error : undefined).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.workspace;
}

const marinaDates = { startDate: "2026-08-21", endDate: "2026-08-24", guests: 4 };

describe("strict calendar dates and integer money", () => {
  it.each([
    ["2026-08-21", "2026-08-24", 3],
    ["2026-08-31", "2026-09-01", 1],
    ["2028-02-28", "2028-03-01", 2],
    ["2026-03-28", "2026-03-30", 2],
    ["2026-10-24", "2026-10-26", 2],
    ["2026-12-31", "2027-01-01", 1],
  ])("counts %s to %s independently of month length or local daylight savings", (start, end, expected) => {
    expect(countNights(start as string, end as string)).toBe(expected);
  });

  it.each([
    ["2026-02-29", "2026-03-03"],
    ["2026-08-32", "2026-09-03"],
    ["2026-8-01", "2026-08-03"],
    ["2026-08-01T00:00:00Z", "2026-08-03"],
    ["", "2026-08-03"],
    ["2026-08-21", "2026-08-21"],
    ["2026-08-22", "2026-08-21"],
    ["2026-08-21", "2026-13-01"],
  ])("rejects invalid interval %s to %s", (start, end) => {
    expect(countNights(start, end)).toBeNull();
  });

  it("quotes Marina's three nights and cleaning in integer cents", () => {
    const bruma = createStayWorkspace().units.find((unit) => unit.id === "bruma")!;
    expect(quoteStay(bruma, "2026-08-21", "2026-08-24")).toEqual({ nights: 3, nightlyRateCents: 18900, accommodationCents: 56700, cleaningFeeCents: 4500, totalCents: 61200, currency: "EUR" });
    expect(quoteStay(bruma, "2026-08-21", "2026-08-25")?.totalCents).toBe(80100);
    expect(quoteStay(bruma, "2026-08-31", "2026-09-01")?.totalCents).toBe(23400);
  });

  it("rejects invalid quotes and unsafe, fractional or negative money", () => {
    const unit = createStayWorkspace().units[0];
    expect(quoteStay(unit, "2026-08-21", "2026-08-21")).toBeNull();
    for (const rate of [NaN, Infinity, -100, 100.5, Number.MAX_SAFE_INTEGER]) {
      expect(quoteStay({ ...unit, nightlyRateCents: rate }, "2026-08-21", "2026-08-24")).toBeNull();
    }
    expect(quoteStay({ ...unit, cleaningFeeCents: -1 }, "2026-08-21", "2026-08-24")).toBeNull();
  });
});

describe("availability and coherent fixtures", () => {
  it("uses departure-exclusive overlap in both directions", () => {
    expect(intervalsOverlap("2026-08-20", "2026-08-22", "2026-08-22", "2026-08-24")).toBe(false);
    expect(intervalsOverlap("2026-08-22", "2026-08-24", "2026-08-20", "2026-08-22")).toBe(false);
    expect(intervalsOverlap("2026-08-20", "2026-08-23", "2026-08-22", "2026-08-24")).toBe(true);
    expect(intervalsOverlap("2026-08-20", "2026-08-25", "2026-08-21", "2026-08-24")).toBe(true);
    expect(intervalsOverlap("2026-08-21", "2026-08-24", "2026-08-20", "2026-08-25")).toBe(true);
    expect(intervalsOverlap("invalid", "2026-08-24", "2026-08-20", "2026-08-25")).toBe(false);
  });

  it("explains the requested conflict and provides one coherent alternative", () => {
    const workspace = createStayWorkspace();
    const options = getEnquiryOptions(workspace, "REQ-024");
    expect(options.find(({ unit }) => unit.id === "aira")?.availability).toMatchObject({ available: false, reason: "occupied", conflicts: [{ id: "EST-001", endDate: "2026-08-22" }] });
    expect(options.filter(({ availability }) => availability.available).map(({ unit, quote }) => [unit.name, quote?.totalCents])).toEqual([["Casa Bruma", 61200]]);
    expect(options.find(({ unit }) => unit.id === "duna")?.availability.reason).toBe("out-of-service");
  });

  it("permits the normal scenario exactly at the previous checkout", () => {
    const option = getEnquiryOptions(createStayWorkspace(), "REQ-025").find(({ unit }) => unit.id === "cauce");
    expect(option?.availability.available).toBe(true);
    expect(option?.quote).toMatchObject({ nights: 3, totalCents: 54400 });
  });

  it("has distinct fully occupied and no-capacity cases with no alternative", () => {
    const workspace = createStayWorkspace();
    expect(getEnquiryOptions(workspace, "REQ-026").map(({ availability }) => availability.reason)).toEqual(Array(8).fill("occupied"));
    expect(getEnquiryOptions(workspace, "REQ-027").map(({ availability }) => availability.reason)).toEqual(Array(8).fill("capacity"));
    expect(getEnquiryOptions(workspace, "unknown")).toEqual([]);
  });

  it("allows arrival when maintenance ends and departure when maintenance starts", () => {
    const workspace = createStayWorkspace();
    expect(checkAvailability(workspace, { unitId: "duna", startDate: "2026-08-19", endDate: "2026-08-20", guests: 2 }).available).toBe(true);
    expect(checkAvailability(workspace, { unitId: "duna", startDate: "2026-08-26", endDate: "2026-08-28", guests: 2 }).available).toBe(true);
    expect(checkAvailability(workspace, { unitId: "duna", startDate: "2026-08-19", endDate: "2026-08-21", guests: 2 }).reason).toBe("out-of-service");
  });

  it("enforces date bounds, known units and finite integral guest counts", () => {
    const workspace = createStayWorkspace();
    expect(checkAvailability(workspace, { ...marinaDates, unitId: "missing" }).reason).toBe("unknown-unit");
    expect(checkAvailability(workspace, { ...marinaDates, unitId: "bruma", startDate: "2026-07-31" }).reason).toBe("out-of-range");
    expect(checkAvailability(workspace, { ...marinaDates, unitId: "bruma", endDate: "2026-09-02" }).reason).toBe("out-of-range");
    expect(checkAvailability(workspace, { unitId: "bruma", startDate: "2026-08-31", endDate: "2026-09-01", guests: 4 }).available).toBe(true);
    for (const guests of [0, -1, 1.5, NaN, Infinity, 13]) {
      expect(checkAvailability(workspace, { ...marinaDates, unitId: "bruma", guests }).reason).toBe("invalid-guests");
    }
    expect(checkAvailability(workspace, { ...marinaDates, unitId: "bruma", guests: 5 }).reason).toBe("capacity");
  });

  it("creates independent fixture collections with no overlapping active stays or outages", () => {
    const workspace = createStayWorkspace();
    for (const stay of workspace.stays) {
      expect(checkAvailability(workspace, { ...stay, excludeStayId: stay.id }).available, stay.id).toBe(true);
    }
    const fresh = createStayWorkspace();
    workspace.units[3].outOfService.splice(0);
    workspace.enquiries[0].guestName = "Changed locally";
    expect(fresh.units[3].outOfService).toHaveLength(1);
    expect(fresh.enquiries[0].guestName).toBe("Marina Costa");
    expect(fresh.history).toHaveLength(0);
  });

  it("filters by actual property ID or the shell's Casa name", () => {
    const workspace = createStayWorkspace();
    expect(selectStays(workspace, { propertyId: "bruma" }).map((stay) => stay.id)).toEqual(["EST-002", "EST-009"]);
    expect(selectStays(workspace, { propertyId: "Casa Bruma" })).toEqual(selectStays(workspace, { propertyId: "bruma" }));
    expect(selectStays(workspace, { propertyId: "missing" })).toEqual([]);
    expect(selectStays(workspace, { propertyId: "all" })).toHaveLength(workspace.stays.length);
  });

  it("reports only serviceable capacity and derives money and occupancy from the fixture month", () => {
    const report = stayReport(createStayWorkspace());
    expect(report).toMatchObject({ stayCount: 15, guestCount: 36, totalCents: 804000, accommodationCents: 738500, cleaningFeeCents: 65500, occupiedNights: 39, availableNights: 242, occupancyPercent: 16.1 });
    expect(report.daily).toHaveLength(31);
    expect(report.daily.find((day) => day.date === "2026-08-21")).toEqual({ date: "2026-08-21", availableUnits: 7, occupiedUnits: 5, outOfServiceUnits: 1 });
    expect(report.daily.find((day) => day.date === "2026-08-28")).toEqual({ date: "2026-08-28", availableUnits: 8, occupiedUnits: 8, outOfServiceUnits: 0 });
    expect(stayReport(createStayWorkspace(), "Casa Duna").availableNights).toBe(25);
    expect(stayReport(createStayWorkspace(), "missing")).toMatchObject({ stayCount: 0, totalCents: 0, occupiedNights: 0, availableNights: 0, occupancyPercent: 0 });
  });

  it("updates a filtered report on confirmation and cancellation while keeping other properties unchanged", () => {
    const original = createStayWorkspace();
    const reportBefore = stayReport(original, "bruma");
    expect(reportBefore).toMatchObject({ stayCount: 2, guestCount: 4, totalCents: 103500, occupiedNights: 5, availableNights: 31 });
    const confirmed = success(confirmEnquiry(original, "REQ-024", "bruma"));
    expect(stayReport(confirmed, "Casa Bruma")).toMatchObject({ stayCount: 3, guestCount: 8, totalCents: 164700, occupiedNights: 8, availableNights: 31, occupancyPercent: 25.8 });
    expect(stayReport(confirmed, "aira")).toEqual(stayReport(original, "aira"));
    expect(stayReport(success(cancelStay(confirmed, "EST-025")), "bruma")).toEqual(reportBefore);
  });
});

describe("local stay lifecycle and safe recovery", () => {
  it("blocks conflict confirmation without changing any state", () => {
    const workspace = createStayWorkspace();
    const result = confirmEnquiry(workspace, "REQ-024", "aira");
    expect(result).toEqual({ ok: false, error: "occupied", workspace });
    expect(result.workspace).toBe(workspace);
    expect(workspace.history).toHaveLength(0);
  });

  it("confirms a single priced stay, links the enquiry and blocks a second confirmation", () => {
    const original = createStayWorkspace();
    const before = JSON.stringify(original);
    const workspace = success(confirmEnquiry(original, "REQ-024", "bruma"));
    expect(workspace.stays.at(-1)).toMatchObject({ id: "EST-025", enquiryId: "REQ-024", guestName: "Marina Costa", unitId: "bruma", ...marinaDates, status: "confirmed", quote: { totalCents: 61200 } });
    expect(workspace.enquiries[0]).toMatchObject({ status: "confirmed", stayId: "EST-025", preferredUnitId: "bruma" });
    expect(JSON.stringify(original)).toBe(before);
    expect(confirmEnquiry(workspace, "REQ-024", "bruma")).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(checkAvailability(workspace, { ...marinaDates, unitId: "bruma" }).reason).toBe("occupied");
    expect(getEnquiryOptions(workspace, "REQ-024").find(({ unit }) => unit.id === "bruma")?.availability.available).toBe(true);
  });

  it("completes the normal enquiry without an alternative", () => {
    const workspace = success(confirmEnquiry(createStayWorkspace(), "REQ-025", "cauce"));
    expect(workspace.stays.at(-1)).toMatchObject({ guestName: "Diego Vidal", guests: 4, unitId: "cauce", quote: { totalCents: 54400 } });
  });

  it("keeps dates, guests and prices coherent across a modification and undo", () => {
    const confirmed = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    const changed = success(changeStay(confirmed, "EST-025", { ...marinaDates, unitId: "bruma", endDate: "2026-08-25", guests: 4 }));
    expect(changed.stays.at(-1)).toMatchObject({ endDate: "2026-08-25", guests: 4, quote: { nights: 4, accommodationCents: 75600, cleaningFeeCents: 4500, totalCents: 80100 } });
    expect(changed.enquiries[0]).toMatchObject({ preferredUnitId: "bruma", endDate: "2026-08-25", guests: 4 });
    const restored = success(undoLastChange(changed));
    expect(restored).toEqual(confirmed);
    expect(restored.stays.at(-1)?.quote.totalCents).toBe(61200);
  });

  it("rejects invalid changes without erasing a valid stay or its history", () => {
    const workspace = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    const badInputs = [
      [{ ...marinaDates, unitId: "aira" }, "occupied"],
      [{ ...marinaDates, unitId: "duna" }, "out-of-service"],
      [{ ...marinaDates, unitId: "bruma", guests: 5 }, "capacity"],
      [{ ...marinaDates, unitId: "bruma", endDate: "2026-08-21" }, "invalid-dates"],
      [{ ...marinaDates, unitId: "bruma", endDate: "2026-09-02" }, "out-of-range"],
    ] as const;
    for (const [input, error] of badInputs) {
      expect(changeStay(workspace, "EST-025", input)).toEqual({ ok: false, workspace, error });
    }
    expect(workspace.history).toHaveLength(1);
    expect(workspace.stays.at(-1)?.quote.totalCents).toBe(61200);
  });

  it("cancels, frees inventory, reopens the enquiry and can restore both", () => {
    const confirmed = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    const cancelled = success(cancelStay(confirmed, "EST-025"));
    expect(cancelled.stays.at(-1)?.status).toBe("cancelled");
    expect(cancelled.enquiries[0]).toMatchObject({ status: "new", stayId: undefined });
    expect(checkAvailability(cancelled, { ...marinaDates, unitId: "bruma" }).available).toBe(true);
    expect(selectStays(cancelled, { status: "cancelled" }).map((stay) => stay.id)).toEqual(["EST-025"]);
    expect(cancelStay(cancelled, "EST-025")).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(changeStay(cancelled, "EST-025", { ...marinaDates, unitId: "bruma" })).toMatchObject({ ok: false, error: "invalid-transition" });
    expect(success(undoLastChange(cancelled))).toEqual(confirmed);
  });

  it("rechecks occupancy before undoing cancellation, preserving the failed recovery", () => {
    const confirmed = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    const cancelled = success(cancelStay(confirmed, "EST-025"));
    const newOccupancy = { ...cancelled, stays: [...cancelled.stays, { ...confirmed.stays.at(-1)!, id: "EST-999", enquiryId: undefined }] };
    const recovered = undoLastChange(newOccupancy);
    expect(recovered).toEqual({ ok: false, workspace: newOccupancy, error: "occupied" });
    expect(recovered.workspace.stays.find((stay) => stay.id === "EST-025")?.status).toBe("cancelled");
    expect(recovered.workspace.history).toHaveLength(2);
  });

  it("refuses stale history that would overwrite a newer record", () => {
    const confirmed = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    const changedOutsideHistory = { ...confirmed, stays: confirmed.stays.map((stay) => stay.id === "EST-025" ? { ...stay, guests: 3 } : stay) };
    expect(undoLastChange(changedOutsideHistory)).toEqual({ ok: false, workspace: changedOutsideHistory, error: "invalid-transition" });
  });

  it("reverses the entire sequence back to the original fixture collection", () => {
    const original = createStayWorkspace();
    let workspace = success(confirmEnquiry(original, "REQ-024", "bruma"));
    workspace = success(changeStay(workspace, "EST-025", { ...marinaDates, unitId: "bruma", endDate: "2026-08-25" }));
    workspace = success(cancelStay(workspace, "EST-025"));
    workspace = success(undoLastChange(workspace));
    workspace = success(undoLastChange(workspace));
    workspace = success(undoLastChange(workspace));
    expect(workspace).toEqual(original);
    expect(undoLastChange(workspace)).toMatchObject({ ok: false, error: "nothing-to-undo" });
  });

  it("keeps cancelled IDs unique when the reopened enquiry is confirmed again", () => {
    let workspace = success(confirmEnquiry(createStayWorkspace(), "REQ-024", "bruma"));
    workspace = success(cancelStay(workspace, "EST-025"));
    workspace = success(confirmEnquiry(workspace, "REQ-024", "bruma"));
    expect(workspace.stays.at(-1)).toMatchObject({ id: "EST-026", status: "confirmed" });
    expect(workspace.stays.find((stay) => stay.id === "EST-025")?.status).toBe("cancelled");
    expect(workspace.enquiries[0].stayId).toBe("EST-026");
  });

  it("allows enquiry corrections within the fixture window and makes them reversible", () => {
    const original = createStayWorkspace();
    const changed = success(updateEnquiry(original, "REQ-024", { preferredUnitId: "faya", startDate: "2026-08-25", endDate: "2026-08-27", guests: 6 }));
    expect(getEnquiryOptions(changed, "REQ-024").find(({ unit }) => unit.id === "faya")?.availability.available).toBe(true);
    expect(success(undoLastChange(changed))).toEqual(original);
    expect(updateEnquiry(original, "REQ-024", { preferredUnitId: "bruma", ...marinaDates, guests: 0 })).toMatchObject({ ok: false, error: "invalid-guests" });
    expect(updateEnquiry(original, "REQ-024", { preferredUnitId: "unknown", ...marinaDates })).toMatchObject({ ok: false, error: "unknown-unit" });
    const confirmed = success(confirmEnquiry(original, "REQ-024", "bruma"));
    expect(updateEnquiry(confirmed, "REQ-024", { preferredUnitId: "bruma", ...marinaDates })).toMatchObject({ ok: false, error: "invalid-transition" });
  });

  it("rejects missing records explicitly", () => {
    const workspace = createStayWorkspace();
    expect(confirmEnquiry(workspace, "missing", "bruma")).toMatchObject({ ok: false, error: "unknown-enquiry" });
    expect(updateEnquiry(workspace, "missing", { preferredUnitId: "bruma", ...marinaDates })).toMatchObject({ ok: false, error: "unknown-enquiry" });
    expect(changeStay(workspace, "missing", { unitId: "bruma", ...marinaDates })).toMatchObject({ ok: false, error: "unknown-stay" });
    expect(cancelStay(workspace, "missing")).toMatchObject({ ok: false, error: "unknown-stay" });
  });
});

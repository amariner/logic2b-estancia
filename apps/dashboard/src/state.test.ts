import { describe, expect, it } from "vitest";
import { canOperate, initialState, parseStored, TOUR_STEP_COUNTS } from "./state";

describe("demo state", () => {
  it("recovers from corrupted storage", () =>
    expect(parseStored("{no", "aurem")).toEqual(initialState("aurem")));
  it("recovers from future versions", () =>
    expect(parseStored('{"version":3}', "terrava")).toEqual(
      initialState("terrava"),
    ));
  it("migrates legacy version-one state and adds the fixture stay", () => {
    const legacy = JSON.stringify({
      version: 1,
      role: "reception",
      enquiry: "booked",
      cleaning: "pending",
      selectedProperty: "all",
    });
    expect(parseStored(legacy, "terrava").version).toBe(2);
    expect(parseStored(legacy, "terrava").enquiry).toBe("booked");
    expect(parseStored(legacy, "terrava").stay).toEqual(
      initialState("terrava").stay,
    );
  });
  it("keeps a valid journey received from the demo website", () => {
    const state = initialState("aurem");
    state.stay = {
      name: "Alex Demo",
      email: "alex@example.test",
      from: "2026-08-14",
      to: "2026-08-17",
      guests: 3,
      amount: 684,
      source: "website",
    };
    expect(parseStored(JSON.stringify(state), "aurem").stay).toEqual(
      state.stay,
    );
  });
  it("rejects malformed shared journey data", () => {
    const state = {
      ...initialState("terrava"),
      stay: {
        name: "",
        email: "bad",
        from: "today",
        to: "tomorrow",
        guests: 99,
        amount: -1,
        source: "website",
      },
    };
    expect(parseStored(JSON.stringify(state), "terrava").stay).toEqual(
      initialState("terrava").stay,
    );
  });
  it("keeps cleaning isolated from reception", () => {
    expect(canOperate("cleaning", "cleaning")).toBe(true);
    expect(canOperate("cleaning", "booking")).toBe(false);
  });
  it("keeps a valid local channel review", () => {
    const state = { ...initialState("aurem"), channelReview: "reviewed" as const };
    expect(parseStored(JSON.stringify(state), "aurem").channelReview).toBe(
      "reviewed",
    );
  });
  it("rejects an unknown channel review state", () => {
    const state = { ...initialState("aurem"), channelReview: "published" };
    expect(parseStored(JSON.stringify(state), "aurem").channelReview).toBe(
      "pending",
    );
  });
  it("keeps a bounded supervised AI draft", () => {
    const state = { ...initialState("aurem"), aiDraft: "Edited locally", aiReview: "reviewed" as const, aiRevision: 2 };
    expect(parseStored(JSON.stringify(state), "aurem")).toMatchObject({ aiDraft: "Edited locally", aiReview: "reviewed", aiRevision: 2 });
  });
  it("rejects invalid AI workflow state", () => {
    const state = { ...initialState("aurem"), aiDraft: "x".repeat(1001), aiReview: "sent", aiRevision: 99 };
    expect(parseStored(JSON.stringify(state), "aurem")).toMatchObject({ aiDraft: null, aiReview: "draft", aiRevision: 1 });
  });
  it("keeps guided progress inside the scenario journey", () => {
    const state = { ...initialState("aurem"), tourMode: "guided" as const, tourStep: TOUR_STEP_COUNTS.aurem - 1 };
    expect(parseStored(JSON.stringify(state), "aurem").tourStep).toBe(6);
  });
  it("rejects negative and out-of-range guided progress", () => {
    for (const tourStep of [-1, TOUR_STEP_COUNTS.terrava, 99]) {
      const state = { ...initialState("terrava"), tourMode: "guided" as const, tourStep };
      expect(parseStored(JSON.stringify(state), "terrava").tourStep).toBeNull();
    }
  });
});

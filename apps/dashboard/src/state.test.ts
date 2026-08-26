import { describe, expect, it } from "vitest";
import { initialState, TOUR_STEP_COUNTS, type Scenario } from "./state";

describe("read-only demo fixtures", () => {
  it.each([
    ["terrava", "Marina Costa", "marina@example.test", 612],
    ["aurem", "Elena Rossi", "elena@example.test", 684],
  ] as const)("starts %s from a fixed fictitious stay", (scenario, name, email, amount) => {
    expect(initialState(scenario).stay).toMatchObject({
      name,
      email,
      amount,
      source: "fixture",
    });
  });

  it.each(["terrava", "aurem"] as const)("starts %s without completed or published demo actions", (scenario: Scenario) => {
    expect(initialState(scenario)).toMatchObject({
      enquiry: "new",
      cleaning: "pending",
      stayOperation: "original",
      maintenance: "new",
      channelReview: "pending",
      aiDraft: null,
      aiReview: "draft",
      completedFlows: [],
      tourStep: null,
    });
  });

  it("keeps guided journey counts aligned with the visible read-only milestones", () => {
    expect(TOUR_STEP_COUNTS).toEqual({ terrava: 3, aurem: 7 });
  });
});

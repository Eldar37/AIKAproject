import {
  calculateGrowthScore,
  calculateLevel,
  detectBusinessStage,
  firstMoneySuggestion,
  updateStreakState
} from "@/lib/business/gamification";

describe("gamification", () => {
  it("calculates levels from XP thresholds", () => {
    expect(calculateLevel(0).name).toBe("Новичок");
    expect(calculateLevel(750).level).toBe(5);
    expect(calculateLevel(4000).name).toBe("Визионер");
  });

  it("detects business stages from progress and revenue", () => {
    expect(detectBusinessStage({ tasksCompleted: 2 })).toBe("START");
    expect(detectBusinessStage({ tasksCompleted: 4, firstSaleDone: true })).toBe("GROWTH");
    expect(detectBusinessStage({ tasksCompleted: 3, monthlyRevenue: 180000 })).toBe("SCALE");
  });

  it("updates daily streaks", () => {
    const lastActive = new Date("2026-05-10T09:00:00.000Z");
    const now = new Date("2026-05-11T09:00:00.000Z");
    expect(updateStreakState(lastActive, now, 2, 2)).toMatchObject({
      current: 3,
      longest: 3,
      daysActiveIncrement: 1
    });
  });

  it("calculates bounded growth scores", () => {
    expect(
      calculateGrowthScore({
        stage: "SCALE",
        tasksCompleted: 100,
        daysActive: 100,
        contentCount: 100,
        firstSaleDone: true
      })
    ).toBe(100);
  });

  it("suggests first money mode after enough start tasks", () => {
    expect(firstMoneySuggestion("START_MODE", 5)).toBe(true);
    expect(firstMoneySuggestion("GROWTH_MODE", 5)).toBe(false);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { countMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
}));

vi.mock("@/app/_lib/prisma", () => ({
  db: {
    transaction: {
      count: countMock,
    },
  },
}));

import {
  FREE_MONTHLY_TRANSACTION_LIMIT,
  validateFreePlanTransactionLimit,
} from "./plan-limit";

describe("validateFreePlanTransactionLimit", () => {
  beforeEach(() => {
    countMock.mockReset();
  });

  it("blocks the 11th transaction for a free-plan user", async () => {
    countMock.mockResolvedValue(FREE_MONTHLY_TRANSACTION_LIMIT);

    const result = await validateFreePlanTransactionLimit({
      date: new Date("2026-03-11T10:00:00.000Z"),
      isPremium: false,
      userId: "user-free",
    });

    expect(result).toBe(
      `Você atingiu o limite de ${FREE_MONTHLY_TRANSACTION_LIMIT} transações para o plano gratuito neste mês.`,
    );
    expect(countMock).toHaveBeenCalledTimes(1);
    expect(countMock).toHaveBeenCalledWith({
      where: {
        userId: "user-free",
        date: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
    });
  });

  it("allows unlimited transactions for a premium user", async () => {
    const result = await validateFreePlanTransactionLimit({
      date: new Date("2026-03-11T10:00:00.000Z"),
      isPremium: true,
      userId: "user-premium",
    });

    expect(result).toBeNull();
    expect(countMock).not.toHaveBeenCalled();
  });
});

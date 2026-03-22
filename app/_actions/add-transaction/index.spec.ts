import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

const {
  createMock,
  updateManyMock,
  getServerSessionMock,
  revalidatePathMock,
  validateFreePlanTransactionLimitMock,
  authOptionsMock,
} = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateManyMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  validateFreePlanTransactionLimitMock: vi.fn(),
  authOptionsMock: { mocked: true },
}));

vi.mock("@/app/_lib/prisma", () => ({
  db: {
    transaction: {
      create: createMock,
      updateMany: updateManyMock,
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("./plan-limit", () => ({
  validateFreePlanTransactionLimit: validateFreePlanTransactionLimitMock,
}));

vi.mock("@/app/_lib/auth", () => ({
  authOptions: authOptionsMock,
}));

import { upsertTransaction } from "./index";

const basePayload = {
  name: "Salario",
  amount: 1000,
  type: TransactionType.DEPOSIT,
  category: TransactionCategory.SALARY,
  paymentMethod: TransactionPaymentMethod.PIX,
  date: new Date("2026-03-11T10:00:00.000Z"),
};

describe("upsertTransaction", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateManyMock.mockReset();
    getServerSessionMock.mockReset();
    revalidatePathMock.mockReset();
    validateFreePlanTransactionLimitMock.mockReset();
  });

  it("returns unauthorized when there is no authenticated user", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const result = await upsertTransaction(basePayload);

    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
    expect(getServerSessionMock).toHaveBeenCalledWith(authOptionsMock);
    expect(createMock).not.toHaveBeenCalled();
    expect(updateManyMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("creates a transaction with the user id from the session", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "session-user",
        subscriptionStatus: "active",
      },
    });
    validateFreePlanTransactionLimitMock.mockResolvedValue(null);
    createMock.mockResolvedValue({ id: "tx-1" });

    const result = await upsertTransaction({
      ...basePayload,
      userId: "payload-user",
    });

    expect(result).toEqual({
      success: true,
      error: null,
    });
    expect(validateFreePlanTransactionLimitMock).toHaveBeenCalledWith({
      date: basePayload.date,
      isPremium: true,
      userId: "session-user",
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        ...basePayload,
        userId: "session-user",
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/transactions");
  });

  it("blocks transaction creation when the free-plan limit is reached", async () => {
    const planLimitError =
      "Você atingiu o limite de 10 transações para o plano gratuito neste mês.";

    getServerSessionMock.mockResolvedValue({
      user: {
        id: "free-user",
        subscriptionStatus: "inactive",
      },
    });
    validateFreePlanTransactionLimitMock.mockResolvedValue(planLimitError);

    const result = await upsertTransaction(basePayload);

    expect(result).toEqual({
      success: false,
      error: planLimitError,
    });
    expect(validateFreePlanTransactionLimitMock).toHaveBeenCalledWith({
      date: basePayload.date,
      isPremium: false,
      userId: "free-user",
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(updateManyMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("uses ownership protection when updating a transaction", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "owner-user",
        subscriptionStatus: "active",
      },
    });
    updateManyMock.mockResolvedValue({ count: 1 });

    const result = await upsertTransaction({
      ...basePayload,
      id: "tx-123",
    });

    expect(result).toEqual({
      success: true,
      error: null,
    });
    expect(validateFreePlanTransactionLimitMock).not.toHaveBeenCalled();
    expect(updateManyMock).toHaveBeenCalledWith({
      where: {
        id: "tx-123",
        userId: "owner-user",
      },
      data: basePayload,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/transactions");
  });

  it("returns an error when the transaction to update is not found", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "owner-user",
        subscriptionStatus: "active",
      },
    });
    updateManyMock.mockResolvedValue({ count: 0 });

    const result = await upsertTransaction({
      ...basePayload,
      id: "missing-tx",
    });

    expect(result).toEqual({
      success: false,
      error: "Transaction not found",
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns the validation error when the payload is invalid", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "session-user",
        subscriptionStatus: "active",
      },
    });

    const result = await upsertTransaction({
      ...basePayload,
      amount: 0,
    });

    expect(result).toEqual({
      success: false,
      error: "O valor deve ser positivo",
    });
    expect(validateFreePlanTransactionLimitMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(updateManyMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

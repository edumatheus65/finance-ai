import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteManyMock,
  getServerSessionMock,
  revalidatePathMock,
  authOptionsMock,
} = vi.hoisted(() => ({
  deleteManyMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  authOptionsMock: { mocked: true },
}));

vi.mock("@/app/_lib/prisma", () => ({
  db: {
    transaction: {
      deleteMany: deleteManyMock,
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/app/_lib/auth", () => ({
  authOptions: authOptionsMock,
}));

import { deleteTransaction } from "./index";

describe("deleteTransaction", () => {
  beforeEach(() => {
    deleteManyMock.mockReset();
    getServerSessionMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("returns Unauthorized when there is no authenticated user", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const result = await deleteTransaction("tx-123");

    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
    expect(getServerSessionMock).toHaveBeenCalledWith(authOptionsMock);
    expect(deleteManyMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns an error when the transaction id is invalid", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "owner-user",
      },
    });

    const result = await deleteTransaction("   ");

    expect(result).toEqual({
      success: false,
      error: "Invalid transaction id",
    });
    expect(deleteManyMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("deletes only the authenticated user's transaction", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "owner-user",
      },
    });
    deleteManyMock.mockResolvedValue({ count: 1 });

    const result = await deleteTransaction(" tx-123 ");

    expect(result).toEqual({
      success: true,
      error: null,
    });
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        id: "tx-123",
        userId: "owner-user",
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/transactions");
  });

  it("returns an error when the transaction is not found", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "owner-user",
      },
    });
    deleteManyMock.mockResolvedValue({ count: 0 });

    const result = await deleteTransaction("tx-missing");

    expect(result).toEqual({
      success: false,
      error: "Transaction not found",
    });
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        id: "tx-missing",
        userId: "owner-user",
      },
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

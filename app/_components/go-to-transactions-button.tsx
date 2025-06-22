"use client";

import { useRouter } from "next/navigation";

const GoToTransactionButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/transactions");
  };
  return (
    <button
      onClick={handleClick}
      className="bg-white text-black px-4 py-2 rounded"
    >
      Ir para transações
    </button>
  );
};

export default GoToTransactionButton;

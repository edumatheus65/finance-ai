"use client";

import Image from "next/image";
import Link from "next/link";
import UserButton from "./user-button";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {/* Esquerda */}
      <div className="flex items-center gap-10">
        <Image src="/logo.svg" width={173} height={39} alt="Finance AI" />
        <Link
          href="/"
          className={
            pathname === "/"
              ? "text-primary font-bold"
              : "text-muted-foreground"
          }
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={
            pathname === "/transactions"
              ? "text-primary font-bold"
              : "text-muted-foreground"
          }
        >
          Transações
        </Link>
        <Link
          href="subscription"
          className={
            pathname === "/subscription"
              ? "text-primary font-bold"
              : "text-muted-foreground"
          }
        >
          Assinaturas
        </Link>
      </div>

      {/* Direita */}
      <UserButton />
    </nav>
  );
};

export default NavBar;

import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {/* Esquerda */}
      <div className="flex items-center gap-10">
        <Image src="/logo.svg" width={173} height={39} alt="Finance AI" />
        <Link href="/">Dashboard</Link>
        <Link href="/transactions">Transações</Link>
        <Link href="subscriptions">Assinaturas</Link>
      </div>

      {/* Direita */}
      {/* Colocar um UserBUtton aqui */}
    </nav>
  );
};

export default NavBar;

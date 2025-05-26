"use client";

import Image from "next/image";
import { Button } from "../_components/ui/button";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const handleLoginWithGoogleClick = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="grid h-full grid-cols-2">
      {/* Esquerda */}
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/finance.svg"
          width={173}
          height={39}
          alt="Finance"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>

        <p className="text-muted-foreground mb-6">
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>

        <Button className="mr-2" onClick={handleLoginWithGoogleClick}>
          Fazer Login ou Criar Conta
        </Button>
      </div>
      {/* Direira */}
      <div className="relative h-full w-full">
        <Image
          src="/login.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;

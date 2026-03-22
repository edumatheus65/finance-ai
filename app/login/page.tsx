"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "../_components/ui/button";
import { signIn } from "next-auth/react";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Este e-mail já está em uso por outro método de login. Tente entrar com o método que você usou originalmente.",
};

const LoginContent = () => {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : null;

  const handleLoginWithGoogleClick = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="grid h-full grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
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

        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button className="mr-2" onClick={handleLoginWithGoogleClick}>
          Fazer Login ou Criar Conta
        </Button>
      </div>
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

const LoginPage = () => {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;

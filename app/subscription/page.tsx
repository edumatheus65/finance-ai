import { getServerSession } from "next-auth";
import NavBar from "../_components/navbar";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "../_components/ui/button";
import AcquirePlanButton from "./_components/acquire-plan-button";
import { Badge } from "../_components/ui/badge";
import { db } from "../_lib/prisma";
import { getMonthDateRange } from "../_lib/date-utils";

const FREE_MONTHLY_TRANSACTION_LIMIT = 10;

const SubscriptionsPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const { from, to } = getMonthDateRange(String(new Date().getMonth() + 1));

  const currentMonthTransactionsCount = await db.transaction.count({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
  });

  const hasPremium = session?.user?.subscriptionStatus === "active";
  return (
    <>
      <NavBar />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="flex gap-6">
          <Card className="w-[450px]">
            <CardHeader className="border-b border-solid py-8">
              <h2 className="text-center text-2xl font-semibold">
                Plano Básico
              </h2>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">0</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>
                  Apenas {FREE_MONTHLY_TRANSACTION_LIMIT} transações por mês (
                  {currentMonthTransactionsCount}/
                  {FREE_MONTHLY_TRANSACTION_LIMIT})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon />
                <p>Relatórios de IA</p>
              </div>
              <Button
                variant="darkOutline"
                className="w-full rounded-full text-primary"
              >
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
          <Card className="w-[450px]">
            <CardHeader className="border-b border-solid py-8 relative">
              {hasPremium && (
                <Badge className="absolute top-4 left-4 bg-primary/10 text-primary">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-2xl fontsemibold">Plano Pro</h2>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">19</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                Relatório de IA ilimitado
              </div>
              <AcquirePlanButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionsPage;

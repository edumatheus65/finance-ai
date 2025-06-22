import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./_components/LogoutButton";
import GoToTransactionButton from "./_components/go-to-transactions-button";
import { redirect } from "next/navigation";
import NavBar from "./_components/navbar";

const Home = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/login");
  }

  return (
    <>
      <NavBar />
      <div className="p-4 space-y-4 justify-between">
        OLá, {session?.user?.name}
        <LogoutButton />
        <GoToTransactionButton />
      </div>
    </>
  );
};

export default Home;

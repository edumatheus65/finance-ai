import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "./_components/LogoutButton";

const Home = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  return (
    <div className="p-4 space-y-4">
      OLá, {session.user?.name}
      <LogoutButton />
    </div>
  );
};

export default Home;

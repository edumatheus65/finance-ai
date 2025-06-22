import { getServerSession } from "next-auth";
import NavBar from "../_components/navbar";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const SubscriptionsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/login");
  }
  return <NavBar />;
};

export default SubscriptionsPage;

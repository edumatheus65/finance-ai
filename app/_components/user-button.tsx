"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { motion } from "framer-motion";

const UserButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <Skeleton className="w-full h-full rounded-full bg-white/10" />
      </div>
    );
  }

  if (!session?.user) return null;

  const { name, email, image } = session.user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="border border-white/20">
          <AvatarImage src={image ?? ""} alt={name ?? "User"} />
          <AvatarFallback className="bg-white/10 text-white font-medium">
            {name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-2 mr-2 bg-zinc-900 text-white border border-white/10"
        align="end"
        asChild
      >
        <motion.div>
          <div className="px-3 py-2">
            <p className="text-sm font-medium leading-none text-white">
              {name}
            </p>
            <p className="text-xs text-zinc-400 truncate">{email}</p>
          </div>
          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">
            <User className="mr-2 h-4 w-4 text-white" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 hover:bg-zinc-800"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4 text-red-500" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;

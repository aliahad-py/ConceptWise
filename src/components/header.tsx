
"use client";

import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function UserNav() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (displayName: string | null, email: string) => {
    if (displayName) {
        const names = displayName.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.length > 0 ? initials.substring(0, 2).toUpperCase() : email.substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : "U";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || ""} />}
            <AvatarFallback>{getInitials(user.displayName, user.email || "")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'Account'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/studio/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  return (
    <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              ConceptWise
            </h1>
            <p className="text-sm text-muted-foreground">
              Turn your notes into clear, connected concepts.
            </p>
          </div>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, loginWithGitHub, logout, type User } from "@/lib/api";
import { ModeToggle } from "./ModeToggle";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Dotfiles Manager</span>
          </a>
          <nav className="hidden md:flex gap-6">
            <a
              href="/templates"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Templates
            </a>
            <a
              href="/organizations"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Organizations
            </a>
            <a
              href="/docs/cli"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Docs
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.username || user.name} />
                    <AvatarFallback>
                      {(user.username || user.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name || user.username || 'User'}</p>
                    {user.username && (
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/create-template">Create Template</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/favorites">My Favorites</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/organizations">My Organizations</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={loginWithGitHub}>
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Sign in with GitHub
            </Button>
          )}
            <ModeToggle />
        </div>
      </div>
    </header>
  );
}

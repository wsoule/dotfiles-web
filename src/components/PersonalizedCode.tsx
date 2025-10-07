import { useState, useEffect } from "react";
import { CodeBlock } from "./CodeBlock";
import { getCurrentUser, type User } from "@/lib/api";

interface PersonalizedCodeProps {
  template: string;
  className?: string;
}

export function PersonalizedCode({ template, className }: PersonalizedCodeProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const personalizeTemplate = (template: string, user: User | null): string => {
    if (!user) return template;

    let personalized = template;

    // Replace email placeholders
    if (user.email) {
      personalized = personalized.replace(/your@email\.com/g, user.email);
    }

    // Replace username placeholders
    if (user.username) {
      personalized = personalized.replace(/your-username/g, user.username);
    }

    // Replace GitHub repo placeholders
    if (user.username) {
      personalized = personalized.replace(
        /github\.com\/your-username\/your-dotfiles\.git/g,
        `github.com/${user.username}/dotfiles.git`
      );
    }

    return personalized;
  };

  if (loading) {
    return (
      <div className={`rounded-lg bg-muted p-4 animate-pulse ${className}`}>
        <div className="h-20 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  const code = personalizeTemplate(template, user);

  return <CodeBlock code={code} className={className} client:load />;
}

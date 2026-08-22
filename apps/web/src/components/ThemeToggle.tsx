"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@musicmotion/ui";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-white/10 bg-white/5 opacity-50"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle Dark/Light Mode"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-800 transition-all" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

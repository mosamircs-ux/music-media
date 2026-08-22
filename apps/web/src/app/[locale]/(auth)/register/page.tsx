"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Music2, Lock, Mail, User } from "lucide-react";
import { Button, Card, Input } from "@musicmotion/ui";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-lg shadow-rose-500/25">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{t("registerTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("registerSubtitle")}</p>
        </div>

        <Card className="border-white/10 bg-card/70 p-6 backdrop-blur-2xl shadow-2xl rounded-3xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t("name")}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Creator"
                  required
                  className="h-11 pl-10 text-xs rounded-xl bg-background/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@creator.io"
                  required
                  className="h-11 pl-10 text-xs rounded-xl bg-background/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pl-10 text-xs rounded-xl bg-background/80"
                />
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground">
              By creating an account, you agree to our Terms of Service & Jamendo License Rules.
            </div>

            <Button
              type="submit"
              variant="gradient"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-rose-500/20 text-sm mt-2"
            >
              {isLoading ? "Creating Account..." : t("signUp")}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-bold text-rose-400 hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

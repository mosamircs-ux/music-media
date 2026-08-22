"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Music2, Lock, Mail } from "lucide-react";
import { Button, Card, Input, Switch } from "@musicmotion/ui";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
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
        {/* Brand Icon Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-lg shadow-rose-500/25">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{t("loginTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        <Card className="border-white/10 bg-card/70 p-6 backdrop-blur-2xl shadow-2xl rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@musicmotion.ai"
                  required
                  className="h-11 pl-10 text-xs rounded-xl bg-background/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">{t("password")}</label>
                <Link href="/forgot-password" className="text-[11px] text-rose-400 hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
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

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={rememberMe} onCheckedChange={setRememberMe} />
                <span className="text-xs text-muted-foreground">{t("rememberMe")}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-rose-500/20 text-sm mt-2"
            >
              {isLoading ? "Signing In..." : t("signIn")}
            </Button>
          </form>

          <div className="relative my-6 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border/40">
            <span className="relative z-10 bg-card px-3 text-muted-foreground font-semibold">
              {t("orContinueWith")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-10 text-xs rounded-xl border-white/10"
            >
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-10 text-xs rounded-xl border-white/10"
            >
              GitHub
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-bold text-rose-400 hover:underline">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}

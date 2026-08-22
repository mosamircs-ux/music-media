"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Music2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button, Card, Input } from "@musicmotion/ui";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  const [email, setEmail] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-lg shadow-rose-500/25">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{t("forgotTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("forgotSubtitle")}</p>
        </div>

        <Card className="border-white/10 bg-card/70 p-6 backdrop-blur-2xl shadow-2xl rounded-3xl">
          {isSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Reset Link Sent!</h3>
                <p className="text-xs text-muted-foreground">
                  Check your inbox at <span className="font-semibold text-foreground">{email}</span> for instructions to reset your password.
                </p>
              </div>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="outline" className="rounded-xl text-xs">
                  {t("backToLogin")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                variant="gradient"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-bold shadow-lg shadow-rose-500/20 text-sm mt-2"
              >
                {isLoading ? "Sending Link..." : t("sendReset")}
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("backToLogin")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

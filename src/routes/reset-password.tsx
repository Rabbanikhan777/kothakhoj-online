import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — KothaKhoj.com" },
      { name: "description", content: "Choose a new password for your KothaKhoj account and get back to browsing and listing property across Nepal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password !== String(fd.get("confirm"))) {
      return toast.error("Passwords do not match.");
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl bg-gradient-card p-8 shadow-elegant">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">Set a new password</h1>
          <p className="text-sm text-muted-foreground">
            {ready ? "Enter your new password below." : "Open this page from the reset link in your email."}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="password">New password (min 6 chars)</Label>
            <Input id="password" name="password" type="password" minLength={6} required disabled={!ready} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" name="confirm" type="password" minLength={6} required disabled={!ready} />
          </div>
          <Button className="w-full bg-gradient-hero text-primary-foreground" disabled={loading || !ready}>
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

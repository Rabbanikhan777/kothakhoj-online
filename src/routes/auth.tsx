import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — KothaKhali.com" }] }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(search.mode === "signup" ? "signup" : "signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(fd.get("full_name") || "") },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Check your email if verification is enabled.");
    navigate({ to: "/dashboard" });
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message ?? "Google sign in failed");
    if (!res.redirected && !res.error) navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl bg-gradient-card p-8 shadow-elegant">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Home className="h-6 w-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">Welcome to KothaKhali</h1>
          <p className="text-sm text-muted-foreground">Sign in or create your account to continue</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-3 pt-4">
              <div>
                <Label htmlFor="email-in">Email</Label>
                <Input id="email-in" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="password-in">Password</Label>
                <Input id="password-in" name="password" type="password" required />
              </div>
              <Button className="w-full bg-gradient-hero text-primary-foreground" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 pt-4">
              <div>
                <Label htmlFor="name-up">Full name</Label>
                <Input id="name-up" name="full_name" required />
              </div>
              <div>
                <Label htmlFor="email-up">Email</Label>
                <Input id="email-up" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="password-up">Password (min 6 chars)</Label>
                <Input id="password-up" name="password" type="password" minLength={6} required />
              </div>
              <Button className="w-full bg-gradient-hero text-primary-foreground" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

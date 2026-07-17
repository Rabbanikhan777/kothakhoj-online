import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Camera, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "Sell Your Property — KothaKhoj.com" }, { name: "description", content: "List your property on Nepal's leading real estate marketplace." }] }),
  component: SellPage,
});

function SellPage() {
  return (
    <div>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Sell your property faster on KothaKhoj
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-primary-foreground/85">
            Reach thousands of serious buyers and renters across Nepal. It's free to list.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/add-property">List your property</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: 1, icon: Users, t: "Create an account", d: "Sign up in 30 seconds with email or Google." },
            { n: 2, icon: Camera, t: "Add your listing", d: "Add photos, price, and details in one form." },
            { n: 3, icon: Zap, t: "Reach buyers", d: "Your listing goes live instantly for buyers to discover." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl bg-gradient-card p-6 shadow-soft">
              <div className="text-xs font-semibold text-primary">STEP {s.n}</div>
              <div className="mt-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-accent/40 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">What you get</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Free unlimited listings",
                "Featured placement options",
                "Direct buyer/tenant contact",
                "Analytics on views and enquiries",
                "Nepal-focused audience",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-card p-8 shadow-elegant">
            <h3 className="font-display text-xl font-semibold">Ready to list?</h3>
            <p className="mt-2 text-muted-foreground">Sign in and add your property in minutes.</p>
            <Button asChild size="lg" className="mt-4 bg-gradient-hero text-primary-foreground">
              <Link to="/add-property">List your property</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

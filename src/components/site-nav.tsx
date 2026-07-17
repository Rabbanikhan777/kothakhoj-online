import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Menu, X, Building2, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/buy", label: "Buy" },
  { to: "/rent", label: "Rent" },
  { to: "/sell", label: "Sell" },
  { to: "/contact", label: "Contact" },
];

export function SiteNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
            <Home className="h-5 w-5" />
          </span>
          <span>
            KothaKhali<span className="text-brand-navy">.com</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-primary"
              activeProps={{ className: "bg-accent text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-hero text-primary-foreground shadow-soft">
                <Link to="/add-property">
                  <Building2 className="mr-1 h-4 w-4" /> List Property
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">
                  <LogIn className="mr-1 h-4 w-4" /> Sign in
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-hero text-primary-foreground shadow-soft">
                <Link to="/auth" search={{ mode: "signup" }}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-md p-2 text-foreground hover:bg-accent"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-2">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-gradient-hero text-primary-foreground" onClick={() => setOpen(false)}>
                    <Link to="/add-property">List Property</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-gradient-hero text-primary-foreground" onClick={() => setOpen(false)}>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

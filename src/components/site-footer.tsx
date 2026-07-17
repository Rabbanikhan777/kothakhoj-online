import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-brand-navy text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground text-brand-navy">
              <Home className="h-5 w-5" />
            </span>
            KothaKhali.com
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Nepal's modern property marketplace. Buy, rent, and sell homes across the country.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/buy" className="hover:text-primary-foreground">Buy Properties</Link></li>
            <li><Link to="/rent" className="hover:text-primary-foreground">Rent Properties</Link></li>
            <li><Link to="/sell" className="hover:text-primary-foreground">Sell Property</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/contact" className="hover:text-primary-foreground">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-primary-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Get in touch</h4>
          <p className="text-sm text-primary-foreground/80">Putalisadak, Kathmandu</p>
          <p className="text-sm text-primary-foreground/80">+977-1-4000000</p>
          <p className="text-sm text-primary-foreground/80">hello@kothakhoj.com</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} KothaKhali.com — All rights reserved.
      </div>
    </footer>
  );
}

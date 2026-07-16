import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Kothakhali.com" }, { name: "description", content: "Get in touch with the Kothakhali team." }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  return (
    <div>
      <section className="bg-gradient-hero py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-4xl font-bold">Contact us</h1>
          <p className="mt-2 max-w-xl text-primary-foreground/85">
            Questions, partnerships, or feedback — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="space-y-6">
          <ContactItem icon={MapPin} title="Office" text="Putalisadak, Kathmandu, Nepal" />
          <ContactItem icon={Phone} title="Phone" text="+977-1-4000000" />
          <ContactItem icon={Mail} title="Email" text="hello@kothakhali.com" />
          <div className="rounded-2xl bg-gradient-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Business hours</h3>
            <p className="mt-2 text-sm text-muted-foreground">Sunday – Friday, 9 AM – 6 PM (NPT)</p>
          </div>
        </div>

        <form
          className="rounded-2xl bg-gradient-card p-6 shadow-elegant"
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => {
              setSending(false);
              toast.success("Message sent — we'll get back to you soon!");
              setForm({ name: "", email: "", message: "" });
            }, 700);
          }}
        >
          <h2 className="font-display text-2xl font-semibold">Send a message</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground" size="lg" disabled={sending}>
              <Send className="mr-1 h-4 w-4" /> {sending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ContactItem({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

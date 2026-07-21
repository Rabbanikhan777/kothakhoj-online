import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPushSupported, subscribeToPush, unsubscribeFromPush, currentSubscriptionEndpoint } from "@/lib/push";
import { toast } from "sonner";

export function PushToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isPushSupported());
    currentSubscriptionEndpoint().then((e) => setEnabled(!!e));
  }, []);

  async function toggle() {
    setLoading(true);
    if (enabled) {
      await unsubscribeFromPush();
      setEnabled(false);
      toast.success("Notifications turned off");
    } else {
      const res = await subscribeToPush();
      if (res.ok) {
        setEnabled(true);
        toast.success("Notifications enabled");
      } else {
        toast.error(res.message || "Could not enable notifications");
      }
    }
    setLoading(false);
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Push notifications aren't supported in this browser.
      </div>
    );
  }

  return (
    <Button variant={enabled ? "outline" : "default"} className={enabled ? "" : "bg-gradient-hero text-primary-foreground"} onClick={toggle} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : enabled ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
      {enabled ? "Turn off notifications" : "Enable notifications"}
    </Button>
  );
}

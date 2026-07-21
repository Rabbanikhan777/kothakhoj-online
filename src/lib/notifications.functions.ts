import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendPushNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; body: string; url?: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth_key");
    if (error) throw error;

    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:owner@example.com",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url || "/",
    });

    let sent = 0;
    let removed = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
          payload
        );
        sent++;
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          removed++;
        }
      }
    }
    return { sent, removed, total: subs?.length ?? 0 };
  });

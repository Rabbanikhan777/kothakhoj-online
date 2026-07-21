import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY } from "./vapid";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("SW registration failed", e);
    return null;
  }
}

export async function subscribeToPush(): Promise<{ ok: boolean; message?: string }> {
  if (!isPushSupported()) return { ok: false, message: "Push notifications aren't supported in this browser." };
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, message: "Notification permission denied." };
  const reg = (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker());
  if (!reg) return { ok: false, message: "Service worker registration failed." };
  await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("push_subscriptions" as never).upsert(
    {
      endpoint: json.endpoint!,
      p256dh: json.keys?.p256dh!,
      auth_key: json.keys?.auth!,
      user_id: userData.user?.id ?? null,
      user_agent: navigator.userAgent,
    } as never,
    { onConflict: "endpoint" } as never
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_subscriptions" as never).delete().eq("endpoint" as never, sub.endpoint);
    await sub.unsubscribe();
  }
}

export async function currentSubscriptionEndpoint(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub?.endpoint ?? null;
}

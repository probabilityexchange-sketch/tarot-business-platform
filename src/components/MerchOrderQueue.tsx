"use client";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-client";

type Order = { id: string; status: string; createdAt: string; totalCents: number; shippingCents: number; taxCents: number; printifyOrderId?: string; address: { first_name: string; last_name: string; email: string; address1: string; address2?: string; city: string; region: string; zip: string }; lines: { name: string; variant: string; quantity: number }[] };
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
export function MerchOrderQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  async function load() {
    setBusy(true); setMessage("");
    try { const response = await adminFetch("/api/admin/merch/orders"); if (!response.ok) throw new Error("Unable to load orders."); const result = await response.json(); setOrders(result.orders); setLoaded(true); }
    catch { setMessage("Unable to load orders. Please try again."); } finally { setBusy(false); }
  }
  async function act(id: string, action: "transfer" | "reconcile") {
    if (!confirmed[id]) return;
    setBusy(true); setMessage("");
    try {
      const response = await adminFetch("/api/admin/merch/orders", { method: "POST", body: JSON.stringify({ id, action, manualApprovalConfirmed: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load(); setMessage("Printify status checked. Production still requires approval in Printify. If an order needs attention, review it there before doing anything else.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update order."); } finally { setBusy(false); }
  }
  return <section className="space-y-5 border-t border-current/20 pt-8"><h2 className="font-serif text-3xl">Paid orders awaiting review</h2><p className="text-sm leading-relaxed">Payments arrive here first. Review the items and address, confirm Printify still uses Manual approval, then transfer the order. You will make the final production decision in Printify. A transfer with an uncertain result must be reconciled, never blindly retried.</p><button disabled={busy} onClick={() => void load()} className="rounded-full border border-current/30 px-5 py-3 disabled:opacity-50">{busy ? "Working…" : "Refresh paid orders"}</button>{loaded && orders.length === 0 && <p>No paid merchandise orders yet.</p>}
    {orders.map((order) => <article key={order.id} className="space-y-4 rounded-xl border border-current/20 p-5"><h3 className="break-all font-medium">{order.id}</h3><p>{order.status.replaceAll("_", " ")} · {money(order.totalCents)}</p><ul>{order.lines.map((line, index) => <li key={index}>{line.quantity} × {line.name} — {line.variant}</li>)}</ul><p>{order.address.first_name} {order.address.last_name}<br />{order.address.address1} {order.address.address2}<br />{order.address.city}, {order.address.region} {order.address.zip}<br />{order.address.email}</p><p className="text-sm">Shipping {money(order.shippingCents)} · Tax {money(order.taxCents)}</p>
      {order.printifyOrderId ? <p className="break-all">Printify reference: {order.printifyOrderId}. Review and approve production in Printify.</p> : <><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={Boolean(confirmed[order.id])} onChange={(event) => setConfirmed({ ...confirmed, [order.id]: event.target.checked })} /><span>I reviewed this order and confirmed Printify’s store approval is still Manual.</span></label>{order.status === "paid_awaiting_review" && <button disabled={busy || !confirmed[order.id]} onClick={() => void act(order.id, "transfer")} className="rounded-full bg-[#653c56] px-5 py-3 text-white disabled:opacity-50">Send to Printify for manual approval</button>}{["transfer_in_progress", "transfer_uncertain"].includes(order.status) && <button disabled={busy || !confirmed[order.id]} onClick={() => void act(order.id, "reconcile")} className="rounded-full border border-current/30 px-5 py-3 disabled:opacity-50">Check Printify—do not resubmit</button>}</>}
    </article>)}{message && <p role="status">{message}</p>}
  </section>;
}

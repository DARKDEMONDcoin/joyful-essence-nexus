import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, ChevronRight, Copy, Sparkle } from "lucide-react";
import {
  EmptyState,
  MIN_PAYOUT,
  fmtDate,
  statusLabel,
  useReferrals,
  INK,
  YELLOW,
  PINK,
  MINT,
  LAVENDER,
  PEACH,
  SURFACE,
  SURFACE_2,
  BORDER,
  TEXT,
  MUTED,
} from "../ReferralsPage";

const AVATAR_TONES = [LAVENDER, PINK, YELLOW, MINT, PEACH];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return isDesktop;
}

export default function DashboardTab() {
  const navigate = useNavigate();
  const {
    totalEarned,
    available,
    committed,
    signups,
    canWithdraw,
    refs,
    earns,
    wds,
    link,
    justCopied,
    copyLink,
    openPromoter,
  } = useReferrals();
  const [tab, setTab] = useState<"referrals" | "earnings" | "withdrawals">("referrals");
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const progressTarget = 25;
    const progressPct = Math.min(100, (signups / progressTarget) * 100);
    const SectionLabel = ({ children }: { children: React.ReactNode }) => (
      <div className="flex items-center gap-2 justify-start">
        <Sparkle className="h-3 w-3 text-white/80" strokeWidth={1.5} />
        <span className="uppercase tracking-[0.22em] text-[11px] text-white/80">{children}</span>
        <Sparkle className="h-3 w-3 text-white/80" strokeWidth={1.5} />
      </div>
    );
    return (
      <section
        className="grid grid-cols-12 gap-4 md:gap-5"
        style={{
          color: "#ffffff",
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Quick stats — col-7 */}
        <div className="pf-noise-overlay relative overflow-hidden col-span-12 lg:col-span-7 rounded-2xl flex flex-col bg-[#324444]">
          <div className="relative z-10 p-5 md:p-6">
            <SectionLabel>Quick Overview</SectionLabel>
          </div>
          <div className="relative z-10 grid grid-cols-3 px-5 md:px-6">
            {[
              { label: "Signups", value: signups.toString() },
              { label: "Available", value: `$${available.toFixed(2)}` },
              { label: "Pending Payouts", value: `$${committed.toFixed(2)}` },
            ].map((s, i) => (
              <div
                key={s.label}
                className="py-2"
                style={{
                  borderLeft: i === 0 ? undefined : "1px solid rgba(255,255,255,0.12)",
                  paddingLeft: i === 0 ? 0 : "1.25rem",
                  paddingRight: "1.25rem",
                }}
              >
                <div className="text-[10.5px] uppercase tracking-[0.18em] mb-2 text-white/60">
                  {s.label}
                </div>
                <div
                  className="text-[26px] font-light tracking-tight tabular-nums text-white"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-auto p-5 md:p-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">VIP Promoter</p>
              <p className="text-[13.5px] font-medium mt-1 text-white">
                Reach up to 50% commission
              </p>
            </div>
            <button
              onClick={openPromoter}
              className="lg-liquid-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] text-white"
            >
              Apply via WhatsApp <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Referral Progress — col-5 */}
        <div className="pf-noise-overlay relative overflow-hidden col-span-12 lg:col-span-5 p-5 md:p-6 rounded-2xl flex flex-col justify-between bg-[#324444]">
          <div className="relative z-10">
            <SectionLabel>Referral Progress</SectionLabel>
            <div
              className="mt-4 text-[40px] font-light tracking-tight tabular-nums text-white"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
            >
              {signups} <span className="text-white/45">/ {progressTarget}</span>
            </div>
            <p className="text-[12px] mt-1 mb-5 text-white/65">
              Reach {progressTarget} referrals to unlock Pro tier perks
            </p>
            <div className="h-1.5 w-full rounded-full overflow-hidden mb-2 bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.5), #ffffff)",
                  boxShadow: "0 0 12px rgba(255,255,255,0.25)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/55">
              <span>Starter</span>
              <span>Pro</span>
            </div>
          </div>
          <div className="lg-liquid-glass relative z-10 mt-5 p-3.5 rounded-xl flex items-center gap-3">
            <span className="text-[12px] text-white/80">
              Total earned:{" "}
              <span className="font-semibold text-white">${totalEarned.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Activity — col-12 (obsidian card with noise overlay border lines) */}
        <div className="pf-noise-overlay relative overflow-hidden col-span-12 rounded-2xl bg-[#324444]">
          <div className="relative z-10 px-5 md:px-6 py-5 flex justify-between items-center">
            <h3 className="font-medium text-[14px] text-white">
              Recent Activity
            </h3>
            <div className="lg-liquid-glass flex gap-1 p-1 rounded-full">
              {(
                [
                  ["referrals", "Referrals", refs.length],
                  ["earnings", "Earnings", earns.length],
                  ["withdrawals", "Payouts", wds.length],
                ] as const
              ).map(([k, label, count]) => {
                const active = tab === k;
                return (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className="px-3 py-1 text-[11px] font-medium rounded-full transition"
                    style={{
                      backgroundColor: active ? "#ffffff" : "transparent",
                      color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {label}
                    <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10">
          {tab === "referrals" &&
            (refs.length === 0 ? (
              <EmptyState title="No referrals yet" hint="Share your link to start earning." />
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr
                    className="text-[10px] uppercase tracking-widest text-white/55"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <th className="px-6 py-3 font-medium">Referral</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {refs.map((r, i) => (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-white/5"
                      style={{ borderBottom: i < refs.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
                    >
                      <td className="px-6 py-3.5 text-[13.5px] text-white">Friend #{i + 1}</td>
                      <td className="px-6 py-3.5 text-[13px] text-white/55">
                        {fmtDate(r.created_at)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                          style={
                            r.status === "approved" || r.status === "active"
                              ? {
                                  backgroundColor: "rgba(255,255,255,0.12)",
                                  color: "#ffffff",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                }
                              : {
                                  backgroundColor: "rgba(255,255,255,0.06)",
                                  color: "rgba(255,255,255,0.75)",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                }
                          }
                        >
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-3.5 text-right text-[13px] font-medium tabular-nums text-white"
                      >
                        —
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}

          {tab === "earnings" &&
            (earns.length === 0 ? (
              <EmptyState title="No earnings yet" hint="Commissions appear after a friend subscribes." />
            ) : (
              <ul>
                {earns.map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between px-6 py-3.5"
                    style={{ borderBottom: i < earns.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
                  >
                    <div>
                      <p className="text-[13.5px] font-medium text-white">{e.source_action}</p>
                      <p className="text-[11px] text-white/55">
                        {fmtDate(e.created_at)}
                      </p>
                    </div>
                    <span
                      className="text-[13px] font-semibold tabular-nums text-white"
                    >
                      +${Number(e.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "withdrawals" &&
            (wds.length === 0 ? (
              <EmptyState
                title="No payouts yet"
                hint={`Request a withdrawal once you reach $${MIN_PAYOUT}.`}
              />
            ) : (
              <ul>
                {wds.map((w, i) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between px-6 py-3.5"
                    style={{ borderBottom: i < wds.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
                  >
                    <div>
                      <p
                        className="text-[13.5px] font-semibold tabular-nums text-white"
                      >
                        ${Number(w.amount).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-white/55">
                        {w.method} · {fmtDate(w.created_at)}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {statusLabel(w.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 space-y-4" style={{ color: TEXT }}>
      {/* Balance hero — mint sticker on dark */}
      <div
        className="relative overflow-hidden rounded-[28px] p-5"
        style={{
          backgroundColor: MINT,
          border: `2.5px solid ${INK}`,
          boxShadow: `4px 4px 0 ${MINT}30`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1" style={{ color: INK }}>
              <span className="text-[20px]" style={{ fontWeight: 800 }}>
                $
              </span>
              <span
                className="text-[44px] leading-none tabular-nums"
                style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
              >
                {available.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/settings/withdraw")}
            disabled={!canWithdraw}
            className="rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: INK,
              color: YELLOW,
              fontWeight: 800,
              border: `2px solid ${INK}`,
              boxShadow: `3px 3px 0 ${INK}`,
            }}
          >
            Withdraw
          </button>
        </div>

        <div
          className="mt-5 grid grid-cols-3 gap-3 pt-4"
          style={{ borderTop: `2px dashed ${INK}`, color: INK }}
        >
          {[
            { label: "Signups", value: signups.toString() },
            { label: "Earned", value: `$${totalEarned.toFixed(0)}` },
            { label: "Paid", value: `$${committed.toFixed(0)}` },
          ].map((s) => (
            <div key={s.label}>
              <p
                className="text-[10.5px] uppercase tracking-wider"
                style={{ fontWeight: 800, opacity: 0.65 }}
              >
                {s.label}
              </p>
              <p className="mt-1 text-[20px] tabular-nums" style={{ fontWeight: 900 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* You earned + arrow chip */}
      <div
        className="flex items-center justify-between rounded-[24px] px-5 py-4"
        style={{
          backgroundColor: SURFACE,
          border: `1.5px solid ${BORDER}`,
        }}
      >
        <span className="text-[16px]" style={{ fontWeight: 700, color: TEXT }}>
          Total earned
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3.5 py-1 text-[18px] leading-none tabular-nums"
            style={{
              backgroundColor: PINK,
              color: INK,
              fontWeight: 900,
              border: `2px solid ${INK}`,
              letterSpacing: "-0.01em",
            }}
          >
            ${totalEarned.toFixed(2)}
          </span>
          <span
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{ backgroundColor: YELLOW, border: `2px solid ${INK}` }}
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={3} style={{ color: INK }} />
          </span>
        </div>
      </div>

      {/* Referrals avatars */}
      <div
        className="rounded-[24px] p-5"
        style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px]" style={{ fontWeight: 800, color: TEXT }}>
            Referrals
          </h3>
          <span className="text-[13px] tabular-nums" style={{ color: MUTED, fontWeight: 700 }}>
            {signups}
          </span>
        </div>

        {refs.length === 0 ? (
          <p className="mt-3 text-[13.5px]" style={{ color: MUTED, fontWeight: 500 }}>
            No referrals yet. Share your link to invite your first friend.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-4 gap-3">
            {refs.slice(0, 8).map((r, i) => {
              const tone = AVATAR_TONES[i % AVATAR_TONES.length];
              const letter = (r.id?.[0] ?? "U").toUpperCase();
              return (
                <li key={r.id} className="flex flex-col items-center gap-2">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ backgroundColor: tone, border: `2px solid ${INK}` }}
                  >
                    <span className="text-[22px]" style={{ color: INK, fontWeight: 900 }}>
                      {letter}
                    </span>
                  </div>
                  <span
                    className="text-center text-[11px]"
                    style={{ color: MUTED, fontWeight: 600 }}
                  >
                    Friend
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Referral link copy card */}
      <button
        onClick={copyLink}
        className="flex w-full items-center justify-between rounded-[22px] px-5 py-4 text-left transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        style={{
          backgroundColor: SURFACE_2,
          border: `1.5px solid ${BORDER}`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] uppercase tracking-wide"
            style={{ color: MUTED, fontWeight: 800 }}
          >
            Your referral link
          </p>
          <p className="mt-1 truncate text-[13.5px]" style={{ color: TEXT, fontWeight: 700 }}>
            {link || "—"}
          </p>
        </div>
        <span
          className="ml-3 grid h-10 w-10 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: justCopied ? MINT : YELLOW,
            border: `2px solid ${INK}`,
          }}
        >
          {justCopied ? (
            <Check className="h-5 w-5" strokeWidth={3} style={{ color: INK }} />
          ) : (
            <Copy className="h-5 w-5" strokeWidth={2.5} style={{ color: INK }} />
          )}
        </span>
      </button>

      {/* VIP upgrade card */}
      <div
        className="rounded-[24px] p-5"
        style={{
          backgroundColor: PINK,
          border: `2.5px solid ${INK}`,
          boxShadow: `4px 4px 0 ${PINK}30`,
        }}
      >
        <span
          className="inline-block rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider"
          style={{ backgroundColor: INK, color: PINK, fontWeight: 800 }}
        >
          VIP
        </span>
        <h3
          className="mt-2 text-[20px] leading-tight"
          style={{ fontWeight: 900, letterSpacing: "-0.02em", color: INK }}
        >
          Reach up to 50% commission
        </h3>
        <p className="mt-1.5 text-[13px]" style={{ fontWeight: 600, color: INK, opacity: 0.75 }}>
          Apply to become a top promoter — higher rates and VIP perks.
        </p>
        <button
          onClick={openPromoter}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{
            backgroundColor: INK,
            color: PINK,
            fontWeight: 800,
            border: `2px solid ${INK}`,
            boxShadow: `3px 3px 0 ${INK}`,
          }}
        >
          Apply via WhatsApp <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>

      {/* Activity */}
      <div>
        <h2
          className="px-1 text-[18px]"
          style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}
        >
          Activity
        </h2>

        <div
          className="mt-3 flex gap-1 rounded-full p-1.5"
          style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
        >
          {(
            [
              ["referrals", "Referrals", refs.length],
              ["earnings", "Earnings", earns.length],
              ["withdrawals", "Payouts", wds.length],
            ] as const
          ).map(([k, label, count]) => {
            const active = tab === k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="flex-1 rounded-full py-2 text-[12.5px] transition"
                style={{
                  backgroundColor: active ? YELLOW : "transparent",
                  color: active ? INK : TEXT,
                  fontWeight: active ? 800 : 700,
                  opacity: active ? 1 : 0.65,
                }}
              >
                {label} <span className="ml-1 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 rounded-[22px] px-4"
          style={{ backgroundColor: SURFACE, border: `1.5px solid ${BORDER}` }}
        >
          {tab === "referrals" &&
            (refs.length === 0 ? (
              <EmptyState title="No referrals yet" hint="Share your link to start earning." />
            ) : (
              <ul className="divide-y" style={{ borderColor: BORDER }}>
                {refs.map((r, i) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderColor: BORDER }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-9 w-9 place-items-center rounded-full text-[12px] tabular-nums"
                        style={{
                          backgroundColor: MINT,
                          border: `2px solid ${INK}`,
                          fontWeight: 900,
                          color: INK,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[14px]" style={{ fontWeight: 800, color: TEXT }}>
                          Friend #{i + 1}
                        </p>
                        <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>
                          {fmtDate(r.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px]"
                      style={{
                        backgroundColor: SURFACE_2,
                        border: `1.5px solid ${BORDER}`,
                        fontWeight: 800,
                        color: TEXT,
                      }}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "earnings" &&
            (earns.length === 0 ? (
              <EmptyState
                title="No earnings yet"
                hint="Commissions appear after a friend subscribes."
              />
            ) : (
              <ul className="divide-y" style={{ borderColor: BORDER }}>
                {earns.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderColor: BORDER }}
                  >
                    <div>
                      <p className="text-[14px]" style={{ fontWeight: 800, color: TEXT }}>
                        {e.source_action}
                      </p>
                      <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>
                        {fmtDate(e.created_at)}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[13px] tabular-nums"
                      style={{
                        backgroundColor: MINT,
                        border: `2px solid ${INK}`,
                        fontWeight: 900,
                        color: INK,
                      }}
                    >
                      +${Number(e.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "withdrawals" &&
            (wds.length === 0 ? (
              <EmptyState
                title="No payouts yet"
                hint={`Request a withdrawal once you reach $${MIN_PAYOUT}.`}
              />
            ) : (
              <ul className="divide-y" style={{ borderColor: BORDER }}>
                {wds.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderColor: BORDER }}
                  >
                    <div>
                      <p
                        className="text-[14px] tabular-nums"
                        style={{ fontWeight: 800, color: TEXT }}
                      >
                        ${Number(w.amount).toFixed(2)}
                      </p>
                      <p className="text-[11px]" style={{ color: MUTED, fontWeight: 600 }}>
                        {w.method} · {fmtDate(w.created_at)}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px]"
                      style={{
                        backgroundColor: SURFACE_2,
                        border: `1.5px solid ${BORDER}`,
                        fontWeight: 800,
                        color: TEXT,
                      }}
                    >
                      {statusLabel(w.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>
    </section>
  );
}

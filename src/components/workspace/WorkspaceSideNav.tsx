// Workspace side nav — editorial dark to match settings.
import { NavLink, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Mail,
  Activity,
  CreditCard,
  BarChart3,
  Settings2,
  Palette,
  Bell,
  ShieldCheck,
  Database,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: LucideIcon };
const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Workspace",
    items: [
      { to: "", label: "Overview", icon: LayoutDashboard },
      { to: "members", label: "Members", icon: Users },
      { to: "invites", label: "Invites", icon: Mail },
      { to: "activity", label: "Activity", icon: Activity },
    ],
  },
  {
    title: "Billing",
    items: [
      { to: "billing", label: "Billing", icon: CreditCard },
      { to: "usage", label: "Usage", icon: BarChart3 },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "general", label: "General", icon: Settings2 },
      { to: "brand", label: "Brand kit", icon: Palette },
      { to: "notifications", label: "Notifications", icon: Bell },
      { to: "security", label: "Security", icon: ShieldCheck },
      { to: "data", label: "Data & privacy", icon: Database },
      { to: "danger", label: "Danger zone", icon: AlertTriangle },
    ],
  },
];

export default function WorkspaceSideNav() {
  const { id } = useParams<{ id: string }>();
  const base = `/settings/workspaces/${id}`;
  return (
    <nav className="space-y-6">
      {SECTIONS.map((sec) => (
        <div key={sec.title}>
          <h4 className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted-foreground/70 mb-2 px-2">
            {sec.title}
          </h4>
          <div className="space-y-0.5">
            {sec.items.map((it) => {
              const path = it.to ? `${base}/${it.to}` : base;
              const Icon = it.icon;
              const isDanger = it.to === "danger";
              return (
                <NavLink
                  key={it.label}
                  to={path}
                  end={!it.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors",
                      isActive
                        ? "bg-foreground/[0.06] text-foreground font-medium"
                        : cn(
                            "hover:bg-foreground/[0.03]",
                            isDanger ? "text-rose-400" : "text-muted-foreground hover:text-foreground"
                          )
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  <span className="truncate">{it.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

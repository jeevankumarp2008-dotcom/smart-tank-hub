import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { AlertCard } from "@/components/telemetry-ui";
import { actions, useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Smart Water Tank Monitor" },
      {
        name: "description",
        content:
          "Leak detection, low-level warnings, overflow risk and sensor health events across every tank.",
      },
      { property: "og:title", content: "Alerts — Smart Water Tank Monitor" },
      {
        property: "og:description",
        content: "Leak, low-level and sensor alerts across your tanks.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/alerts" },
    ],
    links: [{ rel: "canonical", href: "/alerts" }],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts, tanks } = useTelemetry();
  const name = (id: string) => tanks.find((t) => t.id === id)?.name ?? "Unknown";
  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  return (
    <Shell>
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="label-eyebrow">Event log</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Alerts</h1>
        </div>
        <span className="font-mono text-sm text-rose">{active.length} active</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel-card p-4">
          <p className="label-eyebrow mb-3">Active</p>
          <div className="space-y-2.5">
            {active.length === 0 && (
              <p className="text-sm text-muted-foreground">All clear — no active alerts.</p>
            )}
            {active.map((a) => (
              <div key={a.id}>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground">
                  {name(a.tankId)}
                </p>
                <AlertCard alert={a} onAck={() => actions.acknowledgeAlert(a.id)} />
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card p-4">
          <p className="label-eyebrow mb-3">Resolved</p>
          <div className="space-y-2.5">
            {resolved.map((a) => (
              <div key={a.id}>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground">
                  {name(a.tankId)}
                </p>
                <AlertCard alert={a} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}

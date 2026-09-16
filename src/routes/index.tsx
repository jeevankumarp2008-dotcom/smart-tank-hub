import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import {
  AlertCard,
  MetricTile,
  PressureGauge,
  PumpControl,
  StatusPill,
  TankColumn,
  TankRailItem,
  UsageChart,
} from "@/components/telemetry-ui";
import { actions, fmt, useSelectedTank, useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Overview — Smart Water Tank Monitor" },
      {
        name: "description",
        content:
          "Live water level, pump control, flow rate and leak alerts for every connected tank in one IoT dashboard.",
      },
      { property: "og:title", content: "Live Overview — Smart Water Tank Monitor" },
      {
        property: "og:description",
        content: "Monitor tank levels, pumps and leak alerts in real time.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Overview,
});

function Overview() {
  const { tanks, alerts, selectedTankId } = useTelemetry();
  const tank = useSelectedTank();
  const online = tanks.filter((t) => t.status !== "offline").length;
  const active = alerts.filter((a) => !a.resolved);
  const peak = Math.max(...tank.usage24h);

  return (
    <Shell>
      <h1 className="sr-only">Smart Water Tank Monitor live overview</h1>
      <div className="grid grid-cols-12 gap-5">
        <aside className="order-3 col-span-12 lg:order-1 lg:col-span-3">
          <div className="panel-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-eyebrow">Tanks</p>
              <span className="font-mono text-[11px] text-muted-foreground">
                {online} / {tanks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tanks.map((t) => (
                <TankRailItem key={t.id} tank={t} active={t.id === selectedTankId} />
              ))}
            </div>
          </div>
        </aside>

        <main className="order-1 col-span-12 lg:order-2 lg:col-span-6">
          <div className="panel-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label-eyebrow">{tank.name} Tank</p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight">
                  {fmt(tank.capacity)} L capacity
                </p>
              </div>
              <StatusPill tank={tank} />
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-5 sm:flex-row">
              <TankColumn tank={tank} />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <PressureGauge pressure={tank.pressure} />
                <PumpControl tank={tank} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile
              label="Flow rate"
              value={tank.flow.toFixed(1)}
              sub={`L/min · ${tank.pumpOn ? "↑ in" : "↓ out"}`}
            />
            <MetricTile
              label="Daily usage"
              value={fmt(tank.dailyUsage)}
              sub="L · −8% vs avg"
            />
            <MetricTile
              label="Sensor"
              value={`${tank.battery}%`}
              sub={`batt · ${tank.signal} bars`}
            />
            <MetricTile label="Last sync" value={`${tank.lastSync}s`} sub="ago · LoRa" />
          </div>

          <div className="mt-5">
            <UsageChart
              data={tank.usage24h}
              peakLabel={`peak 07:00 · ${peak} L`}
            />
          </div>
        </main>

        <aside className="order-2 col-span-12 lg:order-3 lg:col-span-3">
          <div className="panel-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-eyebrow">Alerts</p>
              <span className="font-mono text-[11px] text-rose">{active.length} active</span>
            </div>
            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onAck={() => actions.acknowledgeAlert(a.id)}
                />
              ))}
            </div>
            <Link
              to="/alerts"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-secondary py-2 text-sm text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
            >
              <span className="size-4 shrink-0">☰</span> View all alerts
            </Link>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

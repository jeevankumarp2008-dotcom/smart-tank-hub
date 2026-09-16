import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { PumpControl, StatusPill, TankColumn } from "@/components/telemetry-ui";
import { fmt, liters, useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/tanks")({
  head: () => ({
    meta: [
      { title: "Tanks & Devices — Smart Water Tank Monitor" },
      {
        name: "description",
        content:
          "Every connected tank with live level, pump state, sensor battery and signal strength.",
      },
      { property: "og:title", content: "Tanks & Devices — Smart Water Tank Monitor" },
      {
        property: "og:description",
        content: "Manage all connected tanks, pumps and sensor nodes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tanks" },
    ],
    links: [{ rel: "canonical", href: "/tanks" }],
  }),
  component: TanksPage,
});

function TanksPage() {
  const { tanks } = useTelemetry();

  return (
    <Shell>
      <div className="mb-5">
        <p className="label-eyebrow">Fleet</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tanks & devices</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tanks.map((tank) => (
          <section key={tank.id} className="panel-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold tracking-tight">{tank.name}</h2>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {tank.location}
                </p>
              </div>
              <StatusPill tank={tank} />
            </div>

            <div className="mt-4 flex gap-4">
              <TankColumn tank={tank} height={200} />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="panel-inset p-3">
                    <p className="label-eyebrow">Volume</p>
                    <p className="mt-1 font-mono text-lg">{fmt(liters(tank))} L</p>
                  </div>
                  <div className="panel-inset p-3">
                    <p className="label-eyebrow">Capacity</p>
                    <p className="mt-1 font-mono text-lg">{fmt(tank.capacity)} L</p>
                  </div>
                  <div className="panel-inset p-3">
                    <p className="label-eyebrow">Battery</p>
                    <p className="mt-1 font-mono text-lg">{tank.battery}%</p>
                  </div>
                  <div className="panel-inset p-3">
                    <p className="label-eyebrow">Signal</p>
                    <p className="mt-1 font-mono text-lg">{tank.signal}/5</p>
                  </div>
                </div>
                <PumpControl tank={tank} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </Shell>
  );
}

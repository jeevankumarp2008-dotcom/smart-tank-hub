import { actions, fmt, liters, pct, type Alert, type Tank } from "@/lib/telemetry";

const statusTone: Record<Tank["status"], string> = {
  filling: "text-primary bg-primary/10 ring-primary/30",
  draining: "text-amber bg-amber/10 ring-amber/30",
  holding: "text-muted-foreground bg-secondary ring-border",
  offline: "text-muted-foreground bg-secondary ring-border",
};

export function StatusPill({ tank }: { tank: Tank }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase ring-1 ${statusTone[tank.status]}`}
    >
      <span className="pulse-dot size-1.5 rounded-full bg-current" />
      {tank.status}
    </div>
  );
}

export function TankColumn({ tank, height = 280 }: { tank: Tank; height?: number }) {
  return (
    <div
      className="relative w-[132px] shrink-0 self-center overflow-hidden rounded-xl bg-background/70 ring-1 ring-border"
      style={{ height }}
    >
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-1000 ease-out"
        style={{ height: `${pct(tank)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-aqua-deep to-aqua/80" />
        <div
          className="wave absolute -top-1 left-0 h-2 w-[200%] bg-aqua"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10px -2px, transparent 8px, var(--aqua) 9px)",
            backgroundSize: "20px 8px",
          }}
        />
        <div className="absolute inset-x-0 -top-px h-[2px] bg-foreground/50" />
      </div>

      <div className="absolute inset-y-0 right-0 flex flex-col justify-between py-3 pr-2">
        {[100, 75, 50, 25, 0].map((t) => (
          <span key={t} className="font-mono text-[9px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-mono text-4xl font-semibold leading-none text-foreground drop-shadow">
            {pct(tank)}%
          </p>
          <p className="mt-1.5 font-mono text-xs text-foreground/70">{fmt(liters(tank))} L</p>
        </div>
      </div>
    </div>
  );
}

export function PressureGauge({ pressure }: { pressure: number }) {
  const angle = -70 + Math.min(1, pressure / 4) * 140;
  return (
    <div className="panel-inset p-4">
      <p className="label-eyebrow">Line pressure</p>
      <div className="relative mt-2 h-[74px] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-full bg-background/40" />
        <div
          className="absolute bottom-0 left-1/2 h-[58px] w-[2px] origin-bottom bg-amber transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-amber" />
        <p className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-lg font-semibold text-amber">
          {pressure.toFixed(1)}
          <span className="ml-0.5 text-[10px] text-muted-foreground">bar</span>
        </p>
      </div>
    </div>
  );
}

export function PumpControl({ tank }: { tank: Tank }) {
  const offline = tank.status === "offline";
  return (
    <div className="panel-inset p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Pump</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {tank.autoMode ? "Auto mode · top-off at 90%" : "Manual mode"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Toggle auto mode"
          aria-pressed={tank.autoMode}
          onClick={() => actions.toggleAuto(tank.id)}
          disabled={offline}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${tank.autoMode ? "bg-primary/80" : "bg-secondary ring-1 ring-border"}`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-foreground shadow-sm transition-all ${tank.autoMode ? "right-0.5" : "left-0.5"}`}
          />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => actions.togglePump(tank.id)}
          disabled={offline}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold ring-1 transition-colors disabled:opacity-40 ${
            tank.pumpOn
              ? "bg-primary text-primary-foreground ring-primary/60"
              : "bg-secondary text-foreground ring-border hover:bg-accent"
          }`}
        >
          <span className="size-4 shrink-0">◐</span>
          {tank.pumpOn ? "Stop pump" : "Start pump"}
        </button>
        <button
          type="button"
          disabled={offline}
          className="flex items-center justify-center gap-1.5 rounded-md bg-card px-3 py-2 text-sm text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground disabled:opacity-40"
        >
          <span className="size-4 shrink-0">↻</span> Flush
        </button>
      </div>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel-card p-4">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export function UsageChart({ data, peakLabel }: { data: number[]; peakLabel: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="panel-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Consumption · last 24h</p>
        <span className="font-mono text-[11px] text-muted-foreground">{peakLabel}</span>
      </div>
      <div className="flex h-28 items-end gap-1">
        {data.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t transition-[height] duration-700 ${v === max ? "bg-aqua" : "bg-aqua-deep/60"}`}
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        {["00", "04", "08", "12", "16", "20", "24"].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}

const alertTone: Record<Alert["level"], string> = {
  critical: "bg-rose/10 ring-rose/30 text-rose",
  warning: "bg-amber/10 ring-amber/30 text-amber",
  info: "bg-secondary ring-border text-muted-foreground",
};

export function AlertCard({ alert, onAck }: { alert: Alert; onAck?: () => void }) {
  return (
    <div
      className={`rounded-lg p-3 ring-1 ${alert.resolved ? "bg-secondary ring-border" : alertTone[alert.level]}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`size-2 shrink-0 rounded-full bg-current ${alert.resolved ? "" : "pulse-dot"}`}
        />
        <p className="truncate text-sm font-medium">{alert.title}</p>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{alert.detail}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-muted-foreground">
          {alert.time} · {alert.resolved ? "resolved" : "active"}
        </p>
        {!alert.resolved && onAck && (
          <button
            type="button"
            onClick={onAck}
            className="rounded px-2 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
          >
            ack
          </button>
        )}
      </div>
    </div>
  );
}

export function TankRailItem({ tank, active }: { tank: Tank; active: boolean }) {
  const offline = tank.status === "offline";
  const tone = offline
    ? "bg-muted-foreground"
    : tank.level < 0.25
      ? "bg-amber"
      : active
        ? "bg-aqua"
        : "bg-aqua-deep";
  return (
    <button
      type="button"
      onClick={() => actions.selectTank(tank.id)}
      className={`w-full rounded-lg p-3 text-left transition-colors ${
        active
          ? "bg-primary/10 ring-1 ring-primary/40"
          : "bg-secondary ring-1 ring-border hover:bg-accent"
      } ${offline ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{tank.name}</p>
        <span className={`size-2 shrink-0 rounded-full ${tone} ${offline ? "" : "pulse-dot"}`} />
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ${tone}`}
          style={{ width: `${pct(tank)}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
        {offline ? "0% · offline" : `${pct(tank)}% · ${fmt(liters(tank))} L`}
      </p>
    </button>
  );
}

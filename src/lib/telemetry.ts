import { useSyncExternalStore } from "react";

export type TankStatus = "filling" | "draining" | "holding" | "offline";

export type Tank = {
  id: string;
  name: string;
  location: string;
  capacity: number; // liters
  level: number; // 0..1
  status: TankStatus;
  pumpOn: boolean;
  autoMode: boolean;
  flow: number; // L/min
  pressure: number; // bar
  battery: number; // 0..100
  signal: number; // 0..5
  lastSync: number; // seconds ago
  dailyUsage: number; // liters
  usage24h: number[]; // 12 buckets of 2h
  history7d: number[]; // liters/day
};

export type Alert = {
  id: string;
  tankId: string;
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
  time: string;
  resolved: boolean;
};

export type TelemetryState = {
  tanks: Tank[];
  selectedTankId: string;
  alerts: Alert[];
};

const bucket = (seed: number, n: number, base: number, spread: number) =>
  Array.from({ length: n }, (_, i) =>
    Math.round(base + Math.abs(Math.sin(seed + i * 0.8)) * spread),
  );

let state: TelemetryState = {
  selectedTankId: "roof",
  tanks: [
    {
      id: "roof",
      name: "Primary Roof",
      location: "Block A · Rooftop",
      capacity: 5000,
      level: 0.68,
      status: "filling",
      pumpOn: true,
      autoMode: true,
      flow: 14.2,
      pressure: 2.4,
      battery: 87,
      signal: 4,
      lastSync: 12,
      dailyUsage: 412,
      usage24h: bucket(1.2, 12, 14, 82),
      history7d: bucket(2.4, 7, 320, 190),
    },
    {
      id: "garden",
      name: "Garden Reserve",
      location: "South lawn · Sump",
      capacity: 3000,
      level: 0.41,
      status: "draining",
      pumpOn: false,
      autoMode: true,
      flow: 6.1,
      pressure: 1.7,
      battery: 72,
      signal: 3,
      lastSync: 26,
      dailyUsage: 238,
      usage24h: bucket(3.1, 12, 8, 54),
      history7d: bucket(1.7, 7, 180, 140),
    },
    {
      id: "basement",
      name: "Basement Backup",
      location: "Level B2 · Utility",
      capacity: 3000,
      level: 0.23,
      status: "holding",
      pumpOn: false,
      autoMode: false,
      flow: 0,
      pressure: 1.1,
      battery: 54,
      signal: 4,
      lastSync: 41,
      dailyUsage: 96,
      usage24h: bucket(4.6, 12, 3, 28),
      history7d: bucket(5.2, 7, 70, 90),
    },
    {
      id: "rain",
      name: "Rain Collection",
      location: "East roof · Harvest",
      capacity: 2000,
      level: 0,
      status: "offline",
      pumpOn: false,
      autoMode: false,
      flow: 0,
      pressure: 0,
      battery: 9,
      signal: 0,
      lastSync: 5400,
      dailyUsage: 0,
      usage24h: new Array(12).fill(0),
      history7d: new Array(7).fill(0),
    },
  ],
  alerts: [
    {
      id: "a1",
      tankId: "basement",
      level: "warning",
      title: "Low level",
      detail: "Basement Backup below 25% threshold. Refill advised.",
      time: "14:32",
      resolved: false,
    },
    {
      id: "a2",
      tankId: "garden",
      level: "critical",
      title: "Leak detected",
      detail: "Flow anomaly on Garden Reserve inlet valve.",
      time: "13:05",
      resolved: false,
    },
    {
      id: "a3",
      tankId: "rain",
      level: "warning",
      title: "Sensor offline",
      detail: "Rain Collection node has not reported for 90 minutes.",
      time: "12:58",
      resolved: false,
    },
    {
      id: "a4",
      tankId: "roof",
      level: "info",
      title: "Overflow risk cleared",
      detail: "Primary Roof stabilized at 68% after rain event.",
      time: "09:48",
      resolved: true,
    },
  ],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const setState = (next: Partial<TelemetryState>) => {
  state = { ...state, ...next };
  emit();
};

const updateTank = (id: string, patch: Partial<Tank>) =>
  setState({
    tanks: state.tanks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  });

export const actions = {
  selectTank: (id: string) => setState({ selectedTankId: id }),
  togglePump: (id: string) => {
    const tank = state.tanks.find((t) => t.id === id);
    if (!tank || tank.status === "offline") return;
    const pumpOn = !tank.pumpOn;
    updateTank(id, {
      pumpOn,
      status: pumpOn ? "filling" : "holding",
      flow: pumpOn ? 12 + Math.random() * 4 : 0,
    });
  },
  toggleAuto: (id: string) => {
    const tank = state.tanks.find((t) => t.id === id);
    if (!tank) return;
    updateTank(id, { autoMode: !tank.autoMode });
  },
  acknowledgeAlert: (id: string) =>
    setState({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    }),
};

let ticking = false;
const tick = () => {
  const tanks = state.tanks.map((tank) => {
    if (tank.status === "offline") return { ...tank, lastSync: tank.lastSync + 2 };

    let { level, pumpOn, status } = tank;
    const drain = 0.0012 + Math.random() * 0.0012;
    const fill = 0.0035 + Math.random() * 0.0015;

    if (pumpOn) level = Math.min(1, level + fill);
    else level = Math.max(0.02, level - drain);

    if (tank.autoMode) {
      if (level >= 0.9 && pumpOn) pumpOn = false;
      if (level <= 0.25 && !pumpOn) pumpOn = true;
    }
    status = pumpOn ? "filling" : level < tank.level ? "draining" : "holding";

    const flow = pumpOn ? 12 + Math.random() * 4 : Math.max(0, 4 + Math.random() * 3);
    return {
      ...tank,
      level,
      pumpOn,
      status,
      flow: Number(flow.toFixed(1)),
      pressure: Number((1.6 + level * 1.4 + Math.random() * 0.1).toFixed(2)),
      lastSync: Math.random() > 0.5 ? 2 : tank.lastSync + 2,
      dailyUsage: tank.dailyUsage + (pumpOn ? 0 : Math.round(Math.random() * 2)),
    };
  });
  setState({ tanks });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!ticking && typeof window !== "undefined") {
    ticking = true;
    window.setInterval(tick, 2000);
  }
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

export function useTelemetry() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSelectedTank() {
  const s = useTelemetry();
  return (s.tanks.find((t) => t.id === s.selectedTankId) ?? s.tanks[0]) as Tank;
}

export const liters = (tank: Tank) => Math.round(tank.level * tank.capacity);
export const pct = (tank: Tank) => Math.round(tank.level * 100);
export const fmt = (n: number) => n.toLocaleString("en-US");

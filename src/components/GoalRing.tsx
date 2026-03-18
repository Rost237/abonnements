import { motion } from "framer-motion";

interface GoalRingProps {
  current: number;
  target: number;
  label?: string;
}

export default function GoalRing({ current, target, label = "Objectif" }: GoalRingProps) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * pct) / 100;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative h-48 w-48 flex items-center justify-center mx-auto"
    >
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 192 192">
        <circle cx="96" cy="96" r={r} stroke="hsl(var(--muted))" strokeWidth="12" fill="transparent" />
        <motion.circle
          cx="96" cy="96" r={r}
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold tabular-nums text-foreground">{pct}%</span>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

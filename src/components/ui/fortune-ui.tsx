"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Chinese character constants via unicode to avoid encoding issues
const MU = '\u6728';  // ? wood
const HUO = '\u706b'; // ? fire
const TU = '\u571f';  // ? earth
const JIN = '\u91d1'; // ? metal
const SHUI = '\u6c34';// ? water

interface WuxingBadgeProps {
  element: string;
  size?: "sm" | "md";
  className?: string;
}

const elementConfig: Record<string, { colorClass: string; bgClass: string }> = {
  [MU]:   { colorClass: "element-wood",  bgClass: "element-bg-wood" },
  [HUO]:  { colorClass: "element-fire",  bgClass: "element-bg-fire" },
  [TU]:   { colorClass: "element-earth", bgClass: "element-bg-earth" },
  [JIN]:  { colorClass: "element-metal", bgClass: "element-bg-metal" },
  [SHUI]: { colorClass: "element-water", bgClass: "element-bg-water" },
};

export function WuxingBadge({ element, size = "md", className }: WuxingBadgeProps) {
  const config = elementConfig[element] ?? elementConfig[TU];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-serif font-medium",
        size === "sm" ? "w-5 h-5 text-xs" : "w-7 h-7 text-sm",
        config.colorClass,
        config.bgClass,
        className
      )}
    >
      {element}
    </span>
  );
}

interface ScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, size = 80, className }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#2e8b57" : score >= 60 ? "#b8891e" : score >= 40 ? "#5c5845" : "#c47a66";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ddd9cc" strokeWidth={4} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif font-bold text-ink-800" style={{ fontSize: size * 0.24 }}>{score}</span>
        <span className="text-ink-400" style={{ fontSize: size * 0.14 }}>{'\u5206'}</span>
      </div>
    </div>
  );
}

interface GanZhiPillarProps {
  gan: string;
  zhi: string;
  label: string;
  isDay?: boolean;
}

export function GanZhiPillar({ gan, zhi, label, isDay = false }: GanZhiPillarProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-4 rounded-lg border",
        isDay ? "border-coral-400 bg-coral-100" : "border-ink-200 bg-white"
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-xs text-ink-500 font-sans">{label}</span>
      <span className={cn("text-2xl font-serif font-bold", isDay ? "text-coral-600" : "text-ink-800")}>{gan}</span>
      <div className="w-px h-3 bg-ink-300" />
      <span className={cn("text-2xl font-serif font-bold", isDay ? "text-coral-500" : "text-ink-700")}>{zhi}</span>
    </motion.div>
  );
}

interface ReasoningChainProps {
  conclusion: string;
  reasoning: string;
  isOpen?: boolean;
  onToggle?: () => void;
  label?: string;
}

export function ReasoningChain({ conclusion, reasoning, isOpen = false, onToggle, label }: ReasoningChainProps) {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-700 transition-colors group"
      >
        <span className={cn("w-4 h-4 rounded-full border border-ink-400 flex items-center justify-center text-[10px] transition-transform", isOpen ? "rotate-45" : "")}>
          +
        </span>
        <span className="group-hover:underline underline-offset-2">{label ?? "\u67e5\u770b\u63a8\u7406\u4f9d\u636e"}</span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 p-3 bg-ink-50 rounded-lg border border-ink-200"
        >
          <p className="text-xs text-ink-600 leading-relaxed font-mono">
            <span className="text-coral-500 font-semibold">{'\u300c'}{conclusion}{'\u300d'}</span>
            <span className="text-ink-400 mx-2">{'\u2190'}</span>
            {reasoning}
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface LoadingInkProps {
  text?: string;
}

export function LoadingInk({ text = "\u6b63\u5728\u63a8\u7b97..." }: LoadingInkProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative w-16 h-16">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-ink-400"
            initial={{ opacity: 0.8, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-serif text-ink-700">{'\u6e0a'}</span>
        </div>
      </div>
      <p className="text-sm text-ink-500 font-sans">{text}</p>
    </div>
  );
}

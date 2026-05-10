"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import type { LifeEvent, PredictedPath, BranchPath, PredictedNode } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Visual constants for the horizontal timeline
// ─────────────────────────────────────────────────────────────────────────────
const SPACING_X = 130;        // horizontal gap between nodes
const ALT_OFFSET_Y = 90;      // vertical offset for the AI alternative path
const BRANCH_OFFSET_Y = 110;  // vertical offset per stacked what-if branch (above main spine)
const NODE_RADIUS = 9;
const SPINE_PADDING_X = 60;

const NODE_PALETTE: Record<string, { fill: string; ring: string; line: string; text: string; chip: string }> = {
  birth:     { fill: "#9d6fc0", ring: "#7c4da0", line: "#c4bfa8", text: "#4a2d6b", chip: "bg-mystic-100 text-mystic-700 border-mystic-400" },
  milestone: { fill: "#d4a843", ring: "#b8891e", line: "#c4bfa8", text: "#8b6914", chip: "bg-gold-100 text-gold-600 border-gold-300" },
  turning:   { fill: "#c47a66", ring: "#a85a46", line: "#c4bfa8", text: "#8b4a38", chip: "bg-coral-100 text-coral-600 border-coral-300" },
  current:   { fill: "#2e8b57", ring: "#1a4d3a", line: "#c4bfa8", text: "#1a4d3a", chip: "bg-jade-100 text-jade-700 border-jade-300" },
  predicted: { fill: "#9e9880", ring: "#7a7560", line: "#c4bfa8", text: "#5c5845", chip: "bg-ink-100 text-ink-500 border-ink-300" },
  alt:       { fill: "#7c4da0", ring: "#4a2d6b", line: "#c4bfa8", text: "#4a2d6b", chip: "bg-mystic-100 text-mystic-700 border-mystic-400" },
  branch:    { fill: "#5c5845", ring: "#403d32", line: "#c4bfa8", text: "#403d32", chip: "bg-ink-200 text-ink-700 border-ink-400" },
};

interface RenderedNode {
  id: string;
  kind: "birth" | "milestone" | "turning" | "current" | "predicted" | "alt" | "branch";
  title: string;
  year?: number;
  age?: number;
  description?: string;
  probability?: string;
  x: number;
  y: number;
  // For interaction
  isLifeEvent?: boolean;        // is this a user LifeEvent (editable)
  pathLabel?: string;           // "main"/"alt"/branch label
  branchId?: string;
  // raw refs
  rawLifeEvent?: LifeEvent;
}

interface RenderedEdge {
  id: string;
  fromId: string;
  toId: string;
  kind: "spine" | "alt" | "branch";
}

interface BuildResult {
  nodes: RenderedNode[];
  edges: RenderedEdge[];
  width: number;
  height: number;
  topPad: number;
  bottomPad: number;
}

function buildLayout(opts: {
  birthYear: number;
  events: LifeEvent[];
  predictedPaths: PredictedPath[];
  branches: BranchPath[];
  labels: { birth: string; current: string };
}): BuildResult {
  const { birthYear, events, predictedPaths, branches, labels } = opts;
  const nodes: RenderedNode[] = [];
  const edges: RenderedEdge[] = [];

  // sort user-recorded life events
  const sortedEvents = [...events]
    .filter((e) => e.nodeType === "milestone" || e.nodeType === "turning")
    .sort((a, b) => a.year - b.year);

  // spine indices: 0 = birth, 1..n = events, n+1 = current, then predicted main
  const mainPath = predictedPaths.find((p) => p.isMain);
  const altPath = predictedPaths.find((p) => !p.isMain);
  const mainPredicted = mainPath?.nodes ?? [];

  let idx = 0;
  const spineX = (i: number) => SPINE_PADDING_X + i * SPACING_X;
  const baselineY = 0;

  // birth
  nodes.push({
    id: "birth",
    kind: "birth",
    title: labels.birth,
    year: birthYear,
    x: spineX(idx),
    y: baselineY,
  });
  idx += 1;

  // user events
  sortedEvents.forEach((ev) => {
    nodes.push({
      id: ev.id,
      kind: ev.nodeType === "turning" ? "turning" : "milestone",
      title: ev.title,
      year: ev.year,
      age: ev.age,
      description: ev.description,
      x: spineX(idx),
      y: baselineY,
      isLifeEvent: true,
      rawLifeEvent: ev,
    });
    idx += 1;
  });

  // current
  const currentYear = new Date().getFullYear();
  nodes.push({
    id: "current",
    kind: "current",
    title: labels.current,
    year: currentYear,
    age: currentYear - birthYear,
    x: spineX(idx),
    y: baselineY,
  });
  idx += 1;

  // predicted main
  mainPredicted.forEach((p) => {
    nodes.push({
      id: `m-${p.id}`,
      kind: "predicted",
      title: p.title,
      year: p.year,
      age: p.age,
      description: p.description,
      probability: p.probability,
      x: spineX(idx),
      y: baselineY,
      pathLabel: mainPath?.label,
    });
    idx += 1;
  });

  // build spine edges
  const spineNodes = nodes.filter((n) => n.y === baselineY);
  for (let i = 0; i < spineNodes.length - 1; i += 1) {
    edges.push({
      id: `spine-${spineNodes[i].id}-${spineNodes[i + 1].id}`,
      fromId: spineNodes[i].id,
      toId: spineNodes[i + 1].id,
      kind: spineNodes[i + 1].kind === "predicted" ? "branch" : "spine",
    });
  }

  // alternative future path (below the spine)
  if (altPath && altPath.nodes.length > 0) {
    const fromNode = nodes.find((n) => n.id === "current");
    if (fromNode) {
      altPath.nodes.forEach((p, i) => {
        const altIdx = idx - mainPredicted.length + i; // place under main predicted columns when possible
        const altX = spineX(Math.max(altIdx, 0));
        const altY = baselineY + ALT_OFFSET_Y;
        const id = `a-${p.id}`;
        nodes.push({
          id,
          kind: "alt",
          title: p.title,
          year: p.year,
          age: p.age,
          description: p.description,
          probability: p.probability,
          x: altX,
          y: altY,
          pathLabel: altPath.label,
        });
        const prev = i === 0 ? "current" : `a-${altPath.nodes[i - 1].id}`;
        edges.push({
          id: `alt-${prev}-${id}`,
          fromId: prev,
          toId: id,
          kind: "alt",
        });
      });
    }
  }

  // user-defined what-if branches (above the spine, stacked)
  branches.forEach((branch, bIdx) => {
    const anchor = nodes.find((n) => n.id === branch.fromNodeId);
    if (!anchor) return;
    const branchY = baselineY - BRANCH_OFFSET_Y * (1 + bIdx * 0.6);
    branch.nodes.forEach((p, i) => {
      const branchX = anchor.x + (i + 1) * SPACING_X * 0.85;
      const id = `b-${branch.id}-${p.id}`;
      nodes.push({
        id,
        kind: "branch",
        title: p.title,
        year: p.year,
        age: p.age,
        description: p.description,
        probability: p.probability,
        x: branchX,
        y: branchY,
        pathLabel: branch.label,
        branchId: branch.id,
      });
      const prev = i === 0 ? branch.fromNodeId : `b-${branch.id}-${branch.nodes[i - 1].id}`;
      edges.push({
        id: `branch-${prev}-${id}`,
        fromId: prev,
        toId: id,
        kind: "branch",
      });
    });
  });

  // overall bounds
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const width = Math.max(...xs, SPACING_X * 4) + SPINE_PADDING_X;
  const topPad = -minY + 60;
  const bottomPad = maxY + 80;
  const height = topPad + bottomPad;

  return { nodes, edges, width, height, topPad, bottomPad };
}

function buildExampleEvents(birthYear: number, t: ReturnType<typeof useT>): LifeEvent[] {
  const make = (
    suffix: string,
    title: string,
    age: number,
    nodeType: "milestone" | "turning",
    category: LifeEvent["category"],
  ): LifeEvent => ({
    id: `example-${suffix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description: t.ji.examplesNote,
    date: `${birthYear + age}-06`,
    year: birthYear + age,
    age,
    category,
    nodeType,
  });
  return [
    make("childhood", t.ji.examples.childhood, 6,  "milestone", "education"),
    make("teen",      t.ji.examples.teen,      18, "turning",   "education"),
    make("adult",     t.ji.examples.adult,     22, "milestone", "general"),
    make("career",    t.ji.examples.career,    25, "turning",   "career"),
  ];
}

export default function JiPage() {
  const t = useT();
  const {
    bazi, birthInfo,
    lifeEvents, addLifeEvent, removeLifeEvent, updateLifeEvent,
    predictedPaths, setPredictedPaths, clearPredictedPaths,
    branchPaths, addBranchPath, removeBranchPath,
    locale,
  } = useStore();

  const [generating, setGenerating] = useState(false);
  const [branchGenerating, setBranchGenerating] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<RenderedNode | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [branchCondition, setBranchCondition] = useState("");

  const initialForm = useMemo(() => ({
    title: "",
    year: new Date().getFullYear(),
    age: "",
    description: "",
    nodeType: "milestone" as "milestone" | "turning",
    category: "general" as LifeEvent["category"],
  }), []);
  const [form, setForm] = useState(initialForm);

  const birthYear = birthInfo?.year ?? new Date().getFullYear() - 30;

  const layout = useMemo(() => buildLayout({
    birthYear,
    events: lifeEvents,
    predictedPaths,
    branches: branchPaths,
    labels: {
      birth: t.ji.birth,
      current: t.ji.current,
    },
  }), [birthYear, lifeEvents, predictedPaths, branchPaths, t]);

  // Auto-scroll to focus the "current" node (so user lands roughly on the spine baseline).
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollerRef.current) return;
    const currentNode = layout.nodes.find((n) => n.id === "current");
    if (!currentNode) return;
    const el = scrollerRef.current;
    const targetX = currentNode.x - el.clientWidth * 0.5 + 40;
    const targetY = layout.topPad - el.clientHeight * 0.5;
    el.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  }, [layout]);

  function showToast(msg: string) {
    setSavedToast(msg);
    window.setTimeout(() => setSavedToast(null), 2000);
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowAddForm(false);
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...initialForm, year: new Date().getFullYear() });
    setShowAddForm(true);
    setSelected(null);
  }

  function openEditFromSelection() {
    if (!selected?.rawLifeEvent) return;
    const ev = selected.rawLifeEvent;
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      year: ev.year,
      age: ev.age?.toString() ?? "",
      description: ev.description ?? "",
      nodeType: ev.nodeType === "turning" ? "turning" : "milestone",
      category: ev.category,
    });
    setShowAddForm(true);
    setSelected(null);
  }

  function handleFormSave() {
    if (!form.title.trim()) return;
    const yearNum = Number(form.year);
    const computedAge = form.age ? Number(form.age) : Math.max(0, yearNum - birthYear);
    if (editingId) {
      updateLifeEvent(editingId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        date: `${yearNum}-06`,
        year: yearNum,
        age: computedAge,
        category: form.category,
        nodeType: form.nodeType,
      });
      showToast(t.ji.syncedToCe);
    } else {
      addLifeEvent({
        id: `ji-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        date: `${yearNum}-06`,
        year: yearNum,
        age: computedAge,
        category: form.category,
        nodeType: form.nodeType,
      });
      showToast(t.ji.syncedToCe);
    }
    resetForm();
  }

  function handleDeleteSelected() {
    if (selected?.rawLifeEvent) {
      removeLifeEvent(selected.rawLifeEvent.id);
      setSelected(null);
    } else if (selected?.branchId) {
      removeBranchPath(selected.branchId);
      setSelected(null);
    }
  }

  function applyExampleTrace() {
    const examples = buildExampleEvents(birthYear, t);
    examples.forEach((ev) => addLifeEvent(ev));
  }

  async function handleGenerate() {
    if (!bazi) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/life-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bazi, lifeEvents, birthYear, locale }),
      });
      const data = await res.json();
      if (Array.isArray(data.paths)) {
        setPredictedPaths(data.paths as PredictedPath[]);
      }
    } catch (err) {
      console.error("life-tree generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleBranch(condition: string) {
    if (!bazi || !selected || !selected.isLifeEvent || !selected.rawLifeEvent) return;
    if (!condition.trim()) return;
    setBranchGenerating(true);
    const anchor = selected.rawLifeEvent;
    try {
      const res = await fetch("/api/life-branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bazi,
          anchor: { id: anchor.id, title: anchor.title, year: anchor.year, age: anchor.age, description: anchor.description },
          condition,
          locale,
        }),
      });
      const data = await res.json();
      if (data?.branch) {
        const branch: BranchPath = {
          id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fromNodeId: anchor.id,
          condition,
          label: data.branch.label,
          description: data.branch.description,
          nodes: data.branch.nodes as PredictedNode[],
          createdAt: Date.now(),
        };
        addBranchPath(branch);
        setBranchCondition("");
        setSelected(null);
      }
    } catch (err) {
      console.error("life-branch generation failed:", err);
    } finally {
      setBranchGenerating(false);
    }
  }

  if (!bazi) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title={t.ji.title} subtitle={t.ji.subtitle} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <span className="text-5xl font-serif text-ink-300 block">{"\u8ff9"}</span>
            <p className="text-ink-500">{t.common.noBazi}</p>
            <Link href="/ming" className="inline-block px-6 py-2.5 bg-ink-900 text-white rounded-xl text-sm">
              {t.gua.goToMing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = lifeEvents.length === 0 && predictedPaths.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.ji.title} subtitle={t.ji.subtitle} />

      <div className="px-6 py-3 border-b border-ink-200 bg-white flex items-center justify-between gap-4 flex-wrap">
        <Legend t={t} />
        <div className="flex items-center gap-3">
          <button
            onClick={openAddForm}
            className="text-xs px-3 py-1.5 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
          >
            {t.ji.addNode}
          </button>
          <Link href="/ce" className="text-xs text-ink-400 hover:text-ink-700 transition-colors hidden md:inline">
            {t.ji.goToCe}
          </Link>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs px-4 py-1.5 bg-ink-900 text-white rounded-lg hover:bg-ink-800 disabled:opacity-50 transition-all"
          >
            {generating ? t.ji.generating : (predictedPaths.length > 0 ? t.ji.regenerate : t.ji.generatePredictions)}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-jade-500 text-white text-xs px-3 py-1.5 rounded-full shadow"
            >
              {savedToast}
            </motion.div>
          )}
        </AnimatePresence>

        {isEmpty ? (
          <EmptyState
            t={t}
            onUseExample={applyExampleTrace}
            onAdd={openAddForm}
            onGenerate={handleGenerate}
            generating={generating}
          />
        ) : (
          <div ref={scrollerRef} className="h-full w-full overflow-x-auto overflow-y-auto bg-paper">
            <Timeline layout={layout} onSelect={setSelected} selectedId={selected?.id ?? null} />
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <NodeForm
              key="add-form"
              t={t}
              form={form}
              setForm={setForm}
              birthYear={birthYear}
              isEdit={!!editingId}
              onSave={handleFormSave}
              onCancel={resetForm}
            />
          )}
          {selected && !showAddForm && (
            <NodeDetail
              key="node-detail"
              t={t}
              node={selected}
              branches={branchPaths.filter((b) => selected.isLifeEvent && b.fromNodeId === selected.rawLifeEvent?.id)}
              branchCondition={branchCondition}
              setBranchCondition={setBranchCondition}
              branchGenerating={branchGenerating}
              onBranch={handleBranch}
              onEdit={openEditFromSelection}
              onDelete={handleDeleteSelected}
              onRemoveBranch={(id) => removeBranchPath(id)}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Legend({ t }: { t: ReturnType<typeof useT> }) {
  const items: Array<{ key: keyof typeof NODE_PALETTE; label: string }> = [
    { key: "birth",     label: t.ji.nodeTypes.birth },
    { key: "milestone", label: t.ji.nodeTypes.milestone },
    { key: "turning",   label: t.ji.nodeTypes.turning },
    { key: "current",   label: t.ji.nodeTypes.current },
    { key: "predicted", label: t.ji.mainPath },
    { key: "alt",       label: t.ji.altPath },
    { key: "branch",    label: t.ji.branchTag },
  ];
  return (
    <div className="flex items-center gap-3 text-[11px] text-ink-500 flex-wrap">
      {items.map((it) => (
        <span key={it.key} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: NODE_PALETTE[it.key].fill, boxShadow: `0 0 0 2px ${NODE_PALETTE[it.key].ring}33` }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function EmptyState(props: {
  t: ReturnType<typeof useT>;
  onUseExample: () => void;
  onAdd: () => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  const { t, onUseExample, onAdd, onGenerate, generating } = props;
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <span className="text-4xl font-serif text-ink-300 block">{"\u8ff9"}</span>
        <h3 className="font-serif font-semibold text-ink-700">{t.ji.onboardingTitle}</h3>
        <p className="text-xs text-ink-500 leading-relaxed">{t.ji.onboardingDesc}</p>
        <div className="card p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-ink-600 mb-2">{t.ji.helpTitle}</p>
          <ul className="text-xs text-ink-500 space-y-1.5 list-decimal pl-4 leading-relaxed">
            <li>{t.ji.help1}</li>
            <li>{t.ji.help2}</li>
            <li>{t.ji.help3}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onUseExample} className="w-full py-2.5 bg-ink-900 text-white rounded-lg text-sm hover:bg-ink-800 transition-colors">
            {t.ji.useExample}
          </button>
          <button onClick={onAdd} className="w-full py-2.5 border border-ink-300 text-ink-700 rounded-lg text-sm hover:bg-ink-50 transition-colors">
            {t.ji.addNode}
          </button>
          <button onClick={onGenerate} disabled={generating} className="w-full py-2 text-xs text-ink-500 hover:text-ink-700 transition-colors disabled:opacity-50">
            {generating ? t.ji.generating : t.ji.generatePredictions}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimelineProps {
  layout: BuildResult;
  onSelect: (n: RenderedNode) => void;
  selectedId: string | null;
}

function Timeline({ layout, onSelect, selectedId }: TimelineProps) {
  const { nodes, edges, width, height, topPad } = layout;
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // World coordinates: nodes use n.x (>= 0) and n.y (can be negative for branches above spine).
  // We translate everything by (PAD_X, topPad) so that y=0 (spine) sits at PAD_Y_TOP within a positive-only DOM box.
  const PAD_X = 40;
  const PAD_Y_TOP = topPad;
  const totalW = width + PAD_X * 2;
  const totalH = height + 80; // 40 above + extra below for labels

  return (
    <div className="relative" style={{ width: totalW, height: totalH }}>
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="absolute inset-0 pointer-events-none"
      >
        {edges.map((e) => {
          const a = nodeMap.get(e.fromId);
          const b = nodeMap.get(e.toId);
          if (!a || !b) return null;
          const ax = a.x + PAD_X;
          const ay = a.y + PAD_Y_TOP;
          const bx = b.x + PAD_X;
          const by = b.y + PAD_Y_TOP;
          const isSpine = e.kind === "spine";
          const isAlt = e.kind === "alt";
          const path = a.y === b.y
            ? `M ${ax} ${ay} L ${bx} ${by}`
            : (() => {
                const cx1 = ax + (bx - ax) * 0.5;
                const cy1 = ay;
                const cx2 = ax + (bx - ax) * 0.5;
                const cy2 = by;
                return `M ${ax} ${ay} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${bx} ${by}`;
              })();
          return (
            <path
              key={e.id}
              d={path}
              fill="none"
              stroke={isSpine ? "#9e9880" : isAlt ? "#7c4da0" : "#5c5845"}
              strokeWidth={isSpine ? 1.5 : 1.2}
              strokeDasharray={isAlt ? "4 4" : !isSpine ? "3 3" : undefined}
              opacity={isSpine ? 0.55 : 0.45}
            />
          );
        })}
      </svg>

      {nodes.map((n) => {
        const palette = NODE_PALETTE[n.kind];
        const isSelected = n.id === selectedId;
        const xPx = n.x + PAD_X;
        const yPx = n.y + PAD_Y_TOP;
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n)}
            className="absolute group focus:outline-none"
            style={{
              left: xPx,
              top: yPx,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="relative flex items-center justify-center">
              <span
                className={`absolute rounded-full transition-all ${isSelected ? "scale-150" : "scale-100 group-hover:scale-125"}`}
                style={{
                  width: NODE_RADIUS * 2 + 8,
                  height: NODE_RADIUS * 2 + 8,
                  background: palette.fill,
                  opacity: isSelected ? 0.25 : 0,
                }}
              />
              <span
                className="block rounded-full transition-transform"
                style={{
                  width: NODE_RADIUS * 2,
                  height: NODE_RADIUS * 2,
                  background: palette.fill,
                  boxShadow: `0 0 0 2px ${palette.ring}66, 0 1px 3px rgba(0,0,0,0.08)`,
                }}
              />
            </span>
            <span
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ top: NODE_RADIUS + 6, minWidth: 90, maxWidth: 130 }}
            >
              {n.year !== undefined && (
                <span className="text-[10px] text-ink-400 font-mono tabular-nums">{n.year}</span>
              )}
              <span className="text-[11px] font-serif font-semibold text-center leading-tight" style={{ color: palette.text }}>
                {n.title}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface NodeFormProps {
  t: ReturnType<typeof useT>;
  form: {
    title: string;
    year: number;
    age: string;
    description: string;
    nodeType: "milestone" | "turning";
    category: LifeEvent["category"];
  };
  setForm: React.Dispatch<React.SetStateAction<NodeFormProps["form"]>>;
  birthYear: number;
  isEdit: boolean;
  onSave: () => void;
  onCancel: () => void;
}

function NodeForm({ t, form, setForm, birthYear, onSave, onCancel }: NodeFormProps) {
  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className="absolute right-0 top-0 bottom-0 w-80 border-l border-ink-200 bg-white p-5 overflow-y-auto z-20 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-ink-800">{t.ji.addNodeTitle}</h3>
        <button onClick={onCancel} className="text-ink-400 hover:text-ink-700 text-xl">&times;</button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-ink-400 mb-1">{t.ji.nodeTitle} *</label>
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t.ji.nodeTitlePh}
            maxLength={40}
            className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-ink-400 mb-1">{t.ji.nodeYear} *</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              min={1900}
              max={2100}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">{t.ji.nodeAge}</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder={`${Math.max(0, Number(form.year) - birthYear)}`}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-400 mb-1">{t.ce.eventNodeType}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["milestone", "turning"] as const).map((nt) => (
              <button
                key={nt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, nodeType: nt }))}
                className={`py-2 text-xs rounded-lg border transition-all ${
                  form.nodeType === nt
                    ? nt === "turning"
                      ? "border-coral-400 bg-coral-50 text-coral-600"
                      : "border-gold-400 bg-gold-100 text-gold-600"
                    : "border-ink-200 text-ink-500 bg-white"
                }`}
              >
                {nt === "turning" ? t.ji.nodeTypeTurning : t.ji.nodeTypeMilestone}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-400 mb-1">{t.ce.eventCategory}</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as LifeEvent["category"] }))}
            className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400"
          >
            {(Object.keys(t.ce.categories) as Array<keyof typeof t.ce.categories>).map((c) => (
              <option key={c} value={c}>{t.ce.categories[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-400 mb-1">{t.ji.nodeDesc}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white resize-none focus:outline-none focus:border-ink-400"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 py-2 text-xs border border-ink-200 rounded-lg text-ink-500 hover:bg-ink-50">{t.ji.cancel}</button>
          <button
            onClick={onSave}
            disabled={!form.title.trim()}
            className="flex-1 py-2 text-xs bg-ink-900 text-white rounded-lg hover:bg-ink-800 disabled:opacity-50"
          >
            {t.ji.save}
          </button>
        </div>
        <p className="text-[10px] text-ink-300 text-center pt-1">{t.ji.help3}</p>
      </div>
    </motion.div>
  );
}

interface NodeDetailProps {
  t: ReturnType<typeof useT>;
  node: RenderedNode;
  branches: BranchPath[];
  branchCondition: string;
  setBranchCondition: (s: string) => void;
  branchGenerating: boolean;
  onBranch: (cond: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveBranch: (id: string) => void;
  onClose: () => void;
}

function NodeDetail(props: NodeDetailProps) {
  const { t, node, branches, branchCondition, setBranchCondition, branchGenerating, onBranch, onEdit, onDelete, onRemoveBranch, onClose } = props;
  const palette = NODE_PALETTE[node.kind];
  const isPastEvent = node.isLifeEvent === true;
  const isBranchNode = node.kind === "branch";

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className="absolute right-0 top-0 bottom-0 w-80 border-l border-ink-200 bg-white p-5 overflow-y-auto z-20 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-ink-800">{t.ji.eventDetail}</h3>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-700 text-xl">&times;</button>
      </div>

      <div
        className="p-3 rounded-xl border-2 mb-4"
        style={{ background: `${palette.fill}11`, borderColor: palette.ring }}
      >
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${palette.chip}`}>
            {kindLabel(node.kind, t)}
          </span>
          {node.pathLabel && (
            <span className="text-[10px] text-ink-400 italic truncate">{node.pathLabel}</span>
          )}
        </div>
        <p className="font-serif font-bold text-ink-800 text-base leading-tight">{node.title}</p>
        {node.year !== undefined && (
          <p className="text-xs text-ink-400 mt-1">
            {node.year}{t.ji.year}
            {node.age !== undefined ? `${" \u00b7 "}${node.age}${t.ji.age}` : ""}
          </p>
        )}
      </div>

      {node.description && (
        <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">{node.description}</p>
      )}

      {node.probability && (
        <div className="mt-4 p-3 bg-ink-50 rounded-lg">
          <p className="text-xs text-ink-400">{t.ji.probability}</p>
          <p className="text-sm font-semibold text-ink-700 mt-1">{node.probability}</p>
        </div>
      )}

      {isPastEvent && (
        <>
          <hr className="divider-ink" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink-600">{t.ji.branchPanelTitle}</p>
            <p className="text-[11px] text-ink-400 leading-relaxed">{t.ji.branchPrompt}</p>
            <textarea
              value={branchCondition}
              onChange={(e) => setBranchCondition(e.target.value)}
              placeholder={t.ji.branchPlaceholder}
              rows={2}
              maxLength={120}
              className="w-full px-3 py-2 text-xs border border-ink-200 rounded-lg bg-ink-50 resize-none focus:outline-none focus:border-ink-400"
            />
            <button
              onClick={() => onBranch(branchCondition)}
              disabled={branchGenerating || !branchCondition.trim()}
              className="w-full py-2 text-xs bg-mystic-500 text-white rounded-lg hover:bg-mystic-700 disabled:opacity-50 transition-colors"
              style={{ background: "#7c4da0" }}
            >
              {branchGenerating ? t.ji.branchGenerating : t.ji.branchGenerate}
            </button>

            {branches.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] text-ink-400 uppercase tracking-wide">{t.ji.branchExisting}</p>
                {branches.map((b) => (
                  <div key={b.id} className="flex items-start gap-2 p-2 bg-ink-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-700 truncate">{b.label}</p>
                      <p className="text-[10px] text-ink-400 line-clamp-2">{b.condition}</p>
                    </div>
                    <button
                      onClick={() => onRemoveBranch(b.id)}
                      title={t.ji.deleteBranch}
                      className="text-ink-300 hover:text-coral-400 text-base flex-shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {(isPastEvent || isBranchNode) && (
        <div className="mt-5 flex gap-2">
          {isPastEvent && (
            <button
              onClick={onEdit}
              className="flex-1 py-2 text-xs border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50"
            >
              {t.ji.edit}
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 py-2 text-xs border border-coral-300 text-coral-500 rounded-lg hover:bg-coral-50"
          >
            {t.ji.delete}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function kindLabel(kind: RenderedNode["kind"], t: ReturnType<typeof useT>): string {
  switch (kind) {
    case "birth":     return t.ji.nodeTypes.birth;
    case "milestone": return t.ji.nodeTypes.milestone;
    case "turning":   return t.ji.nodeTypes.turning;
    case "current":   return t.ji.nodeTypes.current;
    case "predicted": return t.ji.mainPath;
    case "alt":       return t.ji.altPath;
    case "branch":    return t.ji.branchTag;
    default:          return kind;
  }
}

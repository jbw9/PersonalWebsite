import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AchievementId } from "./contracts";

export const ACHIEVEMENTS: { id: AchievementId; icon: string; name: string; done: string; hint: string }[] = [
  { id: "story", icon: "🎬", name: "Director", done: "watched Story mode", hint: "Flip the toggle up top to 🎬 Story" },
  { id: "explorer", icon: "🧭", name: "Location Scout", done: "visited every section", hint: "Scroll all the way through the sections" },
  { id: "vibe", icon: "📈", name: "Vibe Check", done: "read the vibe line", hint: "Hover a moment on the vibe line" },
  { id: "shockwave", icon: "💥", name: "Special Effects", done: "set off a shockwave", hint: "Click an empty spot near the particles" },
  { id: "ask", icon: "✻", name: "Press Junket", done: "got an answer from Claude", hint: "Ask Claude a question about Jonathan" },
  { id: "unknown", icon: "🤷", name: "Off Script", done: "asked what nobody wrote down", hint: "Ask Claude something it can't know" },
  { id: "hire", icon: "🤝", name: "Greenlit", done: "ran sudo hire jonathan", hint: "There's a sudo command in the terminal…" },
];
export const byId = (id: AchievementId) => ACHIEVEMENTS.find((a) => a.id === id) as (typeof ACHIEVEMENTS)[number];

export const Toasts = ({ queue, top, right }: { queue: AchievementId[]; top: number; right?: number }) => (
  <div className="fixed right-3 md:right-5 z-[70] flex flex-col items-end gap-2 pointer-events-none transition-[right] duration-500" style={{ top: top + 12, right }}>
    <AnimatePresence>
      {queue.map((id) => {
        const a = byId(id);
        return (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="rx-card flex items-center gap-3 pl-3 pr-4 py-2.5 border-l-2 !border-l-[#5b9cff] shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-[calc(100vw-24px)]"
          >
            <span className="text-lg leading-none">🏆</span>
            <span className="rx-plain text-[11px] md:text-[12px] leading-snug">
              <span className="text-[#5b9cff]">Unlocked</span> · {a.name} <span className="text-[#8692a8]">— {a.done}</span>
            </span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

export const Panel = ({ open, unlocked, onClose, top }: { open: boolean; unlocked: AchievementId[]; onClose: () => void; top: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest("[data-trophy]")) onClose();
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed right-3 md:right-5 z-[70] w-[min(340px,calc(100vw-24px))] rx-card !bg-[#0b111d]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{ top: top + 10 }}
        >
          <div className="px-4 pt-4 pb-3 flex items-baseline justify-between border-b border-[#e6ecf5]/10">
            <span className="text-xl italic">Achievements</span>
            <span className="rx-mono text-[10px] text-[#5b9cff]">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <ul className="py-1.5">
            {ACHIEVEMENTS.map((a) => {
              const got = unlocked.includes(a.id);
              return (
                <li key={a.id} className="flex items-start gap-3 px-4 py-2">
                  <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm border ${got ? "border-[#5b9cff]/60 bg-[#5b9cff]/10" : "border-[#e6ecf5]/10 grayscale opacity-50"}`}>
                    {got ? a.icon : "🔒"}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[17px] leading-tight ${got ? "" : "text-[#8692a8]"}`}>{a.name}</span>
                    <span className={`block rx-plain text-[11px] leading-snug mt-0.5 ${got ? "text-[#a3adbf]" : "text-[#5d687c]"}`}>{got ? a.done : a.hint}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-2.5 border-t border-[#e6ecf5]/10 rx-plain text-[10px] text-[#5d687c]">Kept in memory only · resets on replay</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

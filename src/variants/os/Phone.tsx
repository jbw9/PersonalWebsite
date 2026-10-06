import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Cloud, Mail, Github, Linkedin, Wifi, BatteryFull, Signal, ArrowUpRight } from "lucide-react";
import { APPS, APP_ORDER, AppIcon } from "./apps";
import { AppId, OSContext, EMAIL, GITHUB, LINKEDIN } from "./shared";

// Phone home screen: a widget + app grid; each app opens full-screen from its icon
const Phone = () => {
  const navigate = useNavigate();
  const [app, setApp] = useState<{ id: AppId; x: number; y: number } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const open = useCallback((id: AppId, r?: DOMRect | null) => {
    setApp({ id, x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : window.innerHeight / 2 });
  }, []);
  const close = useCallback(() => setApp(null), []);
  const go = useCallback((p: string) => navigate(p), [navigate]);
  const api = useMemo(() => ({ open, close, go, compact: true }), [open, close, go]);
  const Body = app ? APPS[app.id].Body : null;

  return (
    <OSContext.Provider value={api}>
      <div className="absolute inset-0 flex flex-col">
        <div className="h-11 flex-shrink-0 flex items-center justify-between px-7 text-[14px] font-semibold">
          <span className="tabular-nums">{now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "")}</span>
          <span className="flex items-center gap-1.5">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <BatteryFull className="w-5 h-5" />
          </span>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-3 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 24 }}
            className="os-glass rounded-[26px] p-5"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-[18px] grid place-items-center text-[26px] font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#FF5F05 0%,#E11D74 55%,#6D28D9 100%)" }}
              >
                J
              </div>
              <div className="min-w-0">
                <div className="text-[26px] font-semibold tracking-[-0.03em] leading-none">Jonathan</div>
                <div className="text-[13px] text-white/60 mt-1">CS &amp; Econs @ UIUC</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={(e) => open("experience", e.currentTarget.getBoundingClientRect())} className="w-full flex items-center gap-2.5 text-left rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/25 px-3 py-2.5">
                <Cloud className="w-4 h-4 text-[#FFB547] flex-shrink-0" />
                <span className="text-[13px]">
                  <b className="font-semibold">Incoming SDE @ AWS</b> <span className="text-white/50">· Amazon MSK</span>
                </span>
              </button>
              <button onClick={() => navigate("/project/taxbuddy")} className="w-full flex items-center gap-2.5 text-left rounded-xl bg-[#30D158]/15 border border-[#30D158]/25 px-3 py-2.5">
                <span className="w-2 h-2 rounded-full bg-[#30D158] os-pulse flex-shrink-0 mx-1" />
                <span className="text-[13px] flex-1">
                  <b className="font-semibold">TaxBuddy</b> <span className="text-white/50">· active project</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/50" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {(
                [
                  [`mailto:${EMAIL}`, Mail, "Email"],
                  [GITHUB, Github, "GitHub"],
                  [LINKEDIN, Linkedin, "LinkedIn"],
                ] as const
              ).map(([href, Icon, label]) => (
                <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-[12.5px] font-medium">
                  <Icon className="w-4 h-4" /> {label}
                </a>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-x-3 gap-y-5 mt-7">
            {APP_ORDER.map((id, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.045, type: "spring", stiffness: 320, damping: 19 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => open(id, e.currentTarget.getBoundingClientRect())}
                className="flex flex-col items-center gap-1.5 min-w-0"
              >
                <div className="w-[60px] h-[60px]">
                  <AppIcon id={id} />
                </div>
                <span className="os-icon-label text-[11px] font-medium truncate max-w-full">{APPS[id].name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {app && Body && (
            <motion.div
              key={app.id}
              className="absolute inset-0 z-50 flex flex-col overflow-hidden"
              style={{ transformOrigin: `${app.x}px ${app.y}px`, background: "rgba(14,14,20,0.94)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}
              initial={{ opacity: 0, scale: 0.12, borderRadius: 60 }}
              animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
              exit={{ opacity: 0, scale: 0.12, borderRadius: 60 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="h-12 flex-shrink-0 flex items-center px-3 border-b border-white/[0.08]">
                <button onClick={close} className="flex items-center text-[#0A84FF] text-[15px] font-medium pr-3 py-2">
                  <ChevronLeft className="w-5 h-5" /> Home
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold">{APPS[app.id].name}</span>
              </div>
              {/* Bottom padding keeps content out from under the variant switcher */}
              <div className="flex-1 min-h-0 pb-20 flex flex-col">
                <div className="flex-1 min-h-0 overflow-auto os-scroll">
                  <Body />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OSContext.Provider>
  );
};

export default Phone;

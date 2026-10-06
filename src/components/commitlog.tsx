import { experiences } from "../data";

const NAVY = "#2C3B4D";

// Experience as a single-branch git log: newest first, current job is HEAD
const CommitLog = () => (
  <div className="bg-[#FFFDF8] border border-warm-border rounded-2xl shadow-soft px-3 sm:px-4 py-3">
    {experiences.map((exp, i) => {
      const isHead = i === 0;
      const isLast = i === experiences.length - 1;
      return (
        <div key={`${exp.company}-${exp.title}`} className="flex">
          <div className="relative w-6 flex-shrink-0">
            <span
              className="absolute left-1/2 w-0.5 -translate-x-1/2"
              style={{ top: isHead ? 24 : 0, bottom: isLast ? "calc(100% - 24px)" : 0, background: NAVY }}
            />
            <span
              className="absolute left-1/2 top-6 w-3 h-3 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
              style={{ borderColor: NAVY, background: isHead ? NAVY : "#FFFDF8" }}
            />
          </div>
          <div className="flex-1 min-w-0 flex gap-3 px-2 py-3">
            <img
              src={exp.companyIcon}
              alt={`${exp.company} logo`}
              className="w-9 h-9 rounded-lg object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-3">
                <h3 className="font-semibold text-warm-navy leading-snug">
                  {exp.title}
                  <span className="font-normal text-[#6B93C4]"> @ {exp.company}</span>
                  {exp.website && (
                    <a
                      href={exp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[#6B93C4] hover:text-warm-navy transition-colors"
                    >
                      ↗
                    </a>
                  )}
                  {isHead && (
                    <span className="ml-2 align-middle font-mono text-[10px] px-1.5 py-px rounded bg-[#E2EBF5] text-[#2C5282]">
                      HEAD
                    </span>
                  )}
                </h3>
                <span className="font-mono text-xs text-warm-muted whitespace-nowrap">{exp.period}</span>
              </div>
              <p className="text-sm text-warm-muted leading-relaxed mt-0.5">{exp.description}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default CommitLog;

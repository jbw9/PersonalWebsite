import { motion } from "framer-motion";
import { getTechBadgeColor } from "../lib/utils";

interface Experience {
  title: string;
  company: string;
  companyIcon?: string;
  website?: string;
  period: string;
  description: string;
  technologies: string[];
}

interface ExperienceTimelineProps {
  experiences: Experience[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ExperienceTimeline = ({ experiences }: ExperienceTimelineProps) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-warm-border via-warm-border to-transparent transform md:-translate-x-1/2" />

      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            variants={fadeUp}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-warm-navy border-2 border-warm-bg transform -translate-x-1/2 mt-6 z-10" />

            {/* Desktop: alternating layout */}
            <div
              className={`hidden md:flex items-start gap-8 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Card */}
              <div className={`w-5/12 ${index % 2 === 0 ? "text-left" : "text-right"}`}>
                <span className="inline-block mb-3 text-xs font-medium px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#3730A3] tracking-wide">
                  {exp.period}
                </span>
                <div className="bg-warm-surface border border-warm-border rounded-2xl p-5 hover:shadow-soft-md transition-shadow">
                  <div className={`flex items-start gap-3 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                    {exp.companyIcon && (
                      <img
                        src={exp.companyIcon}
                        alt={`${exp.company} logo`}
                        className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-warm-navy mb-0.5">{exp.title}</h3>
                      <p className="text-sm font-medium text-[#2563EB] mb-2">{exp.company}</p>
                      <p className="text-sm text-warm-muted leading-relaxed mb-3">
                        {exp.description}
                        {exp.website && (
                          <>
                            {" "}
                            <a
                              href={exp.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-warm-navy underline underline-offset-2 hover:text-[#2563EB] transition-colors"
                            >
                              Visit website →
                            </a>
                          </>
                        )}
                      </p>
                      {exp.technologies.length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTechBadgeColor(tech)}`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="w-5/12" />
            </div>

            {/* Mobile layout */}
            <div className="pl-10 md:hidden">
              <span
                className="inline-block mb-3 text-xs font-medium px-3 py-1 rounded-full bg-warm-surface border border-warm-border text-warm-muted"
                style={{ fontFamily: "Caveat, cursive", fontSize: "13px" }}
              >
                {exp.period}
              </span>
              <div className="bg-warm-surface border border-warm-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  {exp.companyIcon && (
                    <img
                      src={exp.companyIcon}
                      alt={`${exp.company} logo`}
                      className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-navy mb-0.5">{exp.title}</h3>
                    <p className="text-sm font-medium text-[#2563EB] mb-2">{exp.company}</p>
                    <p className="text-sm text-warm-muted leading-relaxed mb-3">
                      {exp.description}
                      {exp.website && (
                        <>
                          {" "}
                          <a
                            href={exp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-warm-navy underline underline-offset-2 hover:text-[#2563EB] transition-colors"
                          >
                            Visit website →
                          </a>
                        </>
                      )}
                    </p>
                    {exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTechBadgeColor(tech)}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceTimeline;

import { Badge } from "./badge";

interface Experience {
  title: string;
  company: string;
  companyIcon?: string; // Direct URL/address to company logo image (e.g., "https://example.com/logo.png")
  website?: string;
  period: string;
  description: string;
  technologies: string[];
}

interface ExperienceTimelineProps {
  experiences: Experience[];
}

const ExperienceTimeline = ({ experiences }: ExperienceTimelineProps) => {
  return (
    <div className="relative">
      {/* Timeline line with fade effect */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-portfolio-accent via-portfolio-accent to-transparent"></div>

      <div className="space-y-12">
        {experiences.map((exp, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute z-10 w-4 h-4 transform -translate-x-1/2 border-4 rounded-full left-1/2 bg-portfolio-blue border-portfolio-dark"></div>

            {/* Desktop layout */}
            <div
              className={`hidden md:flex items-center ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`w-5/12 ${
                  index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                }`}
              >
                {/* Date badge */}
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 text-sm font-medium text-white rounded-full bg-portfolio-blue">
                    {exp.period}
                  </span>
                </div>

                {/* Content card */}
                <div className="p-6 transition-all duration-300 border rounded-lg bg-portfolio-slate border-portfolio-accent/20 hover:border-portfolio-blue/50">
                  <div
                    className={`flex items-start gap-4 ${
                      index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Company icon */}
                    {exp.companyIcon && (
                      <div className="flex-shrink-0">
                        <img
                          src={exp.companyIcon}
                          alt={`${exp.company} logo`}
                          className="object-contain w-12 h-12 rounded"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold text-white">
                        {exp.title}
                      </h3>

                      <p className="mb-4 font-medium text-portfolio-blue">
                        {exp.company}
                      </p>

                      <p className="mb-4 leading-relaxed text-portfolio-light">
                        {exp.description}
                        {exp.website && (
                          <>
                            {" "}
                            <a
                              href={exp.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline hover:text-blue-300"
                            >
                              Check out our website
                            </a>
                          </>
                        )}
                      </p>
                      <div
                        className={`flex flex-wrap gap-2 ${
                          index % 2 === 0 ? "justify-end" : "justify-start"
                        }`}
                      >
                        {exp.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-portfolio-dark text-portfolio-light"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty space for the other side */}
              <div className="w-5/12"></div>
            </div>

            {/* Mobile layout */}
            <div className="pl-8 md:hidden">
              {/* Date badge */}
              <div className="mb-4">
                <span className="px-4 py-2 text-sm font-medium text-white rounded-full bg-portfolio-blue">
                  {exp.period}
                </span>
              </div>

              {/* Content card */}
              <div className="relative p-6 transition-all duration-300 border rounded-lg bg-portfolio-slate border-portfolio-accent/20 hover:border-portfolio-blue/50">
                {/* Company icon in top right corner for mobile */}
                {exp.companyIcon && (
                  <div className="absolute top-4 right-4">
                    <img
                      src={exp.companyIcon}
                      alt={`${exp.company} logo`}
                      className="object-contain w-12 h-12 rounded"
                    />
                  </div>
                )}

                <div className={`${exp.companyIcon ? "mr-16" : ""}`}>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {exp.title}
                  </h3>

                  <p className="mb-4 font-medium text-portfolio-blue">
                    {exp.company}
                  </p>

                  <p className="mb-4 leading-relaxed text-portfolio-light">
                    {exp.description}
                    {exp.website && (
                      <>
                        {" "}
                        <a
                          href={exp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          Check out our website
                        </a>
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-portfolio-dark text-portfolio-light"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceTimeline;

"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  position: string;
  date: string;
  location: string;
  content: React.ReactNode;
  logoUrl: string;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-black" ref={containerRef}>
      <div className="pt-20 pb-10 mx-auto max-w-7xl">
        <h2 className="mb-2 text-5xl font-bold text-white">Experience</h2>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start mb-20 md:gap-10">
            <div className="sticky z-40 flex flex-col items-center self-start max-w-xs md:flex-row top-40 lg:max-w-sm md:w-full">
              <div
                className="absolute flex items-center justify-center w-10 h-10 overflow-hidden bg-white rounded-full left-3 md:left-3 dark:bg-black"
                style={{ top: "0.25rem" }}
              >
                <img
                  src={item.logoUrl}
                  alt={`${item.title} logo`}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="hidden md:block md:pl-20">
                <h3 className="mb-3 text-xl font-bold text-white md:text-5xl">
                  {item.title}
                </h3>
                <p className="mb-2 text-lg font-bold text-gray-300">
                  {item.position}
                </p>
                <p className="mb-2 text-sm text-gray-500">{item.date}</p>
                <p className="text-sm text-gray-500">{item.location}</p>
              </div>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <div className="block mb-6 text-left md:hidden">
                <h3 className="mb-3 text-2xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mb-2 text-lg font-bold text-gray-300">
                  {item.position}
                </p>
                <p className="mb-2 text-sm text-gray-500">{item.date}</p>
                <p className="text-sm text-gray-500">{item.location}</p>
              </div>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

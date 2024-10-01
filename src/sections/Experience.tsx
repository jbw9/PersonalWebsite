import React from "react";
import { Timeline } from "../components/experience-timeline";

const Experience = () => {
  const data = [
    {
      title: "Tulip.",
      position: "Founding Full Stack Engineer",
      date: "May 2024 - Present",
      location: "Chicago, IL",
      logoUrl: "/experience/tuliplogo.png",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 dark:text-neutral-200 md:text-sm">
            Visit{" "}
            <a
              href="https://tulip.estate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              tulip.estate
            </a>{" "}
            for more information! Or click the website preview below!
          </p>
          <div className="flex items-center gap-2 mb-4 text-xs text-neutral-700 dark:text-neutral-300 md:text-sm">
            ✅ Support us by joining the waitlist!
          </div>
          <a
            href="https://tulip.estate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/experience/tulipwebsite.png"
              alt="tulip website"
              className="object-cover w-full mb-2 transition-transform duration-300 ease-in-out rounded-lg hover:scale-105"
            />
          </a>
          <text className="text-xs text-neutral-300 md:text-sm">
            👨🏻‍💻 Tech used: React Native, AWS, Flask, Python
          </text>
        </div>
      ),
    },
    {
      title: "WeHearYou ASL",
      position: "Software Engineer Intern",
      date: "May 2024 - August 2024",
      location: "Peoria, IL",
      logoUrl: "/experience/wehearyoulogo.png",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 dark:text-neutral-200 md:text-sm">
            Worked on a mobile app that translate ASL to English in real time
            using machine learning
          </p>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 md:text-sm">
              ✅ Completely redesigned the Android App
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 md:text-sm">
              ✅ Improved accessibility by up to 35% through implementing
              adjustable translation speed and font size options
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 md:text-sm">
              ✅ Added additional language support for 5 new languages
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 md:text-sm">
              ✅ Implemented a built in feedback, app support and FAQ section on
              the app
            </div>
          </div>
          <img
            src="/experience/why1.png"
            alt="tulip website"
            className="object-cover w-full mb-2 transition-transform duration-300 ease-in-out rounded-lg hover:scale-105"
          />
          <img
            src="/experience/why2.png"
            alt="tulip website"
            className="object-cover w-full mb-2 transition-transform duration-300 ease-in-out rounded-lg hover:scale-105"
          />
          <text className="text-xs text-neutral-300 md:text-sm">
            👨🏻‍💻 Tech used: Android Studio, Java, Tensorflow
          </text>
        </div>
      ),
    },
    {
      title: "iVenture Accelerator",
      position: "Full Stack Engineer @Tulip.",
      date: "May 2024 - August 2024",
      location: "Chicago, IL",
      logoUrl: "/experience/iventurelogo.png",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 dark:text-neutral-200 md:text-sm">
            The premier educational accelerator for the top student startups at
            the University of Illinois and beyond.
          </p>
          <p className="mb-4 text-xs font-normal text-neutral-800 dark:text-neutral-200 md:text-sm">
            Accepted into the accelerator as part of team Tulip. where we
            received $20,000 in non-dilutive funding, mentorship, and access to
            resources to help us grow our startup.
          </p>
          <a
            href="http://iventure.illinois.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/experience/iventure1.png"
              alt="tulip website"
              className="object-cover w-full mb-2 transition-transform duration-300 ease-in-out rounded-lg hover:scale-105"
            />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="w-[80%] md:w-[40%] justify-center flex flex-col">
      <Timeline data={data} />
    </div>
  );
};

export default Experience;

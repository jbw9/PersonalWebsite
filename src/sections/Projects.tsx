import React from "react";
import { FocusCards } from "../components/project-preview-cards";

const Projects = () => {
  const cards = [
    {
      title: "explorify",
      src: "/projects/explorify.png",
      logo: "/projects/explorify/logo.png",
      content: (
        <div>
          <text className="text-xl text-white">Work on progress....</text>
        </div>
      ),
    },
    {
      title: "akar.study",
      src: "/projects/akar.png",
      logo: "projects/explorify/logo.png",
      content: <div></div>,
    },
    {
      title: "GoBites",
      src: "/projects/gobites.png",
      category: "Food Delivery App",
      logo: "projects/explorify/logo.png",
      content: (
        <div>
          <text className="text-xl text-white">Work on progress....</text>
        </div>
      ),
    },
    {
      title: "permiasuiuc.org",
      src: "/projects/permias.png",
      logo: "projects/explorify/logo.png",
      content: (
        <div>
          <text className="text-xl text-white">Work on progress....</text>
        </div>
      ),
    },
    {
      title: "talenta",
      src: "/projects/talenta.png",
      logo: "/projects/explorify/logo.png",
      content: (
        <div>
          <text className="text-xl text-white">Work on progress....</text>
        </div>
      ),
    },
  ];

  return (
    <div className="w-[80%] md:w-[40%] justify-center mt-14 flex flex-col">
      <text className="mb-2 text-4xl font-bold text-white md:text-5xl">
        Projects
      </text>
      <FocusCards cards={cards} />
    </div>
  );
};

export default Projects;

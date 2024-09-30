import React from "react";
import { FocusCards } from "../components/project-preview-cards";

const Projects = () => {
  const cards = [
    {
      title: "explorify",
      src: "/projects/explorify.png",
    },
    {
      title: "akar.study",
      src: "/projects/akar.png",
    },
    {
      title: "GoBites",
      src: "/projects/gobites.png",
    },
    {
      title: "permiasuiuc.org",
      src: "/projects/permias.png",
    },
    {
      title: "talenta",
      src: "/projects/talenta.png",
    },
  ];
  return (
    <div className="w-[80%] md:w-[40%] justify-center mt-14 flex flex-col">
      <text className="mb-2 text-4xl font-bold text-white">Projects</text>
      <FocusCards cards={cards} />
    </div>
  );
};

export default Projects;

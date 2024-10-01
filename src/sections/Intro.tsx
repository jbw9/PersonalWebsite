import React from "react";
import HelloWave from "../components/HelloWave";

const Intro = () => {
  return (
    <div className="w-[80%] md:w-[40%] justify-center mt-14 flex flex-col">
      <text className="text-4xl font-bold text-white md:text-5xl">
        Hello! <HelloWave />
      </text>
      <text className="text-xl font-bold text-white md:text-2xl">
        Welcome to my website! I'm Jonathan Bernard Widjajakusuma, a student at
        the University of Illinois at Urbana-Champaign 🌽
      </text>
    </div>
  );
};

export default Intro;

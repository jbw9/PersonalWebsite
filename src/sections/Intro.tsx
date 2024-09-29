import React from "react";
import HelloWave from "../components/HelloWave";

const Intro = () => {
  return (
    <div className="w-[40%] justify-center mt-14 flex flex-col">
      <text className="text-5xl font-bold text-white">
        Hello! <HelloWave />
      </text>
      <text className="text-2xl font-bold text-white">
        Welcome to my website! I'm Jonathan Bernard Widjajakusuma, a student at
        the University of Illinois at Urbana-Champaign.
      </text>
    </div>
  );
};

export default Intro;

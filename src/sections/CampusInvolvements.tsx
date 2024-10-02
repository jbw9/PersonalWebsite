import React from "react";
import { Carousel, Card } from "../components/campus-involvements"; // Adjust the import path as needed

const CampusInvolvement = () => {
  // Sample data for the cards
  const involvements = [
    {
      src: "/campusInvolvements/iventure.png",
      title: "Iventure Accelerator (10th Cohort)",
      category: "Full Stack Engineer @Tulip.",
      link: "http://iventure.illinois.edu/",
    },
    {
      src: "/campusInvolvements/cozad.png",
      title: "2024 Cozad New Venture Challenge",
      category: "Full Stack Engineer @Talenta",
      link: "https://tec.illinois.edu/programs/cozad",
    },
    {
      src: "/campusInvolvements/acm.png",
      title: "ACM UIUC",
      category: "Full Stack Engineer @SigMobile",
      link: "https://www.acm.illinois.edu/",
    },
    {
      src: "/campusInvolvements/buildillinois.png",
      title: "BuildIllinois",
      category: "Full Stack Engineer",
      link: "https://buildillinois.notion.site/",
    },
    {
      src: "/campusInvolvements/permias.png",
      title: "Indonesian Students Association",
      category: "Technology & Fundraising Officer",
      link: "https://permiasuiuc.org/",
    },
    {
      src: "/campusInvolvements/otcr.png",
      title: "OTCR Consulting",
      category: "Consultant",
      link: "https://otcrconsulting.com/",
    },
  ];

  return (
    <div className="w-[80%] md:w-[40%] justify-center mt-20 flex flex-col mb-[200px]">
      <text className="mb-2 text-4xl font-bold text-white md:text-5xl">
        Campus Involvements
      </text>
      <div className="ml-[-15px]">
        <Carousel
          items={involvements.map((data, index) => (
            <Card key={index} card={data} />
          ))}
        />
      </div>
    </div>
  );
};

export default CampusInvolvement;

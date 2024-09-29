import React from "react";
import { Carousel, Card } from "../components/campus-involvements"; // Adjust the import path as needed

const CampusInvolvement = () => {
  // Sample data for the cards
  const involvements = [
    {
      src: "/path-to-image1.jpg",
      title: "Student Government",
      category: "Leadership",
      content: (
        <p>
          Served as the Vice President of Student Affairs, organizing
          campus-wide events and initiatives.
        </p>
      ),
    },
    {
      src: "/path-to-image2.jpg",
      title: "Debate Club",
      category: "Academic",
      content: (
        <p>
          Participated in regional debates and won first place in the state-wide
          competition.
        </p>
      ),
    },
    {
      src: "/path-to-image3.jpg",
      title: "Environmental Society",
      category: "Community Service",
      content: (
        <p>
          Led a campus-wide recycling program that increased recycling rates by
          30%.
        </p>
      ),
    },
    // Add more involvement items as needed
  ];

  return (
    <div className="w-full mt-14 mb-[200px]">
      <h2 className="mb-8 text-4xl font-bold text-center text-white">
        Campus Involvements
      </h2>
      <Carousel
        items={involvements.map((item, index) => (
          <Card key={index} card={item} index={index} />
        ))}
      />
    </div>
  );
};

export default CampusInvolvement;

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { projects } from "../data/projectdetails";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-portfolio-dark text-portfolio-light">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Project Not Found
          </h1>
          <Button
            onClick={() => navigate("/")}
            className="bg-portfolio-blue hover:bg-portfolio-blue/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portfolio-dark text-portfolio-light">
      {/* Navigation */}
      <nav className="border-b border-portfolio-slate">
        <div className="max-w-6xl px-6 py-4 mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-portfolio-light hover:text-portfolio-blue"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </nav>

      {/* Project Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {project.title}
          </h1>
          <p className="mb-6 text-xl text-portfolio-light">
            {project.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="bg-portfolio-blue hover:bg-portfolio-blue/80"
              onClick={() => window.open(project.github)}
            >
              <Github className="w-4 h-4 mr-2" />
              View Code
            </Button>
            <Button
              variant="outline"
              className="border-portfolio-accent text-portfolio-light hover:bg-portfolio-slate"
              onClick={() => window.open(project.demo)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Demo
            </Button>
          </div>
        </div>

        {/* Project Image */}
        <div className="mb-12">
          <img
            src={project.image}
            alt={project.title}
            className="object-cover w-full h-64 border rounded-lg md:h-96 border-portfolio-accent/20"
          />
        </div>

        {/* Technologies */}
        <Card className="mb-8 bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-portfolio-dark text-portfolio-light"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-8 bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              About This Project
            </h2>
            <p className="leading-relaxed text-portfolio-light">
              {project.longDescription}
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Key Features
            </h2>
            <ul className="space-y-3">
              {project.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start text-portfolio-light"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 mr-3 rounded-full bg-portfolio-blue"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;

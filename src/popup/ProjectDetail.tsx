import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useEffect } from "react";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const projects = [
    {
      id: "task-management",
      title: "Task Management App",
      description:
        "A full-stack task management application with real-time collaboration features. Users can create teams, assign tasks, and track progress.",
      longDescription:
        "This comprehensive task management application was built to address the need for efficient team collaboration. The application features real-time updates using Socket.io, allowing team members to see changes instantly. Users can create projects, assign tasks with due dates, set priorities, and track progress through various stages. The application includes user authentication, role-based permissions, and a responsive design that works seamlessly across desktop and mobile devices.",
      technologies: [
        "React",
        "Express.js",
        "MongoDB",
        "Socket.io",
        "JWT",
        "Tailwind CSS",
      ],
      features: [
        "Real-time collaboration with Socket.io",
        "User authentication and authorization",
        "Task assignment and tracking",
        "Team management functionality",
        "Progress visualization with charts",
        "Responsive design for all devices",
      ],
      github: "#",
      demo: "#",
      image: "/placeholder.svg",
    },
    {
      id: "ecommerce-platform",
      title: "E-commerce Platform",
      description:
        "Modern e-commerce platform with payment integration, inventory management, and admin dashboard.",
      longDescription:
        "A complete e-commerce solution built with modern web technologies. This platform includes a customer-facing storefront with product browsing, shopping cart functionality, and secure payment processing through Stripe. The admin dashboard provides comprehensive inventory management, order tracking, and sales analytics. The application is built with Next.js for optimal performance and SEO, uses Prisma for type-safe database operations, and implements best practices for security and scalability.",
      technologies: [
        "Next.js",
        "Stripe",
        "Prisma",
        "PostgreSQL",
        "TypeScript",
        "Tailwind CSS",
      ],
      features: [
        "Secure payment processing with Stripe",
        "Comprehensive admin dashboard",
        "Inventory management system",
        "Order tracking and management",
        "Customer account management",
        "Sales analytics and reporting",
      ],
      github: "#",
      demo: "#",
      image: "/placeholder.svg",
    },
    {
      id: "ml-dashboard",
      title: "Machine Learning Dashboard",
      description:
        "Interactive dashboard for visualizing machine learning model performance and data analytics.",
      longDescription:
        "An advanced analytics dashboard designed for data scientists and machine learning engineers. The dashboard provides interactive visualizations for model performance metrics, data distribution analysis, and feature importance. Built with Python Flask backend for handling ML computations and D3.js for creating dynamic, interactive charts. The application includes model comparison tools, hyperparameter visualization, and automated reporting features.",
      technologies: [
        "Python",
        "Flask",
        "D3.js",
        "Scikit-learn",
        "Pandas",
        "NumPy",
      ],
      features: [
        "Interactive data visualizations",
        "Model performance comparison",
        "Feature importance analysis",
        "Hyperparameter optimization tracking",
        "Automated report generation",
        "Real-time model monitoring",
      ],
      github: "#",
      demo: "#",
      image: "/placeholder.svg",
    },
  ];

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

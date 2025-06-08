import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { guides } from "../data";

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guide = guides.find((g) => g.id === id);

  if (!guide) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-portfolio-dark text-portfolio-light">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Guide Not Found
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

      {/* Guide Content */}
      <div className="max-w-4xl px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="border-portfolio-blue/50 text-portfolio-blue"
                >
                  {guide.category}
                </Badge>
                <span className="text-sm text-portfolio-accent">•</span>
                <span className="text-sm text-portfolio-accent">
                  {guide.publishDate}
                </span>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                {guide.title}
              </h1>
              <p className="text-xl text-portfolio-light">
                {guide.description}
              </p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="bg-portfolio-slate border-portfolio-accent/20">
          <CardContent className="p-8">
            <div className="prose prose-invert max-w-none">
              <div className="leading-relaxed whitespace-pre-line text-portfolio-light">
                {guide.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideDetail;

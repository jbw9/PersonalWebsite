import { Suspense, useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { variants } from "./registry";

const VariantPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const variant = variants.find((v) => v.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  if (!variant) return <Navigate to="/" replace />;
  const { Component } = variant;
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      {/* location.key changes on every navigation, so "replay" remounts and reruns the intro */}
      <Component key={location.key} />
    </Suspense>
  );
};

export default VariantPage;

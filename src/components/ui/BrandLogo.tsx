import React from "react";

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => (
  <img
    src="/yapster-logo.png"
    alt="Yapster"
    className={`shrink-0 object-contain ${className}`}
  />
);

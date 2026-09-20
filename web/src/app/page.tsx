import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MapShowcase } from "@/components/MapShowcase";
import { FeatureGrid } from "@/components/FeatureGrid";
import { CodeWorkbench } from "@/components/CodeWorkbench";
import { ApiEndpoints } from "@/components/ApiEndpoints";
import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <MapShowcase />
        <FeatureGrid />
        <CodeWorkbench />
        <ApiEndpoints />
        <Architecture />
      </main>
      <Footer />
    </div>
  );
}

import type { NextConfig } from "next";

// Repo name — used as the GitHub Pages base path (havardljohansen.github.io/<repo>/).
const repo = "alfa-harness";
const isPages = process.env.GH_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export", // fully static — no server needed (GitHub Pages friendly)
  images: { unoptimized: true },
  trailingSlash: true, // emit /wires/index.html so Pages serves clean URLs
  basePath: isPages ? `/${repo}` : undefined,
  assetPrefix: isPages ? `/${repo}/` : undefined,
};

export default nextConfig;

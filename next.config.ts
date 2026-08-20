import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Thumbnail peta statis di halaman denah. Tanpa entri ini next/image
      // menolak host-nya dan thumbnail-nya kosong.
      { protocol: "https", hostname: "api.mapbox.com" },
    ],
  },
};

export default nextConfig;

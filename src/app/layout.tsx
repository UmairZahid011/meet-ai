import type { Metadata } from "next";
import "./globals.css";
import '@stream-io/video-react-sdk/dist/css/styles.css'; 
import { Providers } from "./providers";
import { Suspense } from "react";
import FullPageLoader from "@/components/Loader";


export const metadata: Metadata = {
  // title: "Call Rio",
  description: "AI-Driven Solutions for a Smarter Tomorrow",
   icons: {
    icon: "/imgs/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
          <Suspense fallback={<FullPageLoader size={40}/>}>
            <Providers>{children}</Providers>
          </Suspense>
      </body>
    </html>
  );
}

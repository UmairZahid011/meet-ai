'use client'
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect } from "react";
import AOS from 'aos'
import 'aos/dist/aos.css';
import { CursorBall } from "./components/cursor-ball";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    AOS.init({
      duration: 1100,
      once: false,
      mirror: true,
    });

    const handleLoad = () => {
      AOS.refresh();
    };

    window.addEventListener('load', handleLoad);
    AOS.refresh();

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (

    <>
      <div className="bg-[#000] landing-main">
        <Header/>
        <main className="overflow-x-hidden">
          <CursorBall/>
            {children}
        </main>
        <Footer/>
      </div>
    </>
  );
}

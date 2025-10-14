'use client'
import { adminLinks, userLinks } from "@/constants/menu-constants";
import { Droplet, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  isGoogleAuth: boolean | null;
  isAdmin: boolean | undefined;
}

export const Sidebar = ({ isGoogleAuth, isAdmin }: SidebarProps) => {
  
  const [isOpen, setisOpen] = useState(false)
  const sidebarLinks = isAdmin ? adminLinks : userLinks;
  const pathname = usePathname();
  
  return (
    <>
      <button onClick={()=>setisOpen(!isOpen)} className="lg:hidden block fixed top-4 left-4 z-100"><Menu className="text-white size-8"/></button>
      <div className={`bg-layer bg-[#ffffff19] fixed w-full h-full min-h-screen z-[89] top-0 left-0 lg:hidden ${isOpen ? 'visible' : 'hidden'}`} onClick={()=>{setisOpen(!isOpen)}}>
      </div>
      <aside className={`min-w-[280px] lg:bg-[#101010] bg-black z-90 shadow-lg transition-all duration-300 ease-in-out min-h-screen max-h-screen overflow-y-auto p-4 fixed left-0 top-0 scroll-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-[-100%]'}`}>
        <div className="mb-[50px] flex justify-center items-center gap-2">
          <Link href={'/'}>
              <Image src={'/assets/imgs/Logo-New.png'} alt='logo' height={80} width={80} className='transition-all ease-in-out duration-300' />
          </Link>
        </div>

        <ul className="flex gap-4 flex-col">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                onClick={()=>setisOpen(!isOpen)}
                href={link.href}
                className={`flex gap-2 items-center text-white py-[10px] px-[14px] rounded-full bg-primary-light hover:text-primary active:text-primary
                  ${!isGoogleAuth && !isAdmin ? "pointer-events-none opacity-50" : ""}
                  ${pathname === link.href ? "text-primary active" : ""}
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

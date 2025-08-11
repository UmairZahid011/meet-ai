'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ArrowRight, Droplet, Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>([]);
  const [islogin, setIslogin] = useState(false);

  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (session) {
      setIslogin(true);
      setUser(session.user);
    }
  }, [session]);

  return (
    <>
      <header className={`py-[14px] z-[100] header-main fixed w-full top-0 ${isScrolled ? 'bg-[#000] border-b border-gray-800 shadow-lg' : 'bg-transparent'}`}>
        <div className="container relative">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href={'/'}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-gradiant rounded-full flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-xl">MeetAi.</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 list-none">
              <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link></li>
              <li><Link href="#about" className={pathname === '/#about' ? 'active' : ''}>About Us</Link></li>
              <li><Link href="#feature" className={pathname === '/#feature' ? 'active' : ''}>Features</Link></li>
              <li><Link href="/blogs" className={pathname === '/blogs' ? 'active' : ''}>Blogs</Link></li>
              <li><Link href="#contact" className={pathname === '/#contact' ? 'active' : ''}>Contact Us</Link></li>
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center">
              <button
                className="text-white focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Auth/Login Button */}
            <div className="hidden lg:block">
              {
                islogin && user !== undefined ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-full bg-primary-gradiant hover:text-white text-white w-10 h-10 flex items-center justify-center font-bold text-lg p-0 focus-visible:ring-offset-0 focus-visible:ring-0"
                      >
                        {user.name?.[0]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={user.isAdmin ? '/admin' : '/user'}>Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <button className="primary-btn !py-[10px]">
                      Sign in <ArrowRight />
                    </button>
                  </Link>
                )
              }
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#111111] border-t border-gray-800 px-6 py-4">
            <nav className="flex flex-col gap-4 text-white text-base">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link href="#feature" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
              <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>

              <div className="mt-4">
                {
                  islogin && user !== undefined ? (
                    <>
                      <Link href={user.isAdmin ? '/admin' : '/user'} onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="primary-btn w-full text-left mb-2">Dashboard</button>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="primary-btn w-full text-left"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="primary-btn w-full text-left">
                        Sign in <ArrowRight />
                      </button>
                    </Link>
                  )
                }
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

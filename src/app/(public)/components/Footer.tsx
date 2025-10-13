'use client';

import Newsletter from '@/components/newsletter';
import {
  Facebook,
  Instagram,
  X,
  Droplet
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [islogin, setIslogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setIslogin(true);
      if (session.user.isAdmin) {
        setIsAdmin(true);
      }
    }
  }, [session]);

  return (
    <footer className="w-full text-white px-4 sm:px-6">
      <div className="mx-auto max-w-[1600px] py-[50px] rounded-xl bg-glass-color">

        {/* CTA Section */}
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#ffffff0a] rounded-xl border border-[#ffffff0a] p-4 sm:p-6 md:p-12 mb-14">
            <h2 className="text-center md:text-left text-2xl font-semibold">
              LET&apos;S WORK <span className="text-gradiant-primary">TOGETHER</span>
            </h2>
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn w-[40px] md:w-[80px] h-[40px] md:h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55" fill="none">
                  <path d="M53.8624 27.4308L29.5072 51.7859L25.6575 47.9362L43.4409 30.1529L1.72293 30.1529L1.72293 24.7087L43.4409 24.7087L25.6575 6.92537L29.5073 3.07564L53.8624 27.4308Z" stroke="white" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Grid Sections */}
        <div className="container grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 xl:gap-10 text-sm">
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 !text-[20px] sm:!text-[24px]">Get In Touch</h3>
            <p className="text-gray-400">hello@youraicompany.com</p>
            <p className="font-semibold text-white mt-1">+1 (800) 123-4567</p>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-4 !text-[20px] sm:!text-[24px]">Our Location</h3>
            <p className="text-gray-400">123 Innovation Street, Tech City,</p>
            <p className="text-gray-400">NY 10001, USA</p>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4 !text-[20px] sm:!text-[24px]">Social Media</h3>
            <div className="flex gap-3 mt-2">
              {[X, Facebook, Instagram].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-[#1b1b1b] flex items-center justify-center text-red-500 hover:text-white transition"
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter + Links */}
          <div>
            <h3 className="font-semibold mb-4 !text-[20px] sm:!text-[24px]">Subscribe Newsletter&apos;s</h3>
            <div className="w-full">
              <Newsletter />
            </div>
            <ul className="flex flex-wrap gap-3 items-center mt-4">
              <li><Link href="/privacy-policy" className="text-white font-semibold text-sm hover:text-[#E24C4A]">Privacy Policy</Link></li>
              <li><Link href="/terms-&-condition" className="text-white font-semibold text-sm hover:text-[#E24C4A]">Term & Conditions</Link></li>
              <li><Link href="/refund-policy" className="text-white font-semibold text-sm hover:text-[#E24C4A]">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-800 pt-10 text-sm">
          <div className="container">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <Link href={'/'} className="flex items-center gap-2">
                <Image src={'/assets/imgs/Logo-New.png'} alt='logo' height={70} width={70} className='transition-all ease-in-out duration-300'/>
              </Link>
              <p className="text-gray-400">Copyright © 2025 All Rights Reserved.</p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

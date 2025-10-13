'use client'
import ContactForm from "@/components/contactForm";
import { ArrowRight, BarChart, Bot, BotMessageSquare, Calendar1Icon, NotebookPen, PhoneIcon, Video, VideoIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image";
import Link from "next/link";
import TestimonialSection from "./components/Testimonial-section";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BlogSection from "./components/blog-section";
import { faqs } from "@/constants/faq";
import PricingSection from "./components/pricing-section";


export default function Home() {
  const [islogin, setIslogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: session} = useSession();
  
  useEffect(()=>{
    if(session){
      setIslogin(true)
      if(session.user.isAdmin){
        setIsAdmin(true)
      }
    }
  }, [session])
  

  return (
    <>
      <section className="hero-section">
        <div className="container relative">
          <div className="floating-icons">
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn" data-aos="zoom-in" data-aos-delay="200"><VideoIcon className="!transform-none"/></button>
            </Link>
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn" data-aos="zoom-in" data-aos-delay="200"><BotMessageSquare className="!transform-none"/></button>
            </Link>
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn" data-aos="zoom-in" data-aos-delay="200"><Calendar1Icon className="!transform-none"/></button>
            </Link>
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn" data-aos="zoom-in" data-aos-delay="200"><NotebookPen className="!transform-none"/></button>
            </Link>
          </div>

          <div className="text-center max-w-[750px] mx-auto flex flex-col gap-[20px] items-center" data-aos="fade-up" data-aos-delay="600">
            <h4 data-aos="fade-down" className="small-heading" data-aos-delay="700">Welcome to CallRio</h4>
            <h1 data-aos="zoom-in-up" data-aos-delay="800">AI-Driven Solutions for a Smarter Tomorrow</h1>
            <p data-aos="fade-up" data-aos-delay="900">
              Easily schedule a meeting with your AI Agent, have meaningful conversations, and let CallRio do the heavy lifting — taking notes, summarizing key points, and giving you a full video recording, all in your dashboard. It&apos;s smart, simple, and built to save you time.
            </p>
            <Link href={islogin && !isAdmin ? '/user' : '/login'}>
              <button className="primary-btn w-[50px] md:w-[100px] h-[50px] md:h-[100px] mt-[50px]" data-aos="zoom-in" data-aos-delay="1000">
                <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55" fill="none">
                  <path d="M53.8624 27.4308L29.5072 51.7859L25.6575 47.9362L43.4409 30.1529L1.72293 30.1529L1.72293 24.7087L43.4409 24.7087L25.6575 6.92537L29.5073 3.07564L53.8624 27.4308Z" stroke="white" />
                </svg>
              </button>
            </Link>
          </div>

        </div>
      </section>
      <section className="md:mb-[100px] mb-[50px] md:block hidden">
        <div className="container">
          <div className="grid md:grid-cols-3  justify-center w-full md:px-[50px] lg-gap-0 gap-3">
            <div className="md:mr-[-50px] w-full" data-aos="fade-left" data-aos-delay="200">
                <Image src={'/assets/imgs/admin-dashboard-img.png'} width={1000}  height={1000} className="w-full h-full rounded-lg md:-rotate-[10deg] hover:shadow-2xl shadow-[#386bb735] transition-all duration-200 ease-in-out cursor-pointer md:min-h-[400px] object-cover object-left border border-border" alt="img"></Image>
            </div>
            <div className="relative z-[9] md:scale-110 md:mb-[50px] w-full" data-aos="zoom-in">
                <Image src={'/assets/imgs/user-dashboard-img.png'} width={1000}  height={1000} className="w-full h-full rounded-lg hover:shadow-2xl shadow-[#386bb735] transition-all duration-200 ease-in-out cursor-pointer md:min-h-[400px] object-cover object-left border border-border" alt="img"></Image>
            </div>
            <div className="md:ml-[-50px] w-full" data-aos="fade-right" data-aos-delay="200">
                <Image src={'/assets/imgs/meeting-ss-img.png'} width={1000}  height={1000} className="w-full h-full rounded-lg md:rotate-[10deg] hover:shadow-2xl shadow-[#386bb735] transition-all duration-200 ease-in-out cursor-pointer md:min-h-[400px] object-cover object-left border border-border" alt="img"></Image>
            </div>
          </div>
        </div>
        <div>

        </div>
      </section>
      <section className="md:mt-[100px] mt-[50px]" id="about">
        <div className="container">
          <div className="grid grid-cols-10 gap-10">
            <div className="col-span-full lg:col-span-3" data-aos="fade-right">
              <div className="glare-img">
                <Image src={'/assets/imgs/about-us.jpg'} width={1000} height={1000} className="w-full h-full rounded-xl aspect-[9/16] max-h-[450px] object-cover" alt="img"></Image>
              </div>
            </div>
            <div className="col-span-full lg:col-span-7">
              <h4 data-aos="fade-down" className="small-heading !mx-0 !mb-5">ABout Us</h4>
              <h2 data-aos="zoom-in">We use smart AI and human thinking to help businesses grow, work better, and fix problems easily. It’s not just about technology  it’s about making a real difference with clear, helpful ideas.</h2>
              <div className="flex gap-5 items-center mt-[50px]">
                <button className="w-[100px] h-[100px] -rotate-45 hover:rotate-0 transition-all duration-300 ease-in-out p-[15px]" data-aos="fade-right" data-aos-delay="100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="82" height="82" viewBox="0 0 82 82" fill="none"><g clipPath="url(#clip0_1181_21)"><path d="M81.014 41.014L43.9568 78.0713L37.6288 71.7432L63.9438 45.4282L1.69582 45.2535L1.67076 36.3292L63.9187 36.504L37.4556 10.0408L43.7482 3.74819L81.014 41.014Z" stroke="url(#paint0_linear_1181_21)"></path></g><defs><linearGradient id="paint0_linear_1181_21" x1="17.6675" y1="19.5589" x2="60.3419" y2="62.2333" gradientUnits="userSpaceOnUse"><stop stopColor="#386BB7"></stop><stop offset="1" stopColor="#E24C4A"></stop></linearGradient><clipPath id="clip0_1181_21"><rect width="82" height="82" fill="white"></rect></clipPath></defs></svg>
                </button>
                <p data-aos="fade-left" data-aos-delay="150">At CallRio, we blend advanced AI technology with real human understanding to create smart solutions that truly make a difference. We&apos;re not just building tools  we&apos;re transforming how businesses connect, grow, and thrive. With innovation at our core and purpose in every line of code, we help you work smarter, not harder.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-[24px] md:my-[100px] my-[50px]" id="feature">
        <div className="bg-glass-color md:py-[100px] py-[50px] my-[100px] rounded-3xl max-w-[1600px] mx-auto">
          <div className="container">
            <div className="mb-10 text-center">
              <h4 data-aos="fade-down" className="small-heading">Features</h4>
              <h2 data-aos="fade-up">Transforming Your Vision with <br /> Smart AI Tools</h2>
            </div>
            <div className="grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-4 gap-5">
              <Link href={islogin && !isAdmin ? '/user' : '/login'}>
                <div className="services-card bg-[#ffffff0a] xl:p-[40px]  md:p-[30px] p-[20px] border border-gray-800 rounded-2xl" data-aos="fade-right" data-aos-delay="100">
                  <div className="relative z-10">
                    <BotMessageSquare className="lg:mb-[130px] md:mb-[100px] sm:mb-[70px] mb-[50px] w-10 h-10 md:w-16 md:h-16 text-white" />
                    <h4 className="text-2xl text-white mb-4 font-bold">AI-Powered Meetings</h4>
                    <p>Your personal AI Agent joins every call to guide, listen, and assist — just like a real teammate.</p>
                  </div>
                </div>
              </Link>
              <Link href={islogin && !isAdmin ? '/user' : '/login'}>
                <div className="services-card bg-[#ffffff0a] xl:p-[40px]  md:p-[30px] p-[20px] border border-gray-800 rounded-2xl" data-aos="fade-up" data-aos-delay="200">
                  <div className="relative z-10">
                    <Calendar1Icon className="lg:mb-[130px] md:mb-[100px] sm:mb-[70px] mb-[50px] w-10 h-10 md:w-16 md:h-16 text-white" />
                    <h4 className="text-2xl text-white mb-4 font-bold">Seamless Scheduling</h4>
                    <p>Connect with Google Calendar to book meetings effortlessly and never miss a call.</p>
                  </div>
                </div>
              </Link>
              <Link href={islogin && !isAdmin ? '/user' : '/login'}>
                <div className="services-card bg-[#ffffff0a] xl:p-[40px]  md:p-[30px] p-[20px] border border-gray-800 rounded-2xl" data-aos="fade-down" data-aos-delay="300">
                  <div className="relative z-10">
                    <NotebookPen className="lg:mb-[130px] md:mb-[100px] sm:mb-[70px] mb-[50px] w-10 h-10 md:w-16 md:h-16 text-white" />
                    <h4 className="text-2xl text-white mb-4 font-bold">Smart Notes & Summaries</h4>
                    <p>No need to write things down — your AI captures key points and delivers clear summaries instantly.</p>
                  </div>
                </div>
              </Link>
              <Link href={islogin && !isAdmin ? '/user' : '/login'}>
                <div className="services-card bg-[#ffffff0a] xl:p-[40px]  md:p-[30px] p-[20px] border border-gray-800 rounded-2xl" data-aos="fade-left" data-aos-delay="400">
                  <div className="relative z-10">
                    <BarChart className="lg:mb-[130px] md:mb-[100px] sm:mb-[70px] mb-[50px] w-10 h-10 md:w-16 md:h-16 text-white" />
                    <h4 className="text-2xl text-white mb-4 font-bold">All-in-One Dashboard</h4>
                    <p>Access recordings, notes, and insights from every meeting — all in one simple, organized space.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="m-[24px]">
        <div className="bg-glass-color md:py-[100px] py-[50px] my-[100px] rounded-3xl max-w-[1600px] mx-auto">
          <div className="container">
            <div className="mb-10 text-center">
              <h4 data-aos="fade-down" className="small-heading">How it work</h4>
              <h2 data-aos="fade-up">Your Smart Meeting  <br /> Workflow, Simplified</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-5">
                <div className="flex gap-3 group cursor-pointer" data-aos="fade-right" data-aos-delay="100">
                  <div className="max-w-14 max-h-14 min-h-14 min-w-14 flex justify-center items-center transition-all duration-300 ease-in-out rounded-full text-white bg-[#ffffff0a] group-hover:bg-[#E24C4A]">
                    <Bot />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">1. Set Up Your AI Agent</h4>
                    <p> Quickly create and customize your AI Agent to handle meetings and assist you during calls.</p>
                  </div>
                </div>
                <div className="flex gap-3 group cursor-pointer" data-aos="fade-right" data-aos-delay="200">
                  <div className="max-w-14 max-h-14 min-h-14 min-w-14 flex justify-center items-center transition-all duration-300 ease-in-out rounded-full text-white bg-[#ffffff0a] group-hover:bg-[#E24C4A]">
                    <Calendar1Icon />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">2. Schedule a Meeting</h4>
                    <p>Pick a date and time using Google Calendar. Your Agent and the guest get auto-invites — easy and smooth.</p>
                  </div>
                </div>
                <div className="flex gap-3 group cursor-pointer" data-aos="fade-right" data-aos-delay="300">
                  <div className="max-w-14 max-h-14 min-h-14 min-w-14 flex justify-center items-center transition-all duration-300 ease-in-out rounded-full text-white bg-[#ffffff0a] group-hover:bg-[#E24C4A]">
                    <PhoneIcon />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">3. Join the Call</h4>
                    <p> Connect via a secure Stream video link. Talk naturally while your AI listens and takes smart notes.</p>
                  </div>
                </div>
                <div className="flex gap-3 group cursor-pointer" data-aos="fade-right" data-aos-delay="400">
                  <div className="max-w-14 max-h-14 min-h-14 min-w-14 flex justify-center items-center transition-all duration-300 ease-in-out rounded-full text-white bg-[#ffffff0a] group-hover:bg-[#E24C4A]">
                    <Video />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">4. Get Summary & Recording</h4>
                    <p>Right after the call, get a full video, AI-generated notes, and a clear summary — all in your dashboard.</p>
                  </div>
                </div>
              </div>
              <div data-aos="fade-left" data-aos-delay="500">
                <div className="glare-img h-full max-w-[550px] mx-auto">
                  <Image src={'/assets/imgs/how-it-works.jpg'} width={1000} height={1000} className="w-full h-full rounded-xl object-center mx-auto aspect-[16/9] object-cover" alt="img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection/>

      <TestimonialSection/>
      
      <section className="md:py-[100px] py-[50px] text-white">
        <div className="container">
            <div className="text-center mb-10">
              <h4 data-aos="fade-down" className="small-heading">FAQ&apos;s</h4>
              <h2 data-aos="fade-up">Frequently asked questions <br /> about our AI services</h2>
            </div>
            <Accordion type="single" collapsible defaultValue="item-1">
              <div className="grid md:grid-cols-2 gap-5">
                {
                  faqs.map((elem, index)=>{
                  return(
                      <AccordionItem key={index} value={`items-${index + 1}`} data-aos="fade-up" data-aos-delay={index * 50}>
                        <AccordionTrigger>{elem.question}</AccordionTrigger>
                        <AccordionContent>
                          {elem.answer}
                        </AccordionContent>
                      </AccordionItem>
                  )
                })
              }
            </div>
            </Accordion>
        </div>
      </section>

      <BlogSection/>

      <ContactForm/>

      <section className="mx-[24px]">
        <div className="bg-glass-color py-[30px] my-[100px] rounded-3xl max-w-[1600px] mx-auto">
          <div className="container">
            <div className="grid grid-cols-10 items-center">
              <div className="col-span-full lg:col-span-6">
                <h4 data-aos="fade-down" className="small-heading !mx-0">Join Today</h4>
                <h2 data-aos="fade-right" data-aos-delay="100" className="my-5">Start Your AI Journey Today</h2>
                <p data-aos="fade-right" data-aos-delay="100">Don’t wait to future-proof your business. Embrace the power of AI to streamline operations, boost productivity, and uncover new opportunities. Whether you&apos;re a startup or an enterprise, our intelligent solutions are designed to scale with your growth. Join us today and take the first step toward smarter, faster, and more efficient business outcomes.</p>
                <Link href={islogin && !isAdmin ? '/user' : '/login' } data-aos="fade-up" data-aos-delay="150">
                  <button className="primary-btn mt-[40px]">
                    Join Us Today
                    <ArrowRight/>
                  </button>
                </Link>
              </div>
              <div className="col-span-full lg:col-span-4" data-aos="fade-left" data-aos-delay="200">
                <Image src={'/assets/imgs/join-us-today-new.png'} width={1000} height={1000} className="w-full h-full mb-[-30px] max-w-[450px] mx-auto" alt="img"></Image>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

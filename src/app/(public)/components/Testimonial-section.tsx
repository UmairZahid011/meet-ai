'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ArrowLeft, ArrowRight, Loader2, Quote } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';

interface Testimonial {
  id: number;
  rating: number;
  text: string;
  author: string;
  title: string;
  avatar: string;
}

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [laoding, setlaoding] = useState(false);

  useEffect(() => {
    setlaoding(true);
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/admin/testimonials');
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          id: item.id,
          rating: item.rating,
          text: item.description,
          author: item.name,
          title: item.position,
          avatar: item.image || '/assets/imgs/default-avatar.jpg', // fallback if no image
        }));
        setTestimonials(formatted);
        setlaoding(false);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setlaoding(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="my-[100px] mx-[24px]">
      <div className="max-w-[1600px] mx-auto bg-glass-color rounded-3xl py-[100px] relative overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-16 items-center">
            <div className="col-span-full lg:col-span-4">
              <p className="small-heading !mb-4 !mx-0" data-aos="fade-down">Testimonials</p>
              <h2 className="mb-8" data-aos="fade-up" data-aos-delay="100">
                Client share their experience with our AI
              </h2>
            </div>

            <div className="relative col-span-full lg:col-span-6" data-aos="zoom-in" data-aos-delay="100">
              <div>
                {
                  laoding ?
                  <Loader2  className='text-white animate-spin py-4'/>
                  :
                  <>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={24}
                      slidesPerView={1.2}
                      loop={true}
                      navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                      }}
                      breakpoints={{
                        768: { slidesPerView: 1.5 },
                        992: { slidesPerView: 2 },
                      }}
                      className="mySwiper"
                    >
                      {testimonials.map((testimonial) => (
                        <SwiperSlide key={testimonial.id} className='h-full'>
                          <div className="bg-[#ffffff0a] h-full shadow-[9px_11px_14px_0_rgba(0,0,0,.1)] rounded-xl p-[15px] md:p-[20px] lg:p-[40px] md:min-h-[450px] md:max-h-[450px] flex flex-col justify-between">
                            {/* <div className="flex text-white mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.908-7.416 3.908 1.48-8.279-6.064-5.828 8.332-1.151z" />
                                  </svg>
                              ))}
                              {[...Array(5 - testimonial.rating)].map((_, i) => (
                                  <svg key={i} className="w-5 h-5 fill-none stroke-1 stroke-white" viewBox="0 0 24 24">
                                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.908-7.416 3.908 1.48-8.279-6.064-5.828 8.332-1.151z" />
                                  </svg>
                              ))}
                            </div> */}
                            <div className='h-full text-white'>
                              <div>
                                <Quote className='md:h-8 md:w-8 w-5 h-5 rotate-180' />
                              </div>
                              <div className='py-[20px] md:py-[40px]'>
                                <p className="text-gray-300 line-clamp-6">
                                  {testimonial.text}
                                </p>
                              </div>
                              <div className='flex justify-end'>
                                <Quote className='md:h-8 md:w-8 w-5 h-5  text-white' />
                              </div>
                            </div>
                            <div className="flex md:items-center border-t md:flex-row flex-col border-gray-800 pt-[30px] mt-3 md:gap-0 gap-3">
                              <Image src={testimonial.avatar} alt={testimonial.author} width={1000} height={1000}  className="w-12 h-12 rounded-full mr-4"/>
                              <div>
                                <p className="text-white font-semibold text-lg capitalize">{testimonial.author}</p>
                                <p className="text-gray-400 text-sm">{testimonial.title}</p>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <div className="flex justify-center !mt-8 gap-5">
                      <button className="swiper-button-prev p-3 rounded-full text-white hover:bg-opacity-20 transition">
                        <ArrowLeft />
                      </button>
                      <button className="swiper-button-next p-3 rounded-full text-white hover:bg-opacity-20 transition">
                        <ArrowRight />
                      </button>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

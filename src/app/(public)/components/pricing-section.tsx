'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

const PricingSection = () => {

    const [plans, setPlans] = useState([]);
    const [loading, setloading] = useState(true);
    const { data: session } = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        axios.get('/api/admin/plans').then((res) => setPlans(res.data)).finally(()=>setloading(false));
    }, []);

    const handleBuy = async (plan: any) => {
    if (!userId) {
      redirect('/login');
    }

    const res = await axios.post('/api/checkout', {
        plan,
        userId,
        });

        window.location.href = res.data.url;
    };

    return (
        <>
            <section className="my-[100px] mx-[24px]">
                <div className="container">
                    <div className="text-center">
                        <p className="small-heading !mb-4" data-aos="fade-down">Pricing</p>
                        <h2 className="mb-8" data-aos="fade-up" data-aos-delay="100">
                            Our Plans
                        </h2>
                    </div>

                    {
                        loading ?
                        <div className="text-white p-8 flex justify-center items-center">
                            <Loader2 className='animate-spin h-8 w-8' />
                        </div>
                        :
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan: any) => (
                            <div key={plan.id} className="border rounded-lg p-4 shadow text-left bg-foreground">
                                <h2 className="font-bold mt-2 text-2xl">${plan.price}</h2>
                                <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                                <p className="text-sm text-gray-600">{plan.description}</p>
                                <ul className='mt-10 flex flex-col gap-2'>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Ai Meetings</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Ai Agents</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Ai Chat</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Tokens {plan.tokens}</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Google Calendar schedule</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Meeting Recordings</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Agent Creating cost {plan.agent_cost}</li>
                                <li className='!text-white flex gap-2 items-center'><CheckCircle className='text-primary'/> Meeting Creating cost {plan.meeting_cost}</li>
                                </ul>
                                <Button onClick={() => handleBuy(plan)} className='w-full mt-10'>Buy Now</Button>
                            </div>
                            ))}
                        </div>
                    }
                    {
                        plans.length == 0 && !loading ?
                        <p className='text-center !text-white !text-lg py-5'>No Plans Found</p>
                        :
                        ''
                    }
                </div>       
            </section> 
        </>
    )
}

export default PricingSection

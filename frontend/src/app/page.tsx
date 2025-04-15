import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ImageCarousel from '@/components/ImageCarousel';

// Load the counter component on the client side
const AnimatedCounter = dynamic(() => import('@/components/AnimatedCounter'), { ssr: false });

export default function Home() {
  // Example stake packages
  const examplePackages = [
    {
      id: '67e2bbb61101784a04734802',
      name: 'Starter Package',
      priceInCoins: 500,
      durations: [
        { days: 90, profitRate: 25 },
        { days: 180, profitRate: 40 },
        { days: 360, profitRate: 60 }
      ],
    },
    {
      id: '67e2bbcd1101784a04734804',
      name: 'Standard Package',
      priceInCoins: 1250,
      durations: [
        { days: 90, profitRate: 25 },
        { days: 180, profitRate: 40 },
        { days: 360, profitRate: 60 }
      ],
    },
    {
      id: '67e2bc6d1101784a0473480e',
      name: 'Premium Package',
      priceInCoins: 25000, 
      durations: [
        { days: 90, profitRate: 25 },
        { days: 180, profitRate: 40 },
        { days: 360, profitRate: 60 }
      ],
    },
  ];

  const stats = [
    { id: 1, label: 'Verified', value: '2500+', description: 'Web3 projects' },
    { id: 2, label: '10,000+', value: 'Members', description: 'worldwide' },
  ];

  // Counter value
  const counterValue = "15,000,000";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section - New Modern Design */}
        <section className="relative  pt-12 pb-20">
          <div className="max-w-7xl mx-auto px-6 py-6a sm:px-8 lg:mt-7">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5  px-8 py-4 bg-white/10 backdrop-blur-md rounded-xl">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-6xl mb-8 leading-tight">
                  Earn with <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500'>XEIN</span> Platform
                </h1>
                
                <p className="mt-8 text-sm text-primary-100 leading-relaxed">
                  Utilize your digital assets with our easy, secure, and profitable staking platform. Invite your friends with our referral program to earn extra rewards.
                </p>
                
                
                
                <div className="mt-7 grid grid-cols-2 gap-12">
                  {stats.map((stat) => (
                    <div key={stat.id} className="border-l-2 border-primary-400 pl-4 lg:pl-8">
                      <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                      <p className="text-base font-medium text-primary-200 mt-2">
                        {stat.label} {stat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-16 lg:mt-0 lg:col-span-7">
                <div className=" relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-primary-500/20">
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src="/images/meet-drone.jpg"
                      alt="XEIN Platform"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* Features */}
        <section className="py-12 lg:py-20   text-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Top Title and Description */}
            <div className="text-center mb-16">
              <h2 className="text-4xl text font-bold mb-4 ">Start earning with XEIN platform</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">Safely grow your investments by working with verified projects for secure and profitable returns.</p>
            </div>
            
            {/* Numbered Features */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-24">
              <div className="flex items-center gap-6 hover:scale-105 transition-transform duration-300 w-full md:w-auto">
                <div className="text-4xl font-bold relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">01</span>
                </div>
                <p className="text-lg font-medium">Access verified projects</p>
              </div>
              
              {/* Desktop vertical line */}
              <div className="h-12 w-px bg-white hidden md:block"></div>
              
              {/* Mobile horizontal line */}
              <div className="w-full h-px bg-gradient-to-r from-primary-500 to-purple-500 md:hidden my-4"></div>
              
              <div className="flex items-center gap-6 hover:scale-105 transition-transform duration-300 w-full md:w-auto">
                <div className="text-4xl font-bold relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">02</span>
                </div>
                <p className="text-lg font-medium">Earn directly from projects</p>
              </div>
              
              {/* Desktop vertical line */}
              <div className="h-12 w-px bg-white hidden md:block"></div>
              
              {/* Mobile horizontal line */}
              <div className="w-full h-px bg-gradient-to-r from-primary-500 to-purple-500 md:hidden my-4"></div>
              
              <div className="flex items-center gap-6 hover:scale-105 transition-transform duration-300 w-full md:w-auto">
                <div className="text-4xl font-bold relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">03</span>
                </div>
                <p className="text-lg font-medium">Gain financial freedom</p>
              </div>
            </div>
            
            {/* Bottom Section - Title and Boxes */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
              {/* Left Side - Title */}
              <div className="w-full md:w-5/12">
                <h2 className="text-5xl md:text-6xl text-white font-bold mb-8 leading-tight">
                  On our way to becoming the largest Web3 community from scratch
                </h2>
              </div>
              
              {/* Right Side - 4 Boxes */}
              <div className="w-full md:w-7/12 grid grid-cols-2 gap-6">
                {/* Box 1 */}
                <div className=" bg-white/10 backdrop-blur-md p-8 rounded-xl relative overflow-hidden group stats-card w-full">
                  <div className="absolute top-4 right-4 ">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="7" height="7" rx="2" fill="#9633f2" />
                      <rect x="4" y="13" width="7" height="7" rx="2" fill="#9633f2" opacity="0.4" />
                      <rect x="13" y="4" width="7" height="7" rx="2" fill="#9633f2" opacity="0.4" />
                      <rect x="13" y="13" width="7" height="7" rx="2" fill="#9633f2" />
                    </svg>
                  </div>
                  <h3 className="text-6xl font-bold mb-2 text-white">10K+</h3>
                  <p className="text-gray-400 text-xl">members</p>
                </div>
                
                {/* Box 2 */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl relative overflow-hidden group stats-card w-full">
                  <div className="absolute top-4 right-4">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="#a256e8" />
                      <circle cx="8" cy="12" r="2" fill="#0F172A" />
                      <circle cx="16" cy="12" r="2" fill="#0F172A" />
                    </svg>
                  </div>
                  <h3 className="text-6xl font-bold mb-2 text-white">15M+</h3>
                  <p className="text-gray-400 text-xl">total earnings</p>
                </div>
                
                {/* Box 3 */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl relative overflow-hidden group stats-card w-full">
                  <div className="absolute top-4 right-4">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#9633f2  " strokeWidth="2" />
                      <path d="M8 12L11 15L16 9" stroke="#a256e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-6xl font-bold mb-2 text-white">60<span className="text-3xl ml-1">+</span></h3>
                  <p className="text-gray-400 text-xl">countries</p>
                </div>
                
                {/* Box 4 */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl relative overflow-hidden group stats-card w-full">
                  <div className="absolute top-4 right-4">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5L14.5 10H19.5L15.5 14L17 19L12 16L7 19L8.5 14L4.5 10H9.5L12 5Z" fill="#a256e8" />
                    </svg>
                  </div>
                  <h3 className="text-6xl font-bold mb-2 text-white">120<span className="text-3xl ml-1">+</span></h3>
                  <p className="text-gray-400 text-xl">events</p>
                </div>
              </div>
            </div>
            
            {/* Logo */}
            <div className="flex justify-center mt-16">
              <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-5 rounded-xl logo-container">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C12 7.76142 9.76142 10 7 10C9.76142 10 12 12.2386 12 15C12 12.2386 14.2386 10 17 10C14.2386 10 12 7.76142 12 5Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </section>
        {/* Counter Section */}
        <section className=" py-8 mx-6">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-8">Our Members' Earnings</h2>
              <div className="flex justify-center">
                <div className="relative inline-flex items-center lg:px-12 rounded-xl lg:p-6 bg-black/30">
                  {/* Gradient Border Overlay */}
                  <div className="absolute inset-0 rounded-xl border-4 border-transparent bg-transparent" 
                       style={{ 
                         background: 'linear-gradient(to right, transparent, transparent) padding-box, linear-gradient(to right,rgb(104, 182, 206),rgb(168, 128, 214),rgb(109, 37, 192)) border-box'
                       }}>
                  </div>
                  <span className="text-5xl font-bold text-white mx-2 relative z-10">$</span>
                  <div className="relative z-10">
                    <AnimatedCounter endValue={counterValue} delayBetweenDigits={100} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        <section className="py-16  overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center">
              <h2 className=" text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500 font-semibold tracking-wide uppercase">Stake Packages</h2>
              <p className="mt-4 text-3xl leading-8 font-extrabold text-white tracking-tight  sm:text-5xl">
                Our Popular Stake Packages
              </p>
              <p className="mt-6 max-w-2xl text-xl text-gray-400 lg:mx-auto leading-relaxed">
                Choose the stake package that suits your needs and start earning immediately.
              </p>
            </div>

           

            <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
              {examplePackages.map((pkg) => (
                <div key={pkg.id} className="bg-white/10 overflow-hidden shadow-lg rounded-xl divide-y divide-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="px-8 py-10">
                    <h3 className="text-xl leading-6 font-semibold text-white">{pkg.name}</h3>
                    <p className="mt-6 flex items-baseline">
                      <span className="text-4xl font-extrabold text-white">{pkg.priceInCoins}</span>
                      <span className="ml-2 text-xl font-medium text-gray-200">coins</span>
                    </p>
                    <div className="mt-8 text-gray-300">
                      {pkg.durations.map((duration, idx) => (
                        <div key={`${pkg.id}-${idx}`} className="flex items-center py-1">
                          <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            {duration.days} days: %{duration.profitRate} profit
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-8 py-6">
                    <Link
                      href={`/stake-packages/${pkg.id}`}
                      className="block w-full text-center px-6 py-3 border border-white/10 text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-purple-900 hover:bg-purple-900 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/stake-packages"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-gradient-to-r from-primary-500 to-purple-900 hover:bg-purple-900 transition-colors duration-200"
              >
                View All Packages
              </Link>
            </div>
          </div>
        </section>
        <section>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h1 className="text-4xl font-bold tracking-tight text-white text-center sm:text-6xl lg:text-6xl mb-8 leading-tight">We want to see you too</h1>
        <div className="mt-8 mb-16">
              <ImageCarousel 
                images={[
                  '/images/company-celebrate.jpg',
                  '/images/company-meet.jpg',
                  '/images/meet.jpg',
                  '/images/stake-mobile2.jpg',
                  '/images/out-meet.jpg',
                  '/images/company.jpg',
                  '/images/platform.jpg',
                  '/images/stake-mobile.jpg',
                  '/images/meet3.jpg',
                  '/images/out-meet-all.jpg',
                  '/images/meet-drone.jpg',
                  '/images/zoom.jpg',
                  '/images/company-celebrate2.jpeg',
                  '/images/meet2.jpg',
                  '/images/company-celebrate3.jpeg',
                  '/images/company-introduction.jpeg',
                  '/images/company-introduction3.jpeg',
                  '/images/company-night.jpg'
                ]}
                autoplaySpeed={3000}
              />
            </div>
            </div>
        </section>

        {/* CTA Section */}
        <div className=" bg-white/10 backdrop-blur-md ">
          <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:py-24 lg:px-12 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              <span className="block">Start now</span>
              <span className="block text-purple-700 mt-3">Create your account and start earning.</span>
            </h2>
            <div className="mt-10 flex flex-col sm:flex-row sm:space-x-6 lg:mt-0 lg:flex-shrink-0">
              <div className="rounded-md shadow mb-4 sm:mb-0">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-700 hover:text-white transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
              <div className="rounded-md shadow">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-purple-700 hover:bg-white hover:text-purple-600 transition-colors duration-200"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
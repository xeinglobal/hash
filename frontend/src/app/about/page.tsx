import React from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function About() {
  // Company values
  const values = [
    {
      icon: (
        <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
      title: "Excellence",
      description: "We aim to provide the highest quality service at all times.",
    },
    {
      icon: (
        <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" />
        </svg>
      ),
      title: "Security",
      description: "The security and privacy of our users is our top priority.",
    },
    {
      icon: (
        <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" />
        </svg>
      ),
      title: "Reliability",
      description: "We keep our promises, we are always honest and transparent.",
    },
    {
      icon: (
        <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" />
        </svg>
      ),
      title: "Innovation",
      description: "We continuously develop new ideas and solutions.",
    }
  ];

  // Achievements
  const achievements = [
    { number: "60+", text: "Countries Presence" },
    { number: "10K+", text: "Happy Users" },
    { number: "120+", text: "Events Organized" },
    { number: "15M+", text: "Rewards Distributed" }
  ];

  // Customer testimonials
  const testimonials = [
    {
      quote: "With XEIN Platform, I can safely increase my earnings. I definitely recommend it!",
      name: "Robert Andrews",
      title: "Platform Member",
      image: "/images/user3.jpg"
    },
    {
      quote: "With its modern and user-friendly interface, it's much easier to use than other platforms.",
      name: "Paula Barber",
      title: "Investor",
      image: "/images/user1.jpg"
    },
    {
      quote: "Thanks to the referral program, you can invite your friends and earn extra income.",
      name: "Jaime Couch",
      title: "Business Partner",
      image: "/images/user2.jpg"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-700 to-purple-900 py-20 pt-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-6xl mb-8">
              About Us
            </h1>
            <p className="mt-4 text-xl text-teal-100 max-w-3xl mx-auto">
              Our journey in the Web3 world began with a vision to create a reliable and profitable staking platform.
            </p>
          </div>
        </section>

        {/* Company Introduction */}
        <section className="py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="lg:flex lg:items-center lg:gap-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <h2 className="text-3xl font-bold text-white mb-6">Who Are We?</h2>
                <p className="text-lg text-gray-300 mb-6">
                  XEIN Platform is an innovative financial ecosystem that uses blockchain technology to enable people to safely and profitably leverage their assets.
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  Founded in 2021, our company has quickly expanded operations to more than 60 countries and reached over 10,000 users.
                </p>
                <p className="text-lg text-gray-300">
                  By working with verified Web3 projects, we offer our users the opportunity to invest in a secure environment.
                </p>
              </div>
              <div className="lg:w-1/2 relative rounded-xl overflow-hidden h-96">
                <Image 
                  src="/images/company.jpg" 
                  alt="XEIN Platform Team" 
                  fill 
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-900/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="lg:flex lg:items-center lg:gap-16">
              <div className="lg:w-1/2 relative rounded-xl overflow-hidden h-96 mb-12 lg:mb-0 lg:order-1">
                <Image 
                  src="/images/company-meet.jpg" 
                  alt="XEIN Platform Vision" 
                  fill 
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="lg:w-1/2 lg:order-2">
                <div className="mb-12">
                  <h3 className="text-teal-400 font-semibold mb-2 tracking-wide uppercase">Our Mission</h3>
                  <h2 className="text-3xl font-bold text-white mb-6">Technology for Financial Freedom</h2>
                  <p className="text-lg text-gray-300">
                    We aim to contribute to our users' financial freedom by providing a secure, transparent, and profitable investment platform using blockchain technology.
                  </p>
                </div>
                <div>
                  <h3 className="text-teal-400 font-semibold mb-2 tracking-wide uppercase">Our Vision</h3>
                  <h2 className="text-3xl font-bold text-white mb-6">Leading the Web3 World</h2>
                  <p className="text-lg text-gray-300">
                    As the most reliable and user-friendly staking platform in the Web3 ecosystem, we aim to enable millions of people to leverage their digital assets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h3 className="text-teal-400 font-semibold mb-2 tracking-wide uppercase">Our Values</h3>
              <h2 className="text-3xl font-bold text-white mb-6">Core Principles and Values</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                As XEIN Platform, we have core values that guide every decision and action we take.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-md p-8 flex flex-col items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-800"
                >
                  <div className="mb-4 ">{value.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-300 text-center">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-16 bg-gradient-to-br from-teal-700 to-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h3 className="text-teal-300 font-semibold mb-2 tracking-wide uppercase">Our Achievements</h3>
              <h2 className="text-3xl font-bold mb-6">Achievements So Far</h2>
              <p className="text-lg text-teal-100 max-w-3xl mx-auto">
                We've achieved great success in a short time and continue to grow every day.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-xl bg-black/30 backdrop-blur-sm border border-teal-500/20"
                >
                  <h3 className="text-4xl font-bold mb-2">{achievement.number}</h3>
                  <p className="text-teal-300">{achievement.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products and Services */}
        <section className="py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h3 className="text-teal-400 font-semibold mb-2 tracking-wide uppercase">Our Products</h3>
              <h2 className="text-3xl font-bold text-white mb-6">Services We Offer</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Innovative solutions and services we provide to our users.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-800">
                <div className="relative h-48">
                  <Image 
                    src="/images/platform.jpg" 
                    alt="Stake Packages" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Stake Packages</h3>
                  <p className="text-gray-300">We offer various stake packages for different budgets. With these packages, you can safely leverage your digital assets.</p>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-800">
                <div className="relative h-48">
                  <Image 
                    src="/images/stake-mobile.jpg" 
                    alt="Mobile App" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Website Platform</h3>
                  <p className="text-gray-300">You can use our advanced platform to track your investments anytime, anywhere.</p>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-800">
                <div className="relative h-48">
                  <Image 
                    src="/images/out-meet.jpg" 
                    alt="Community Events" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Community Events</h3>
                  <p className="text-gray-300">We regularly organize events to bring together our community members.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Photos */}
        <section className="py-16 bg-gray-900/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h3 className="text-teal-400 font-semibold mb-2 tracking-wide uppercase">Our Team</h3>
              <h2 className="text-3xl font-bold text-white mb-6">The People Who Make Us Special</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                With our passionate and talented team, we progress towards better every day.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="relative h-80 rounded-xl overflow-hidden">
                <Image 
                  src="/images/company-celebrate.jpg" 
                  alt="XEIN Team Celebration" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="relative h-80 rounded-xl overflow-hidden">
                <Image 
                  src="/images/meet-drone.jpg" 
                  alt="XEIN Team Drone Shot" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="relative h-80 rounded-xl overflow-hidden">
                <Image 
                  src="/images/company-night.jpg" 
                  alt="XEIN Night Event" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-6">What Our Users Say?</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Valuable feedback from users who are satisfied with our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-800"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-teal-700 to-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Join the XEIN Family Today!</h2>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-10">
              Sign up now and start your profitable investment journey.
            </p>
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 transition-colors duration-200"
            >
              Get Started
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
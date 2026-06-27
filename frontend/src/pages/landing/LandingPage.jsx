import React, { useRef, useEffect } from 'react'
import HeroSection from './sections/HeroSection'
import BookCatalogSection from './sections/BookCatalogSection'
import FeaturesSection from './sections/FeaturesSection'
// import MoodSection from './sections/MoodSection'
import StatsSection from './sections/StatsSection'
import HowItWorksSection from './sections/HowItWorksSection'
import AboutSection from './sections/AboutSection'
import FaqSection from './sections/FaqSection'
import ContactSection from './sections/ContactSection'
import CtaSection from './sections/CtaSection'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

/**
 * Landing Page — public entry point for the Library Management System.
 * Route: /
 */
export default function LandingPage() {
  const blob1Ref = useRef(null)
  const blob2Ref = useRef(null)
  const blob3Ref = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const x = (clientX - window.innerWidth / 2) * 0.02
      const y = (clientY - window.innerHeight / 2) * 0.02
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${x * 1.2}px, ${y * 0.8}px)`
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${x * -0.9}px, ${y * 1.1}px)`
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${x * 0.6}px, ${y * -0.7}px)`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden" style={{ perspective: '1000px' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          ref={blob1Ref}
          className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] transition-transform duration-700 ease-out animate-pulse"
        />
        <div
          ref={blob2Ref}
          className="absolute top-1/3 -right-48 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[80px] transition-transform duration-700 ease-out animate-pulse"
          style={{ animationDelay: '-4s' }}
        />
        <div
          ref={blob3Ref}
          className="absolute -bottom-48 left-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[80px] transition-transform duration-700 ease-out animate-pulse"
          style={{ animationDelay: '-8s' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Navbar />
      <main className="relative z-10">
        <BookCatalogSection />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <AboutSection />
        {/* <MoodSection /> */}
        <HowItWorksSection />
        <FaqSection />
        <ContactSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

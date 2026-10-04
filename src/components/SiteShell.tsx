'use client';

import { SmoothScrollProvider } from '@/lib/lenis';
import { MusicProvider } from '@/lib/music';
import { ResumeProvider } from '@/lib/resume';
import { LoadingScreen } from './ui/LoadingScreen';
import { CustomCursor } from './ui/CustomCursor';
import { Navbar } from './ui/Navbar';
import { Hero } from './ui/Hero';
import { About } from './ui/About';
import { JourneyMap } from './ui/JourneyRoute';
import { School, College } from './ui/Education';
import { TechUniverse, Marquee } from './ui/TechUniverse';
import { ConstellationSection } from './ui/ConstellationField';
import { Projects } from './ui/Projects';
import { Experience, Certifications } from './ui/Experience';
import { BeyondCode, HowIThink, Philosophy, DomeGallery } from './ui/BeyondCode';
import { Contact } from './ui/Contact';
import { CurvedLoop, PixelDivider } from './ui/CurvedLoop';
import { ResumeViewer } from './ui/ResumeViewer';
import { ResumePreparing } from './ui/ResumePreparing';

/**
 * SITE SHELL — one continuous journey rather than a stack of sections.
 * CurvedLoop and PixelDivider are the connective tissue: the thin
 * curves keep the route visible, the dividers mark the big chapters.
 *
 * The resume viewer lives here, once, and is shared by the Hero and
 * the Contact section. Nothing about it is loaded until a visitor
 * actually asks to see the resume.
 */
export function SiteShell() {
  return (
    <MusicProvider>
      <ResumeProvider>
        <SmoothScrollProvider>
          <LoadingScreen />
          <CustomCursor />
          <Navbar />

          <main>
            <Hero />
            <PixelDivider colors={['#5BAEE0', '#FFD34D']} />
            <About />
            <CurvedLoop />
            <JourneyMap />
            <PixelDivider colors={['#FFD34D', '#FF5C5C']} />
            <School />
            <College />
            <CurvedLoop flip />
            <TechUniverse />
            <Marquee />
            <ConstellationSection />
            <PixelDivider colors={['#FF5C5C', '#5BAEE0']} />
            <Projects />
            <CurvedLoop />
            <Experience />
            <Certifications />
            <Marquee reverse />
            <BeyondCode />
            <HowIThink />
            <Philosophy />
            <DomeGallery />
            <Contact />
          </main>

          {/* one viewer + one overlay for the whole site */}
          <ResumeViewer />
          <ResumePreparing />
        </SmoothScrollProvider>
      </ResumeProvider>
    </MusicProvider>
  );
}
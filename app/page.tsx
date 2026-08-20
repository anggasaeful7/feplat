import { Navbar } from "./_components/landing/navbar";
import { Hero } from "./_components/landing/hero";
import { Stats } from "./_components/landing/stats";
import { Problem } from "./_components/landing/problem";
import { Features } from "./_components/landing/features";
import { DashboardPreview } from "./_components/landing/dashboard-preview";
import { HowItWorks } from "./_components/landing/how-it-works";
import { Pricing } from "./_components/landing/pricing";
import { Testimonials } from "./_components/landing/testimonials";
import { FAQ } from "./_components/landing/faq";
import { CTA } from "./_components/landing/cta";
import { Footer } from "./_components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Problem />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

import HeroSection from '@/features/marketing/components/HeroSection';
import FeaturesGrid from '@/features/marketing/components/FeaturesGrid';
import LogoMarquee from '@/features/marketing/components/LogoMarquee';
import SolutionsFeature from '@/features/marketing/components/SolutionsFeature';
import StatsSection from '@/features/marketing/components/StatsSection';
import CTASection from '@/features/marketing/components/CTASection';

export default function MarketingPage() {
    return (
        <>
            <HeroSection />
            <FeaturesGrid />
            <LogoMarquee />
            <SolutionsFeature />
            <StatsSection />
            <CTASection />
        </>
    );
}

import {
  Header,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  UseCasesSection,
  Footer,
  TechnologiesSection
} from "@/components/landing-page";
import { useAccounts } from "@mysten/dapp-kit";
import { Navigate } from "react-router";

const HomePage = () => {
  const accounts = useAccounts();

  if (accounts.length > 0) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <TechnologiesSection />
      </main>
      <Footer />
    </div>
  );
};

export { HomePage };

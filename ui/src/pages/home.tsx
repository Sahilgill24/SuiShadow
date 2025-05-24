import {
  Header,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  UseCasesSection,
  CallToActionSection,
  Footer,
} from "@/components/landing-page";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const HomePage = () => {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  useEffect(() => {
    if (currentAccount) {
      navigate("/dashboard");
    }
  }, [currentAccount, navigate]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export { HomePage };

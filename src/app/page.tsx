"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowUpIcon,
  RefreshCcw,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  Scale,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Rocket,
  Target,
  Calendar,
  ArrowUpRight,
  Sparkles,
  LineChart,
  Search,
  ArrowRight,
  PlusCircle,
  Share2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isStandalone, setIsStandalone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(isPWA);

    // If PWA, redirect to app
    if (isPWA) {
      router.push("/app");
    }
  }, [router]);

  // Show landing page only for web
  if (isStandalone) return null;

  return (
    <div className="min-h-screen overflow-auto">
      {/* Header/Nav */}
      <header className="fixed top-0 w-full bg-black/80 backdrop-blur-sm z-50 py-4 border-b border-border">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">
                SP
              </span>
            </div>
            <h1 className="text-xl font-bold">Smart Portfolio</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a
              href="#features"
              className="font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="font-medium hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#vision"
              className="font-medium hover:text-primary transition-colors"
            >
              Vision
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          <div className="hidden md:block">
            <Button
              variant="outline"
              onClick={() => {
                const element = document.getElementById("install-guide");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Install App
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b py-4 px-4 absolute w-full">
            <nav className="flex flex-col space-y-4">
              <a
                href="#features"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#vision"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vision
              </a>
              <Button
                className="w-full mt-2"
                onClick={() => {
                  const element = document.getElementById("install-guide");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Install App
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16 overflow-y-auto">
        {/* Hero section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-6 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-primary">AI-Powered</span> Crypto
                  Portfolio Management
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
                  Invest Smarter, Not Harder. Effortlessly design, track, and
                  optimize your crypto portfolio with AI automation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                  <Button size="lg" className="text-lg">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Launch App
                  </Button>
                  <InstallPrompt inline />
                </div>
              </div>
              <Card className="relative overflow-hidden border-2 shadow-lg max-w-md mx-auto w-full">
                <CardContent className="p-0">
                  <div className="relative h-[350px] sm:h-[400px] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {/* Portfolio visualization mockup */}
                    <div className="w-full max-w-xs px-4">
                      <div className="mb-6 text-center">
                        <div className="inline-block bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                          <p className="text-lg font-medium">
                            Total Portfolio Value
                          </p>
                          <p className="text-3xl font-bold">$12,345.67</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          +3.4%{" "}
                          <ArrowUpRight className="inline-block h-4 w-4 text-green-500" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            name: "Bitcoin",
                            symbol: "BTC",
                            value: "$5,432.10",
                            percent: "44%",
                          },
                          {
                            name: "Ethereum",
                            symbol: "ETH",
                            value: "$3,210.45",
                            percent: "26%",
                          },
                          {
                            name: "USDC",
                            symbol: "USDC",
                            value: "$2,500.00",
                            percent: "20%",
                          },
                          {
                            name: "Chainlink",
                            symbol: "LINK",
                            value: "$1,203.12",
                            percent: "10%",
                          },
                        ].map((token, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-background/80 backdrop-blur-sm rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{token.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {token.symbol}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{token.value}</p>
                              <p className="text-xs text-muted-foreground">
                                {token.percent}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Future of Crypto section */}
        <section id="features" className="py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Rocket className="inline-block h-8 w-8 mr-2" />
                The Future of Crypto Investing
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Web3 is complicated. We make it easy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "No Seed Phrases",
                  description: "Secure social login & passkeys",
                  icon: <ShieldCheck className="h-10 w-10" />,
                },
                {
                  title: "Gasless Transactions",
                  description: "We sponsor gas fees",
                  icon: <RefreshCcw className="h-10 w-10" />,
                },
                {
                  title: "Fiat On-Ramps",
                  description: "Buy crypto with Google Pay & Apple Pay",
                  icon: <ArrowUpIcon className="h-10 w-10" />,
                },
                {
                  title: "AI-Powered Insights",
                  description: "Smart portfolio management with automation",
                  icon: <Lightbulb className="h-10 w-10" />,
                },
                {
                  title: "Mobile-First",
                  description:
                    "Use it instantly with our Progressive Web App (PWA)",
                  icon: <ExternalLink className="h-10 w-10" />,
                },
                {
                  title: "Portfolio Tracking",
                  description:
                    "Get real-time insights and risk-based analytics",
                  icon: <TrendingUp className="h-10 w-10" />,
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md h-full"
                >
                  <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                    <div className="mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Smart Portfolio Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Search className="inline-block h-8 w-8 mr-2" />
                Why Smart Portfolio?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                The bridge between traditional finance and Web3
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Current Challenges</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <p>
                        Complex seed phrases and gas fees create unnecessary
                        barriers
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <p>
                        DeFi concepts like DEXs and liquidity pools remain
                        confusing
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <p>
                        Limited tools for portfolio optimization and risk
                        management
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Our Solution</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        Simple passkey login - as easy as using your favorite
                        apps
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        AI-powered automation handles the complexity for you
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <p>Professional-grade tools in an intuitive interface</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section id="vision" className="py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Target className="inline-block h-8 w-8 mr-2" />
                Our Vision
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                We&apos;re unlocking Web3 for 85,000+ new investors by making
                crypto as intuitive as traditional finance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Web3 Meets Web2",
                  description: "Crypto investing, simplified.",
                  icon: <ShieldCheck className="h-8 w-8" />,
                },
                {
                  title: "AI-Powered Decisions",
                  description: "Smarter investing with automated insights.",
                  icon: <Lightbulb className="h-8 w-8" />,
                },
                {
                  title: "Security & Privacy First",
                  description:
                    "Decentralized authentication, no email or Google logins required.",
                  icon: <Scale className="h-8 w-8" />,
                },
              ].map((vision, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 text-center h-full"
                >
                  <CardContent className="pt-8 pb-6 flex flex-col items-center h-full">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {vision.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{vision.title}</h3>
                    <p className="text-muted-foreground">
                      {vision.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Next */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Calendar className="inline-block h-8 w-8 mr-2" />
                What&apos;s Next?
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 mb-8">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold mb-2">MVP Launch</h3>
                      <p className="text-muted-foreground">
                        Onboarding early adopters & testing our points system
                      </p>
                      <ul className="mt-4 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Passkey authentication</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Portfolio creation & tracking</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Gasless transactions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                      <LineChart className="h-6 w-6" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold mb-2">V2 Expansion</h3>
                      <p className="text-muted-foreground">
                        DeFi yield aggregation & AI-powered trading strategies
                      </p>
                      <ul className="mt-4 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>Automated yield farming</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>AI-driven rebalancing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>Advanced analytics dashboard</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section id="install-guide" className="py-16 md:py-24 bg-black">
          <div className="container mx-auto px-4">
            <Card className="border-2 max-w-3xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    <PlusCircle className="inline-block h-8 w-8 mr-2" />
                    Install Smart Portfolio
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Get instant access to your portfolio on your mobile device
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* iOS Installation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>iOS Installation</CardTitle>
                      <CardDescription>iPhone and iPad devices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ol className="space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            1
                          </span>
                          <div>
                            <p>Tap the Share button</p>
                            <Share2 className="h-5 w-5 text-muted-foreground mt-2" />
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            2
                          </span>
                            <p>Select &quot;Add to Home Screen&quot;</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            3
                          </span>
                          <p>Tap &quot;Add&quot; to confirm</p>
                        </li>
                      </ol>
                      {/* iOS installation video */}
                      <div className="aspect-video bg-muted rounded-lg mt-4">
                        <video
                          className="w-full rounded-lg"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source
                            src="/videos/ios-install.mp4"
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Android Installation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Android Installation</CardTitle>
                      <CardDescription>
                        Chrome and other browsers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ol className="space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            1
                          </span>
                          <p>Tap the menu icon (⋮) in Chrome</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            2
                          </span>
                          <p>Select &quot;Install app&quot;</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            3
                          </span>
                          <p>Tap &quot;Install&quot; to confirm</p>
                        </li>
                      </ol>
                      {/* Android installation video */}
                      <div className="aspect-video bg-muted rounded-lg mt-4">
                        <video
                          className="w-full rounded-lg"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source
                            src="/videos/android-install.mp4"
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-black to-primary/5">
          <div className="container mx-auto px-4">
            <Card className="border-2 max-w-3xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-primary/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Rocket className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium">Ready to start?</p>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Start Investing Now
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Experience gasless, AI-driven crypto investing in seconds.
                      No waitlist, no delays.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" className="w-full">
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Launch App
                      </Button>
                      <Button size="lg" variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Install App
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  SP
                </span>
              </div>
              <h3 className="text-lg font-bold">Smart Portfolio</h3>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Discord
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Smart Portfolio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

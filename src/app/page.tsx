"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
  Search,
  PlusCircle,
  Share2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isStandalone, setIsStandalone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // More robust PWA detection
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      document.referrer.includes("android-app://");

    console.log("PWA detection:", {
      matchMedia: window.matchMedia("(display-mode: standalone)").matches,
      referrer: document.referrer.includes("android-app://"),
    });

    setIsStandalone(isPWA);

    // If PWA, redirect to app
    if (isPWA) {
      router.push("/app");
    }
  }, [router]);

  // Only render content after client-side detection
  if (!mounted) return null;

  // For PWA mode, don't show landing page
  if (isStandalone) return null;

  return (
    <div className="min-h-screen overflow-auto">
      {/* Header/Nav */}
      <header className="fixed top-0 w-full bg-black/80 backdrop-blur-sm z-50 py-4 border-b border-border">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/SP_LOGO.png"
              alt="Smart Portfolio Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
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
              href="#gallery"
              className="font-medium hover:text-primary transition-colors"
            >
              Gallery
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
                href="#gallery"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
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
            <div className="flex flex-col items-center gap-8 md:gap-12">
              <div className="flex justify-center items-center">
                <Image
                  src="/SP_LOGO.png"
                  alt="Smart Portfolio Logo"
                  width={350}
                  height={350}
                  className="max-w-full h-auto"
                  priority
                />
              </div>
              <div className="space-y-6 text-center max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-primary">Web3</span> Made Simple
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Empowering everyone to navigate and maximize their Web3
                  investments effortlessly through excellent UI, account
                  abstraction, seamless onboarding, and intuitive portfolio
                  management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                  <InstallPrompt inline />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Rocket className="inline-block h-8 w-8 mr-2" />
                Key Features
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Breaking down Web3 barriers with innovative solutions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Passwordless Login",
                  description:
                    "Secure authentication using passkeys - no seed phrases or passwords to remember",
                  icon: <ShieldCheck className="h-10 w-10" />,
                },
                {
                  title: "Custom Usernames",
                  description:
                    "Personalized user experience with friendly, memorable usernames",
                  icon: <ArrowUpIcon className="h-10 w-10" />,
                },
                {
                  title: "Account Abstraction",
                  description:
                    "Simplified blockchain interactions without technical complexity",
                  icon: <RefreshCcw className="h-10 w-10" />,
                },
                {
                  title: "Portfolio Management",
                  description:
                    "Build custom portfolios or use templates with just a few taps",
                  icon: <Lightbulb className="h-10 w-10" />,
                },
                {
                  title: "Points & Rewards",
                  description:
                    "Earn points for various actions within the platform",
                  icon: <ExternalLink className="h-10 w-10" />,
                },
                {
                  title: "Real-Time Tracking",
                  description:
                    "Monitor portfolio performance with accurate value calculations",
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

        {/* App Gallery Section */}
        <section id="gallery" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Search className="inline-block h-8 w-8 mr-2" />
                App Gallery
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Mobile-first PWA experience with intuitive navigation
              </p>
            </div>

            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/register.jpg"
                    alt="Seamless Registration"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Seamless Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Register with passkeys - no passwords needed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/dashboard.jpg"
                    alt="Main Dashboard"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Main Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Overview of your portfolio performance
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/assets_overview.jpg"
                    alt="Assets Overview"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Assets Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Track all your assets in one place
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/portfolios.jpg"
                    alt="Portfolio Management"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Portfolio Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage multiple investment portfolios
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/portfolio_details.jpg"
                    alt="Portfolio Details"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Portfolio Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown of each portfolio
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/risk_templates.jpg"
                    alt="Risk Templates"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Risk Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from pre-built risk-based portfolios
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/custom_templates.jpg"
                    alt="Custom Templates"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Custom Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your own portfolio templates
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/points_action.jpg"
                    alt="Points Actions"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Earning Points</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn points for various actions within the app
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="h-[400px] relative">
                  <Image
                    src="/points_leaderboard.jpg"
                    alt="Points Leaderboard"
                    fill
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Points Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare your progress with other users
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section id="vision" className="py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Target className="inline-block h-8 w-8 mr-2" />
                Core Values
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Our guiding principles that drive Smart Portfolio&apos;s
                development
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Simplicity & Accessibility",
                  description: "Breaking down Web3 barriers for everyone",
                  icon: <ShieldCheck className="h-8 w-8" />,
                },
                {
                  title: "Security & Trust",
                  description:
                    "User control with passkeys and gasless transactions",
                  icon: <Lightbulb className="h-8 w-8" />,
                },
                {
                  title: "Innovation & Adaptability",
                  description: "Integrating cutting-edge DeFi opportunities",
                  icon: <Scale className="h-8 w-8" />,
                },
                {
                  title: "Community-Driven Growth",
                  description: "Evolving based on real user needs",
                  icon: <TrendingUp className="h-8 w-8" />,
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

        {/* Roadmap Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <Calendar className="inline-block h-8 w-8 mr-2" />
                Roadmap
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Where we&apos;ve been and where we&apos;re going
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 mb-8">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold mb-2">
                        Completed (Ethena Accelerator)
                      </h3>
                      <p className="text-muted-foreground">
                        Core features delivered during the accelerator program
                      </p>
                      <ul className="mt-4 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>
                            Core PWA implementation with mobile-optimized UI
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Passkey-based authentication system</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Portfolio creation and management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Points and rewards system</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>User profile management</span>
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
                      <Rocket className="h-6 w-6" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Exciting features on our development roadmap
                      </p>
                      <ul className="mt-4 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Enso Network DeFi Integration and Ethena</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Social features and community engagement</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>AI-driven investment recommendations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Cross-chain portfolio management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>
                            Enhanced referral system with smart contract
                            integration
                          </span>
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
                  <div className="relative h-full min-h-[300px]">
                    <Image
                      src="/dashboard.jpg"
                      alt="Smart Portfolio App"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Start Investing Now
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Experience secure, simplified crypto investing with Smart
                      Portfolio. Join now, and start racking up points!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const element =
                            document.getElementById("install-guide");
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
              <Image
                src="/SP_LOGO.png"
                alt="Smart Portfolio Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h3 className="text-lg font-bold">Smart Portfolio</h3>
            </div>
            <div className="flex gap-6">
              <a
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="https://discord.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Smart Portfolio. Built with ❤️ for
              the Ethena Accelerator Program
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

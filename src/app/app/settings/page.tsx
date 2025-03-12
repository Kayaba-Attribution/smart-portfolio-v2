"use client";

import { PageWrapper } from "@/components/PageWrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Moon,
  Sun,
  Shield,
  UserCog,
  Bell,
  Globe,
  Clock,
  Languages,
  Lock,
  Key,
  Fingerprint,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PushNotificationManager } from "@/components/PushNotificationManager";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>

        {/* Appearance Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Smart Portfolio looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between opacity-60">
              <div>
                <Label className="text-base">Language</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">English</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PushNotificationManager />

            <div className="mt-6 space-y-4 opacity-60">
              <div className="flex items-center justify-between">
                <Label className="text-base">Portfolio Alerts</Label>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Price Alerts</Label>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-base">Security Alerts</Label>
                <Switch disabled checked />
              </div>
              <p className="text-sm text-muted-foreground italic mt-4">
                More notification options coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Protect your account and assets with additional security features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Passkey Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your account is secured with a passkey
                </p>
              </div>
              <div className="bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Active
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between opacity-60">
              <div>
                <Label className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Transaction Confirmation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require biometric confirmation for all transactions
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between opacity-60">
              <div>
                <Label className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Recovery Options
                </Label>
                <p className="text-sm text-muted-foreground">
                  Set up account recovery methods
                </p>
              </div>
              <Button variant="outline" size="sm" disabled className="h-8">
                Configure
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                Enhanced security features will be available in the next update.
              </p>
              <p className="mt-1">
                Your account is already secured with a passkey.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your trading and portfolio experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">
                    Default Chart Timeframe
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 opacity-60">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    1D
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    1W
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2 bg-muted"
                  >
                    1M
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    3M
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    1Y
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    All
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Currency Display</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 opacity-60">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2 bg-muted"
                  >
                    USD
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    EUR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    GBP
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-7 text-xs px-2"
                  >
                    JPY
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center italic">
              Additional preference settings will be available soon
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-4">
          Smart Portfolio v1.0.0 • Running on Base Sepolia Testnet
        </div>
      </div>
    </PageWrapper>
  );
} 
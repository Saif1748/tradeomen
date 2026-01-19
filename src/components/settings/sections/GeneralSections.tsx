import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Robot, ShieldCheck, Lightning, Check } from "@phosphor-icons/react";

// ✅ Flag for feature availability
const SHOW_DEV_FEATURES = import.meta.env.DEV;

export const AISection = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="aiModel">AI Model</Label>
      <Select defaultValue="balanced">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fast">Fast (Quick responses)</SelectItem>
          <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
          <SelectItem value="precise">Precise (Detailed analysis)</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Label>Memory</Label>
        <p className="text-xs text-muted-foreground">Remember conversation context</p>
      </div>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Label>Proactive Insights</Label>
        <p className="text-xs text-muted-foreground">Get AI suggestions automatically</p>
      </div>
      <Switch defaultChecked />
    </div>
    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Robot weight="fill" className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">AI Usage This Month</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">247</span>
        <span className="text-sm text-muted-foreground">/ unlimited queries</span>
      </div>
    </div>
  </div>
);

export const NotificationsSection = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Label>Email Notifications</Label>
        <p className="text-xs text-muted-foreground">Receive updates via email</p>
      </div>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Label>Push Notifications</Label>
        <p className="text-xs text-muted-foreground">Browser push notifications</p>
      </div>
      <Switch />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Label>Daily Summary</Label>
        <p className="text-xs text-muted-foreground">Get a daily trading recap</p>
      </div>
      <Switch defaultChecked />
    </div>
  </div>
);

export const PrivacySection = () => (
  <div className="space-y-6">
    {/* ✅ Only show Analytics and Export in Dev/Localhost */}
    {SHOW_DEV_FEATURES && (
      <>
        <div className="flex items-center justify-between">
          <div>
            <Label>Analytics</Label>
            <p className="text-xs text-muted-foreground">Help improve TradeOmen</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="space-y-3">
          <Label>Export Data</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export as CSV</Button>
            <Button variant="outline" size="sm">Export as JSON</Button>
          </div>
        </div>
      </>
    )}

    {/* ✅ Always Visible: Danger Zone */}
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck weight="fill" className="w-5 h-5 text-rose-400" />
        <span className="text-sm font-medium text-rose-400">Danger Zone</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Permanently delete your account and all data. This action cannot be undone.
      </p>
      <Button variant="destructive" size="sm">Delete Account</Button>
    </div>
  </div>
);

export const IntegrationsSection = () => {
  const integrations = [
    { name: "TradingView", status: "connected", icon: "📈" },
    { name: "MetaTrader 4", status: "available", icon: "📊" },
    { name: "Discord", status: "connected", icon: "💬" },
  ];

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <div
          key={integration.name}
          className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{integration.icon}</span>
            <div>
              <span className="text-sm font-medium text-foreground">{integration.name}</span>
              {integration.status === "connected" && (
                <Badge variant="outline" className="ml-2 text-xs border-emerald-500/50 text-emerald-400">
                  Connected
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant={integration.status === "connected" ? "outline" : "default"}
            size="sm"
          >
            {integration.status === "connected" ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export const SubscriptionSection = () => (
  <div className="space-y-6">
    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-glow-secondary/10 border border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <Lightning weight="fill" className="w-5 h-5 text-primary" />
        <span className="text-lg font-medium text-foreground">Pro Plan</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        You're currently on the Pro plan with unlimited access to all features.
      </p>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-semibold text-foreground">$29</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <Button variant="outline" className="w-full">Manage Subscription</Button>
    </div>
    
    <div className="space-y-3">
      <Label>Plan Features</Label>
      <ul className="space-y-2">
        {["Unlimited trades", "Advanced AI", "Priority support"].map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check weight="bold" className="w-4 h-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
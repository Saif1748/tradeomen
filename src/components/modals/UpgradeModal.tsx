import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-Auth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";


interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { profile } = useAuth(); //


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-background border-border shadow-2xl">
        <div className="grid md:grid-cols-2">
          
          {/* Pro Tier - Professional SaaS Look */}
          <div className="p-8 flex flex-col justify-between border-r border-border">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Pro Trader</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-muted-foreground ml-2">/ month</span>
              </div>


              <p className="text-sm text-muted-foreground mb-8">
                Ideal for serious traders looking to automate their insights and remove daily limits.
              </p>


              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span><strong>50 AI Chats</strong> daily limit</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span><strong>Unlimited</strong> trade logging</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span>Broker Synchronization</span>
                </li>
              </ul>
            </div>


            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold">
              Upgrade to Pro
            </Button>
          </div>




          {/* Premium Tier - Institutional / Landing Page Highlight Style */}
          <div className="p-8 flex flex-col justify-between bg-secondary/20 relative overflow-hidden">
            {/* Visual highlight consistent with Hero/Pricing sections */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Premium</h3>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
                  BEST VALUE
                </Badge>
              </div>


              <div className="mb-6">
                <span className="text-4xl font-extrabold">$79</span>
                <span className="text-muted-foreground ml-2">/ month</span>
              </div>


              <p className="text-sm text-muted-foreground mb-8">
                Institutional-grade tools for elite traders requiring maximum performance and zero constraints.
              </p>


              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm font-medium">
                  <Zap className="w-4 h-4 text-primary mt-0.5 fill-primary" />
                  <span><strong>200 AI Chats</strong> daily limit</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span><strong>Unlimited</strong> Strategies</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span>Priority AI processing</span>
                </li>
              </ul>
            </div>


            <Button variant="outline" className="w-full h-11 border-primary text-primary hover:bg-primary/10 font-bold border-2">
              Get Institutional Access
            </Button>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
};
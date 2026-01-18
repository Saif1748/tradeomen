import { useState, useMemo } from "react";
import { Plus, MagnifyingGlass, Funnel, Sword } from "@phosphor-icons/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StrategyStatsCards from "@/components/strategies/StrategyStatsCards";
import StrategyCard from "@/components/strategies/StrategyCard";
import CreateStrategyModal from "@/components/strategies/CreateStrategyModal";
import EditStrategyModal from "@/components/strategies/EditStrategyModal";
import StrategyDetail from "@/components/strategies/StrategyDetail";
import { Strategy, strategyStyles } from "@/lib/strategiesData"; 
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks & Context
import { useStrategies, UIStrategy } from "@/hooks/use-strategies";
import { useModal } from "@/contexts/ModalContext"; 
import { useCurrency } from "@/hooks/use-currency";
import { useFeatureAccess } from "@/hooks/useFeatureAccess"; // ✅ Import Feature Access

const Strategies = () => {
  // --- 1. Real Data Hooks ---
  const { strategies: realStrategies, isLoading, createStrategy, deleteStrategy, updateStrategy } = useStrategies();
  
  // ✅ Use standard feature access hooks instead of manual profile checks
  const { isPro, isPremium } = useFeatureAccess();
  const { triggerUpgrade } = useModal(); // ✅ Use triggerUpgrade instead of openUpgradeModal
  
  const { format, symbol } = useCurrency();

  // --- 2. State ---
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");

  // --- 3. Data Adapter (DB -> UI) ---
  const strategies: Strategy[] = useMemo(() => {
    return realStrategies.map((s: UIStrategy) => {
      const ruleGroups = s.rules 
        ? Object.entries(s.rules).map(([name, rules], i) => ({
            id: `g-${i}`,
            name,
            rules: Array.isArray(rules) ? rules : []
          }))
        : [];

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.emoji,
        emoji: s.emoji,
        color: s.color,
        color_hex: s.color,
        style: s.style,
        instruments: s.instrumentTypes || [],
        instrument_types: s.instrumentTypes,
        ruleGroups: ruleGroups,
        rules: s.rules,
        track_missed_trades: s.trackMissed,
        createdAt: s.createdAt.toISOString(),
        
        // Stats
        totalTrades: s.stats.totalTrades,
        winRate: s.stats.winRate,
        netPnl: s.stats.netPL,
        profitFactor: s.stats.profitFactor,
        avgWin: s.stats.avgWinner,
        avgLoss: s.stats.avgLoser,
        expectancy: s.stats.expectancy,
      } as unknown as Strategy;
    });
  }, [realStrategies]);

  // --- 4. Aggregate Global Stats ---
  const globalStats = useMemo(() => {
    const totalStrategies = strategies.length;
    const combinedTrades = strategies.reduce((acc, s) => acc + (s.totalTrades || 0), 0);
    
    // Weighted Win Rate
    const totalWins = strategies.reduce((acc, s) => acc + ((s.winRate / 100) * s.totalTrades), 0);
    const avgWinRate = combinedTrades > 0 ? (totalWins / combinedTrades) * 100 : 0;
    
    return {
      totalStrategies,
      combinedTrades,
      avgWinRate,
      totalPnl: strategies.reduce((acc, s) => acc + (s.netPnl || 0), 0)
    };
  }, [strategies]);

  const filteredStrategies = useMemo(() => {
    return strategies.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStyle = styleFilter === "all" || s.style === styleFilter;
      return matchesSearch && matchesStyle;
    });
  }, [strategies, searchQuery, styleFilter]);

  // --- 5. Handlers ---
  const handleCreateClick = () => {
    const currentCount = strategies.length;

    // ✅ Case 1: Free Plan Limit (1 Strategy)
    if (!isPro && currentCount >= 1) {
      triggerUpgrade("Free plan is limited to 1 strategy. Upgrade to Pro to create more.");
      return;
    }

    // ✅ Case 2: Pro Plan Limit (10 Strategies)
    if (isPro && !isPremium && currentCount >= 5) {
      triggerUpgrade("Pro plan is limited to 10 strategies. Upgrade to Premium for unlimited.");
      return;
    }

    // If Premium or within limits
    setCreateModalOpen(true);
  };

  const handleCreateStrategy = (newStrategy: any) => {
    const payload = {
        ...newStrategy,
        emoji: newStrategy.icon, 
        color: newStrategy.color || "#FFFFFF",
        instrumentTypes: newStrategy.instruments,
        trackMissed: false
    };
    createStrategy(payload, { onSuccess: () => setCreateModalOpen(false) });
  };

  const handleUpdateStrategy = (updatedData: any) => {
    if (!selectedStrategy) return;

    const payload = {
        name: updatedData.name,
        description: updatedData.description,
        emoji: updatedData.icon,
        color: updatedData.color,
        style: updatedData.style,
        instrumentTypes: updatedData.instruments,
        rules: updatedData.rules
    };

    updateStrategy({ id: selectedStrategy.id, data: payload }, {
        onSuccess: () => {
            setEditModalOpen(false);
        }
    });
  };

  const handleDeleteStrategy = () => {
    if (!selectedStrategy) return;
    deleteStrategy(selectedStrategy.id, {
        onSuccess: () => {
            setSelectedStrategy(null);
            setDeleteDialogOpen(false);
        }
    });
  };

  // --- 6. Render ---
  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Strategies" icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />} />
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  if (selectedStrategy) {
    return (
      <DashboardLayout>
        <PageHeader title="Strategy Detail" icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />} />
        <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4">
          <StrategyDetail
            strategy={selectedStrategy}
            onBack={() => setSelectedStrategy(null)}
            onEdit={() => setEditModalOpen(true)}
            onDelete={() => setDeleteDialogOpen(true)}
          />
        </div>
        <EditStrategyModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          strategy={selectedStrategy}
          onUpdateStrategy={handleUpdateStrategy}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedStrategy.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStrategy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Strategies" icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />}>
        <Button onClick={handleCreateClick} className="glow-button gap-2 text-white">
          <Plus weight="bold" className="w-4 h-4" />
          <span className="hidden sm:inline">New Strategy</span>
        </Button>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-4 sm:space-y-6">
        <StrategyStatsCards
          totalStrategies={globalStats.totalStrategies}
          combinedTrades={globalStats.combinedTrades}
          avgWinRate={globalStats.avgWinRate}
          totalPnl={globalStats.totalPnl}
        />

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <MagnifyingGlass weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border">
              <Funnel weight="regular" className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {strategyStyles.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredStrategies.map(strategy => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onClick={() => setSelectedStrategy(strategy)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
            <p className="text-muted-foreground">
              {searchQuery || styleFilter !== "all"
                ? "No strategies match your search."
                : "No strategies yet. Create your first strategy to get started."}
            </p>
          </div>
        )}
      </div>

      <CreateStrategyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateStrategy={handleCreateStrategy}
      />
    </DashboardLayout>
  );
};

export default Strategies;
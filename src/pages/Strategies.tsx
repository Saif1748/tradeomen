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
import { Skeleton } from "@/components/ui/skeleton";

// Hooks & Context
import { useStrategies, UIStrategy } from "@/hooks/use-strategies";
import { useModal } from "@/contexts/ModalContext";
import { useCurrency } from "@/hooks/use-currency";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

const Strategies = () => {
  /* =========================
     Hooks
  ========================= */

  const {
    strategies: realStrategies,
    isLoading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
  } = useStrategies();

  const { isPro, isPremium } = useFeatureAccess();
  const { triggerUpgrade } = useModal();
  const { format, symbol } = useCurrency();

  /* =========================
     Local State
  ========================= */

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");

  /* =========================
     DB → UI Adapter
  ========================= */

  const strategies: Strategy[] = useMemo(() => {
    return realStrategies.map((s: UIStrategy) => {
      const ruleGroups = s.rules
        ? Object.entries(s.rules).map(([name, rules], i) => ({
            id: `group-${i}`,
            name,
            rules: Array.isArray(rules) ? rules : [],
          }))
        : [];

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        emoji: s.emoji,
        icon: s.emoji,
        color: s.color,
        color_hex: s.color,
        style: s.style,
        instruments: s.instrumentTypes,
        instrument_types: s.instrumentTypes,
        rules: s.rules,
        ruleGroups,
        track_missed_trades: s.trackMissed,
        createdAt: s.createdAt.toISOString(),

        // --- Stats (already computed in SQL) ---
        totalTrades: Number(s.stats.totalTrades) || 0,
        winRate: Number(s.stats.winRate) || 0,
        netPnl: Number(s.stats.netPL) || 0,
        profitFactor: Number(s.stats.profitFactor) || 0,
        avgWin: Number(s.stats.avgWinner) || 0,
        avgLoss: Number(s.stats.avgLoser) || 0,
        expectancy: Number(s.stats.expectancy) || 0,
      } as Strategy;
    });
  }, [realStrategies]);

  /* =========================
     Global Aggregates (Correct Math)
  ========================= */

  const globalStats = useMemo(() => {
    let totalTrades = 0;
    let totalWins = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let netPnl = 0;

    for (const s of strategies) {
      totalTrades += s.totalTrades;
      totalWins += Math.round((s.winRate / 100) * s.totalTrades);

      if (s.netPnl > 0) grossProfit += s.netPnl;
      if (s.netPnl < 0) grossLoss += Math.abs(s.netPnl);

      netPnl += s.netPnl;
    }

    return {
      totalStrategies: strategies.length,
      combinedTrades: totalTrades,
      avgWinRate:
        totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0,
      totalPnl: netPnl,
      profitFactor:
        grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : 0,
    };
  }, [strategies]);

  /* =========================
     Filters
  ========================= */

  const filteredStrategies = useMemo(() => {
    return strategies.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStyle = styleFilter === "all" || s.style === styleFilter;
      return matchesSearch && matchesStyle;
    });
  }, [strategies, searchQuery, styleFilter]);

  /* =========================
     Handlers
  ========================= */

  const handleCreateClick = () => {
    const count = strategies.length;

    if (!isPro && count >= 1) {
      triggerUpgrade("Free plan allows only 1 strategy.");
      return;
    }

    if (isPro && !isPremium && count >= 5) {
      triggerUpgrade("Pro plan allows up to 5 strategies.");
      return;
    }

    setCreateModalOpen(true);
  };

  const handleCreateStrategy = (data: any) => {
    createStrategy(
      {
        ...data,
        emoji: data.icon,
        color: data.color,
        instrumentTypes: data.instruments,
        trackMissed: false,
      },
      { onSuccess: () => setCreateModalOpen(false) }
    );
  };

  const handleUpdateStrategy = (data: any) => {
    if (!selectedStrategy) return;

    updateStrategy(
      {
        id: selectedStrategy.id,
        data: {
          name: data.name,
          description: data.description,
          emoji: data.icon,
          color: data.color,
          style: data.style,
          instrumentTypes: data.instruments,
          rules: data.rules,
        },
      },
      { onSuccess: () => setEditModalOpen(false) }
    );
  };

  const handleDeleteStrategy = () => {
    if (!selectedStrategy) return;

    deleteStrategy(selectedStrategy.id, {
      onSuccess: () => {
        setSelectedStrategy(null);
        setDeleteDialogOpen(false);
      },
    });
  };

  /* =========================
     Loading
  ========================= */

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Strategies"
          icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />}
        />
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* =========================
     Strategy Detail
  ========================= */

  if (selectedStrategy) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Strategy Detail"
          icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />}
        />
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

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
              <AlertDialogDescription>
                Delete "{selectedStrategy.name}" permanently?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStrategy}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    );
  }

  /* =========================
     Main List
  ========================= */

  return (
    <DashboardLayout>
      <PageHeader
        title="Strategies"
        icon={<Sword weight="duotone" className="w-6 h-6 text-primary" />}
      >
        <Button onClick={handleCreateClick} className="glow-button gap-2">
          <Plus weight="bold" />
          New Strategy
        </Button>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-6">
        <StrategyStatsCards
          totalStrategies={globalStats.totalStrategies}
          combinedTrades={globalStats.combinedTrades}
          avgWinRate={globalStats.avgWinRate}
          totalPnl={globalStats.totalPnl}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Funnel className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {strategyStyles.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onClick={() => setSelectedStrategy(strategy)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">
              No strategies match your filters.
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

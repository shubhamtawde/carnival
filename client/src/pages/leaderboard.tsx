import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, PartyPopper } from "lucide-react";
import { useWebSocket } from "@/lib/useWebSocket";
import type { Player } from "@shared/schema";

export default function Leaderboard() {
  useWebSocket();

  const { data: topPlayers = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 5000,
  });

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-amber-100 dark:bg-amber-900/30 border-amber-400 scale-105";
    if (rank === 2) return "bg-gray-100 dark:bg-gray-800/50 border-gray-400";
    if (rank === 3) return "bg-orange-100 dark:bg-orange-900/30 border-orange-400";
    return "";
  };

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return "bg-amber-500 text-white w-12 h-12 text-xl";
    if (rank === 2) return "bg-gray-400 text-white w-10 h-10 text-lg";
    if (rank === 3) return "bg-orange-600 text-white w-10 h-10 text-lg";
    return "bg-muted text-muted-foreground w-8 h-8";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-4">
        <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
          <PartyPopper className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Carnival Leaderboard</h1>
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-amber-500" />
              Top 10 Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-lg">
                Loading leaderboard...
              </div>
            ) : topPlayers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-lg">
                No scores yet - the competition is about to begin!
              </div>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                        isTopThree ? getRankStyle(rank) : "border-transparent"
                      }`}
                      data-testid={`leaderboard-row-${player.id}`}
                    >
                      <div
                        className={`rounded-full flex items-center justify-center font-bold ${getRankBadgeStyle(rank)}`}
                      >
                        {rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isTopThree ? "text-xl" : "text-lg"}`}>
                          {player.name}
                        </p>
                      </div>
                      <div className={`font-bold ${isTopThree ? "text-2xl" : "text-xl"}`}>
                        {player.totalPoints}
                        <span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

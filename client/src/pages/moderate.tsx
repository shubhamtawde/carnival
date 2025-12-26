import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Award, Sparkles, X, Undo2, PartyPopper, ArrowLeft } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/useWebSocket";
import { useLocation } from "wouter";
import type { Player, ScoreLogWithPlayer } from "@shared/schema";

export default function Moderate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const [selectedLogToUndo, setSelectedLogToUndo] = useState<ScoreLogWithPlayer | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  useWebSocket();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: recentLogs = [] } = useQuery<ScoreLogWithPlayer[]>({
    queryKey: ["/api/scores/recent"],
    enabled: showUndoDialog,
  });

  const addScoreMutation = useMutation({
    mutationFn: async (data: { playerId: number; points: number; note?: string }) => {
      return await apiRequest("POST", "/api/scores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Score Recorded!",
        description: `${parseInt(points) >= 0 ? "+" : ""}${points} points for ${selectedPlayer?.name}`,
      });
      setSelectedPlayer(null);
      setPoints("");
      setNote("");
      setShowConfirmDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const undoMutation = useMutation({
    mutationFn: async (logId?: number) => {
      return await apiRequest("POST", "/api/scores/undo", logId ? { logId } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores/recent"] });
      toast({ title: "Undone!", description: "Score entry has been reversed" });
      setShowUndoConfirm(false);
      setShowUndoDialog(false);
      setSelectedLogToUndo(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setShowUndoConfirm(false);
    },
  });

  const handleScoreSubmit = () => {
    if (!selectedPlayer) {
      toast({ title: "Error", description: "Please select a player", variant: "destructive" });
      return;
    }
    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum)) {
      toast({ title: "Error", description: "Please enter a valid number", variant: "destructive" });
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmScoreSubmit = () => {
    if (!selectedPlayer) return;
    addScoreMutation.mutate({
      playerId: selectedPlayer.id,
      points: parseInt(points, 10),
      note: note.trim() || undefined,
    });
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUndoClick = (log: ScoreLogWithPlayer) => {
    setSelectedLogToUndo(log);
    setShowUndoDialog(false);
    setShowUndoConfirm(true);
  };

  const confirmUndo = () => {
    if (selectedLogToUndo) {
      undoMutation.mutate(selectedLogToUndo.id);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <PartyPopper className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold">Game Moderator</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUndoDialog(true)}
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-primary" />
              Award Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-14"
                data-testid="input-search-player"
              />
            </div>

            {searchQuery && filteredPlayers.length > 0 && !selectedPlayer && (
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {filteredPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-4 py-3 hover-elevate flex items-center justify-between border-b last:border-b-0"
                    data-testid={`button-select-player-${player.id}`}
                  >
                    <span className="font-medium">{player.name}</span>
                    <span className="text-muted-foreground">{player.totalPoints} pts</span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && filteredPlayers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No players found</p>
            )}

            {selectedPlayer && (
              <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Player</p>
                  <p className="font-semibold text-lg">{selectedPlayer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {selectedPlayer.totalPoints} points
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPlayer(null)}
                  data-testid="button-clear-selection"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Points to Award</label>
              <Input
                type="number"
                placeholder="Enter points (e.g., 10 or -5)"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="text-xl h-16 text-center font-bold"
                data-testid="input-points"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Note (optional)</label>
              <Textarea
                placeholder="e.g., Won Air Hockey"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
                rows={2}
                data-testid="input-note"
              />
            </div>

            <Button
              onClick={handleScoreSubmit}
              className="w-full h-16 text-lg font-semibold"
              disabled={!selectedPlayer || !points || addScoreMutation.isPending}
              data-testid="button-submit-score"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Award Points
            </Button>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Score Entry</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You are about to award:</p>
              <p className="text-2xl font-bold text-foreground">
                {parseInt(points) >= 0 ? "+" : ""}{points} points
              </p>
              <p>to <span className="font-semibold">{selectedPlayer?.name}</span></p>
              {note && <p className="text-sm">Note: {note}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmScoreSubmit} data-testid="button-confirm-score">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUndoConfirm} onOpenChange={setShowUndoConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo This Entry?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {selectedLogToUndo && (
                <>
                  <p>You are about to undo:</p>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <p className="font-semibold text-foreground">{selectedLogToUndo.playerName}</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedLogToUndo.points >= 0 ? "+" : ""}{selectedLogToUndo.points} points
                    </p>
                    {selectedLogToUndo.note && (
                      <p className="text-sm text-muted-foreground">Note: {selectedLogToUndo.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(selectedLogToUndo.timestamp)}</p>
                  </div>
                  <p className="text-sm">This will reverse the points awarded.</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUndo} data-testid="button-confirm-undo">
              Undo Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Entry to Undo</DialogTitle>
            <DialogDescription>
              Choose a score entry to reverse. Recent entries are shown first.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent entries found
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => handleUndoClick(log)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    data-testid={`button-undo-log-${log.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{log.playerName}</p>
                        <p className={`text-lg font-bold ${log.points >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {log.points >= 0 ? "+" : ""}{log.points} pts
                        </p>
                        {log.note && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

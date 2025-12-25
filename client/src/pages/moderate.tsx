import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { Search, Award, Sparkles, X, Undo2, PartyPopper } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/useWebSocket";
import type { Player } from "@shared/schema";

export default function Moderate() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  useWebSocket();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
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
    mutationFn: async () => {
      return await apiRequest("POST", "/api/scores/undo", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "Undone!", description: "Last score entry has been reversed" });
      setShowUndoConfirm(false);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold">Game Moderator</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUndoConfirm(true)}
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
            <AlertDialogTitle>Undo Last Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reverse the most recent score entry globally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => undoMutation.mutate()} data-testid="button-confirm-undo">
              Undo Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, UserPlus, Check, PartyPopper, Trash2, ArrowLeft } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/useWebSocket";
import { useLocation } from "wouter";
import type { Player } from "@shared/schema";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState("");

  useWebSocket();

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/players", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Player Added", description: "New player has joined the carnival!" });
      setNewPlayerName("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return await apiRequest("PATCH", `/api/players/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Player Updated", description: "Player name has been updated" });
      setEditingPlayer(null);
      setEditName("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Player Deleted", description: "Player has been removed" });
      setEditingPlayer(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({ title: "Error", description: "Please enter a player name", variant: "destructive" });
      return;
    }
    addPlayerMutation.mutate(newPlayerName.trim());
  };

  const handleEditPlayer = () => {
    if (!editingPlayer || !editName.trim()) return;
    updatePlayerMutation.mutate({ id: editingPlayer.id, name: editName.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PartyPopper className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-bold">Registration Desk</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Add New Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                className="text-lg h-14"
                data-testid="input-player-name"
              />
              <Button
                onClick={handleAddPlayer}
                className="h-14 px-8 bg-blue-600"
                disabled={addPlayerMutation.isPending}
                data-testid="button-add-player"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Registered Players ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading players...</p>
            ) : players.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No players yet - add your first contestant!
              </p>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`player-row-${player.id}`}
                  >
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.totalPoints} pts</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPlayer(player);
                        setEditName(player.name);
                      }}
                      data-testid={`button-edit-${player.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>Update the player's name or remove them.</DialogDescription>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Player name"
            className="text-lg"
            data-testid="input-edit-player-name"
          />
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="destructive"
              onClick={() => editingPlayer && deletePlayerMutation.mutate(editingPlayer.id)}
              disabled={deletePlayerMutation.isPending}
              data-testid="button-delete-player"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setEditingPlayer(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditPlayer}
              disabled={updatePlayerMutation.isPending}
              data-testid="button-save-edit"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

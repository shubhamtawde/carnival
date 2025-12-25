import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import Register from "@/pages/register";
import Moderate from "@/pages/moderate";
import Leaderboard from "@/pages/leaderboard";
import { UserPlus, Award, Trophy } from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">Carnival Scorer</h1>
      <p className="text-muted-foreground mb-8 text-center">Select your station</p>
      <div className="grid gap-4 w-full max-w-md">
        <Link href="/register">
          <Button className="w-full h-16 text-lg gap-3 bg-blue-600" data-testid="link-register">
            <UserPlus className="w-6 h-6" />
            Registration Desk
          </Button>
        </Link>
        <Link href="/moderate">
          <Button className="w-full h-16 text-lg gap-3" data-testid="link-moderate">
            <Award className="w-6 h-6" />
            Game Moderator
          </Button>
        </Link>
        <Link href="/leaderboard">
          <Button className="w-full h-16 text-lg gap-3 bg-amber-500" data-testid="link-leaderboard">
            <Trophy className="w-6 h-6" />
            Leaderboard Display
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/register" component={Register} />
      <Route path="/moderate" component={Moderate} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

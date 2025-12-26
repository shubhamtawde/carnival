import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertPlayerSchema, insertScoreLogSchema } from "@shared/schema";

const clients = new Set<WebSocket>();

function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({ event, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  app.get("/api/players", async (_req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const parsed = insertPlayerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const existing = await storage.getPlayerByName(parsed.data.name.trim());
      if (existing) {
        return res.status(409).json({ error: "A player with this name already exists" });
      }
      const player = await storage.createPlayer(parsed.data);
      broadcast("player_added", player);
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Name is required" });
      }
      const existing = await storage.getPlayerByName(name.trim());
      if (existing && existing.id !== id) {
        return res.status(409).json({ error: "A player with this name already exists" });
      }
      const player = await storage.updatePlayer(id, name);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      broadcast("player_updated", player);
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deletePlayer(id);
      broadcast("player_deleted", { id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const players = await storage.getTopPlayers(10);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const parsed = insertScoreLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const player = await storage.getPlayer(parsed.data.playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const scoreLog = await storage.createScoreLog(parsed.data);
      await storage.updatePlayerPoints(parsed.data.playerId, parsed.data.points);
      const updatedPlayer = await storage.getPlayer(parsed.data.playerId);
      if (updatedPlayer) {
        broadcast("score_added", { scoreLog, player: updatedPlayer });
      }
      res.status(201).json({ scoreLog, player: updatedPlayer || player });
    } catch (error) {
      res.status(500).json({ error: "Failed to add score" });
    }
  });

  app.post("/api/scores/undo", async (req, res) => {
    try {
      const { logId } = req.body;
      
      let logToUndo: any;
      
      if (logId) {
        // Undo a specific log
        logToUndo = await storage.getScoreLog(logId);
        if (!logToUndo) {
          return res.status(404).json({ error: "Score entry not found" });
        }
      } else {
        // Undo the last log (backward compatibility)
        logToUndo = await storage.getLastScoreLog();
        if (!logToUndo) {
          return res.status(404).json({ error: "No score entry to undo" });
        }
      }
      
      await storage.updatePlayerPoints(logToUndo.playerId, -logToUndo.points);
      await storage.deleteScoreLog(logToUndo.id);
      const updatedPlayer = await storage.getPlayer(logToUndo.playerId);
      broadcast("score_undone", { scoreLog: logToUndo, player: updatedPlayer });
      res.json({ undone: logToUndo, player: updatedPlayer });
    } catch (error) {
      res.status(500).json({ error: "Failed to undo score" });
    }
  });

  app.get("/api/scores/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const logs = await storage.getRecentScoreLogs(Math.min(limit, 50));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent scores" });
    }
  });

  return httpServer;
}

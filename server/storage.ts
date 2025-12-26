import { players, scoreLogs, type Player, type InsertPlayer, type ScoreLog, type InsertScoreLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  createPlayer(data: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, name: string): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<void>;
  
  getTopPlayers(limit?: number): Promise<Player[]>;
  
  createScoreLog(data: InsertScoreLog): Promise<ScoreLog>;
  getLastScoreLog(): Promise<ScoreLog | undefined>;
  getRecentScoreLogs(limit?: number): Promise<Array<ScoreLog & { playerName: string }>>;
  deleteScoreLog(id: number): Promise<void>;
  updatePlayerPoints(playerId: number, pointsDelta: number): Promise<void>;
  getScoreLog(id: number): Promise<ScoreLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players).orderBy(players.name);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.name, name));
    return player || undefined;
  }

  async createPlayer(data: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values({ name: data.name.trim() }).returning();
    return player;
  }

  async updatePlayer(id: number, name: string): Promise<Player | undefined> {
    const [player] = await db.update(players).set({ name: name.trim() }).where(eq(players.id, id)).returning();
    return player || undefined;
  }

  async deletePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async getTopPlayers(limit: number = 10): Promise<Player[]> {
    return await db.select().from(players).orderBy(desc(players.totalPoints)).limit(limit);
  }

  async createScoreLog(data: InsertScoreLog): Promise<ScoreLog> {
    const [log] = await db.insert(scoreLogs).values({
      playerId: data.playerId,
      points: data.points,
      note: data.note || null,
      timestamp: Math.floor(Date.now() / 1000),
    }).returning();
    return log;
  }

  async getLastScoreLog(): Promise<ScoreLog | undefined> {
    const [log] = await db.select().from(scoreLogs).orderBy(desc(scoreLogs.timestamp), desc(scoreLogs.id)).limit(1);
    return log || undefined;
  }

  async getRecentScoreLogs(limit: number = 25): Promise<Array<ScoreLog & { playerName: string }>> {
    const logs = await db
      .select({
        id: scoreLogs.id,
        playerId: scoreLogs.playerId,
        points: scoreLogs.points,
        note: scoreLogs.note,
        timestamp: scoreLogs.timestamp,
        playerName: players.name,
      })
      .from(scoreLogs)
      .innerJoin(players, eq(scoreLogs.playerId, players.id))
      .orderBy(desc(scoreLogs.timestamp), desc(scoreLogs.id))
      .limit(limit);
    return logs;
  }

  async getScoreLog(id: number): Promise<ScoreLog | undefined> {
    const [log] = await db.select().from(scoreLogs).where(eq(scoreLogs.id, id));
    return log || undefined;
  }

  async deleteScoreLog(id: number): Promise<void> {
    await db.delete(scoreLogs).where(eq(scoreLogs.id, id));
  }

  async updatePlayerPoints(playerId: number, pointsDelta: number): Promise<void> {
    await db.update(players).set({
      totalPoints: sql`${players.totalPoints} + ${pointsDelta}`
    }).where(eq(players.id, playerId));
  }
}

export const storage = new DatabaseStorage();

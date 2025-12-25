import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  totalPoints: integer("total_points").notNull().default(0),
});

export const scoreLogs = pgTable("score_logs", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  note: text("note"),
  timestamp: integer("timestamp").notNull().default(sql`extract(epoch from now())::integer`),
});

export const playersRelations = relations(players, ({ many }) => ({
  scoreLogs: many(scoreLogs),
}));

export const scoreLogsRelations = relations(scoreLogs, ({ one }) => ({
  player: one(players, {
    fields: [scoreLogs.playerId],
    references: [players.id],
  }),
}));

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
});

export const insertScoreLogSchema = createInsertSchema(scoreLogs).pick({
  playerId: true,
  points: true,
  note: true,
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type ScoreLog = typeof scoreLogs.$inferSelect;
export type InsertScoreLog = z.infer<typeof insertScoreLogSchema>;

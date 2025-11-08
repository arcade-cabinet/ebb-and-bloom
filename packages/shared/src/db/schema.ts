/**
 * DRIZZLE DATABASE SCHEMA - SINGLE SOURCE OF TRUTH
 * All Zod schemas derive from this
 */

import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ============================================================================
// GEN 0: PLANETS
// ============================================================================

export const planetsTable = sqliteTable('planets', {
  id: text('id').primaryKey(),
  seed: text('seed').notNull(),
  radius: real('radius').notNull(),
  mass: real('mass').notNull(),
  rotationPeriod: real('rotation_period').notNull(),
  compositionHistory: text('composition_history', { mode: 'json' }),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  status: text('status', { enum: ['forming', 'formed', 'stable'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const planetaryLayersTable = sqliteTable('planetary_layers', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  name: text('name').notNull(),
  minRadius: real('min_radius').notNull(),
  maxRadius: real('max_radius').notNull(),
  density: real('density').notNull(),
  temperature: real('temperature').notNull(),
  pressure: real('pressure').notNull(),
  materials: text('materials', { mode: 'json' }).notNull(),
});

// ============================================================================
// GEN 1: CREATURES  
// ============================================================================

export const creaturesTable = sqliteTable('creatures', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  archetype: text('archetype').notNull(),
  position: text('position', { mode: 'json' }).notNull(), // {lat, lon}
  traits: text('traits', { mode: 'json' }).notNull(),
  composition: text('composition', { mode: 'json' }).notNull(),
  needs: text('needs', { mode: 'json' }).notNull(),
  energy: real('energy').notNull(),
  age: integer('age').notNull(),
  status: text('status', { enum: ['alive', 'sick', 'dying', 'dead'] }).notNull(),
  stuck: integer('stuck', { mode: 'boolean' }).default(false),
  stuckCycles: integer('stuck_cycles').default(0),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GEN 2: PACKS
// ============================================================================

export const packsTable = sqliteTable('packs', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  members: text('members', { mode: 'json' }).notNull(), // Creature IDs
  center: text('center', { mode: 'json' }).notNull(),
  cohesion: real('cohesion').notNull(),
  status: text('status', { enum: ['forming', 'stable', 'dispersing'] }).notNull(),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GEN 3: TOOLS
// ============================================================================

export const toolsTable = sqliteTable('tools', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  type: text('type').notNull(),
  composition: text('composition', { mode: 'json' }).notNull(),
  boost: text('boost', { mode: 'json' }).notNull(),
  durability: real('durability').notNull(),
  owner: text('owner'), // Creature ID
  stuck: integer('stuck', { mode: 'boolean' }).default(false),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GEN 4: TRIBES
// ============================================================================

export const tribesTable = sqliteTable('tribes', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  name: text('name').notNull(),
  members: text('members', { mode: 'json' }).notNull(), // Creature IDs
  territory: text('territory', { mode: 'json' }).notNull(),
  resources: text('resources', { mode: 'json' }).notNull(),
  morale: real('morale').notNull(),
  cohesion: real('cohesion').notNull(),
  status: text('status', { enum: ['forming', 'stable', 'expanding', 'declining', 'collapsed'] }).notNull(),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GEN 5: BUILDINGS
// ============================================================================

export const buildingsTable = sqliteTable('buildings', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  type: text('type').notNull(),
  location: text('location', { mode: 'json' }).notNull(),
  composition: text('composition', { mode: 'json' }).notNull(),
  constructionProgress: real('construction_progress').notNull(),
  benefits: text('benefits', { mode: 'json' }).notNull(),
  owner: text('owner'), // Tribe ID
  stuck: integer('stuck', { mode: 'boolean' }).default(false),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GEN 6: ABSTRACT SYSTEMS
// ============================================================================

export const abstractSystemsTable = sqliteTable('abstract_systems', {
  id: text('id').primaryKey(),
  planetId: text('planet_id').references(() => planetsTable.id),
  type: text('type', { enum: ['religious', 'political', 'economic', 'cultural', 'philosophical', 'ideological', 'cult', 'movement'] }).notNull(),
  name: text('name').notNull(),
  followers: text('followers', { mode: 'json' }).notNull(), // Tribe IDs
  practices: text('practices', { mode: 'json' }).notNull(),
  beliefs: text('beliefs', { mode: 'json' }).notNull(),
  influence: real('influence').notNull(),
  status: text('status', { enum: ['emerging', 'established', 'dominant', 'declining', 'extinct'] }).notNull(),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  generation: integer('generation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// ============================================================================
// GAME STATE
// ============================================================================

export const gameStateTable = sqliteTable('game_state', {
  id: text('id').primaryKey(),
  seed: text('seed').notNull(),
  generation: integer('generation').notNull(),
  cycle: integer('cycle').notNull(),
  worldMetrics: text('world_metrics', { mode: 'json' }),
  status: text('status', { enum: ['running', 'paused', 'ended'] }).notNull(),
  endingType: text('ending_type', { enum: ['mutualism', 'parasitism', 'domination', 'transcendence'] }),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ============================================================================
// ZOD SCHEMAS FROM DRIZZLE (SINGLE SOURCE OF TRUTH)
// ============================================================================

// Insert schemas (for creating new records)
export const insertPlanetSchema = createInsertSchema(planetsTable);
export const insertCreatureSchema = createInsertSchema(creaturesTable);
export const insertPackSchema = createInsertSchema(packsTable);
export const insertToolSchema = createInsertSchema(toolsTable);
export const insertTribeSchema = createInsertSchema(tribesTable);
export const insertBuildingSchema = createInsertSchema(buildingsTable);
export const insertAbstractSystemSchema = createInsertSchema(abstractSystemsTable);
export const insertGameStateSchema = createInsertSchema(gameStateTable);

// Select schemas (for reading records)
export const selectPlanetSchema = createSelectSchema(planetsTable);
export const selectCreatureSchema = createSelectSchema(creaturesTable);
export const selectPackSchema = createSelectSchema(packsTable);
export const selectToolSchema = createSelectSchema(toolsTable);
export const selectTribeSchema = createSelectSchema(tribesTable);
export const selectBuildingSchema = createSelectSchema(buildingsTable);
export const selectAbstractSystemSchema = createSelectSchema(abstractSystemsTable);
export const selectGameStateSchema = createSelectSchema(gameStateTable);

// Type exports
export type Planet = typeof planetsTable.$inferSelect;
export type NewPlanet = typeof planetsTable.$inferInsert;
export type Creature = typeof creaturesTable.$inferSelect;
export type NewCreature = typeof creaturesTable.$inferInsert;
export type Pack = typeof packsTable.$inferSelect;
export type NewPack = typeof packsTable.$inferInsert;
export type Tool = typeof toolsTable.$inferSelect;
export type NewTool = typeof toolsTable.$inferInsert;
export type Tribe = typeof tribesTable.$inferSelect;
export type NewTribe = typeof tribesTable.$inferInsert;
export type Building = typeof buildingsTable.$inferSelect;
export type NewBuilding = typeof buildingsTable.$inferInsert;
export type AbstractSystem = typeof abstractSystemsTable.$inferSelect;
export type NewAbstractSystem = typeof abstractSystemsTable.$inferInsert;
export type GameState = typeof gameStateTable.$inferSelect;
export type NewGameState = typeof gameStateTable.$inferInsert;
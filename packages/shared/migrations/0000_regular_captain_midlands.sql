CREATE TABLE `abstract_systems` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`followers` text NOT NULL,
	`practices` text NOT NULL,
	`beliefs` text NOT NULL,
	`influence` real NOT NULL,
	`status` text NOT NULL,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`type` text NOT NULL,
	`location` text NOT NULL,
	`composition` text NOT NULL,
	`construction_progress` real NOT NULL,
	`benefits` text NOT NULL,
	`owner` text,
	`stuck` integer DEFAULT false,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `creatures` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`archetype` text NOT NULL,
	`position` text NOT NULL,
	`traits` text NOT NULL,
	`composition` text NOT NULL,
	`needs` text NOT NULL,
	`energy` real NOT NULL,
	`age` integer NOT NULL,
	`status` text NOT NULL,
	`stuck` integer DEFAULT false,
	`stuck_cycles` integer DEFAULT 0,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_state` (
	`id` text PRIMARY KEY NOT NULL,
	`seed` text NOT NULL,
	`generation` integer NOT NULL,
	`cycle` integer NOT NULL,
	`world_metrics` text,
	`status` text NOT NULL,
	`ending_type` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `packs` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`members` text NOT NULL,
	`center` text NOT NULL,
	`cohesion` real NOT NULL,
	`status` text NOT NULL,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `planetary_layers` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`name` text NOT NULL,
	`min_radius` real NOT NULL,
	`max_radius` real NOT NULL,
	`density` real NOT NULL,
	`temperature` real NOT NULL,
	`pressure` real NOT NULL,
	`materials` text NOT NULL,
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `planets` (
	`id` text PRIMARY KEY NOT NULL,
	`seed` text NOT NULL,
	`radius` real NOT NULL,
	`mass` real NOT NULL,
	`rotation_period` real NOT NULL,
	`composition_history` text,
	`visual_blueprint` text,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`type` text NOT NULL,
	`composition` text NOT NULL,
	`boost` text NOT NULL,
	`durability` real NOT NULL,
	`owner` text,
	`stuck` integer DEFAULT false,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tribes` (
	`id` text PRIMARY KEY NOT NULL,
	`planet_id` text,
	`name` text NOT NULL,
	`members` text NOT NULL,
	`territory` text NOT NULL,
	`resources` text NOT NULL,
	`morale` real NOT NULL,
	`cohesion` real NOT NULL,
	`status` text NOT NULL,
	`visual_blueprint` text,
	`generation` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`planet_id`) REFERENCES `planets`(`id`) ON UPDATE no action ON DELETE no action
);

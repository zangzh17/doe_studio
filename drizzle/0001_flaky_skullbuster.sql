CREATE TABLE `doe_designs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`mode` varchar(64) NOT NULL,
	`status` enum('draft','optimized') NOT NULL DEFAULT 'draft',
	`parameters` json,
	`previewData` json,
	`optimizationResult` json,
	`phaseMapUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doe_designs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doe_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`mode` varchar(64) NOT NULL,
	`category` varchar(64),
	`parameters` json NOT NULL,
	`thumbnailUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doe_templates_id` PRIMARY KEY(`id`)
);

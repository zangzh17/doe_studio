CREATE TABLE `doe_designs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
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
--> statement-breakpoint
CREATE TABLE `oauth_accounts` (
	`provider` varchar(64) NOT NULL,
	`providerUserId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expiresAt` datetime NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` text,
	`email` varchar(320),
	`avatarUrl` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`optimizationCredits` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `oauth_accounts` ADD CONSTRAINT `oauth_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
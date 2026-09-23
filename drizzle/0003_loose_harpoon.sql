CREATE TABLE "season_picks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_season_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"wdc_driver_id" uuid NOT NULL,
	"wcc_team" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_standings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_season_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"regular_points" integer NOT NULL,
	"wdc_bonus" integer DEFAULT 0 NOT NULL,
	"wcc_bonus" integer DEFAULT 0 NOT NULL,
	"total_points" integer NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "league_seasons" ADD COLUMN "wdc_winner_driver_id" uuid;--> statement-breakpoint
ALTER TABLE "league_seasons" ADD COLUMN "wcc_winner_team" text;--> statement-breakpoint
ALTER TABLE "season_picks" ADD CONSTRAINT "season_picks_league_season_id_league_seasons_id_fk" FOREIGN KEY ("league_season_id") REFERENCES "public"."league_seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_picks" ADD CONSTRAINT "season_picks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_picks" ADD CONSTRAINT "season_picks_wdc_driver_id_drivers_id_fk" FOREIGN KEY ("wdc_driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_standings" ADD CONSTRAINT "season_standings_league_season_id_league_seasons_id_fk" FOREIGN KEY ("league_season_id") REFERENCES "public"."league_seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_standings" ADD CONSTRAINT "season_standings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "season_picks_league_season_id_user_id_key" ON "season_picks" USING btree ("league_season_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "season_standings_league_season_id_user_id_key" ON "season_standings" USING btree ("league_season_id","user_id");--> statement-breakpoint
ALTER TABLE "league_seasons" ADD CONSTRAINT "league_seasons_wdc_winner_driver_id_drivers_id_fk" FOREIGN KEY ("wdc_winner_driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;
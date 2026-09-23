CREATE TYPE "public"."round_status" AS ENUM('upcoming', 'locked', 'completed');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"team" text NOT NULL,
	"number" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "picks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_season_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"p1_driver_id" uuid NOT NULL,
	"p2_driver_id" uuid NOT NULL,
	"p3_driver_id" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"round_number" integer NOT NULL,
	"name" text NOT NULL,
	"lock_at" timestamp with time zone NOT NULL,
	"status" "round_status" DEFAULT 'upcoming' NOT NULL,
	"result_p1_id" uuid,
	"result_p2_id" uuid,
	"result_p3_id" uuid,
	"result_entered_at" timestamp with time zone,
	"result_entered_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_season_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"points" integer NOT NULL,
	"breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_league_season_id_league_seasons_id_fk" FOREIGN KEY ("league_season_id") REFERENCES "public"."league_seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_p1_driver_id_drivers_id_fk" FOREIGN KEY ("p1_driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_p2_driver_id_drivers_id_fk" FOREIGN KEY ("p2_driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picks" ADD CONSTRAINT "picks_p3_driver_id_drivers_id_fk" FOREIGN KEY ("p3_driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_result_p1_id_drivers_id_fk" FOREIGN KEY ("result_p1_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_result_p2_id_drivers_id_fk" FOREIGN KEY ("result_p2_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_result_p3_id_drivers_id_fk" FOREIGN KEY ("result_p3_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_result_entered_by_users_id_fk" FOREIGN KEY ("result_entered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_league_season_id_league_seasons_id_fk" FOREIGN KEY ("league_season_id") REFERENCES "public"."league_seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_code_key" ON "drivers" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "picks_league_season_id_user_id_round_id_key" ON "picks" USING btree ("league_season_id","user_id","round_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rounds_year_round_number_key" ON "rounds" USING btree ("year","round_number");--> statement-breakpoint
CREATE UNIQUE INDEX "score_events_league_season_id_user_id_round_id_key" ON "score_events" USING btree ("league_season_id","user_id","round_id");
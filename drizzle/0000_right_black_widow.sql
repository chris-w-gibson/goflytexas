CREATE TYPE "public"."email_event_kind" AS ENUM('auto_reply', 'weekly_followup', 'admin_notify', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('web', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'converted', 'unsubscribed');--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"kind" "email_event_kind" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"flight_interest" text,
	"preferred_contact" text,
	"message" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"source" "lead_source" DEFAULT 'web' NOT NULL,
	"unsubscribe_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"unsubscribed" boolean DEFAULT false NOT NULL,
	"last_contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
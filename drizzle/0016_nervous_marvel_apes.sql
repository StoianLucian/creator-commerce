ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
-- Backfill handles for accounts created before the username plugin, so their
-- /@handle/* URLs resolve. Derived from name, de-duplicated with a counter.
WITH ranked AS (
	SELECT
		id,
		name,
		CASE
			WHEN length(regexp_replace(lower(name), '[^a-z0-9_]', '', 'g')) >= 3
				THEN regexp_replace(lower(name), '[^a-z0-9_]', '', 'g')
			ELSE 'user_' || left(md5(id), 8)
		END AS base
	FROM "user"
	WHERE username IS NULL
), numbered AS (
	SELECT
		id,
		name,
		base,
		row_number() OVER (PARTITION BY base ORDER BY id) AS rn
	FROM ranked
)
UPDATE "user" u
SET
	username = CASE WHEN n.rn = 1 THEN n.base ELSE n.base || n.rn END,
	display_username = n.name
FROM numbered n
WHERE u.id = n.id;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");
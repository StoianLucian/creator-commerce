import "dotenv/config";
import { deleteOrphanedImages } from "./orphaned-images";

// CLI runner: `npm run images:cleanup [-- --dry-run] [--grace-hours=N]`
// Point DATABASE_URL / UPLOADTHING_TOKEN at the target environment when running
// against staging or prod, e.g. `DATABASE_URL='...' npm run images:cleanup`.
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");

    const graceArg = args.find((a) => a.startsWith("--grace-hours="));
    const gracePeriodMs = graceArg
        ? Number(graceArg.split("=")[1]) * 60 * 60 * 1000
        : undefined;

    const result = await deleteOrphanedImages({ dryRun, gracePeriodMs });

    console.log(
        `${dryRun ? "[dry run] " : ""}scanned ${result.scanned} file(s), ` +
            `found ${result.orphaned} orphan(s), deleted ${result.deletedCount}.`,
    );
    if (result.keys.length > 0) {
        console.log(result.keys.join("\n"));
    }

    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

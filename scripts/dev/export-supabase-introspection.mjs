import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseSchemas() {
  const raw = process.env.DEV_INTROSPECTION_SCHEMAS ?? "public";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function main() {
  const allow = process.env.DEV_DB_INTROSPECTION === "1";
  if (!allow) {
    throw new Error(
      "Refusing to run. Set DEV_DB_INTROSPECTION=1 to explicitly allow this dev-only export."
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run in NODE_ENV=production.");
  }

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const schemas = parseSchemas();

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("introspection_snapshot", {
    target_schemas: schemas,
  });

  if (error) {
    throw new Error(
      `RPC failed. Ensure scripts/dev/supabase_dev_introspection.sql was applied to your DEV DB.\n${error.message}`
    );
  }

  const outputDir = path.resolve(".dev");
  const outputFile = path.join(outputDir, "supabase-introspection.json");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(`Wrote ${outputFile}`);
  console.log(`Schemas: ${schemas.join(", ")}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

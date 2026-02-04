import path from "node:path";
import { buildServer } from "./app";

function env(name: string, fallback: string) {
  return process.env[name] ?? fallback;
}

async function main() {
  const host = env("PLANOTE_HOST", "127.0.0.1");
  const port = Number(env("PLANOTE_PORT", "8787"));

  const projectRoot = process.cwd();
  const uiDistPath = path.join(projectRoot, "ui", "dist");

  const app = await buildServer({ host, port, projectRoot, uiDistPath });
  await app.listen({ host, port });
  app.log.info(`Planote server listening on http://${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

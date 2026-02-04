#!/usr/bin/env node
import { Command } from "commander";
import { registerHistoryCommand } from "./commands/history";
import { registerSnapshotCommand } from "./commands/snapshot";

const program = new Command();

program.name("planote").description("Planote CLI").version("0.0.0");

program
  .command("doctor")
  .description("Diagnostics (WP0 stub)")
  .action(() => {
    console.log("Planote doctor: OK (WP0)");
  });

// Register subcommands
registerHistoryCommand(program);
registerSnapshotCommand(program);

program.parse(process.argv);

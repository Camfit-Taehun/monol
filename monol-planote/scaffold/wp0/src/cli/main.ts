#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program.name("planote").description("Planote CLI").version("0.0.0");

program
  .command("doctor")
  .description("Diagnostics (WP0 stub)")
  .action(() => {
    console.log("Planote doctor: OK (WP0)");
  });

program.parse(process.argv);

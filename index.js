#!/usr/bin/env node
"use strict";

const program = require("commander");
const { newService } = require("./libs/service");
const { newEndpoint } = require("./libs/endpoint");
const { doSetup } = require("./libs/starter");
const { newModel } = require("./libs/model");

program.version("1.0.0").description("Parsony CLI");

program
  .command("addEndpoint")
  .alias("+")
  .description("Create a new endpoint")
  .action(newEndpoint);

program
  .command("addService")
  .alias("+s")
  .description("Create a new service")
  .action(newService);

program
  .command("initProject")
  .alias("init")
  .description("Create new Parsony project.")
  .action(doSetup);

program
  .command('newModel')
  .alias('+m')
  .description('Create a new model')
  .action(newModel);

program.parse(process.argv);

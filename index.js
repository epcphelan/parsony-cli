#!/usr/bin/env node
"use strict";

const program = require("commander");
const { checkIsService, createService } = require("./libs/service");
const { endpointWithService } = require("./libs/endpoint");
const { doSetup } = require('./libs/starter');


program.version("1.0.0").description("Parsony CLI");

program
  .command("addEndpoint")
  .alias("+")
  .description("Create a new endpoint")
  .action(() => {
    checkIsService((isService, serviceName) => {
      if (!isService) {
        console.log("This service does not exist yet.");
        createService(serviceName, err => {
          if (err) {
            console.log('Something went wrong:',err);
          } else {
            endpointWithService(serviceName);
          }
        });
      } else {
        endpointWithService(serviceName);
      }
    });
  });

program
  .command("addService")
  .alias("+s")
  .description("Create a new service")
  .action(()=>{
    checkIsService((isService,name) =>{
      if(isService){
        console.log("This service already exists.");
      } else {
        createService(name, err=>{
          if(err){
            console.log(err)
          } else{
            console.log(`New service, ${name}, has been created.`)
          }
        })
      }
    })
  });

program
  .command("initProject")
  .alias("init")
  .description("Create new Parsony project.")
  .action(doSetup);


program.parse(process.argv);

#!/usr/bin/env node
'use strict';

const program = require('commander');
const {checkIsService, createService} = require('./libs/service');
const {endpointWithService} = require('./libs/endpoint');

let service = null;
let endpoint = null;

program
	.version('1.0.0')
	.description('Parsony CLI');

program
	.command('addEndpoint')
	.alias('+')
	.description('Create a new endpoint')
	.action(() => {
		checkIsService((isService, serviceName) => {
			if(!isService){
				console.log('This service does not exist yet.');
				createService(serviceName,(err)=>{
					if(err){
						console.log(err)
					}
					else{
						endpointWithService(serviceName);
					}
				})
			}
			else{
				endpointWithService(serviceName);
			}
		});
	});

program.parse(process.argv);
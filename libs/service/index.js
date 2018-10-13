const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");
const { makeServicePrompt, getServicePrompt } = require("../prompts");

async function newService() {
  const {service} = await getServiceName();
  if (checkIsService(service)) {
    console.log("This service already exists.");
  } else {
    if (await shouldMakeNewService()) {
      makeNewService(service);
    }
  }
}

function makeNewService(serviceName) {
  const _servicesDirectory = path.join("services", serviceName);
  fs.mkdirSync(_servicesDirectory);
  fs.mkdirSync(path.join(_servicesDirectory,'interfaces'));
  fs.mkdirSync(path.join(_servicesDirectory,'handlers'));


  let handlersIndexPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    "stubs",
    "handlers.index.js"
  );

  let interfacesIndexPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    "stubs",
    "interfaces.index.js"
  );

  let handlersIndex = fs.readFileSync(handlersIndexPath);
  fs.writeFileSync(path.join(_servicesDirectory, 'handlers','index.js'), handlersIndex);

  let interfacesIndex = fs.readFileSync(interfacesIndexPath);
  fs.writeFileSync(path.join(_servicesDirectory, 'interfaces','index.js'), interfacesIndex);
}

function shouldMakeNewService() {
  return prompt(makeServicePrompt);
}

function getServiceName() {
  return prompt(getServicePrompt);
}

function checkIsService(name) {
  return _isServiceDirectory(name);
}

function _isServiceDirectory(serviceName) {
  let _servicesDirectory = `services/${serviceName}`;
  return fs.existsSync(_servicesDirectory);
}

module.exports = {
  newService,
  shouldMakeNewService,
  getServiceName,
  checkIsService,
  makeNewService
};

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

  const interfaceFile = `${serviceName}.interface.json`;
  const handlersFile = `${serviceName}.handlers.js`;

  const interfaceObj = {
    handlers: handlersFile,
    endpoints: []
  };

  fs.writeFileSync(
    path.join(_servicesDirectory, interfaceFile),
    JSON.stringify(interfaceObj, null, 2)
  );

  let template = path.join(
    path.dirname(fs.realpathSync(__filename)),
    "stubs",
    "handlers.template.js"
  );

  let templateFile = fs.readFileSync(template);
  fs.writeFileSync(path.join(_servicesDirectory, handlersFile), templateFile);
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

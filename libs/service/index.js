const { makeServicePrompt, getServicePrompt } = require("../prompts");
const { prompt } = require("inquirer");
const fs = require("fs");
const path = require("path");

function createService(serviceName, callback) {
  prompt(makeServicePrompt).then(({ newService }) => {
    if (newService === true) {
      makeNewService(serviceName, callback);
    }
  });
}

function makeNewService(serviceName, callback) {
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
  fs.writeFileSync(path.join(_servicesDirectory, handlersFile),templateFile);
  callback();
}

function checkIsService(callback) {
  prompt(getServicePrompt).then(answers => {
    callback(_isServiceDirectory(answers.service), answers.service);
  });
}

function _isServiceDirectory(serviceName) {
  let _servicesDirectory = `services/${serviceName}`;
  return fs.existsSync(_servicesDirectory);
}

module.exports = {
  createService,
  checkIsService
};

const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");
const { makeWebServicePrompt, getServicePrompt } = require("../prompts");

async function newWebService() {
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
  const _servicesDirectory = path.join("redux", serviceName);
  fs.mkdirSync(_servicesDirectory);
  const stubsPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    'stubs'
  );
  const stubs = fs.readdirSync(stubsPath);
  stubs.forEach(file => {
    const src = path.join(
      path.dirname(fs.realpathSync(__filename)),
      'stubs',
      file
    );
    const fileData = fs.readFileSync(src);
    let fileDataString = fileData.toString();
    if(file==='reducers.js'){
      fileDataString = fileDataString.replace('{{STATE_BRANCH_PLACEHOLDER}}',serviceName);
    }
    fs.writeFileSync(path.join(_servicesDirectory, file), fileDataString);
  })
}

function shouldMakeNewService() {
  return prompt(makeWebServicePrompt);
}

function getServiceName() {
  return prompt(getServicePrompt);
}

function checkIsService(name) {
  return _isServiceDirectory(name);
}

function _isServiceDirectory(serviceName) {
  let _servicesDirectory = `redux/${serviceName}`;
  return fs.existsSync(_servicesDirectory);
}

module.exports = {
  newWebService,
  makeNewService,
  shouldMakeNewService,
  getServiceName,
  checkIsService
};

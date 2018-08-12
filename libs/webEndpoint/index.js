const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");

const {
  shouldMakeNewService,
  getServiceName,
  checkIsService,
  makeNewService
} = require("../webService");

const {
  getEndpointPrompt,
} = require("../prompts");

let args = {
  method: null,
  desc: "Description of method.",
  service: "service",
  apiKeyRequired: false,
  sessionTokenRequired: false,
  endpoint: "",
  handler: null,
  params: []
};

async function newWebEndpoint() {
  try {
    const { service } = await getServiceName();

    if (!checkIsService(service)) {
      console.log("This service does not exist yet.");
      const { newService } = await shouldMakeNewService();
      if (newService) {
        makeNewService(service);
      } else {
        process.exit();
      }
    }
    const { endpoint } = await getEndpointName();
    await createEndpoint(endpoint, service);
  } catch (e) {
    console.log(e.message);
  }
}

function getEndpointName() {
  return prompt(getEndpointPrompt);
}


async function createEndpoint(endpointName, service) {

  args.endpoint = endpointName;
  const _servicesDirectory = path.join("redux", service);
  const selectors = path.join(
    _servicesDirectory,
    'selectors.js'
  );
  fs.appendFileSync(selectors, createSelector(endpointName));

  const types = path.join(
    _servicesDirectory,
    'types.js'
  );
  fs.appendFileSync(types, createType(endpointName, service));

  const initialState = path.join(
    _servicesDirectory,
    'initialState.js'
  );

  fs.appendFileSync(initialState,createStateSlug(endpointName));

  const actions = path.join(
    _servicesDirectory,
    'actions.js'
  );
  fs.appendFileSync(actions, createAction(endpointName,service))
}


function createSelector(name){
  return`
  
export function ${name}(state){
\t return state[BRANCH].${name}
}
`
}

function createType(name, service){
  const type = camelToSnake(name).toUpperCase();
  return`
  
export const ${type} = '${service}.${name}';

  `
}

function camelToSnake(string){
  const upperChars = string.match(/([A-Z])/g);
  if (! upperChars) {
    return this;
  }
  let str = string;
  for (let i = 0, n = upperChars.length; i < n; i++) {
    str = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
  }
  if (str.slice(0, 1) === '_') {
    str = str.slice(1);
  }
  return str;
}

function createStateSlug(name){
  return `
  
state.${name} = {
\t isLoading:false,
\t data: null,
\t error: null
};
  `
}

function createAction(name, service){
  const type = camelToSnake(name).toUpperCase();
  return`
  
export function ${name}(){
\t return dispatch => request('${service}.${name}', {}, TYPES.${type}, dispatch)
}
  `
}

module.exports = {
  newWebEndpoint
};

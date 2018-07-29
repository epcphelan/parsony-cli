const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");

const {
  shouldMakeNewService,
  getServiceName,
  checkIsService,
  makeNewService
} = require("../service");

const {
  parameterValidationValuePrompt,
  parameterPrompt,
  shouldGatherParamsPrompt,
  getEndpointPrompt,
  endpointDetailPrompt
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

async function newEndpoint() {
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
    checkUniqueEndpoints(service, endpoint);
    await createEndpoint(endpoint, service);
  } catch (e) {
    console.log(e.message);
  }
}

function getEndpointName() {
  return prompt(getEndpointPrompt);
}

function checkUniqueEndpoints(service, endpoint) {
  let pathToInterface = getTargetFile(service, "interface");

  let interfaceObj = getInterfaceObj(pathToInterface);
  let endpoints = interfaceObj.endpoints;

  let namespacedEndpoint = `${service}.${endpoint}`;
  let namespacedREST = `/${service}/${endpoint}`;

  if (!uniqueRESTEndpoint(namespacedREST, endpoints)) {
    throw new Error(`Duplicate REST endpoint: ${namespacedREST}`);
  }
  if (!uniqueJSONEndpoint(namespacedEndpoint, endpoints)) {
    throw new Error(`Duplicate API endpoint: ${namespacedEndpoint}`);
  }
}

async function createEndpoint(endpointName, serviceName) {
  args.service = serviceName;
  args.endpoint = endpointName;

  const {
    desc,
    method,
    apiKeyRequired,
    sessionTokenRequired
  } = await getEndpointSummary();

  args.desc = desc;
  args.method = method;
  args.apiKeyRequired = apiKeyRequired;
  args.sessionTokenRequired = sessionTokenRequired;

  await gatherParams();
  const contract = await addEndpointToService(args);
  console.log(
    `Success: endpoint created:
    ${JSON.stringify(contract, null, 2)}`
  );
}

function getEndpointSummary() {
  return prompt(endpointDetailPrompt);
}

async function addEndpointToService(args) {
  const pathToInterface = getTargetFile(args.service, "interface");
  const pathToHandlers = getTargetFile(args.service, "handlers");

  const interfaceObj = getInterfaceObj(pathToInterface);
  const endpoints = interfaceObj.endpoints;

  const namespacedEndpoint = `${args.service}.${args.endpoint}`;
  const namespacedREST = `/${args.service}/${args.endpoint}`;

  args.namespacedREST = namespacedREST;
  args.namespacedEndpoint = namespacedEndpoint;

  if (!uniqueRESTEndpoint(`${args.method}:${namespacedREST}`, endpoints)) {
    throw new Error(`Duplicate REST endpoint: ${namespacedREST} `);
  }
  if (!uniqueJSONEndpoint(namespacedEndpoint, endpoints)) {
    throw new Error(`Duplicate API endpoint: ${namespacedEndpoint} `);
  }

  const updatedInterface = appendedInterface(interfaceObj, args);
  const newHandler = appendedFunction(args);

  fs.writeFileSync(pathToInterface, updatedInterface);
  fs.appendFileSync(pathToHandlers, newHandler);

  return interfaceObj;
}

function getInterfaceObj(pathToInterface) {
  let pathTo = path.join(process.cwd(), pathToInterface);
  return require(pathTo);
}

function getTargetFile(service, stringIdentifier) {
  let _servicesDirectory = `services/${service}`;
  let outFile = null;
  let stats = fs.statSync(_servicesDirectory);
  if (stats.isDirectory()) {
    fs.readdirSync(_servicesDirectory)
      .filter(function(file) {
        return file.indexOf(stringIdentifier) > -1;
      })
      .forEach(function(file) {
        outFile = file;
      });
  }
  return `${_servicesDirectory}/${outFile}`;
}

function uniqueRESTEndpoint(REST, interfaceObj) {
  for (let key in interfaceObj) {
    if (interfaceObj.hasOwnProperty(key)) {
      if (interfaceObj[key].RESTUrl === REST) {
        return false;
      }
    }
  }
  return true;
}

function uniqueJSONEndpoint(jsonAPI, interfaceObj) {
  for (let key in interfaceObj) {
    if (interfaceObj.hasOwnProperty(key)) {
      if (interfaceObj[key].json_api === jsonAPI) {
        return false;
      }
    }
  }
  return true;
}

function appendedInterface(interfaceObj, args) {
  let endpoints = interfaceObj.endpoints;
  interfaceObj.endpoints = updatedEndpointsArray(endpoints, args);
  return JSON.stringify(interfaceObj, null, 2);
}

function appendedFunction(args) {
  return generateFunction(
    args.endpoint,
    args.params,
    args.desc,
    args.sessionTokenRequired
  );
}

function updatedEndpointsArray(endpointsArray, newEndpointArgs) {
  const newEndpointObj = {
    json_api: newEndpointArgs.namespacedEndpoint,
    RESTUrl: `${newEndpointArgs.namespacedREST}`,
    method: newEndpointArgs.method,
    desc: newEndpointArgs.desc,
    handler: `${newEndpointArgs.endpoint}`,
    authentication: {
      api_key: newEndpointArgs.apiKeyRequired,
      session_token: newEndpointArgs.sessionTokenRequired
    },
    params: newEndpointArgs.params,
    returns: {},
    errors: []
  };
  endpointsArray.push(newEndpointObj);
  return endpointsArray;
}

function generateFunction(functionName, constArgs, description, sessionReq) {
  return `
/**
 * ${description}
 * @param {object} data - Parsony data object
 * @return {Promise.<*>}
 */
exports.${functionName} = async data => {
  // * = required
  ${generateConstants(constArgs, sessionReq)}

  /**
   * @todo Implement method
   */
};
`;
}

function generateConstants(params, session) {
  let out = "const { \n";
  out += params.reduce((s, p) => {
    return s + `\t ${p.param},\t${paramsComments(p)} \n`;
  }, "");

  if (session) {
    out += "\t sessionObj: { userId }\t// from session \n";
  }

  out += "\t } = data;";
  return out;
}

function paramsComments(param) {
  return `// type: ${extractType(param.validation)}${(() => {
    return param.required ? " *" : "";
  })()}`;

  function extractType(validation) {
    if (validation.hasOwnProperty("is_type")) {
      return validation["is_type"];
    }
    if (validation.hasOwnProperty("is_date")) {
      return "date";
    }
    if (validation.hasOwnProperty("is_json")) {
      return "json";
    }
    if (validation.hasOwnProperty("is_array")) {
      return "array";
    }
    return "untyped";
  }
}

async function gatherParams() {
  const { addParams } = await shouldGatherParams();
  if (addParams) {
    const response = await getParam();
    if (args.params.indexOf(response.param) === -1) {
      const validations = await handleParam(response);
      let param = {
        param: response.param,
        required: response.required,
        validation: validations
      };
      args.params.push(param);
      await gatherParams();
    } else if (response.param.length > 0) {
      await gatherParams();
    }
  }
}

function shouldGatherParams() {
  return prompt(shouldGatherParamsPrompt);
}

function getParam() {
  return prompt(parameterPrompt);
}

async function handleParam(params) {
  const validations = {};
  const { validations: rule } = params;
  switch (params.type) {
    case 'array':
      validations.is_array = true;
      break;
    case 'json':
      validations.is_json = true;
      break;
    default:
      validations.is_type = params.type;
      break;
  }
  if (rule.indexOf("valid email") > -1) {
    validations.valid_email = true;
  }
  if (rule.indexOf("url") > -1) {
    validations.is_url = true;
  }
  if (rule.indexOf("min. length") > -1) {
    parameterValidationValuePrompt[0].message = "min. length = ";
    const {val} = await paramValidationValue();
    validations.min_length = val;
  }
  if (rule.indexOf("max. length") > -1) {
      parameterValidationValuePrompt[0].message = "max. length = ";
      const { val } = await paramValidationValue();
      validations.max_length = val;
  }
  if (rule.indexOf("value in []") > -1) {
    parameterValidationValuePrompt[0].message = "set = [] (eg. 1,5,7): ";
    const { val } = await paramValidationValue();
    let valArray = val.split(',');
    if(params.type==='number'){
      valArray = valArray.map(v=>parseFloat(v));
    }
    validations.in_set = valArray;
  }
  if (rule.indexOf("regex") > -1) {
    parameterValidationValuePrompt[0].message = "regex pattern = ";
    const { val } = await paramValidationValue();
    validations.regex = val;
  }
  return validations;
}

function paramValidationValue() {
  return prompt(parameterValidationValuePrompt);
}

module.exports = {
  newEndpoint
};

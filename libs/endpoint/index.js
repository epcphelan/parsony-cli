const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");
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

function endpointWithService(serviceName) {
  checkIsUniqueEndpoint(serviceName, (err, endpointName) => {
    if (err.length > 0) {
      console.log(`Could not create new endpoint: ${err.join(", ")}`);
    } else {
      args.service = serviceName;
      args.endpoint = endpointName;
      getEndpointSummary(() => {
        gatherParams(function() {
          addEndpointToService(args, (err, contract) => {
            if (err) {
              console.log(
                `Failed to create endpoint. Error: ${JSON.stringify(err)}`
              );
            } else {
              console.log(
                `Success: endpoint created:
                  ${JSON.stringify(contract, null, 2)}`
              );
            }
          });
        });
      });
    }
  });
}

function checkIsUniqueEndpoint(serviceName, callback) {
  prompt(getEndpointPrompt).then(answers => {
    callback(
      checkUniqueEndpoints(serviceName, answers.endpoint),
      answers.endpoint
    );
  });
}

function checkUniqueEndpoints(service, endpoint) {
  let errors = [];

  let pathToInterface = getTargetFile(service, "interface");

  let interfaceObj = getInterfaceObj(pathToInterface);
  let endpoints = interfaceObj.endpoints;

  let namespacedEndpoint = `${service}.${endpoint}`;
  let namespacedREST = `/${service}/${endpoint}`;

  if (!uniqueRESTEndpoint(namespacedREST, endpoints)) {
    errors.push(`Duplicate REST endpoint: ${namespacedREST}`);
  }
  if (!uniqueJSONEndpoint(namespacedEndpoint, endpoints)) {
    errors.push(`Duplicate API endpoint: ${namespacedEndpoint}`);
  }
  return errors;
}

function getInterfaceObj(pathToInterface) {
  let pathTo = path.join(process.cwd(), pathToInterface);
  return require(pathTo);
}

function getEndpointSummary(callback) {
  prompt(endpointDetailPrompt).then(answers => {
    args.desc = answers.desc;
    args.method = answers.method;
    args.apiKeyRequired = answers.apiKeyRequired;
    args.sessionTokenRequired = answers.sessionTokenRequired;
    callback();
  });
}

function addEndpointToService(args, callback) {
  let errors = [];

  let pathToInterface = getTargetFile(args.service, "interface");
  let pathToHandlers = getTargetFile(args.service, "handlers");

  let interfaceObj = getInterfaceObj(pathToInterface);
  let endpoints = interfaceObj.endpoints;

  let namespacedEndpoint = `${args.service}.${args.endpoint}`;
  let namespacedREST = `/${args.service}/${args.endpoint}`;

  args.namespacedREST = namespacedREST;
  args.namespacedEndpoint = namespacedEndpoint;

  if (!uniqueRESTEndpoint(`${args.method}:${namespacedREST}`, endpoints)) {
    errors.push(`Duplicate REST endpoint: ${namespacedREST} `);
  }
  if (!uniqueJSONEndpoint(namespacedEndpoint, endpoints)) {
    errors.push(`Duplicate API endpoint: ${namespacedEndpoint} `);
  }

  let updatedInterface = appendedInterface(interfaceObj, args);
  let newHandler = appendedFunction(args);

  if (errors.length === 0) {
    fs.writeFile(pathToInterface, updatedInterface, function(err) {
      if (err) {
        callback(err);
      } else {
        fs.appendFile(pathToHandlers, newHandler, function(err) {
          callback(err, interfaceObj);
        });
      }
    });
  } else {
    callback(errors);
  }
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

function generateFunction(functionName, constArgs, description, sessionReq) {
  return `
/**
 * ${description}
 * @param {object} data - Parsony data object
 * @return {Promise.<*>}
 * @example
 \v ${JSON.stringify(constArgs, null, 2)}
 */
exports.${functionName} = async data => {
  // * = required
  ${generateConstants(constArgs, sessionReq)}

  try{
    /**
     * @todo Implement method
     */
  } catch(e){
    throw makeStandardError(ERROR)
  }
  
  ${generateReturn(constArgs, sessionReq)}
};
`;
}

function generateReturn(params, session) {
  let out = "return { \n";
  out += params.reduce((s, p) => {
    return s + `\v\v\v ${p.param},\n`;
  }, "");

  if (session) {
    out += "\v\v\v userId \n";
  }

  out += "\v };";
  return out;
}

function generateConstants(params, session) {
  let out = "const { \n";
  out += params.reduce((s, p) => {
    return s + `\v\v\v ${p.param},\v${paramsComments(p)} \n`;
  }, "");

  if (session) {
    out += "\v\v\v sessionObj: { userId }\v// from session \n";
  }

  out += "\v } = data;";
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

function appendedInterface(interfaceObj, args) {
  let endpoints = interfaceObj.endpoints;
  interfaceObj.endpoints = updatedEndpointsArray(endpoints, args);
  return JSON.stringify(interfaceObj, null, 2);
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

function appendedFunction(args) {
  return generateFunction(
    args.endpoint,
    args.params,
    args.desc,
    args.sessionTokenRequired
  );
}

function gatherParams(callback) {
  prompt(shouldGatherParamsPrompt).then(answers => {
    const { addParams } = answers;
    if (addParams === false) {
      callback();
    } else {
      prompt(parameterPrompt).then(answers => {
        if (args.params.indexOf(answers.param) === -1) {
          handleParams(answers, validations => {
            let param = {
              param: answers.param,
              required: answers.required,
              validation: validations
            };
            args.params.push(param);
            gatherParams(callback);
          });
        } else if (answers.param.length > 0) {
          gatherParams(callback);
        }
      });
    }
  });
}

function handleParams(params, callback) {
  const validations = {};
  const { validations: rule } = params;
  validations.is_type = params.type;
  if (rule.indexOf("proper case") > -1) {
    validations.proper_case = true;
  }
  if (rule.indexOf("valid email") > -1) {
    validations.valid_email = true;
  }
  if (rule.indexOf("proper case") > -1) {
    validations.proper_case = true;
  }
  if (rule.indexOf("value in []") > -1) {
    validations.in_set = [];
  }
  if (rule.indexOf("url") > -1) {
    validations.is_url = true;
  }
  if (rule.indexOf("min. length") > -1) {
    parameterValidationValuePrompt[0].message = "min. length = ";
    prompt(parameterValidationValuePrompt).then(answer => {
      const { val } = answer;
      validations.min_length = val;
      if (rule.indexOf("max. length") > -1) {
        parameterValidationValuePrompt[0].message = "max. length = ";
        prompt(parameterValidationValuePrompt).then(answer => {
          const { val } = answer;
          validations.max_length = val;
          callback(validations);
        });
      } else {
        callback(validations);
      }
    });
  } else {
    callback(validations);
  }
}

module.exports = {
  endpointWithService
};

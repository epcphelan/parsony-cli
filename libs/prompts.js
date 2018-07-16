const endpointDetailPrompt = [
  {
    type: "input",
    name: "desc",
    message: "Endpoint Description:"
  },
  {
    type: "list",
    name: "method",
    choices: ["post", "get", "put", "delete"],
    message: "HTTP Method ..."
  },
  {
    type: "confirm",
    name: "apiKeyRequired",
    message: "API Key Required?",
    default: true
  },
  {
    type: "confirm",
    name: "sessionTokenRequired",
    message: "Session Token Required",
    default: true
  }
];

const getServicePrompt = [
  {
    type: "input",
    name: "service",
    message: "Service: "
  }
];

const makeServicePrompt = [
  {
    type: "confirm",
    name: "newService",
    message: "Make new service? ",
    default: true
  }
];

const getEndpointPrompt = [
  {
    type: "input",
    name: "endpoint",
    message: "API Endpoint: (hint: camelCase)"
  }
];

const shouldGatherParamsPrompt = [
  {
    type: "confirm",
    name: "addParams",
    message: "Add Endpoint Parameters?",
    default: true
  }
];

const parameterPrompt = [
  {
    type: "input",
    name: "param",
    message: "Parameter:"
  },
  {
    type: "confirm",
    name: "required",
    message: "Parameter required?",
    default: true
  },
  {
    type: "rawlist",
    name: "type",
    message: "Argument Type:",
    choices: ["string", "number", "boolean", "date", "array", "json"]
  },
  {
    type: "checkbox",
    name: "validations",
    message: "Optional Validations:",
    choices: [
      "min. length",
      "max. length",
      "valid email",
      "regex",
      "value in []",
      "url"
    ]
  }
];

const parameterValidationValuePrompt = [
  {
    type: "input",
    name: "val",
    message: "Enter a value.",
    validation: input => {
      return typeof input === "number" ? true : "Value must be an integer.";
    }
  }
];

const initProjectPrompt = [
  {
    type: "input",
    name: "name",
    message: "Project name:",
    validation:input =>{
      return input.length > 1 ? true: "Name cannot be blank.";
    }
  }
];

const initDBPrompt = [
  {
    type: "confirm",
    name: "setup",
    message: "Configure database connection now?",
    default: true
  }
];

const configureDBPrompt = [
  {
    type: "input",
    name: "host",
    message: "Host:",
    default:"localhost",
  },
  {
    type: "input",
    name: "port",
    message: "Port:",
    default:8889,
  },
  {
    type: "input",
    name: "username",
    message: "Username:",
    default:"root",
  },
  {
    type: "input",
    name: "password",
    message: "Password:",
    default:""
  },
  {
    type: "input",
    name: "database",
    message: "Database:",
    default:"parsony"
  },
  {
    type: "input",
    name: "dialect",
    message: "Dialect:",
    default:"mysql",
    validation:input =>{
      return input.length > 1 ? true: "Name cannot be blank.";
    }
  }
];

const runTestsPrompt = [
  {
    type: "confirm",
    name: "shouldRun",
    message: "It's a good idea to run the tests.  Would you like to do so? If so, make sure your DB server and Redis are running.",
    default:true,
  }
];

const makeModelPrompt = [
  {
    type: "input",
    name: "name",
    message: "Model name:",
    validation:input =>{
      return input.length > 1 ? true: "Name cannot be blank.";
    }
  }
];

module.exports = {
  initDBPrompt,
  initProjectPrompt,
  parameterValidationValuePrompt,
  parameterPrompt,
  shouldGatherParamsPrompt,
  getEndpointPrompt,
  makeServicePrompt,
  getServicePrompt,
  endpointDetailPrompt,
  configureDBPrompt,
  runTestsPrompt,
  makeModelPrompt
};

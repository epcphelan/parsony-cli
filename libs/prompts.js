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
      "proper case",
      "valid email",
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

const addAnother = [
  {
    type: "confirm",
    name: "addAnother",
    message: "Add another param?:",
    default: true
  }
];

module.exports = {
  addAnother,
  parameterValidationValuePrompt,
  parameterPrompt,
  shouldGatherParamsPrompt,
  getEndpointPrompt,
  makeServicePrompt,
  getServicePrompt,
  endpointDetailPrompt
};

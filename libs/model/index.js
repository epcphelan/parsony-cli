const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");
const { makeModelPrompt } = require("../prompts");
const chalk = require("chalk");

async function newModel(){
  let { name } = await getModelName();
  name = capitalize(name);
  if(isModelUnique(name)){
    const stub = fs.readFileSync(path.join(__dirname,'stubs','model.js'), 'utf8');
    const newModel = stub.replace(new RegExp('MODEL_NAME','g'),name);
    fs.writeFileSync(pathToSave(name),newModel)
  } else{
    console.log(chalk.red(`[Error] The model: ${name}, exists. Model not created.`));
  }
}

async function getModelName(){
  return prompt(makeModelPrompt);
}

function capitalize(name){
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function pathToSave(name){
  return path.join(process.cwd(),'models',`${name}.js`);
}

function isModelUnique(name){
  const file = pathToSave(name);
  return !fs.existsSync(file);
}

module.exports = {
  newModel
};
const download = require("../github");
const child_process = require("child_process");
const { Spinner } = require("clui");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const chalk = require("chalk");
const clear = require("clear");
const { prompt } = require("inquirer");
const {
  initProjectPrompt,
  initDBPrompt,
  configureDBPrompt,
  runTestsPrompt
} = require("../prompts");
const {
  starters: { WebServices, WebApp }
} = require("../config.json");

async function doSetup() {
  const spinner = new Spinner("Downloading Parsony from GitHub... ", [
    "|",
    "/",
    "-",
    "\\",
    "|",
    "/",
    "-",
    "\\"
  ]);
  try {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("Parsony", { horizontalLayout: "full" }))
    );
    const { name } = await getProjectName();
    console.log("Creating project: ", name);

    spinner.start();
    spinner.message("Getting WebServices Starter...");
    await fetchWebServicesRepo();

    spinner.message("Getting React WebApp Starter...");
    await fetchWebAppRepo();
    spinner.stop();

    const { setup } = await shouldConfigureDB();

    if (setup) {
      const db = await getDBConfigs();
      configureDB(db);
    }

    spinner.message("Installing node.js packages...");
    spinner.start();
    await installPackages();
    spinner.stop();

    console.log("Congratulations! Parsony is now installed in your project.");

    const { shouldRun } = await shouldRunTests();
    if (shouldRun) {
      await runTests();
    }
    success();
  } catch (e) {
    spinner.stop();
    console.log(e);
  }
}

function getProjectName() {
  const dir = path.basename(process.cwd());
  const q = [...initProjectPrompt];
  q[0].default = dir;
  return prompt(q);
}

function fetchRepo(repo, save) {
  const dir = path.join(process.cwd(), save);
  return new Promise((resolve, reject) => {
    download(repo, dir, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function fetchWebServicesRepo() {
  return fetchRepo(WebServices, "WebServices");
}

function fetchWebAppRepo() {
  return fetchRepo(WebApp, "WebApp");
}

function installPackages() {
  return new Promise((resolve, reject) => {
    try {
      const child = child_process.spawn("bash", [__dirname + "/install.sh"], {
        stdio: "inherit"
      });
      child.on("exit", () => {
        resolve();
      });
      child.on("error", e => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function runTests() {
  return new Promise((resolve, reject) => {
    try {
      const child = child_process.spawn("bash", [__dirname + "/tests.sh"], {
        stdio: "inherit"
      });
      child.on("exit", () => {
        resolve();
      });
      child.on("error", e => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function success() {
  console.log(
    chalk.green(figlet.textSync("DONE!", { horizontalLayout: "full" }))
  );
  console.log(`
  ******************************************************************
  
  Ok. We are all done here. Happy building - make something awesome!
  
  *******************************************************************+
  `);
}

function shouldConfigureDB() {
  return prompt(initDBPrompt);
}

function getDBConfigs() {
  return prompt(configureDBPrompt);
}

function shouldRunTests() {
  return prompt(runTestsPrompt);
}

function configureDB(db) {
  const configsPath = path.join(process.cwd(), "WebServices", "config.json");
  const configs = fs.readFileSync(configsPath, "utf8");
  const confObj = JSON.parse(configs);
  const defaultDB = confObj["local"]["db"];
  confObj["local"]["db"] = Object.assign({}, defaultDB, db);
  fs.writeFileSync(configsPath, JSON.stringify(confObj, null, 2));
}

module.exports = {
  doSetup
};

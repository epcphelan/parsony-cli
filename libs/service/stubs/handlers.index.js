const fs = require('fs');
const path = require('path');

fs.readdirSync(path.join(__dirname))
  .filter(file=>{
    return (
      file.indexOf('.js') >-1 &&
      file.charAt(0) !== '_' &&
      !fs.statSync(path.join(__dirname, file)).isDirectory()
    )
  })
  .forEach(file=>{
    const name = file.replace('.js','');
    exports[name] = require(path.join(__dirname,file)).handler;
  });
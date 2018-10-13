const fs = require('fs');
const path = require('path');

exports.handlers = '/handlers';
exports.endpoints = [];

fs.readdirSync(path.join(__dirname))
  .filter(file=>{
    return file.indexOf('.json') >-1
  })
  .forEach(file=>{
    exports.endpoints.push(require(path.join(__dirname,file)))
  });
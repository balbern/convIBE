"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.property = void 0;

var _codependency = _interopRequireDefault(require("codependency"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _perf_hooks = require("perf_hooks");

var _prettyMs = _interopRequireDefault(require("pretty-ms"));

var _Storage = _interopRequireDefault(require("./store/Storage"));

var _FileReader = _interopRequireDefault(require("./IO/FileReader"));

var _MetaObj = _interopRequireDefault(require("./IO/MetaObj"));

var _OutputTable = _interopRequireDefault(require("./IO/OutputTable"));

var _utils = _interopRequireDefault(require("./utils/utils"));

var _factory = _interopRequireDefault(require("./utils/factory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var requirePeer = _codependency["default"].register(module);

//import property.json from args
var propertyPath = process.argv[2];
var basePath = _path["default"].dirname(propertyPath) + '/';
console.log("basePath", basePath);

var property = require(propertyPath).property;

exports.property = property;
module.exports.property = property;

if (property.inputDB || property.configDB || property.outputDB) {
  var pg = requirePeer('pg');
} //Read from one or more paths


if (_utils["default"].isPrimitive(property.configDir)) {
  property.configDir = [property.configDir];
} //Iterate over config directories


property.configDir.forEach(function (configDirPath) {
  configDirPath = basePath + configDirPath; //Read file required for sorting tags in xml

  if (_fs["default"].existsSync(configDirPath + 'column_mapping_auto.tsv')) {
    _FileReader["default"].readAndPutIntoStorage(configDirPath + 'column_mapping_auto.tsv');
  }
  /*Read all configuration files from directory
  required for columnMapping and write into Storage.storage*/


  _FileReader["default"].readConfigDir(configDirPath + 'columnMappings/'); //Read transformation functions and write to Storage.storage


  _FileReader["default"].readFunctions(configDirPath + 'functions.js'); //Read file required for wordMapping and write to Storage.storage


  _FileReader["default"].readWordMapping(configDirPath + "wordMapping.tsv");
}); //Read Data

if (_utils["default"].isPrimitive(property.inputDir)) {
  property.inputDir = [property.inputDir];
}

var data = {};
property.inputDir.forEach(function (inputDirPath) {
  inputDirPath = basePath + inputDirPath;
  Object.assign(data, _FileReader["default"].readDataDir(inputDirPath));
}); //Link Tables according to property file

_utils["default"].adjustTables(data, property.tables);

var startTable = property.startTable; //Build MetaObj

var metaDataObj = _utils["default"].transformToMetaObj(data, startTable); //Iterate over Data
//Early Breaks for testing like SQL limit 10 or top 10


var breakPoint = false;
var top = 10;
var countUp = 0;
var primaryKey = property.tables[startTable].primaryKey[0];
var primaryKeys = data[startTable].indexData[primaryKey];

var startTime = _perf_hooks.performance.now();

var lastTime = startTime;
var ETA = 0;
var streams = new Map();
var tablesOutput = new Map();
var outputDir = basePath + property.outputDir;
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = primaryKeys.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var primaryKeyValue = _step.value;

    if (breakPoint && countUp === top) {
      break;
    }

    try {
      (function () {
        var output = new _factory["default"]('XML', [primaryKeyValue, property.xmlRoot]);

        var subobj = _utils["default"].createSubObj(metaDataObj, primaryKey, primaryKeyValue);

        subobj = new _MetaObj["default"](primaryKeyValue, _utils["default"].objToMap(subobj[0])); //Main method of filling in the data into the output

        _utils["default"].configWalker(data, subobj, startTable, output);

        output.insertDefault();

        if (property.outputFormat === 'xml') {
          output.xml = _utils["default"].mapSorter(output.xml);
        }

        if (property.rootAttributes) {
          output.xml.set("@", property.rootAttributes);
        }

        var removeKeys = _Storage["default"].xPathGetDataFromStorage("REMOVEKEY/" + property.namespace);

        if (removeKeys) {
          removeKeys.forEach(function (value, xPath) {
            _utils["default"].removeItems(output.xml, xPath, value.get('valueStorage'));
          });
        }

        var fileContent = void 0;
        var fileName = primaryKeyValue;

        try {
          switch (property.outputFormat) {
            case 'json':
              fileContent = JSON.stringify(_utils["default"].strMapToObj(output.xml)); //console.log(JSON.stringify(Utils.strMapToObj(output.xml)));

              break;

            case 'xml':
              fileContent = output.finishXML();

              if (property.xPathGetFileNameFromXML) {
                fileName = output.xPathGetDataFromXML(property.xPathGetFileNameFromXML)[0].get('#');
              }

              break;

            case 'csv':
              fileContent = output.toCSV();

              if (property.xPathGetFileNameFromXML) {
                fileName = output.xPathGetDataFromXML(property.xPathGetFileNameFromXML)[0];
              } //console.log(fileContent);


              output.xml.forEach(function (content, fileName) {
                if (!tablesOutput.has(fileName)) {
                  tablesOutput.set(fileName, new _OutputTable["default"](fileName));
                }

                tablesOutput.get(fileName).addData(fileContent[fileName]);
              });
              break;

            default:
              console.log('please specify an output file format under property.outputFormat');
          }

          if (property.outputFormat != 'csv') {
            _fs["default"].writeFileSync(outputDir + fileName + '.' + property.outputFormat, fileContent);
          }
        } catch (e) {
          console.log(e);
          console.log("Warning: Cannot create output: Skipping Patient");
        }
      })();
    } catch (error) {
      console.log(e);
      console.error("Error with entry number ", primaryKeyValue, countUp);
    }

    countUp++;

    if (countUp % 10 === 0) {
      lastTime = _perf_hooks.performance.now() - startTime;
      ETA = (0, _prettyMs["default"])(lastTime / countUp * (primaryKeys.size - countUp)); //console.log(prettyMS(lastTime ), primaryKeys.size-countUp);
    }

    process.stdout.write('\rProcessed ' + countUp + '/' + primaryKeys.size + ' Estimated Time: ' + ETA + '             ');
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
      _iterator["return"]();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

if (property.outputFormat === 'csv') {
  tablesOutput.forEach(function (table, tableName) {
    _fs["default"].writeFileSync(outputDir + tableName + '.' + property.outputFormat, table.toString('$'));
  });
}

console.log('');
console.log("It took " + (0, _prettyMs["default"])(lastTime));
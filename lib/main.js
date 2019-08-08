"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.property = void 0;

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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//import property.json from args
var propertyPath = process.argv[2];
var basePath = _path["default"].dirname(propertyPath) + '/';
console.log("basePath", basePath);

var property = require(propertyPath).property;

exports.property = property;
module.exports.property = property;
var pg, DB;

if (property.inputDB || property.configDB || property.outputDB) {
  try {
    pg = require('pg');
    DB = require('./IO/db')["default"];
    console.log("Found package pg");
  } catch (err) {
    console.log(err.stack);
    throw "Could not find pg";
  }
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var data, db, startTable, metaDataObj, breakPoint, top, countUp, primaryKey, primaryKeys, startTime, lastTime, ETA, streams, tablesOutput, outputDir, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, primaryKeyValue;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //Read from one or more paths
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

            data = {};

            if (property.inputDir) {
              property.inputDir.forEach(function (inputDirPath) {
                inputDirPath = basePath + inputDirPath;
                Object.assign(data, _FileReader["default"].readDataDir(inputDirPath));
              });
            } else {
              console.log("Reading no files from Filesystem. No input directory given.");
            } //console.log('data1',data);


            if (pg && DB) {
              console.log('Loading Data from DB');
              db = new DB();
              property.inputDBTables.forEach(
              /*#__PURE__*/
              function () {
                var _ref = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee(tableName) {
                  var table;
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return db.getTable(tableName).then(function (d) {
                            return d;
                          })["catch"](function (e) {
                            return console.error(e.stack);
                          });

                        case 2:
                          table = _context.sent;
                          data = _objectSpread({}, data, {}, table);

                        case 4:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function (_x) {
                  return _ref.apply(this, arguments);
                };
              }());
            } //Link Tables according to property file


            _utils["default"].adjustTables(data, property.tables);

            startTable = property.startTable; //Build MetaObj

            metaDataObj = _utils["default"].transformToMetaObj(data, startTable); //Iterate over Data
            //Early Breaks for testing like SQL limit 10 or top 10

            breakPoint = false;
            top = 10;
            countUp = 0;
            primaryKey = property.tables[startTable].primaryKey[0];
            primaryKeys = data[startTable].indexData[primaryKey];
            startTime = _perf_hooks.performance.now();
            lastTime = startTime;
            ETA = 0;
            streams = new Map();
            tablesOutput = new Map();
            outputDir = basePath + property.outputDir;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 23;
            _iterator = primaryKeys.keys()[Symbol.iterator]();

          case 25:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 36;
              break;
            }

            primaryKeyValue = _step.value;

            if (!(breakPoint && countUp === top)) {
              _context2.next = 29;
              break;
            }

            return _context2.abrupt("break", 36);

          case 29:
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

          case 33:
            _iteratorNormalCompletion = true;
            _context2.next = 25;
            break;

          case 36:
            _context2.next = 42;
            break;

          case 38:
            _context2.prev = 38;
            _context2.t0 = _context2["catch"](23);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 42:
            _context2.prev = 42;
            _context2.prev = 43;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 45:
            _context2.prev = 45;

            if (!_didIteratorError) {
              _context2.next = 48;
              break;
            }

            throw _iteratorError;

          case 48:
            return _context2.finish(45);

          case 49:
            return _context2.finish(42);

          case 50:
            if (property.outputFormat === 'csv') {
              tablesOutput.forEach(function (table, tableName) {
                _fs["default"].writeFileSync(outputDir + tableName + '.' + property.outputFormat, table.toString('$'));
              });
            }

            console.log('');
            console.log("It took " + (0, _prettyMs["default"])(lastTime));

          case 53:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[23, 38, 42, 50], [43,, 45, 49]]);
  }));
  return _main.apply(this, arguments);
}

main();
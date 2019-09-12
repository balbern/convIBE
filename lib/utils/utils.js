"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var Utils =
/*#__PURE__*/
function () {
  function Utils() {
    (0, _classCallCheck2["default"])(this, Utils);
  }

  (0, _createClass2["default"])(Utils, [{
    key: "conditionCheck",
    value: function conditionCheck(realValue, conditionalValue) {
      if (Array.isArray(conditionalValue)) {
        return conditionalValue.includes(realValue);
      } else if (typeof conditionalValue === 'string') {
        if (conditionalValue === '*') {
          return !(realValue === '' || realValue === "NO_TRANSLATION");
        } else if (conditionalValue === realValue) {
          return true;
        } else if (conditionalValue.startsWith('!')) {
          return !this.conditionCheck(realValue, conditionalValue.slice(1));
        } else {
          return false;
        }
      } else if (conditionalValue.constructor.name === 'Object') {
        var regex = new RegExp(conditionalValue.regex, conditionalValue.regexFlags);
        return regex.test(realValue);
      } else {
        console.log('Warning: type of conditionalValue', conditionalValue, ' is neither a String nor an Array!');
        return false;
      }
    }
  }, {
    key: "updatePath",
    value: function updatePath(parentPath, childPath) {
      var parentSplit = parentPath.split('/');
      var childSplit = childPath.split('/');
      var diff = parentSplit.length - childSplit.length;

      if (diff <= 0) {
        childSplit.splice(0, parentSplit.length - 1);
        return parentPath + childSplit.join('/');
      } else {
        return parentSplit.splice(0, childSplit.length).join('/');
      }
    }
  }, {
    key: "updatePathwIteratorPath",
    value: function updatePathwIteratorPath(iteratorPath, childPath) {
      var iteratorSplit = iteratorPath.split('/');
      var childSplit = childPath.split('/');
      childSplit[iteratorSplit.length - 1] = iteratorSplit[iteratorSplit.length - 1];
      return childSplit.join('/');
    }
  }, {
    key: "checkNewKey",
    value: function checkNewKey(key, uniqueKeys) {
      if (uniqueKeys.has(key)) {
        return false;
      } else {
        uniqueKeys.add(key);
        return true;
      }
    }
  }, {
    key: "mapSorter",
    value: function mapSorter(map) {
      var _this = this;

      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var finishpath = "";

      if (!this.isLeaf(map)) {
        (0, _toConsumableArray2["default"])(map.keys()).forEach(function (key) {
          if (key !== "@") {
            if (path) {
              finishpath = path + '/' + key;
            } else {
              finishpath = key;
            }

            map.get(key).forEach(function (entry, index) {
              map.get(key)[index] = _this.mapSorter(entry, finishpath);
            });
          }
        });
        map = new Map((0, _toConsumableArray2["default"])(map.entries()).sort(function (a, b) {
          var priortyPath = path;

          if (priortyPath) {
            priortyPath = priortyPath + '/';
          }

          return _Storage["default"].xPathGetDataFromStorage("PRIORITY/" + namespace + "/" + priortyPath + a[0] + '/valueStorage') - _Storage["default"].xPathGetDataFromStorage('PRIORITY/' + namespace + '/' + priortyPath + b[0] + '/valueStorage');
        }));
      }

      return map;
    }
  }, {
    key: "sortArray",
    value: function sortArray(array, type) {
      if (type === 'numerical') {
        array.sort(function (a, b) {
          return a - b;
        });
      } else {
        array.sort();
      }
    }
  }, {
    key: "createSubObj",
    value: function createSubObj(data, key, keyValue) {
      return data[key].get(keyValue);
    }
  }, {
    key: "resultOfConditionCheck",
    value: function resultOfConditionCheck(metaObj, metaCondition, inputPathWIterator) {
      var _this2 = this;

      return Object.keys(metaCondition).every(function (condition) {
        var paras = _this2.buildRefValuePath(condition, inputPathWIterator);

        var refColumn = paras[0];
        var realValue = metaObj.xPathGetDataWithIterator(refColumn);

        if (realValue === false) {
          console.log('Warning: no realValue could be found for given Path:', refColumn);
        }

        var conditionalValue = metaCondition[condition];
        return _this2.conditionCheck(realValue, conditionalValue);
      });
    }
  }, {
    key: "getParas",
    value: function getParas(metaObj, tableParas, inputPathWIterator, defaultParas) {
      var _this3 = this;

      var para = [];

      if (tableParas) {
        tableParas.forEach(function (tableParaPath) {
          var paras = _this3.buildRefValuePath(tableParaPath, inputPathWIterator);

          var refValuePath = paras[0];
          var tablePara = metaObj.xPathGetDataWithIterator(refValuePath);

          if (tableParaPath) {
            para.push(tablePara);
          }
        });
      }

      if (defaultParas) {
        defaultParas.forEach(function (defaultPara) {
          para.push(defaultPara);
        });
      }

      return para;
    } //let remove = ['bmiEntry','nicotineEntry'];
    //let dir = 'entry';

  }, {
    key: "removeItems",
    value: function removeItems(origData, dir, remove) {
      var count = 0;
      var newArray = [];
      var data = origData;

      if (dir) {
        data = _Storage["default"].xPathGetDataWithIterator(dir, origData);
      }

      data.forEach(function (entry) {
        if (!remove.every(function (removeItem) {
          if (entry.has(removeItem)) {
            newArray.push(entry.get(removeItem)[0]);
            return true;
          } else {
            return false;
          }
        })) {
          newArray.push(entry);
        }
      });
      return _Storage["default"].xPathGetDataWithIterator(dir, origData, newArray);
    }
  }, {
    key: "buildRefValuePath",
    value: function buildRefValuePath(refValuePath, inputPathWIterator) {
      var refTable = refValuePath.split('/')[0];
      var refColumn = refValuePath.split('/')[1];
      var index;

      if (property.startTable !== refTable) {
        var searchPath = inputPathWIterator.split('dependentData/' + refTable);

        if (searchPath.length === 2) {
          index = searchPath[1].split('/')[1];
          refColumn = searchPath[0] + 'dependentData/' + refTable + '/' + index + '/' + refColumn;
        } else if (searchPath.length > 2) {
          console.log('Warning: search string', 'dependentData/' + refTable, 'has been found multiple times in', inputPathWIterator);
        } else {
          console.log('Warning: search string', 'dependentData/' + refTable, 'has not been found in', inputPathWIterator);
        }
      }

      return [refColumn, index];
    }
  }, {
    key: "getAttributeValue",
    value: function getAttributeValue(metaObj, fromPath, inputPathWIterator, transformations) {
      var _this4 = this;

      var paras = this.buildRefValuePath(fromPath, inputPathWIterator);
      var refColumn = paras[0];
      var realValue = metaObj.xPathGetDataWithIterator(refColumn);
      var index = paras[1];

      if (realValue === false) {
        console.log('Warning: no realValue could be found for given Path:', refColumn);
      }

      if (transformations) {
        transformations.forEach(function (transformation) {
          var para = _this4.getParas(metaObj, transformation.tablePara, inputPathWIterator);

          realValue = _Storage["default"].xPathGetDataFromStorage('functions/valueStorage/' + transformation.name).apply(void 0, [realValue, index].concat((0, _toConsumableArray2["default"])(para)));
        });
      }

      return realValue;
    }
  }, {
    key: "transformToMetaObj",
    value: function transformToMetaObj(data, startFile) {
      var _this5 = this;

      var metaObj = data[startFile].indexData; //Iterate over dependent Tables

      if (data[startFile].dependentColumn) {
        Object.entries(data[startFile].dependentColumn).forEach(function (_ref) {
          var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
              depFileName = _ref2[0],
              columns = _ref2[1];

          //Iterate over indexData to column
          metaObj[columns.depColumn].forEach(function (rows, keyValue) {
            //Iterate over rows by that key
            _this5.writeDepDataToData(rows, data, depFileName, columns, startFile);
          });
        });
      }

      return metaObj;
    }
  }, {
    key: "transformToMetaObjRec",
    value: function transformToMetaObjRec(data, fileName, key, keyValue) {
      var _this6 = this;

      var rows = data[fileName].indexData[key].get(keyValue);

      if (data[fileName].dependentColumn && rows) {
        Object.entries(data[fileName].dependentColumn).forEach(function (_ref3) {
          var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
              depFileName = _ref4[0],
              columns = _ref4[1];

          _this6.writeDepDataToData(rows, data, depFileName, columns, fileName);
        });
      }

      return rows;
    }
  }, {
    key: "writeDepDataToData",
    value: function writeDepDataToData(rows, data, depFileName, columns, fileName) {
      var _this7 = this;

      var iterators = _Storage["default"].arrayGetDataFromStorage(['ITERATOR', namespace, fileName]);

      rows.every(function (row, iterator) {
        if (!row.dependentData) {
          row.dependentData = {};
        }

        var tempRows = _this7.transformToMetaObjRec(data, depFileName, columns.column, row[columns.depColumn]);

        if (tempRows) {
          row.dependentData[depFileName] = tempRows;
        }

        return iterators;
      });
    }
    /*standard procedure for each table:
    1.deĺete documents with 'Löschkennzeichung' from data
    2.reduce data set in such a way, that only latest version of all documents is included
    3.index data according to linkedKey (if table has dependence on another table) and for iteration purposes
    4.save connection between two tables in data (example: npat has a dependence on parent-table tzpi via doknr)
    important: "parent"-table must already exist in data
    */

  }, {
    key: "adjustTables",
    value: function adjustTables(data, tablesInfoObj) {
      Object.keys(tablesInfoObj).forEach(function (table) {
        //deletes Data according to specific delete pattern
        if (tablesInfoObj[table].deleteData) {
          Object.keys(tablesInfoObj[table].deleteData).forEach(function (columnName) {
            var deletePattern = tablesInfoObj[table].deleteData[columnName];
            data[table].deleteData(columnName, deletePattern);
          });
        } //deletes Data with not maximal version number


        if (tablesInfoObj[table].minIndices) {
          Object.keys(tablesInfoObj[table].minIndices).forEach(function (keyColumn) {
            var versionColumn = tablesInfoObj[table].minIndices[keyColumn];
            data[table].deleteMinIndices(keyColumn, versionColumn);
          });
        } //reduces Data to one entry per primary key


        if (tablesInfoObj[table].primaryKey) {
          var primaryKey = tablesInfoObj[table].primaryKey;
          data[table].deleteRedundantData(primaryKey);
        } //indexes Data


        if (tablesInfoObj[table].indexColumns) {
          tablesInfoObj[table].indexColumns.forEach(function (indexColumn) {
            data[table].doIndexData(indexColumn);
          });
        } else {
          console.log('Warning: table', table, 'has to be indexed at least once to enable correct data processing and translation!');
        }

        if (tablesInfoObj[table].dependentTables) {
          Object.keys(tablesInfoObj[table].dependentTables).forEach(function (dependentTable) {
            var column = tablesInfoObj[table].dependentTables[dependentTable].column;
            var depColumn = tablesInfoObj[table].dependentTables[dependentTable].depColumn;
            data[table].setDependentColumn(dependentTable, column, depColumn); //data[table].extend(data[dependentTable]);
          });
        }
      });
    }
  }, {
    key: "updateParentObj",
    value: function updateParentObj(data, table, subtable, parentObj, selectedRow) {
      var columnName = data[table].dependentColumn[subtable].column;
      var depColumnName = data[table].dependentColumn[subtable].depColumn;

      if (!parentObj[table]) {
        parentObj[table] = {};
      }

      var value = selectedRow[data[table][depColumnName]];
      parentObj[subtable] = {};
      parentObj[subtable][columnName] = value;
      return parentObj;
    }
  }, {
    key: "configWalker",
    value: function configWalker(origdata, data, startTable, outputFormat) {
      var _this8 = this;

      var indexObj = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var parentPath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
      var parentObj = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
      var subParentObj = JSON.parse(JSON.stringify(parentObj));

      var tableNamespace = _Storage["default"].xPathGetDataFromStorage(namespace);

      var startTableConfigs = tableNamespace.get(startTable);
      var tempObj;

      if (property.rememberIndices) {
        tempObj = indexObj;
      } else {
        tempObj = subParentObj;
      }

      if (startTableConfigs) {
        startTableConfigs.forEach(function (toPath, fromPath) {
          var iteratorObj;
          toPath = toPath.get('valueStorage');
          var tempToPath = [];
          toPath.forEach(function (toPathItem) {
            var tempToPathItem = toPathItem;
            Object.entries(tempObj).forEach(function (_ref5) {
              var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
                  toPathIterator = _ref6[0],
                  key = _ref6[1];

              if (toPathItem === toPathIterator || toPathItem.startsWith(toPathIterator + '/')) {
                tempToPathItem = _this8.updatePathwIteratorPath(toPathIterator + '[' + key + ']', tempToPathItem);
              }
            });
            tempToPath.push(tempToPathItem);
          });

          if (iteratorObj) {
            _this8.insertIterators(fromPath, toPath, iteratorObj, data, startTable, outputFormat);
          } else {
            var value = data.xPathGetDataWithIterator(parentPath + fromPath);

            if (value) {
              data.dataToDataItem(startTable, fromPath, value, toPath, outputFormat, data, parentPath + fromPath, tempToPath);
            }
          }
        });
      }

      outputFormat.insertAttribute(startTable, tempObj, data, parentPath);

      if (origdata[startTable].dependentColumn) {
        Object.entries(origdata[startTable].dependentColumn).forEach(function (_ref7) {
          var _ref8 = (0, _slicedToArray2["default"])(_ref7, 2),
              fileName = _ref8[0],
              dependentColumn = _ref8[1];

          var nextParentPath = parentPath + "dependentData/" + fileName;

          if (data.xPathGetDataWithIterator(nextParentPath)) {
            data.xPathGetDataWithIterator(nextParentPath).forEach(function (line, key) {
              var iterators = _Storage["default"].arrayGetDataFromStorage(['ITERATOR', namespace, fileName]);

              if (iterators && iterators.has("WHOLE_FILE")) {
                iterators.get("WHOLE_FILE").get("valueStorage").forEach(function (iterator) {
                  if (!subParentObj[iterator]) {
                    subParentObj[iterator] = 0;
                  }

                  if (!indexObj[iterator]) {
                    indexObj[iterator] = 0;
                  }

                  indexObj[iterator]++;
                  subParentObj[iterator]++;
                });
              } //Recursive call


              _this8.configWalker(origdata, data, fileName, outputFormat, indexObj, nextParentPath + '/' + key + '/', subParentObj);
            });
          }
        });
      }
    }
  }, {
    key: "insertIterators",
    value: function insertIterators(fromPath, toPath, iteratorObj, data, fileName, output) {
      var _this9 = this;

      var i = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
      var cancelArray = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
      //build parentobj
      var iteratorKeys = (0, _toConsumableArray2["default"])(iteratorObj.keys());
      console.log("utils.insertIterators,iteratorKeys", iteratorObj, iteratorKeys);

      if (iteratorObj.size > i) {
        var value = true;

        if (cancelArray.length < i + 1) {
          cancelArray.push(true);
        }

        var check = true;

        var _loop = function _loop(j) {
          var iteratorInputPath = iteratorKeys[i] + '[' + j + ']';
          var id = data.xPathGetDataWithIterator(iteratorInputPath);
          var iteratorOutputPath = iteratorObj.get(iteratorKeys[i]) + '[' + j + ']';
          var outputPathWIterator = [];
          toPath.forEach(function (path) {
            outputPathWIterator.push(_this9.updatePathwIteratorPath(iteratorOutputPath, path));
          });

          var inputPathWIterator = _this9.updatePathwIteratorPath(iteratorInputPath, fromPath);

          _this9.insertIterators(inputPathWIterator, outputPathWIterator, iteratorObj, data, fileName, output, i + 1, cancelArray);

          if (iteratorObj.size === i + 1) {
            value = data.xPathGetDataWithIterator(inputPathWIterator); //check if id of row fits the general row

            if (!value) {
              for (var c = cancelArray.length - 1; c >= 0; c--) {
                if (cancelArray[c]) {
                  cancelArray[c] = false;
                  break;
                }
              }

              return {
                v: false
              };
            } else {
              data.dataToDataItem(fileName, fromPath, value, toPath, output, outputPathWIterator);

              for (var k = 0; k < cancelArray.length; k++) {
                cancelArray[k] = true;
              }
            }
          }

          check = cancelArray[i];
        };

        for (var j = 1; check; j++) {
          var _ret = _loop(j);

          if ((0, _typeof2["default"])(_ret) === "object") return _ret.v;
        }
      }
    }
  }, {
    key: "isPrimitive",
    value: function isPrimitive(value) {
      return value !== Object(value);
    }
  }, {
    key: "isLeaf",
    value: function isLeaf(value) {
      if (this.isPrimitive(value)) {
        return true;
      }

      if (value.size === 1 && value.has('#')) {
        return true;
      }

      if (value.size === 2 && value.has('#') && value.has('@')) {
        return true;
      }
    }
  }, {
    key: "strMapToObj",
    value: function strMapToObj(strMap) {
      var _this10 = this;

      var obj = {}; //Object.create(null);

      if ((0, _typeof2["default"])(strMap) === 'object') {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = strMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = (0, _slicedToArray2["default"])(_step.value, 2),
                key = _step$value[0],
                value = _step$value[1];

            if (value.constructor.name !== 'Object') {
              if (value.length === 1) {
                obj[key] = this.strMapToObj(value[0]);
              } else {
                (function () {
                  var objArray = [];
                  value.forEach(function (map) {
                    objArray.push(_this10.strMapToObj(map));
                  });
                  obj[key] = objArray;
                })();
              }
            } else {
              obj[key] = value;
            }
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
      } else {
        obj = strMap;
      }

      return obj;
    }
  }, {
    key: "objToMarray",
    value: function objToMarray(obj) {
      var _this11 = this;

      var strMap = new Map();

      if (obj.constructor.name === 'Object') {
        Object.keys(obj).forEach(function (key) {
          if ((0, _typeof2["default"])(obj[key]) === 'object') {
            if (obj[key].constructor.name === 'Object') {
              strMap.set(key, [_this11.objToMarray(obj[key])]);
            } else if (obj[key].constructor.name === 'Array') {
              var strArr = [];
              obj[key].forEach(function (entry) {
                strArr.push([_this11.objToMarray(entry)]);
              });
              strMap.set(key, strArr);
            } else {
              console.log('Warning:this type:', obj[key].constructor.name, 'is not handled yet!');
            }
          } else {
            strMap.set(key, [obj[key]]);
          }
        });
        return strMap;
      }
    }
  }, {
    key: "getCurrentIteratorFromPath",
    value: function getCurrentIteratorFromPath(path) {
      var iterator;
      var checkIterator = path.split('[');

      if (checkIterator.length > 1) {
        iterator = checkIterator[checkIterator.length - 1].split(']')[0];
      } else iterator = 1;

      return iterator;
    }
  }, {
    key: "objToMap",
    value: function objToMap(obj) {
      var _this12 = this;

      var strMap = new Map(Object.entries(obj));
      strMap.forEach(function (value, key) {
        if (_this12.isPrimitive(value)) {
          strMap.set(key, value);
        } else {
          if (value.constructor.name === 'Object') {
            strMap.set(key, _this12.objToMap(value));
          } else if (value.constructor.name === 'Array') {
            strMap.set(key, new Map());
            value.forEach(function (item, index) {
              if (!_this12.isPrimitive(item)) {
                item = _this12.objToMap(item);
              }

              strMap.get(key).set(index + 1 + '', item);
            });
          } else if (value.constructor.name === 'Map') {
            value.forEach(function (mapValue, mapKey) {
              strMap.set(mapKey, _this12.objToMap(mapValue));
            });
          } else {
            console.log("Warning: this constructor type:", value.constructor.name, " is not handeled by utils.objToMap");
          }
        }
      });
      return strMap;
    }
  }]);
  return Utils;
}();

var _default = new Utils();

exports["default"] = _default;
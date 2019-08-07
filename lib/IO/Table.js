"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Items = require("./Items");

var _FileReader = _interopRequireDefault(require("./FileReader"));

var _DataFormat2 = _interopRequireDefault(require("./DataFormat"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Table =
/*#__PURE__*/
function (_DataFormat) {
  _inherits(Table, _DataFormat);

  function Table(name, header) {
    var _this;

    _classCallCheck(this, Table);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Table).call(this));
    _this.name = name;
    _this.data = [];
    return _this;
  }

  _createClass(Table, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "setData",
    value: function setData(path, delimiter) {
      var data = _FileReader["default"].readByLines(path, 0, delimiter);

      this.createJSON(data);
    }
  }, {
    key: "addData",
    value: function addData(data) {
      this.data.push(data);
    }
  }, {
    key: "createJSON",
    value: function createJSON(data) {
      var _this2 = this;

      var header = data.shift();
      data.forEach(function (entry) {
        var json = {};

        for (var i = 0; i < header.length; i++) {
          json[header[i]] = entry[i];
        }

        _this2.data.push(json);
      });
    }
  }, {
    key: "setDependentColumn",
    value: function setDependentColumn(table, column, depColumn) {
      if (!this.dependentColumn) {
        this.dependentColumn = {};
      }

      if (!this.dependentColumn[table]) {
        this.dependentColumn[table] = {};
      }

      this.dependentColumn[table].column = column;
      this.dependentColumn[table].depColumn = depColumn;
    }
  }, {
    key: "extend",
    value: function extend(table) {
      var _this3 = this;

      table.data.forEach(function (item) {
        item[_this3.name] = _this3.indexData[_this3.dependentColumn[table.name].depColumn].get(item[table.getRevHeader(_this3.dependentColumn[table.name].column)]);
      });
    }
  }, {
    key: "doIndexData",
    value: function doIndexData(column) {
      var columnIndex = column;

      if (!this.indexData) {
        this.indexData = {};
      }

      if (!this.indexData[column]) {
        this.indexData[column] = new Map();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var row = _step.value;

            if (!this.indexData[column].has(row[columnIndex])) {
              this.indexData[column].set(row[columnIndex], []);
            }

            this.indexData[column].get(row[columnIndex]).push(row);
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
      }
    }
  }, {
    key: "getIndiciesOf",
    value: function getIndiciesOf(column, value) {
      var one = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var indexes = [];

      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i][[column]] === value) {
          indexes.push(i);

          if (one) {
            break;
          }
        }
      }

      return indexes;
    }
  }, {
    key: "deleteDataFromIndicies",
    value: function deleteDataFromIndicies(indexes) {
      for (var i = indexes.length - 1; i >= 0; i--) {
        this.data.splice(indexes[i], 1);
      }
    }
  }, {
    key: "deleteData",
    value: function deleteData(column, value) {
      this.deleteDataFromIndicies(this.getIndiciesOf(column, value));
    }
  }, {
    key: "deleteMinIndices",
    value: function deleteMinIndices(keyColumn, valueColumn) {
      this.deleteDataFromIndicies(this.getMinIndices(keyColumn, valueColumn));
    }
  }, {
    key: "getMinIndices",
    value: function getMinIndices(keyColumn, versionColumn) {
      var keyMap = {};
      var index = 0;
      var indices = [];
      var key_columnNr = keyColumn;
      var value_columnNr = versionColumn;
      this.data.forEach(function (entry) {
        if (!keyMap[entry[key_columnNr]]) {
          keyMap[entry[key_columnNr]] = {};
          keyMap[entry[key_columnNr]].minIndex = [];
          keyMap[entry[key_columnNr]].maxIndex = [entry[value_columnNr], index];
        } else if (keyMap[entry[key_columnNr]].maxIndex[0] < entry[value_columnNr]) {
          keyMap[entry[key_columnNr]].minIndex.push(keyMap[entry[key_columnNr]].maxIndex[1]);
          keyMap[entry[key_columnNr]].maxIndex = [entry[value_columnNr], index];
        } else {
          keyMap[entry[key_columnNr]].minIndex.push(index);
        }

        index++;
      });

      for (var _i = 0, _Object$entries = Object.entries(keyMap); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        if (value.minIndex.length > 0) {
          value.minIndex.forEach(function (index) {
            indices.push(parseInt(index));
          });
        }
      }

      _utils["default"].sortArray(indices, 'numerical');

      return indices;
    }
  }, {
    key: "deleteRedundantData",
    value: function deleteRedundantData(primaryKey) {
      var keySet = new Set();
      var deleteIndices = [];
      this.data.forEach(function (entry, dataIndex) {
        var uniqueKey = "";
        primaryKey.forEach(function (key, keyIndex) {
          if (keyIndex > 0) {
            uniqueKey += ",";
          }

          uniqueKey += entry[key];
        });

        if (!_utils["default"].checkNewKey(uniqueKey, keySet)) {
          deleteIndices.push(dataIndex);
        }
      });
      this.deleteDataFromIndicies(deleteIndices);
    }
  }, {
    key: "xPathGetDataForKey",
    value: function xPathGetDataForKey(linkedKey, keyValue) {
      return this.indexData[linkedKey].get(keyValue);
    }
  }, {
    key: "arrayGetData",
    value: function arrayGetData(fromArray) {
      if (fromArray.length === 1) {
        return this.data[0][fromArray[0]];
      } else {
        if (!this.data[fromArray[1] - 1]) {
          return false;
        }

        return this.data[fromArray[1] - 1][fromArray[0]];
      }
    }
  }]);

  return Table;
}(_DataFormat2["default"]);

exports["default"] = Table;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XPathItem = exports.DataItem = void 0;

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var DataItem =
/*#__PURE__*/
function () {
  function DataItem() {
    var fromPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

    _classCallCheck(this, DataItem);

    this.fromPath = fromPath;
    this.value = value;
  }

  _createClass(DataItem, [{
    key: "addToItem",
    value: function addToItem(item) {
      if (!this.toItems) {
        this.toItems = [];
      }

      this.toItems.push(item);
    }
  }, {
    key: "transformValues",
    value: function transformValues(metaObj, inputPathWIterator) {
      var _this = this;

      //ForEach For Isa
      this.toItems.filter(function (item) {
        return item.checkedCondition;
      }).forEach(function (item) {
        item.transformValue(_this.value, _this.fromPath, metaObj, inputPathWIterator);
      });
    }
  }, {
    key: "setIteratorPath",
    value: function setIteratorPath(parentPath) {
      this.toItems.forEach(function (item) {
        item.updatePath(parentPath);
      });
    }
  }, {
    key: "checkConditions",
    value: function checkConditions(metaObj, inputPathWIterator) {
      this.toItems.forEach(function (item) {
        item.checkCondition(metaObj, inputPathWIterator);
      });
    }
  }, {
    key: "writeTo",
    value: function writeTo(dataObject) {
      this.toItems.filter(function (item) {
        return item.checkedCondition && item.value && item.value !== "NO_TRANSLATION";
      }).forEach(function (item) {
        item.writeXPathItemTo(dataObject);
      });
    }
  }]);

  return DataItem;
}();

exports.DataItem = DataItem;

var XPathItem =
/*#__PURE__*/
function () {
  //toPath = resulting path in xml
  //toOrginalPath = toPath without iterators
  function XPathItem() {
    var toPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var toOrginalPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

    _classCallCheck(this, XPathItem);

    this.toPath = toPath;
    this.value = value;
    this.meta = meta;
    this.checkedCondtition = false;
    this.toOrginalPath = toOrginalPath;
  }

  _createClass(XPathItem, [{
    key: "writeXPathItemTo",
    value: function writeXPathItemTo(dataObject) {
      dataObject.XPathSetValue(this.toPath, this.value);
    }
  }, {
    key: "setInitialPath",
    value: function setInitialPath(path) {
      this.toOrginalPath = path;
      this.toPath = path;
    }
  }, {
    key: "transformValue",
    value: function transformValue(value, path, metaObj, inputPathWIterator) {
      var wordMappingString = 'wordMapping/' + namespace + '/' + path + '/' + value + '/valueStorage';

      var wordMapping = _Storage["default"].xPathGetDataFromStorage(wordMappingString);

      if (wordMapping) {
        value = wordMapping;
      }

      var index = _utils["default"].getCurrentIteratorFromPath(this.toPath);

      this.meta.some(function (metaItem) {
        if (metaItem.condition) {
          if (metaItem.transformation) {
            metaItem.transformation.forEach(function (transformation) {
              var para = _utils["default"].getParas(metaObj, transformation.tablePara, inputPathWIterator, transformation.defaultPara);

              value = _Storage["default"].xPathGetDataFromStorage('functions/valueStorage/' + transformation.name).apply(void 0, [value, index].concat(_toConsumableArray(para)));
            });
          }

          return true;
        }
      });
      this.value = value;
    }
  }, {
    key: "updatePath",
    value: function updatePath(parentPath) {
      this.toPath = _utils["default"].updatePath(parentPath, this.toPath);
    }
  }, {
    key: "checkCondition",
    value: function checkCondition(metaObj, inputPathWIterator) {
      this.checkedCondition = this.meta.some(function (metaItem) {
        if (_typeof(metaItem.condition) === 'object') {
          metaItem.condition = _utils["default"].resultOfConditionCheck(metaObj, metaItem.condition, inputPathWIterator);
          return metaItem.condition;
        } else if (metaItem.condition === false) {
          console.log('Warning: This condition has been already checked and declared as false');
          return false;
        } else if (metaItem.condition) {
          return true;
        }
      });
    }
  }]);

  return XPathItem;
}();

exports.XPathItem = XPathItem;
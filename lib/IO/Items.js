"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XPathItem = exports.DataItem = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var DataItem =
/*#__PURE__*/
function () {
  function DataItem() {
    var fromPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    (0, _classCallCheck2["default"])(this, DataItem);
    this.fromPath = fromPath;
    this.value = value;
  }

  (0, _createClass2["default"])(DataItem, [{
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
    (0, _classCallCheck2["default"])(this, XPathItem);
    this.toPath = toPath;
    this.value = value;
    this.meta = meta;
    this.checkedCondtition = false;
    this.toOrginalPath = toOrginalPath;
  }

  (0, _createClass2["default"])(XPathItem, [{
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

              value = _Storage["default"].xPathGetDataFromStorage('functions/valueStorage/' + transformation.name).apply(void 0, [value, index].concat((0, _toConsumableArray2["default"])(para)));
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
        if ((0, _typeof2["default"])(metaItem.condition) === 'object') {
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
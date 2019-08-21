"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var json2xml = require('js2xmlparser');

var XML =
/*#__PURE__*/
function () {
  function XML(name, root) {
    (0, _classCallCheck2["default"])(this, XML);
    this.name = name;
    this.root = root;
    this.xml = new Map();
  }

  (0, _createClass2["default"])(XML, [{
    key: "XPathSetValue",
    value: function XPathSetValue(path, value) {
      _Storage["default"].XPathAddToMarray(path, value, this.xml);
    }
  }, {
    key: "xPathGetDataFromXML",
    value: function xPathGetDataFromXML(xPath) {
      var returnArr = [this.xml];
      var newArray = [];
      var keys = xPath.split('/');
      keys.forEach(function (key) {
        newArray = [];
        var keyArr = key.split('[');
        key = keyArr[0];
        returnArr.forEach(function (entry) {
          if (entry.has(key)) {
            if (keyArr[1]) {
              var iterator = keyArr[1].slice(0, -1) - 1;

              if (entry.get(key)[iterator]) {
                newArray.push(entry.get(key)[iterator]);
              }
            } else {
              newArray = newArray.concat(entry.get(key));
            }
          }
        });
        returnArr = newArray;
      });
      return newArray;
    } //checks if attribute exist for current table -> checks attribute.condition -> writes attribute to XML if conditions are fullfilled

  }, {
    key: "insertAttribute",
    value: function insertAttribute(table, parentObj, data, parentPath) {
      var _this = this;

      if (_Storage["default"].xPathGetDataFromStorage('ATTRIBUTE/' + namespace + '/' + table + '/valueStorage')) {
        _Storage["default"].xPathGetDataFromStorage('ATTRIBUTE/' + namespace + '/' + table + '/valueStorage').forEach(function (attribute) {
          var path = attribute.path;
          Object.entries(parentObj).forEach(function (_ref) {
            var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
                toPathIterator = _ref2[0],
                key = _ref2[1];

            if (attribute.path === toPathIterator || attribute.path.startsWith(toPathIterator + '/')) {
              path = _utils["default"].updatePathwIteratorPath(toPathIterator + '[' + key + ']', path);
            }
          });

          var attributePath = _this.xPathGetDataFromXML(path);

          if (attributePath.length > 1) {
            console.log("Warning: there are more than one results for ", attribute.path, "in the XML, that means this.xPathGetDataFromXML is not working correctly");
          }

          if (attributePath.length > 0) {
            var attributevalue = JSON.parse(JSON.stringify(attribute.value));
            Object.entries(attributevalue).forEach(function (_ref3) {
              var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
                  key = _ref4[0],
                  value = _ref4[1];

              if (!_utils["default"].isPrimitive(value)) {
                attributevalue[key] = _utils["default"].getAttributeValue(data, value.fromPath, parentPath, value.transformation);
              }
            });

            if (attribute.condition) {
              if (_utils["default"].resultOfConditionCheck(data, attribute.condition, parentPath)) {
                attributePath[0].set("@", attributevalue);
              }
            } else {
              attributePath[0].set("@", attributevalue);
            }
          }
        });
      }
    }
  }, {
    key: "insertDefault",
    value: function insertDefault() {
      var _this2 = this;

      if (_Storage["default"].xPathGetDataFromStorage('DEFAULT/' + namespace)) {
        _Storage["default"].xPathGetDataFromStorage('DEFAULT/' + namespace).forEach(function (values, xPath) {
          values = values.get('valueStorage');

          if (xPath !== "") {
            var defaultObjs = _this2.xPathGetDataFromXML(xPath);

            if (defaultObjs.length > 0) {
              values.forEach(function (insertValues) {
                insertValues.forEach(function (insertValue, insertKey) {
                  defaultObjs.forEach(function (map) {
                    _Storage["default"].XPathAddToMarray(insertKey, insertValue, map);
                  });
                });
              });
            }
          } else {
            values.forEach(function (insertValues) {
              insertValues.forEach(function (insertValue, insertKey) {
                _this2.XPathSetValue(insertKey, insertValue);
              });
            });
          }
        });
      }
    }
  }, {
    key: "finishXML",
    value: function finishXML() {
      if (this.xml) {
        return json2xml.parse(this.root, this.xml);
      }
    }
  }, {
    key: "toCSV",
    value: function toCSV() {
      if (this.xml) {
        return _utils["default"].strMapToObj(this.xml);
      }
    }
  }]);
  return XML;
}();

var _default = XML;
exports["default"] = _default;
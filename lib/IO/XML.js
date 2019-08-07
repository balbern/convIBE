"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var json2xml = require('js2xmlparser');

var XML =
/*#__PURE__*/
function () {
  function XML(name, root) {
    _classCallCheck(this, XML);

    this.name = name;
    this.root = root;
    this.xml = new Map();
  }

  _createClass(XML, [{
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
            var _ref2 = _slicedToArray(_ref, 2),
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
              var _ref4 = _slicedToArray(_ref3, 2),
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
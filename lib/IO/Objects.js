"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

var _DataFormat2 = _interopRequireDefault(require("./DataFormat"));

var _FileReader = _interopRequireDefault(require("./FileReader"));

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var Objects =
/*#__PURE__*/
function (_DataFormat) {
  (0, _inherits2["default"])(Objects, _DataFormat);

  function Objects(name) {
    var _this;

    (0, _classCallCheck2["default"])(this, Objects);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Objects).call(this));
    _this.name = name;
    _this.data = [];
    return _this;
  }

  (0, _createClass2["default"])(Objects, [{
    key: "arrayGetData",
    value: function arrayGetData(array, obj) {
      array.every(function (key) {
        if (obj.has(key)) {
          obj = obj.get(key);
          return true;
        } else {
          obj = false;
          return false;
        }
      });
      return obj;
    }
  }, {
    key: "xPathGetDataForKey",
    value: function xPathGetDataForKey(xPath, keyValue) {
      _Storage["default"].xPathGetData(xPath, this.data);
    }
  }, {
    key: "setData",
    value: function setData(path) {
      this.data = JSON.parse(_FileReader["default"].read(path));
    }
  }]);
  return Objects;
}(_DataFormat2["default"]);

exports["default"] = Objects;
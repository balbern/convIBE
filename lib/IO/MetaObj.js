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

var _Items = require("./Items");

var _FileReader = _interopRequireDefault(require("./FileReader"));

var _DataFormat2 = _interopRequireDefault(require("./DataFormat"));

var MetaObj =
/*#__PURE__*/
function (_DataFormat) {
  (0, _inherits2["default"])(MetaObj, _DataFormat);

  function MetaObj(name, data) {
    var _this;

    (0, _classCallCheck2["default"])(this, MetaObj);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MetaObj).call(this));
    _this.name = name;
    _this.data = data;
    return _this;
  }

  (0, _createClass2["default"])(MetaObj, [{
    key: "arrayGetData",
    value: function arrayGetData(array) {
      return this.arrayGetDataInt(array, this.data);
    }
  }, {
    key: "arrayGetDataInt",
    value: function arrayGetDataInt(array, obj) {
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
  }]);
  return MetaObj;
}(_DataFormat2["default"]);

exports["default"] = MetaObj;
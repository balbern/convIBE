"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _Table = _interopRequireDefault(require("../IO/Table"));

var _XML = _interopRequireDefault(require("../IO/XML"));

var _Objects = _interopRequireDefault(require("../IO/Objects"));

var classes = {
  Table: _Table["default"],
  XML: _XML["default"],
  Objects: _Objects["default"]
};

var Factory = function Factory(className) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  (0, _classCallCheck2["default"])(this, Factory);
  return (0, _construct2["default"])(classes[className], (0, _toConsumableArray2["default"])(opts));
};

var _default = Factory;
exports["default"] = _default;
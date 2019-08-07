"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = _interopRequireDefault(require("../utils/utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Storage =
/*#__PURE__*/
function () {
  function Storage() {
    _classCallCheck(this, Storage);

    this.storage = new Map();
  } //add a xPath to the Storage


  _createClass(Storage, [{
    key: "xPathAddToStorage",
    value: function xPathAddToStorage(xPath, value) {
      xPath = xPath.split('/');
      this.arrayAddToStorage(xPath, value, this.storage);
    } //add an xPath in array typing to the storage

  }, {
    key: "arrayAddToStorage",
    value: function arrayAddToStorage(array, value) {
      this.arrayAddToObj([].concat(_toConsumableArray(array), ['valueStorage']), value, this.storage);
    } //get an xPath from the storage

  }, {
    key: "xPathGetDataFromStorage",
    value: function xPathGetDataFromStorage(xPath) {
      return this.xPathGetData(xPath, this.storage);
    } //get an xPath in array typing from the storage

  }, {
    key: "arrayGetDataFromStorage",
    value: function arrayGetDataFromStorage(array) {
      return this.arrayGetData(array, this.storage);
    }
  }, {
    key: "xPathGetData",
    value: function xPathGetData(xPath, obj) {
      xPath = xPath.split('/');
      return this.arrayGetData(xPath, obj);
    }
  }, {
    key: "xPathGetDataWithIterator",
    value: function xPathGetDataWithIterator(xPath, obj, data) {
      if (xPath.endsWith(']')) {
        xPath = xPath.substring(0, xPath.length - 1);
      }

      xPath = xPath.split(/\]\/|\/|\[/);
      return this.arrayGetData(xPath, obj, data);
    }
  }, {
    key: "arrayGetData",
    value: function arrayGetData(array, obj, data) {
      array.every(function (key, index) {
        if (obj.has(key)) {
          if (data && index + 1 === array.length) {
            obj.set(key, data);
            return true;
          }

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
    key: "arrayAddToObj",
    value: function arrayAddToObj(array, value, obj) {
      for (var i = 0; i < array.length - 1; i++) {
        var key = array[i];
        var key2 = array[i + 1];

        if (!obj.has(key)) {
          obj.set(key, new Map());
        }

        if (i === array.length - 2) {
          obj.get(key).set(key2, value);
        }

        obj = obj.get(key);
      }
    }
  }, {
    key: "xPathPushToStorage",
    value: function xPathPushToStorage(xPath, value) {
      xPath = xPath.split('/');
      this.arrayPushToStorage(xPath, value);
    }
  }, {
    key: "arrayPushToStorage",
    value: function arrayPushToStorage(array, value) {
      if (!this.arrayGetDataFromStorage([].concat(_toConsumableArray(array), ['valueStorage']))) {
        this.arrayAddToStorage(array, []);
      }

      this.arrayGetDataFromStorage([].concat(_toConsumableArray(array), ['valueStorage'])).push(value);
    }
  }, {
    key: "XPathAddToMarray",
    value: function XPathAddToMarray(xPath, value, map) {
      xPath = xPath.split('/');
      this.arrayAddToMarray(xPath, value, map);
    }
  }, {
    key: "arrayAddToMarray",
    value: function arrayAddToMarray(fields, value, map) {
      for (var i = 0; i < fields.length; i++) {
        var entries = fields[i].split('[');
        var iterator = void 0;
        var key = entries[0];

        if (!map.has(key)) {
          map.set(key, []);
        }

        if (entries.length === 1) {
          iterator = 0;
        } else {
          iterator = entries[1].slice(0, -1) - 1;
        }

        if (!map.get(key)[iterator]) {
          if (i === fields.length - 1) {
            if (property.outputFormat === 'xml') {
              map.get(key)[iterator] = new Map();
              map.get(key)[iterator].set('#', value);
            } else {
              map.get(key)[iterator] = value;
            }
          } else {
            map.get(key)[iterator] = new Map();
          }
        } else {
          if (_utils["default"].isPrimitive(map.get(key)[iterator])) {
            console.log("Warning " + fields + " is not writing since " + map.get(key)[iterator] + " is already a Primitive");
          }
        }

        map = map.get(key)[iterator];
      }
    }
  }]);

  return Storage;
}();

var _default = Storage = new Storage();

exports["default"] = _default;
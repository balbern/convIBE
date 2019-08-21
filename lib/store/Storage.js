"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _utils = _interopRequireDefault(require("../utils/utils"));

var Storage =
/*#__PURE__*/
function () {
  function Storage() {
    (0, _classCallCheck2["default"])(this, Storage);
    this.storage = new Map();
  } //add a xPath to the Storage


  (0, _createClass2["default"])(Storage, [{
    key: "xPathAddToStorage",
    value: function xPathAddToStorage(xPath, value) {
      xPath = xPath.split('/');
      this.arrayAddToStorage(xPath, value, this.storage);
    } //add an xPath in array typing to the storage

  }, {
    key: "arrayAddToStorage",
    value: function arrayAddToStorage(array, value) {
      this.arrayAddToObj([].concat((0, _toConsumableArray2["default"])(array), ['valueStorage']), value, this.storage);
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
      if (array.length === 1 && array[0] === '') {
        if (data) {
          return data;
        }

        return obj;
      }

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
      if (!this.arrayGetDataFromStorage([].concat((0, _toConsumableArray2["default"])(array), ['valueStorage']))) {
        this.arrayAddToStorage(array, []);
      }

      this.arrayGetDataFromStorage([].concat((0, _toConsumableArray2["default"])(array), ['valueStorage'])).push(value);
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
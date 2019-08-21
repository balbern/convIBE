"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Items = require("./Items");

var _Storage = _interopRequireDefault(require("../store/Storage"));

var propertyPath = process.argv[2];

var property = require(propertyPath).property;

var namespace = property.namespace;

var DataFormat =
/*#__PURE__*/
function () {
  function DataFormat() {
    (0, _classCallCheck2["default"])(this, DataFormat);

    if ((this instanceof DataFormat ? this.constructor : void 0) === DataFormat) {
      throw TypeError("new of abstract class");
    }
  }

  (0, _createClass2["default"])(DataFormat, [{
    key: "xPathGetDataWithIterator",
    value: function xPathGetDataWithIterator(xPath) {
      if (xPath.endsWith(']')) {
        xPath = xPath.substring(0, xPath.length - 1);
      }

      xPath = xPath.split(/\]\/|\/|\[/);
      return this.arrayGetData(xPath);
    }
  }, {
    key: "dataToDataItem",
    value: function dataToDataItem(fileName, fromPath, value, toPath, output, data, inputPathWIterator) {
      var outputPathWIterator = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
      var dItem = new _Items.DataItem();
      dItem.fromPath = fileName + '/' + fromPath;
      dItem.value = value;

      for (var i = 0; i < toPath.length; i++) {
        var xItem = new _Items.XPathItem();
        xItem.setInitialPath(toPath[i]);

        if (outputPathWIterator.length > 0) {
          xItem.toPath = outputPathWIterator[i];
        }

        var meta = JSON.parse(JSON.stringify(_Storage["default"].arrayGetDataFromStorage(['META', namespace, fileName, fromPath, toPath[i], "valueStorage"])));

        if (meta) {
          xItem.meta = meta;
        }

        if (!meta) {
          xItem.meta = [{
            condition: true
          }];
        } else {
          xItem.meta.forEach(function (metaItem) {
            if (!metaItem.condition) {
              metaItem.condition = true;
            }
          });
        }

        dItem.addToItem(xItem);
      }

      dItem.checkConditions(data, inputPathWIterator);
      dItem.transformValues(data, inputPathWIterator);
      dItem.writeTo(output);
    }
  }]);
  return DataFormat;
}();

exports["default"] = DataFormat;
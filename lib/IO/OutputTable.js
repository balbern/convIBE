"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _utils = _interopRequireDefault(require("../utils/utils"));

var _Items = require("./Items");

var _FileReader = _interopRequireDefault(require("./FileReader"));

//Table.js
var OutputTable =
/*#__PURE__*/
function () {
  function OutputTable(name, header) {
    (0, _classCallCheck2["default"])(this, OutputTable);
    this.name = name;
    this.data = [];

    if (header) {
      this.header = header;
      console.log("ich bin doof");
    } else {
      this.header = [];
    }

    this.size = 0;
    this.headerIndex = {};
    this.initHeader();
  }

  (0, _createClass2["default"])(OutputTable, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "initHeader",
    value: function initHeader() {
      var _this = this;

      this.header.forEach(function (columnName) {
        _this.addHeaderIndex(columnName);
      });
    }
  }, {
    key: "addColumn",
    value: function addColumn(columnName) {
      this.header.push(columnName);
      this.addHeaderIndex(columnName);
    }
  }, {
    key: "addHeaderIndex",
    value: function addHeaderIndex(columnName) {
      this.headerIndex[columnName] = this.size++; //console.log(this.headerIndex);
    }
  }, {
    key: "hasColumn",
    value: function hasColumn(columnName) {
      return this.headerIndex[columnName];
    }
  }, {
    key: "addData",
    value: function addData(inputRow) {
      var _this2 = this;

      //console.log("Adding",inputRow);
      //console.log("constructor",);
      if (inputRow.constructor.name != 'Array') {
        inputRow = [inputRow];
      }

      inputRow.forEach(function (row) {
        var outputRow = [];
        Object.keys(row).forEach(function (item) {
          var columnNumber = _this2.hasColumn(item);

          if (columnNumber == null) {
            _this2.addColumn(item);

            columnNumber = _this2.hasColumn(item);
          }

          outputRow[columnNumber] = row[item]; //console.log(outputRow,"This",outputRow[columnNumber],"at",columnNumber,item)
        });

        _this2.data.push(outputRow);
      });
    }
  }, {
    key: "toString",
    value: function toString(delimiter) {
      var _this3 = this;

      var string = this.header.join(delimiter);
      this.data.forEach(function (row) {
        row.length = _this3.header.length;
        string += "\n" + row.join(delimiter);
      });
      return string;
    }
  }]);
  return OutputTable;
}();

exports["default"] = OutputTable;
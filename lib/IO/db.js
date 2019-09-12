"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _pg = require("pg");

var _factory = _interopRequireDefault(require("../utils/factory"));

var DB =
/*#__PURE__*/
function () {
  function DB(dbOpt) {
    (0, _classCallCheck2["default"])(this, DB);

    if (dbOpt) {
      this.pool = new _pg.Pool({
        user: dbOpt.user,
        host: dbOpt.host,
        database: dbOpt.database,
        password: dbOpt.password,
        port: dbOpt.port
      });
    } else {
      this.pool = new _pg.Pool();
    }
  }

  (0, _createClass2["default"])(DB, [{
    key: "query",
    value: function query(text, params) {
      return this.pool.query(text, params);
    }
  }, {
    key: "end",
    value: function end() {
      return this.pool.end();
    }
  }, {
    key: "getTable",
    value: function () {
      var _getTable = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(tableName) {
        var res, data, table;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.query({
                  name: 'test',
                  text: 'SELECT * from ' + tableName,
                  rowMode: 'array'
                });

              case 2:
                res = _context.sent;
                data = res.fields.map(function (field) {
                  return field.name;
                });
                table = new _factory["default"]('Table', [tableName]);
                table.createJSON([data].concat((0, _toConsumableArray2["default"])(res.rows)));
                console.log(table);
                return _context.abrupt("return", table);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getTable(_x) {
        return _getTable.apply(this, arguments);
      }

      return getTable;
    }()
  }, {
    key: "setSchema",
    value: function () {
      var _setSchema = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(tableName) {
        var res, data, table;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.query({
                  name: 'test',
                  text: 'SELECT * from ' + tableName,
                  rowMode: 'array'
                });

              case 2:
                res = _context2.sent;
                data = res.fields.map(function (field) {
                  return field.name;
                });
                table = new _factory["default"]('Table', [tableName]);
                table.createJSON([data].concat((0, _toConsumableArray2["default"])(res.rows)));
                return _context2.abrupt("return", table);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setSchema(_x2) {
        return _setSchema.apply(this, arguments);
      }

      return setSchema;
    }()
  }]);
  return DB;
}(); //Usage:
//PGUSER= PGHOST= PGPASSWORD= PGDATABASE= PGPORT= babel-node src/main.js


exports["default"] = DB;
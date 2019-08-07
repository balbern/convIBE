"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pg = require("pg");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DB =
/*#__PURE__*/
function () {
  function DB(dbOpt) {
    _classCallCheck(this, DB);

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

  _createClass(DB, [{
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
      var _getTable = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(tableName) {
        var res, data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
                return _context.abrupt("return", [data].concat(_toConsumableArray(res.rows)));

              case 5:
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
  }]);

  return DB;
}(); //Usage:
//PGUSER= PGHOST= PGPASSWORD= PGDATABASE= PGPORT= babel-node src/main.js


exports["default"] = DB;
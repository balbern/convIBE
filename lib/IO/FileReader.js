"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _Storage = _interopRequireDefault(require("../store/Storage"));

var _Table = _interopRequireDefault(require("./Table"));

var _factory = _interopRequireDefault(require("../utils/factory"));

var FileReader =
/*#__PURE__*/
function () {
  function FileReader() {
    (0, _classCallCheck2["default"])(this, FileReader);
  }

  (0, _createClass2["default"])(FileReader, [{
    key: "readConfigDir",
    value: function readConfigDir(dir) {
      var _this = this;

      _fs["default"].readdirSync(dir).forEach(function (file) {
        if (!file.startsWith('.')) {
          console.log("Reading file:", dir + file);

          _this.readAndPutIntoStorage(dir + file);
        } else {
          console.log(("Ignoring hidden file:", dir + file));
        }
      });
    }
  }, {
    key: "readAndPutIntoStorage",
    value: function readAndPutIntoStorage(filePath) {
      var _this2 = this;

      //read configfile and skip first line
      var output = this.readByLines(filePath, 1);
      output.forEach(function (line) {
        var namespace = line[1];
        var namespaceArray = namespace.split('/');
        var prefix;
        var fileName; //CHECK IF PREFIX

        if (namespaceArray[1]) {
          namespace = namespaceArray[1];
          prefix = namespaceArray[0];
        }

        var path = line[2];
        var value = line[3];
        var meta = line[4];

        if (prefix === 'PRIORITY') {
          _this2.handlePriority(namespace, path);
        } else if (prefix === 'DEFAULT') {
          path = _this2.handlePriority(namespace, path);

          _this2.handleDefault(namespace, path, value);
        } else if (prefix === 'ATTRIBUTE') {
          _this2.handleAttribute(namespace, path, value);
        } else if (prefix === 'ITERATOR') {
          _this2.handleIterator(namespace, path, value);
        } else if (prefix === 'REMOVEKEY') {
          _this2.handleRemoveKey(namespace, path, value);
        } else {
          if (prefix) {
            console.log('Warning: It may be that the given prefix', prefix, 'is not handled yet, i.e. line will not be processed correctly!');
          }

          value = _this2.handlePriority(namespace, value);
          path = path.split('/');
          fileName = path.shift();
          path = path.join('/'); //save values for datapoint in an Array in Storage 

          if (!_Storage["default"].arrayGetDataFromStorage([line[1], fileName, path, 'valueStorage'])) {
            _Storage["default"].arrayAddToStorage([line[1], fileName, path], []);
          }

          _Storage["default"].arrayGetDataFromStorage([line[1], fileName, path, 'valueStorage']).push(value);
        } //check if conditions or transform functions exist


        if (meta) {
          //save conditions/transform functions in Storage
          if (prefix) {
            console.log('Warning: META-Data is not handled yet for this config-type: ' + prefix + '!');
          } else {
            _Storage["default"].arrayPushToStorage(['META', namespace, fileName, path, value], JSON.parse(meta));
          }
        }
      });
    }
  }, {
    key: "readByLines",
    value: function readByLines(path) {
      var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '\t';
      var output = this.read(path).trim() //remove carriage return
      .replace(/\r/g, '').split('\n'); //skip lines

      for (var i = skip; i > 0; i--) {
        output.shift();
      }

      return output.filter(function (line) {
        return !line.startsWith('//');
      }) //do not read out commented lines
      .map(function (line) {
        return line.split(delimiter).map(function (item) {
          return item.trim();
        });
      });
    }
  }, {
    key: "read",
    value: function read(path) {
      return _fs["default"].readFileSync(path, 'utf8');
    }
  }, {
    key: "handlePriority",
    value: function handlePriority(namespace, path) {
      var value = path.split("(");
      var originalPath = value[0];
      var priority;

      if (value[1]) {
        priority = value[1].slice(0, -1);

        _Storage["default"].xPathAddToStorage("PRIORITY/" + namespace + "/" + originalPath, priority);
      }

      return originalPath;
    }
  }, {
    key: "handleDefault",
    value: function handleDefault(namespace, path, value) {
      path = path.split("/");
      var insertion = new Map();
      var insertionKey = path.pop();
      path = path.join("/");
      insertion.set(insertionKey, value);
      var array = ['DEFAULT', namespace, path];

      _Storage["default"].arrayPushToStorage(array, insertion);
    }
  }, {
    key: "handleAttribute",
    value: function handleAttribute(namespace, path, value) {
      _Storage["default"].xPathPushToStorage('ATTRIBUTE/' + namespace + '/' + path, JSON.parse(value));
    }
  }, {
    key: "handleIterator",
    value: function handleIterator(namespace, path, value) {
      path = path.split('/');
      var fileName = path.shift();
      path = path.join('/');

      if (!_Storage["default"].arrayGetDataFromStorage(['ITERATOR', namespace, fileName, path, 'valueStorage'])) {
        _Storage["default"].arrayAddToStorage(['ITERATOR', namespace, fileName, path], []);
      }

      _Storage["default"].arrayGetDataFromStorage(['ITERATOR', namespace, fileName, path, 'valueStorage']).push(value);
    }
  }, {
    key: "handleRemoveKey",
    value: function handleRemoveKey(namespace, path, value) {
      if (!_Storage["default"].arrayGetDataFromStorage(['REMOVEKEY', namespace, path, 'valueStorage'])) {
        _Storage["default"].arrayAddToStorage(['REMOVEKEY', namespace, path], []);
      }

      _Storage["default"].arrayGetDataFromStorage(['REMOVEKEY', namespace, path, 'valueStorage']).push(value);
    }
  }, {
    key: "readDataDir",
    value: function readDataDir(dir) {
      var _this3 = this;

      var inputs = {};

      _fs["default"].readdirSync(dir).forEach(function (file) {
        if (!file.startsWith('.')) {
          var fileName = file.split('.')[0];
          var format = property.tables[fileName].format;
          var delimiter;
          var delimiters = ['\t', ';', ',', '$'];

          if (delimiters.includes(format)) {
            delimiter = format;
            format = "Table";
          }

          console.log("Reading file:", file, "and saving it in data under", fileName, "with format", format);
          inputs[fileName] = _this3.readData(dir + "/" + file, format, delimiter);
        }
      });

      return inputs;
    }
  }, {
    key: "readData",
    value: function readData(path, classType, delimiter) {
      var pathSplit = path.split('/');
      var name = pathSplit[pathSplit.length - 1].split('.')[0];
      var input = new _factory["default"](classType, [name]);
      input.setData(path, delimiter);
      return input;
    }
  }, {
    key: "readWordMapping",
    value: function readWordMapping(path) {
      var output = this.readByLines(path, 1);
      output.forEach(function (line) {
        _Storage["default"].xPathAddToStorage('wordMapping/' + line[1] + "/" + line[2], line[3]);
      });
    }
  }, {
    key: "readFunctions",
    value: function readFunctions(path) {
      var preFunctions = JSON.parse(this.read(path));

      if (!_Storage["default"].xPathGetDataFromStorage('functions')) {
        _Storage["default"].xPathAddToStorage('functions', new Map());
      }

      var functions = _Storage["default"].xPathGetDataFromStorage('functions').get('valueStorage');

      preFunctions.forEach(function (preFunction) {
        functions.set(preFunction.name, new Function(preFunction.para, preFunction.body));
      });
    }
  }]);
  return FileReader;
}();

var _default = new FileReader();

exports["default"] = _default;
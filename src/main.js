import fs from 'fs';
import path from 'path';
import {
	performance,
	PerformanceObserver
} from 'perf_hooks';
import prettyMS from 'pretty-ms'
//import property.json from args

let pg, DB;
import Property from './utils/property'
import Storage from './store/Storage';
import FileReader from './IO/FileReader';
import MetaObj from './IO/MetaObj';
import OutputTable from './IO/OutputTable';
import Utils from './utils/utils';
import Factory from './utils/factory';
import Crypt from './IO/Crypt'

export class convIBE {

	constructor({
		data: data = {},
		property: property,
		basePath: basePath,
		configs: configs
	}) {
		if (!property) {
			let propertyPath = process.argv[2];
			basePath = path.dirname(propertyPath) + '/';
			console.log("basePath", basePath);
			property = require(propertyPath).property;
		}
		if (data) {
			this.data = data
		}
		if (configs) {
			this.configs = configs
		}
		Property.property = property
		Property.add("basePath", basePath)
		this.property = Property.property
		//console.log(Property.property)
		this.basePath = basePath

		if (this.property.inputDB || this.property.configDB) {
			try {
				pg = require('pg');
				DB = require('./IO/db').default;
				console.log("Found package pg")
			} catch (err) {
				console.log(err.stack)
				throw "Could not find pg"
			}
		}
		if (this.property.outputDB) {
			require('../../l/lib')

		}
	}

	async main() {

		//Read from one or more paths
		if (this.property.configDir) {
			if (Utils.isPrimitive(this.property.configDir)) {
				this.property.configDir = [this.property.configDir];
			}
			//Iterate over config directories
			console.log("configdir", this.property.configDir)
			this.property.configDir.forEach(configDirPath => {
				configDirPath = this.basePath + configDirPath;
				//Read file required for sorting tags in xml
				if (fs.existsSync(configDirPath + 'column_mapping_auto.tsv')) {
					FileReader.readAndPutIntoStorage(configDirPath + 'column_mapping_auto.tsv');
				}
				/*Read all configuration files from directory
				required for columnMapping and write into Storage.storage*/
				FileReader.readConfigDir(configDirPath + 'columnMappings/');
				//Read transformation functions and write to Storage.storage
				FileReader.readFunctions(configDirPath + 'functions.js');
				//Read file required for wordMapping and write to Storage.storage
				FileReader.readWordMapping(configDirPath + "wordMapping.tsv");
			})
		}
		if (this.configs) {
			FileReader.putIntoStorage(this.configs.columnMappings)
		}
		//Read Data
		if (this.property.inputDir) {
			if (Utils.isPrimitive(this.property.inputDir)) {
				this.property.inputDir = [this.property.inputDir]
			}
			this.property.inputDir.forEach(inputDirPath => {
				inputDirPath = this.basePath + inputDirPath;
				Object.assign(this.data, FileReader.readDataDir(inputDirPath))
			})
		} else {
			console.log("Reading no files from Filesystem. No input directory given.")
		}

		if (pg && DB) {
			console.log('Loading Data from DB')
			let db = new DB()
			if (this.property.dblink) {
				console.log("Setting dblink", this.property.dblink)
				await db.setDBLink(this.property.dblink)
			}
			for (let tableName of this.property.inputDBTables) {
				let splitName = tableName.split('.');
				if (splitName[1]) {
					console.log("Setting Schema");
					await db.setSchema(splitName[0]);
					tableName = splitName[1];
				}
				console.log("Loading Table " + tableName);
				let table = await db.getTable(tableName).then(d => {
					return d;
				}).catch(e => console.error(e.stack));
				this.data[table.name] = table;
			}
		}
		//console.log(data)
		//Link Tables according to this.property file
		Utils.adjustTables(this.data, this.property.tables);

		let startTable = this.property.startTable;

		//Build MetaObj
		let metaDataObj = Utils.transformToMetaObj(this.data, startTable);
		//console.log(metaDataObj)
		//console.log(metaDataObj.person_id)
		//Iterate over Data
		//Early Breaks for testing like SQL limit 10 or top 10
		let breakPoint = false;
		let top = 10;

		let countUp = 0;
		let primaryKey = this.property.tables[startTable].primaryKey[0];
		let primaryKeys = this.data[startTable].indexData[primaryKey];
		let startTime = performance.now();
		let lastTime = startTime;
		let ETA = 0;
		let streams = new Map();
		let tablesOutput = new Map();
		let outputDir = this.basePath + this.property.outputDir;
		for (let primaryKeyValue of primaryKeys.keys()) {
			if (breakPoint && countUp === top) {
				break;
			}

			try {
				let output = new Factory('XML', [primaryKeyValue, this.property.xmlRoot]);
				let subobj = Utils.createSubObj(metaDataObj, primaryKey, primaryKeyValue);
				subobj = new MetaObj(primaryKeyValue, Utils.objToMap(subobj[0]));
				//Main method of filling in the data into the output
				Utils.configWalker(this.data, subobj, startTable, output);
				output.insertDefault();
				if (this.property.outputFormat === 'xml') {
					output.xml = Utils.mapSorter(output.xml);
				}
				if (this.property.rootAttributes) {
					output.xml.set("@", this.property.rootAttributes);
				}
				let removeKeys = Storage.xPathGetDataFromStorage("REMOVEKEY/" + this.property.namespace);
				if (removeKeys) {
					removeKeys.forEach((value, xPath) => {
						output.xml = Utils.removeItems(output.xml, xPath, value.get('valueStorage'));
					})
				}
				let fileContent;
				let fileName = primaryKeyValue;
				try {
					switch (this.property.outputFormat) {
						case 'json':
							fileContent = JSON.stringify(Utils.strMapToObj(output.xml));
							break;
						case 'xml':
							fileContent = output.finishXML();
							if (this.property.xPathGetFileNameFromXML) {
								fileName = output.xPathGetDataFromXML(this.property.xPathGetFileNameFromXML)[0].get('#');
							}
							break;
						case 'csv':
							fileContent = output.toCSV();
							//console.log("main,filecontent",fileContent)
							output.xml.forEach((content, fileName) => {
								if (!tablesOutput.has(fileName)) {
									tablesOutput.set(fileName, new OutputTable(fileName));
								}
								tablesOutput.get(fileName).addData(fileContent[fileName]);
							})
							break;
						default:
							console.log('please specify an output file format under this.property.outputFormat');
					}
					if (this.property.outputFormat != 'csv') {
						if (this.property.encrypt) {
							fileContent = await Crypt.encrypt(fileContent)
						}
						console.log('Writting', outputDir + fileName + '.' + this.property.outputFormat)
						fs.writeFileSync(outputDir + fileName + '.' + this.property.outputFormat, fileContent);
					}
				} catch (e) {
					console.log(e)
					console.log("Warning: Cannot create output: Skipping Patient");
				}
			} catch (error) {
				console.log(error);
				console.error("Error with entry number ", primaryKeyValue, countUp);
			}
			countUp++;
			if (countUp % 10 === 0) {

				lastTime = performance.now() - startTime;
				ETA = prettyMS(lastTime / countUp * (primaryKeys.size - countUp));
				//console.log(prettyMS(lastTime ), primaryKeys.size-countUp);
			}

			process.stdout.write('\rProcessed ' + countUp + '/' + primaryKeys.size + ' Estimated Time: ' + ETA + '             ')

		}
		if (this.property.outputFormat === 'csv') {
			let output = {}
			tablesOutput.forEach((table, tableName) => {
				let out = table.toJSON();
				if(this.property.outputDir){
					fs.writeFileSync(outputDir + tableName + '.' + this.property.outputFormat, table.toString('$'));	
				} else {
					output[tableName] = out;
					
				}
				
			})
			if(this.property.api){
				console.log(output)
				return output
			}
		}

		console.log('')
		console.log("It took " + prettyMS(lastTime));

	}
	//input: {
	//	fileName: {
	//			name: fileName,
	//			type: Objects,Table, XML,
	//			data: []
	//		}
	//	}
	prepareData(data){
		let output = {}
		Object.entries(data).forEach([file,name] => {
			output[table.name] = new Factory(file.type,file.name,file.header)
			output[table.name].data = table.data
		})
		return data;
	}

}

let conv = new convIBE({/*
	property: property,
	configs: configs,
	data: data*/
});
conv.main()
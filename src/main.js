import fs from 'fs';
import path from 'path';
import {performance, PerformanceObserver} from 'perf_hooks';
import prettyMS from 'pretty-ms'
//import property.json from args
let propertyPath = process.argv[2];
let basePath = path.dirname(propertyPath)+'/';
console.log("basePath",basePath);
export let property = require(propertyPath).property;
module.exports.property = property;

import Storage from './store/Storage';
import FileReader from './IO/FileReader';
import MetaObj from './IO/MetaObj';
import OutputTable from './IO/OutputTable';
import Utils from './utils/utils';
import Factory from './utils/factory';
if(property.inputDB||property.configDB||property.outputDB){
	try{
		let pg = require('pg')
		console.log("Found package pg")
	} catch (err){
		console.log("Could not find pg")
		pg = null;
	}
}

//Read from one or more paths
if (Utils.isPrimitive(property.configDir)){
	property.configDir = [property.configDir];
}
//Iterate over config directories
property.configDir.forEach(configDirPath=>{
	configDirPath=basePath+configDirPath;
	//Read file required for sorting tags in xml
	if(fs.existsSync(configDirPath+'column_mapping_auto.tsv')){
		FileReader.readAndPutIntoStorage(configDirPath+'column_mapping_auto.tsv');
	}
	/*Read all configuration files from directory
	required for columnMapping and write into Storage.storage*/
	FileReader.readConfigDir(configDirPath+'columnMappings/');
	//Read transformation functions and write to Storage.storage
	FileReader.readFunctions(configDirPath+'functions.js');
	//Read file required for wordMapping and write to Storage.storage
	FileReader.readWordMapping(configDirPath+"wordMapping.tsv");
})

//Read Data
if (Utils.isPrimitive(property.inputDir)){
	property.inputDir = [property.inputDir]
}
let data = {};
property.inputDir.forEach(inputDirPath=>{
	inputDirPath=basePath+inputDirPath;
	Object.assign(data,FileReader.readDataDir(inputDirPath))
})
//Link Tables according to property file
Utils.adjustTables(data,property.tables);

let startTable = property.startTable;

//Build MetaObj
let metaDataObj = Utils.transformToMetaObj(data,startTable);


//Iterate over Data
//Early Breaks for testing like SQL limit 10 or top 10
let breakPoint = false;
let top = 10;

let countUp = 0;
let primaryKey = property.tables[startTable].primaryKey[0];
let primaryKeys = data[startTable].indexData[primaryKey];
let startTime = performance.now();
let lastTime = startTime;
let ETA = 0;
let streams = new Map();
let tablesOutput = new Map();
let outputDir=basePath+property.outputDir;
for (let primaryKeyValue of primaryKeys.keys()){
	if(breakPoint&&countUp===top){
		break;
	}
	
	try {
		let output = new Factory('XML',[primaryKeyValue,property.xmlRoot]);
		let subobj = Utils.createSubObj(metaDataObj,primaryKey,primaryKeyValue);
		subobj = new MetaObj(primaryKeyValue,Utils.objToMap(subobj[0]));
		//Main method of filling in the data into the output
		Utils.configWalker(data,subobj,startTable,output);
		output.insertDefault();
		if(property.outputFormat==='xml'){
			output.xml = Utils.mapSorter(output.xml);	
		}
		if(property.rootAttributes){
			output.xml.set("@",property.rootAttributes);
		}
		let removeKeys = Storage.xPathGetDataFromStorage("REMOVEKEY/"+property.namespace);
		if(removeKeys){
			removeKeys.forEach((value,xPath)=>{
				Utils.removeItems(output.xml,xPath,value.get('valueStorage'));
			})
		}
		let fileContent;
		let fileName = primaryKeyValue;
		try {
			switch(property.outputFormat){
					case 'json':
						fileContent = JSON.stringify(Utils.strMapToObj(output.xml));
						//console.log(JSON.stringify(Utils.strMapToObj(output.xml)));
						break;
					case 'xml':
						fileContent = output.finishXML();
						if (property.xPathGetFileNameFromXML){
							fileName = output.xPathGetDataFromXML(property.xPathGetFileNameFromXML)[0].get('#');	
						}
						break;
					case 'csv':
						fileContent = output.toCSV();
						if (property.xPathGetFileNameFromXML){
							fileName = output.xPathGetDataFromXML(property.xPathGetFileNameFromXML)[0];	
						}
						//console.log(fileContent);
						output.xml.forEach((content,fileName) =>{
							if(!tablesOutput.has(fileName)){
								tablesOutput.set(fileName,new OutputTable(fileName));
							}
							tablesOutput.get(fileName).addData(fileContent[fileName]);
						})
						break;
					default:
						console.log('please specify an output file format under property.outputFormat');
				}
				if(property.outputFormat != 'csv'){
					fs.writeFileSync(outputDir+fileName+'.'+property.outputFormat,fileContent);	
				}
			}
			catch(e){
				console.log(e)
				console.log("Warning: Cannot create output: Skipping Patient");
			}
		}
		catch(error) {
			console.log(e);
			console.error("Error with entry number ",primaryKeyValue,countUp);
		}
		countUp++;
		if(countUp%10===0){

			lastTime = performance.now() - startTime;
			ETA = prettyMS(lastTime/countUp*(primaryKeys.size-countUp));
			//console.log(prettyMS(lastTime ), primaryKeys.size-countUp);
		}

	process.stdout.write('\rProcessed '+ countUp +'/'+primaryKeys.size+ ' Estimated Time: '+ETA+ '             ')
	
}
if(property.outputFormat === 'csv'){
	tablesOutput.forEach((table,tableName) => {
		fs.writeFileSync(outputDir+tableName+'.'+property.outputFormat,table.toString('$'));
	})	
}

console.log('')
console.log("It took "+prettyMS(lastTime ));
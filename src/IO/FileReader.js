import fs from 'fs';
import untildify from 'untildify'
import Storage from '../store/Storage';
import Table from './Table';
import Factory from '../utils/factory';

class FileReader{
	constructor(){}

	readConfigDir(dir){
		fs.readdirSync(dir).forEach(file => 
			{if(!file.startsWith('.')){
				console.log("Reading file:",dir+file);
				this.readAndPutIntoStorage(dir+file);}
			else{
				console.log(("Ignoring hidden file:",dir+file));
			}
		});
	}

	readAndPutIntoStorage(filePath) {
		//read configfile and skip first line
		let output = this.readByLines(filePath,1);
		output.forEach(line => {
			let namespace = line[1];
			let namespaceArray = namespace.split('/');
			let prefix;
			let fileName;
			//CHECK IF PREFIX
			if(namespaceArray[1]){
				namespace = namespaceArray[1];
				prefix = namespaceArray[0];
			}
			let path = line[2];
			let value = line[3];
			let meta = line[4];
			if(prefix==='PRIORITY'){
				this.handlePriority(namespace,path);
			}
			else if(prefix==='DEFAULT'){
				path = this.handlePriority(namespace,path);
				this.handleDefault(namespace,path,value);
			}
			else if(prefix==='ATTRIBUTE'){
				this.handleAttribute(namespace,path,value);	
			}
			else if(prefix==='ITERATOR'){
				this.handleIterator(namespace,path,value);
			}
			else if(prefix==='REMOVEKEY'){
				this.handleRemoveKey(namespace,path,value);	
			}
			else if(prefix==='FORCEARRAY'){
				this.handleForceArray(namespace,path,value);	
			}
			 else {
				if(prefix){
					console.log('Warning: It may be that the given prefix',prefix,'is not handled yet, i.e. line will not be processed correctly!');
				}
				value = this.handlePriority(namespace,value);
				path = path.split('/');
				fileName = path.shift();
				path = path.join('/');
				//save values for datapoint in an Array in Storage 
				if (!Storage.arrayGetDataFromStorage([line[1],fileName,path,'valueStorage'])){
					Storage.arrayAddToStorage([line[1],fileName,path],[]);
				}
				Storage.arrayGetDataFromStorage([line[1],fileName,path,'valueStorage']).push(value);
			}
			//check if conditions or transform functions exist
			if(meta){
				//save conditions/transform functions in Storage
				if(prefix){
					console.log('Warning: META-Data is not handled yet for this config-type: '+prefix+'!');
				} else{
					Storage.arrayPushToStorage(['META',namespace,fileName,path,value],JSON.parse(meta));
				}
			}
		});
	}
	readByLines(path,skip=0,delimiter='\t') {
		let output = this.read(path)
		.trim()
		//remove carriage return
		.replace(/\r/g,'')
		.split('\n');
		//skip lines
		for (let i = skip; i > 0; i--) {
			output.shift();
		}
		return output
		.filter(line => !line.startsWith('//')) //do not read out commented lines
		.map(line => line.split(delimiter).map(item => {
			return item.trim();
		})); 
	}
	read(path){
		return fs.readFileSync(untildify(path),'utf8');
	}
	handlePriority(namespace,path){
		let value = path.split("(");
		let originalPath = value[0];
		let priority;
		if(value[1]){
			priority=value[1].slice(0,-1);
			Storage.xPathAddToStorage("PRIORITY/"+namespace+"/"+originalPath,priority);
		}
		return originalPath;
	}
	handleDefault(namespace,path,value){
		path=path.split("/");
		let insertion= new Map();
		let insertionKey=path.pop();
		path=path.join("/");
		insertion.set(insertionKey,value);
		let array = ['DEFAULT',namespace,path];
		Storage.arrayPushToStorage(array,insertion);

	}
	handleAttribute(namespace,path,value){
		Storage.xPathPushToStorage('ATTRIBUTE/'+namespace+'/'+path,JSON.parse(value));
	}
	handleIterator(namespace,path,value){
		path = path.split('/');
		let fileName = path.shift();
		path = path.join('/');
		if (!Storage.arrayGetDataFromStorage(['ITERATOR',namespace,fileName,path,'valueStorage'])){
			Storage.arrayAddToStorage(['ITERATOR',namespace,fileName,path],[]);
		}
		Storage.arrayGetDataFromStorage(['ITERATOR',namespace,fileName,path,'valueStorage']).push(value);
	}

	handleRemoveKey(namespace,path,value){
		if (!Storage.arrayGetDataFromStorage(['REMOVEKEY',namespace,path,'valueStorage'])){
			Storage.arrayAddToStorage(['REMOVEKEY',namespace,path],[]);
		}
		Storage.arrayGetDataFromStorage(['REMOVEKEY',namespace,path,'valueStorage']).push(value);
	}

	handleForceArray(namespace,path){
		if (!Storage.arrayGetDataFromStorage(['FORCEARRAY',namespace,'valueStorage'])){
			Storage.arrayAddToStorage(['FORCEARRAY',namespace],[]);
		}
		Storage.arrayGetDataFromStorage(['FORCEARRAY',namespace,'valueStorage']).push(path);
	}

	readDataDir(dir){
		let inputs = {};
		fs.readdirSync(dir).forEach(file => {
			if(!file.startsWith('.')){
				let fileName = file.split('.')[0];
				let format = property.tables[fileName].format;
				let delimiter;
				let delimiters = ['\t',';',',','$'];
				if (delimiters.includes(format)){
					delimiter = format;
					format = "Table";
				}
				console.log("Reading file:",file, "and saving it in data under",fileName,"with format",format);
				inputs[fileName]=this.readData(dir+"/"+file,format,delimiter);
				}
			});
		return inputs;
	}
	readData(path,classType,delimiter){
		let pathSplit = path.split('/');
		let name = pathSplit[pathSplit.length-1].split('.')[0];
		let input = new Factory(classType,[name]);
		input.setData(path,delimiter); 
		return input;
	}
	readWordMapping(path){
		let output = this.readByLines(path,1);
		output.forEach(line => {
			Storage.xPathAddToStorage('wordMapping/'+line[1]+"/"+line[2],line[3]);
		});
	}
	readFunctions(path){
		let preFunctions = JSON.parse(this.read(path));
		if(!Storage.xPathGetDataFromStorage('functions')){
			Storage.xPathAddToStorage('functions',new Map());
		}
		let functions = Storage.xPathGetDataFromStorage('functions').get('valueStorage');
		preFunctions.forEach(preFunction =>{
			functions.set(preFunction.name,new Function(preFunction.para,preFunction.body));
		})
	}
}
export default (new FileReader);

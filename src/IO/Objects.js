let propertyPath = process.argv[2];
let property = require(propertyPath).property;
let namespace = property.namespace;
import Utils from '../utils/utils';
import Storage from '../store/Storage';
import DataFormat from './DataFormat';
import FileReader from './FileReader';

export default class Objects extends DataFormat {
	constructor(name){
		super();
		this.name=name;
		this.data=[];
	}
	arrayGetData(array,obj){
		array.every(key=>{
			if(obj.has(key)){
				obj=obj.get(key);
				return true;
			} else {
				obj = false;
				return false;
			}
		})
		return obj;
	}

	arrayGetFromObject(array,obj){
		array.every(key=>{
			if(obj[key]){
				obj=obj[key];
				return true;
			} else {
				obj = false;
				return false;
			}
		})
		return obj;	
		
	}

	xPathGetDataForKey(xPath,keyValue){
		Storage.xPathGetData(xPath,this.data);
	}
	setData(path){
		this.data=JSON.parse(FileReader.read(path));
	}

	deleteRedundantData(primaryKey){
		console.log("Not implemented since not needed till now")
	}

	doIndexData(column){
		let columnIndex = column.split('/');
		if(!this.indexData){
			this.indexData = {};	
		}
		if(!this.indexData[column]){
			this.indexData[column] = new Map();
			for(let row of this.data){
				let columnValue = this.arrayGetFromObject(columnIndex,row)
				if(!this.indexData[column].has(row[columnIndex])){
					this.indexData[column].set(row[columnIndex],[]);
				}
				this.indexData[column].get(row[columnIndex]).push(row);
			}
		}	
	}
}

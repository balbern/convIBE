//Table.js
import Utils from '../utils/utils';
import {DataItem,XPathItem} from './Items';
import FileReader from './FileReader';
import DataFormat from './DataFormat';

export default class Table extends DataFormat {
	constructor(name,header){
		super();
		this.name = name;
		this.data = [];
	}
	getName() {
		return this.name;
	}
	setData(path,delimiter){
		let data = FileReader.readByLines(path,0,delimiter);
		this.createJSON(data);
	}
	addData(data){
		this.data.push(data);
	}
	createJSON(data){
		let header = data.shift();
		data.forEach(entry=>{
			let json = {};
			for (let i = 0; i < header.length; i++) {
					json[header[i]]=entry[i];
				}
			this.data.push(json);
			});
	}
	setDependentColumn(table,column,depColumn){
		if(!this.dependentColumn){
			this.dependentColumn = {};
		}
		if(!this.dependentColumn[table]){
			this.dependentColumn[table] = {};
		}
		this.dependentColumn[table].column = column;
		this.dependentColumn[table].depColumn = depColumn; 
	}
	extend(table){
		table.data.forEach(item => {
			item[this.name] = this.indexData[this.dependentColumn[table.name].depColumn].get(item[table.getRevHeader(this.dependentColumn[table.name].column)])
		})
	}
	doIndexData(column){
		let columnIndex = column;
		if(!this.indexData){
			this.indexData = {};	
		}
		if(!this.indexData[column]){
			this.indexData[column] = new Map();
			for(let row of this.data){
				if(!this.indexData[column].has(row[columnIndex])){
					this.indexData[column].set(row[columnIndex],[]);
				}
				this.indexData[column].get(row[columnIndex]).push(row);
			}
		}	
	}
	getIndiciesOf(column,value,one=false){
		let indexes = [];
		for (let i = 0; i < this.data.length; i++) {
			if(this.data[i][[column]]===value){
				indexes.push(i);
				if(one){
					break;
				}
			}
		}
		return indexes;
	}
	deleteDataFromIndicies(indexes){
		for (let i = indexes.length - 1; i >= 0; i--) {
			this.data.splice(indexes[i],1);
		}
	}
	deleteData(column,value){
		this.deleteDataFromIndicies(this.getIndiciesOf(column,value));
	}

	deleteMinIndices(keyColumn,valueColumn){
		this.deleteDataFromIndicies(this.getMinIndices(keyColumn,valueColumn));
	}

	getMinIndices(keyColumn,versionColumn) {
	    let keyMap={};
	    let index=0;
	    let indices=[];
	    let key_columnNr=keyColumn;
	    let value_columnNr=versionColumn;
	    this.data.forEach(entry => {
	        if(!keyMap[entry[key_columnNr]]){
	        	keyMap[entry[key_columnNr]]={};
	        	keyMap[entry[key_columnNr]].minIndex=[];
	            keyMap[entry[key_columnNr]].maxIndex=[entry[value_columnNr],index];
	        }
	        else if(keyMap[entry[key_columnNr]].maxIndex[0]<entry[value_columnNr]){
	        	keyMap[entry[key_columnNr]].minIndex.push(keyMap[entry[key_columnNr]].maxIndex[1]);
	        	keyMap[entry[key_columnNr]].maxIndex=[entry[value_columnNr],index];
	        } else {
	        	keyMap[entry[key_columnNr]].minIndex.push(index);
	        }
	        index++;
	        })
	    for (let [key,value] of Object.entries(keyMap)) {
	    	if(value.minIndex.length>0){
	    		value.minIndex.forEach(index => {
	    			indices.push(parseInt(index));
	    		})
	    	}
	    }
	    Utils.sortArray(indices,'numerical');
	    return indices;
	}

	deleteRedundantData(primaryKey){
		let keySet = new Set();
		let deleteIndices = [];
		this.data.forEach((entry,dataIndex)=>{
			let uniqueKey = "";
			primaryKey.forEach((key,keyIndex)=>{
				if (keyIndex>0){
					uniqueKey += ",";
				}
				uniqueKey+=entry[key];
			})
			if(!Utils.checkNewKey(uniqueKey,keySet)){
				deleteIndices.push(dataIndex);
			}
		})
		this.deleteDataFromIndicies(deleteIndices);
	}

	xPathGetDataForKey(linkedKey,keyValue){
		return this.indexData[linkedKey].get(keyValue);
	}
	arrayGetData(fromArray){
		if(fromArray.length===1){
			return this.data[0][fromArray[0]];
		} else {
			if(!this.data[(fromArray[1]-1)]){
				return false;	
			}
			return this.data[(fromArray[1]-1)][fromArray[0]];
		}	
	}
}

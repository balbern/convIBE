//Table.js
import Utils from '../utils/utils';
import {DataItem,XPathItem} from './Items';
import FileReader from './FileReader';

export default class OutputTable {
	constructor(name,header){
		this.name = name;
		this.data = [];
		if(header){
			this.header = header;	
			console.log("ich bin doof");
		} else {
			this.header = [];
		}
		this.size = 0;
		this.headerIndex = {};
		this.initHeader();

	}
	getName() {
		return this.name;
	}

	initHeader(){
		this.header.forEach(columnName => {
			this.addHeaderIndex(columnName);
		})
	}

	addColumn(columnName){
		this.header.push(columnName);
		this.addHeaderIndex(columnName);
	}

	addHeaderIndex(columnName){
		this.headerIndex[columnName] = this.size++;
		//console.log(this.headerIndex);
	}

	hasColumn(columnName){
		return this.headerIndex[columnName];
	}

	addData(inputRow) {
		if(inputRow.constructor.name != 'Array'){
			inputRow = [inputRow];
		}
		inputRow.forEach(row => {
		let outputRow = [];
		Object.keys(row).forEach(item => {
			let columnNumber = this.hasColumn(item)
			if(columnNumber == null){
				this.addColumn(item);
				columnNumber = this.hasColumn(item)
			}
			outputRow[columnNumber] = row[item];
		})
		this.data.push(outputRow);
		})
	}

	toString(delimiter){
		let string = this.header.join(delimiter);
		this.data.forEach(row => {
			row.length = this.header.length;
			string += "\n"+row.join(delimiter)
		})
		return string;
	}
}

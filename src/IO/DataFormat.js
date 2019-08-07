let propertyPath = process.argv[2];
let property = require(propertyPath).property;
let namespace = property.namespace;
import {DataItem,XPathItem} from './Items';
import Storage from '../store/Storage';
export default class DataFormat {
	constructor(){
		if(new.target===DataFormat){
			throw TypeError("new of abstract class");
		}
	}
	xPathGetDataWithIterator(xPath){
		if(xPath.endsWith(']')){
			xPath = xPath.substring(0,xPath.length-1);
		}
		xPath = xPath.split(/\]\/|\/|\[/);
		return this.arrayGetData(xPath);
	}
	dataToDataItem(fileName,fromPath,value,toPath,output,data,inputPathWIterator,outputPathWIterator=[]){
		let dItem = new DataItem();
		dItem.fromPath=fileName+'/'+fromPath;
		dItem.value = value;
		for (let i=0;i<toPath.length;i++){
			let xItem = new XPathItem();
			xItem.setInitialPath(toPath[i]);
			if (outputPathWIterator.length>0){
				xItem.toPath=outputPathWIterator[i];
			}
			let meta = JSON.parse(JSON.stringify(Storage.arrayGetDataFromStorage(['META',namespace,fileName,fromPath,toPath[i],"valueStorage"])));
			if (meta){
				xItem.meta = meta;
			}
			if(!meta){
				xItem.meta = [{condition:true}];
			} else {
				xItem.meta.forEach(metaItem => {
					if(!metaItem.condition){
						metaItem.condition = true;	
					}
					
				})
			}
			dItem.addToItem(xItem);
		}
		dItem.checkConditions(data,inputPathWIterator);
		dItem.transformValues(data,inputPathWIterator);
		dItem.writeTo(output);
	}
}
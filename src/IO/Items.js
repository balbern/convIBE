import Property from '../utils/property'
let namespace = Property.property.namespace;
import Utils from '../utils/utils';
import Storage from '../store/Storage';

export class DataItem {

	constructor(fromPath="",value="") {
		this.fromPath = fromPath;
		this.value = value;
	}
	addToItem(item){
		if(!this.toItems){
			this.toItems = [];
		}
		this.toItems.push(item);
	}
	transformValues(metaObj,inputPathWIterator){
		//ForEach For Isa
		this.toItems.filter(item => item.checkedCondition).forEach(item=>{
			item.transformValue(this.value,this.fromPath,metaObj,inputPathWIterator);
		})
	}
	setIteratorPath(parentPath){
		this.toItems.forEach(item=>{
			item.updatePath(parentPath);
		})
	}

	checkConditions(metaObj,inputPathWIterator){
		this.toItems.forEach(item=>{
			item.checkCondition(metaObj,inputPathWIterator);
		})
	}

	writeTo(dataObject){
		this.toItems.filter(item => item.checkedCondition&&item.value!=="NO_TRANSLATION").forEach(item=>{
				item.writeXPathItemTo(dataObject);
		})
	}
}
export class XPathItem {
	//toPath = resulting path in xml
	//toOrginalPath = toPath without iterators
	constructor(toPath="",value="",meta={},toOrginalPath=""){
        this.toPath = toPath;
        this.value = value;
        this.meta = meta;
        this.checkedCondtition = false;
        this.toOrginalPath = toOrginalPath;
	}
	writeXPathItemTo(dataObject){
		//console.log(this.toPath,this.value)
		dataObject.XPathSetValue(this.toPath,this.value);
	}
	setInitialPath(path){
		this.toOrginalPath = path;
		this.toPath = path;
	}

	transformValue(value,path,metaObj,inputPathWIterator){
		let wordMappingString = 'wordMapping/'+namespace+'/'+path+'/'+value+'/valueStorage';
		let wordMapping = Storage.xPathGetDataFromStorage(wordMappingString);
		if(wordMapping){
			value = wordMapping;
		}
		let index = Utils.getCurrentIteratorFromPath(this.toPath);
		this.meta.some(metaItem =>{
			if(metaItem.condition){
				if(metaItem.transformation){
					metaItem.transformation.forEach(transformation=>{
						let libs =  {};
						if(transformation.libs){
							transformation.libs.forEach(lib => {
								libs[lib] = require(lib);
							})
						}
						let para=Utils.getParas(metaObj,transformation.tablePara,inputPathWIterator,transformation.defaultPara);
						//console.log(metaItem,value,index,libs,...para,path,metaObj)
						value = Storage.xPathGetDataFromStorage('functions/valueStorage/'+transformation.name)(value,index,libs,...para);
					})
				}
				return true;
			}
		})
		this.value = value;
	}
	updatePath(parentPath){
		this.toPath = Utils.updatePath(parentPath,this.toPath);

	}

	checkCondition(metaObj,inputPathWIterator){
		this.checkedCondition = this.meta.some(metaItem =>{
			if(typeof metaItem.condition==='object'){
				metaItem.condition = Utils.resultOfConditionCheck(metaObj,metaItem.condition,inputPathWIterator);
				return metaItem.condition;
			} else if (metaItem.condition===false){
				console.log('Warning: This condition has been already checked and declared as false');
				return false;
			} else if(metaItem.condition){
				return true;
			}
		})
	}
}
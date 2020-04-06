import Property from '../utils/property'
let namespace = Property.property.namespace;
let json2xml = require('js2xmlparser');
import Utils from '../utils/utils';
import Storage from '../store/Storage';

class XML {
	constructor(name,root){
		this.name = name;
		this.root = root;
		this.xml = new Map();
	}
	XPathSetValue(path,value){
		Storage.XPathAddToMarray(path,value,this.xml);
	}
	xPathGetDataFromXML(xPath){
		let returnArr=[this.xml];
		let newArray = [];
		let keys = xPath.split('/');
		keys.forEach(key=>{
			newArray = [];
			let keyArr=key.split('[');
			key=keyArr[0];
			returnArr.forEach(entry=>{
				if(entry.has(key)){
					if(keyArr[1]){
						let iterator = keyArr[1].slice(0,-1)-1;
						if(entry.get(key)[iterator]){
							newArray.push(entry.get(key)[iterator])
						}
					} else {
						newArray = newArray.concat(entry.get(key));	
					}
					
				}
			})
			returnArr = newArray;
		})
		return newArray;
	}
	//checks if attribute exist for current table -> checks attribute.condition -> writes attribute to XML if conditions are fullfilled
	insertAttribute(table,parentObj,data,parentPath){
		if(Storage.xPathGetDataFromStorage('ATTRIBUTE/'+namespace+'/'+table+'/valueStorage')){
			Storage.xPathGetDataFromStorage('ATTRIBUTE/'+namespace+'/'+table+'/valueStorage').forEach(attribute=> {
				let path = attribute.path;
				Object.entries(parentObj).forEach(([toPathIterator,key]) => {
					if(attribute.path===toPathIterator||attribute.path.startsWith(toPathIterator+'/')){
						path = Utils.updatePathwIteratorPath(toPathIterator+'['+key+']',path);
					}
				})
				let attributePath = this.xPathGetDataFromXML(path);
				if(attributePath.length>1){
					console.log("Warning: there are more than one results for ",attribute.path,"in the XML, that means this.xPathGetDataFromXML is not working correctly");
				}
				if(attributePath.length>0){
					let attributevalue = JSON.parse(JSON.stringify(attribute.value));
					Object.entries(attributevalue).forEach(([key,value])=>{
						if(!Utils.isPrimitive(value)){
							attributevalue[key] = Utils.getAttributeValue(data,value.fromPath,parentPath,value.transformation);
						}
					})
					if(attribute.condition){
						if(Utils.resultOfConditionCheck(data,attribute.condition,parentPath)){
							
							attributePath[0].set("@",attributevalue);
						}
					} else {
						attributePath[0].set("@",attributevalue);
					}
				}
			});
		}
	}

	insertDefault(){
		if(Storage.xPathGetDataFromStorage('DEFAULT/'+namespace)){
			Storage.xPathGetDataFromStorage('DEFAULT/'+namespace).forEach((values,xPath)=>{
				values = values.get('valueStorage');
				if (xPath!==""){
					let defaultObjs = this.xPathGetDataFromXML(xPath);
					if (defaultObjs.length>0){
						values.forEach(insertValues=>{
							insertValues.forEach((insertValue,insertKey)=>{
								defaultObjs.forEach(map=>{
									Storage.XPathAddToMarray(insertKey,insertValue,map);		
								})
							})
						})
					}
				} else {values.forEach(insertValues=>{
					insertValues.forEach((insertValue,insertKey)=>{
						this.XPathSetValue(insertKey,insertValue);
					})		
				})
			}	
		});
		}
	}

	finishXML(){
		if(this.xml){
			return json2xml.parse(this.root,this.xml);
		}
	}

	toCSV(){
		if(this.xml){
			//console.log("Converting to CSV:",this.xml)
			return Utils.strMapToObj(this.xml);
		}	
	}
}

export default XML;
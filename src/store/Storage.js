import Utils from '../utils/utils';

class Storage {
	constructor(){
		this.storage = new Map();
	}
	//add a xPath to the Storage
	xPathAddToStorage(xPath,value) {
		xPath = xPath.split('/');
		this.arrayAddToStorage(xPath,value,this.storage);
	}

	//add an xPath in array typing to the storage
	arrayAddToStorage(array,value){
		this.arrayAddToObj([...array,'valueStorage'],value,this.storage);	
	}

	//get an xPath from the storage
	xPathGetDataFromStorage(xPath) {
		return this.xPathGetData(xPath,this.storage);
	}

	//get an xPath in array typing from the storage
	arrayGetDataFromStorage(array){
		return this.arrayGetData(array,this.storage);
	}

	xPathGetData(xPath,obj){
		xPath = xPath.split('/');
		return this.arrayGetData(xPath,obj);
	}
	
	xPathGetDataWithIterator(xPath,obj,data){
		if(xPath.endsWith(']')){
			xPath = xPath.substring(0,xPath.length-1);
		}
		xPath = xPath.split(/\]\/|\/|\[/);
		return this.arrayGetData(xPath,obj,data);
	}

	arrayGetData(array,obj,data){
		array.every((key,index)=>{
			if(obj.has(key)){
				if(data&&index+1===array.length){
					obj.set(key,data)
					return true;
				}
				obj=obj.get(key);
				return true;
			} else {
				obj = false;
				return false;
			}
		})

		return obj;
	}

	arrayAddToObj(array,value,obj) {
		for (let i = 0; i < array.length-1; i++) {
			let key = array[i];
			let key2 = array[i+1];
			if(!obj.has(key)){
				obj.set(key,new Map());
			}
			if(i===array.length-2){
				obj.get(key).set(key2,value);
			}
			obj = obj.get(key);
		}
	}
	xPathPushToStorage(xPath,value){
		xPath = xPath.split('/');
		this.arrayPushToStorage(xPath,value);
	}

	arrayPushToStorage(array,value){
		if(!this.arrayGetDataFromStorage([...array,'valueStorage'])){
			this.arrayAddToStorage(array,[]);
		}
		this.arrayGetDataFromStorage([...array,'valueStorage']).push(value);
	}
	XPathAddToMarray(xPath,value,map){
		xPath = xPath.split('/');
		this.arrayAddToMarray(xPath,value,map);
	}
	arrayAddToMarray(fields,value,map){
		for (let i=0; i<fields.length; i++) {
			let entries=fields[i].split('[');
			let iterator;
			let key = entries[0];
			if(!map.has(key)){
				map.set(key,[]);
			}
			if(entries.length===1){
				iterator=0;
			} else {
				iterator=entries[1].slice(0,-1)-1;            
			}
			if (!map.get(key)[iterator]){
				if(i===fields.length-1){
					if(property.outputFormat==='xml'){
						map.get(key)[iterator]=new Map();
						map.get(key)[iterator].set('#',value);
					} else {
						map.get(key)[iterator]=value;
					}
				} else {
					map.get(key)[iterator]=new Map();
				}   
			} else {
				if(Utils.isPrimitive(map.get(key)[iterator])){
					console.log("Warning "+fields+" is not writing since "+map.get(key)[iterator]+ " is already a Primitive");
				}
			}
			map=map.get(key)[iterator];
		}
	}
}

export default Storage = (new Storage());
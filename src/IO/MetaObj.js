import Utils from '../utils/utils';
import {DataItem,XPathItem} from './Items';
import FileReader from './FileReader';
import DataFormat from './DataFormat';

export default class MetaObj extends DataFormat {
	constructor(name,data){
		super();
		this.name = name;
		this.data = data;		
	}
	arrayGetData(array){
		return this.arrayGetDataInt(array,this.data);
	}
	arrayGetDataInt(array,obj){
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

}
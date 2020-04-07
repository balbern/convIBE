
class Property{
	constructor(){
		this.property = {}
	}
	require(path){
		this.property = require(propertyPath).property 
	}

	add(key,value){
		this.property[key] = value
	}
}

export default Property = new Property()
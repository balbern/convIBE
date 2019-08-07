import Table from '../IO/Table';
import XML from '../IO/XML';
import Objects from '../IO/Objects';

const classes = {
	Table,
	XML,
	Objects
}

class Factory{
	constructor (className, opts=[]){
		return new classes[className](...opts);
	}
}

export default Factory;
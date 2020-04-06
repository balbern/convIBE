import fs from 'fs';
import path from 'path';
import * as openpgp from 'openpgp';
import Property from '../utils/property'
let property = Property.property
let namespace = Property.property.namespace;
let basePath = Property.property.basePath;


import FileReader from '../IO/FileReader';

class Crypt {
	constructor() {
		if(property.encrypt){
			this.password = this.readPassword()
		}
	}



	readPassword(){
		try{
			let password = FileReader.read(property.cryptAbsolutePath).trim()
			return password;
		}
		catch (e) {
			console.log("Cannot read encryption password file at",property.cryptAbsolutePath)
			console.log(e.stack)
		}
		
	}

	encrypt(data){
		try {
			let options = {};
			options.message = openpgp.message.fromText(data);
			options.passwords = this.password;
			options.armor = false;
			let cryptmessage = openpgp.encrypt(options).then(encrypted => {return encrypted.message.packets.write()})
			return cryptmessage;
		}
		catch (e) {
			console.log("Error while encryption")
			console.log(e.stack)
		}
	}

}
export default (new Crypt());
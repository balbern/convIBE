import fs from 'fs';
import path from 'path';
import * as openpgp from 'openpgp';
let propertyPath = process.argv[2];
let property = require(propertyPath).property;
let namespace = property.namespace;
let basePath = path.dirname(propertyPath)+'/';


import FileReader from '../IO/FileReader';

class Crypt {
	constructor() {
		this.password = this.readPassword()
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
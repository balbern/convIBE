let propertyPath = process.argv[2];
let property = require(propertyPath).property;
let namespace = property.namespace;
import Storage from '../store/Storage';

class Utils{
	constructor(){}

	conditionCheck(realValue,conditionalValue){
		if (Array.isArray(conditionalValue)){
			return conditionalValue.includes(realValue);
		} else if (typeof conditionalValue==='string'){
			if (conditionalValue.startsWith('!')){
				return !this.conditionCheck(realValue,conditionalValue.slice(1));
			} 
			else if (conditionalValue==='*'){
				return !(realValue===''||realValue==="NO_TRANSLATION"||realValue===null);
			}
			else if (conditionalValue===realValue){
				return true;
			} 
			else if (conditionalValue===''){
				return (realValue===''||realValue==="NO_TRANSLATION"||realValue===null);
			}
			else {
				return false;
			}
		} else if (conditionalValue.constructor.name==='Object'){
			let regex = new RegExp(conditionalValue.regex,conditionalValue.regexFlags);
			return regex.test(realValue);
		}
		else {
			console.log('Warning: type of conditionalValue',conditionalValue,' is neither a String nor an Array!');
			return false;
		}
	}
	updatePath(parentPath,childPath){
		let parentSplit = parentPath.split('/');
		let childSplit = childPath.split('/');
		let diff = parentSplit.length-childSplit.length;
		if(diff<=0){
			childSplit.splice(0,parentSplit.length-1);
			return parentPath+childSplit.join('/');
		} else {
			return parentSplit.splice(0,childSplit.length).join('/');
		}
	}

	updatePathwIteratorPath(iteratorPath,childPath){
		let iteratorSplit = iteratorPath.split('/');
		let childSplit = childPath.split('/');
		childSplit[iteratorSplit.length-1]=iteratorSplit[iteratorSplit.length-1];
		return childSplit.join('/');
	}

	checkNewKey(key,uniqueKeys){
		if(uniqueKeys.has(key)){
			return false;
		}
		else {
			uniqueKeys.add(key);
			return true;
		}
	}
	mapSorter(map,path=''){
		let finishpath = "";
		if(!this.isLeaf(map)){
			[ ...map.keys() ].forEach(key =>{
				if(key!=="@"){
					if(path){
						finishpath = path+'/'+key
					} else {
						finishpath = key;
					}
					map.get(key).forEach((entry,index)=>{
						map.get(key)[index]= this.mapSorter(entry,finishpath);
					})
				}
			})
			map = new Map([ ...map.entries() ].sort((a,b) => {
				let priortyPath = path;
				if(priortyPath){
					priortyPath=priortyPath+'/';
				}
				return Storage.xPathGetDataFromStorage("PRIORITY/"+namespace+"/"+priortyPath+a[0]+'/valueStorage')-Storage.xPathGetDataFromStorage('PRIORITY/'+namespace+'/'+priortyPath+b[0]+'/valueStorage');
			}))
		}
		return map;
	}
	sortArray(array,type){
		if (type==='numerical'){
			array.sort((a,b)=>a-b);
		} else {
			array.sort();
		}
	}
	createSubObj(data,key,keyValue){
		return data[key].get(keyValue);
	}

	resultOfConditionCheck(metaObj,metaCondition,inputPathWIterator){
		return Object.keys(metaCondition).every(condition=>{
			let paras = this.buildRefValuePath(condition,inputPathWIterator);
			let refColumn = paras[0];
			let realValue = metaObj.xPathGetDataWithIterator(refColumn);
			if(realValue===false){
				console.log('Warning: no realValue could be found for given Path:',refColumn);
			}
			let conditionalValue=metaCondition[condition];
			return this.conditionCheck(realValue,conditionalValue);
		});
	}

	getParas(metaObj,tableParas,inputPathWIterator,defaultParas){
		let para = [];
		if(tableParas){
			tableParas.forEach(tableParaPath=>{
				let paras = this.buildRefValuePath(tableParaPath,inputPathWIterator);
				let refValuePath= paras[0];
				let tablePara=metaObj.xPathGetDataWithIterator(refValuePath);
				if(tableParaPath){
					para.push(tablePara);
				}
			})
		}
		if(defaultParas){
			defaultParas.forEach(defaultPara=>{
				para.push(defaultPara);
			})
		}
		return para;
	}
	
	//let remove = ['bmiEntry','nicotineEntry'];
	//let dir = 'entry';
	removeItems(origData,dir,remove) {
		let count = 0;
		let newArray = [];
		let data = origData;
		if(dir){
			data = Storage.xPathGetDataWithIterator(dir,origData);
		}
	    data.forEach(entry => {
	    	let removeCheck = false;
			remove.forEach(removeItem => {
				if(entry.has(removeItem)){
					newArray.push(entry.get(removeItem)[0]);
					removeCheck = true;
				}
			})
			if(!removeCheck){
				newArray.push(entry);	
			}
			
		})
		return Storage.xPathGetDataWithIterator(dir,origData,newArray);
	}


	buildRefValuePath(refValuePath,inputPathWIterator){
		let refTable=refValuePath.split('/')[0];
		let refColumn=refValuePath.split('/')[1];
		let index;
		if(property.startTable!==refTable){
			let searchPath = inputPathWIterator.split('dependentData/'+refTable);
			if (searchPath.length===2){
				index = searchPath[1].split('/')[1];
					refColumn=searchPath[0]+'dependentData/'+refTable+'/'+index+'/'+refColumn;
			} else if (searchPath.length>2){
				console.log('Warning: search string','dependentData/'+refTable,'has been found multiple times in',inputPathWIterator);
			} else {
				console.log('Warning: search string','dependentData/'+refTable,'has not been found in',inputPathWIterator);
			}
		} 
		return [refColumn,index];
	}

	getAttributeValue(metaObj,fromPath,inputPathWIterator,transformations){
			let paras = this.buildRefValuePath(fromPath,inputPathWIterator);
			let refColumn = paras[0];
			let realValue = metaObj.xPathGetDataWithIterator(refColumn);
			let index = paras[1];
			if(realValue===false){
				console.log('Warning: no realValue could be found for given Path:',refColumn);
			}
			if(transformations){
				transformations.forEach(transformation=>{
					let para=this.getParas(metaObj,transformation.tablePara,inputPathWIterator);
					realValue = Storage.xPathGetDataFromStorage('functions/valueStorage/'+transformation.name)(realValue,index,...para);
				})
			}
			return realValue;
	}


	transformToMetaObj(data,startFile){
		let metaObj = data[startFile].indexData;
		//Iterate over dependent Tables
		if(data[startFile].dependentColumn){
			Object.entries(data[startFile].dependentColumn).forEach(
				([depFileName,columns]) => {
					//Iterate over indexData to column
					if(!metaObj[columns.depColumn]){
						this.error([startFile,"has no index column",columns.depColumn,"it is needed to connect to",depFileName])
						process.exit()
					}
					metaObj[columns.depColumn].forEach(
						(rows,keyValue) => {
							//Iterate over rows by that key
							this.writeDepDataToData(rows,data,depFileName,columns,startFile);
						})
				})
			}
		return metaObj;
	}

	transformToMetaObjRec(data,fileName,key,keyValue){
		//console.log(fileName,key,keyValue)
		let rows;
		try {
			rows = data[fileName].indexData[key].get(keyValue);	
		}
		catch (e){
			this.error(["Can not call index column",key,"on",fileName])
			this.error(["Forgot to index?"])
			console.log(e.stack)
			process.exit()
		}
		if(data[fileName].dependentColumn&&rows){
		Object.entries(data[fileName].dependentColumn).forEach(
			([depFileName,columns]) => {
				this.writeDepDataToData(rows,data,depFileName,columns,fileName);
			})
		}
		return rows;
	}

	writeDepDataToData(rows,data,depFileName,columns,fileName){
		let iterators = Storage.arrayGetDataFromStorage(['ITERATOR',namespace,fileName]);
		rows.forEach(
		(row,iterator) => 
		{
			if(!row.dependentData){
				row.dependentData = {};
			}
			let tempRows = this.transformToMetaObjRec(data,depFileName,columns.column,row[columns.depColumn]);
			if(tempRows){
				row.dependentData[depFileName] = tempRows;
			}	
			return iterators;
		})
	}


	/*standard procedure for each table:
	1.deĺete documents with 'Löschkennzeichung' from data
	2.reduce data set in such a way, that only latest version of all documents is included
	3.index data according to linkedKey (if table has dependence on another table) and for iteration purposes
	4.save connection between two tables in data (example: npat has a dependence on parent-table tzpi via doknr)
	important: "parent"-table must already exist in data
	*/
	adjustTables(data,tablesInfoObj){
		Object.keys(tablesInfoObj).forEach(table=>{
			if(!data[table]){
				this.error([table,"is not loaded"])
				process.exit()
			}
			//deletes Data according to specific delete pattern
			if (tablesInfoObj[table].deleteData){
				Object.keys(tablesInfoObj[table].deleteData).forEach(columnName=>{
					let deletePattern = tablesInfoObj[table].deleteData[columnName];
					data[table].deleteData(columnName,deletePattern);
				})
			}
			//deletes Data with not maximal version number
			if (tablesInfoObj[table].minIndices){
				Object.keys(tablesInfoObj[table].minIndices).forEach(keyColumn=>{
					let versionColumn = tablesInfoObj[table].minIndices[keyColumn];
					data[table].deleteMinIndices(keyColumn,versionColumn);
				})
			}
			//reduces Data to one entry per primary key
			if(tablesInfoObj[table].primaryKey){
				let primaryKey = tablesInfoObj[table].primaryKey;
				try {
					data[table].deleteRedundantData(primaryKey);
					
				}
				catch (e) {
					console.log(e.stack)
					this.error(["Can not set",primaryKey,"as primary key on",table])
					process.exit()
				}
			}
			//indexes Data
			if (tablesInfoObj[table].indexColumns){
				tablesInfoObj[table].indexColumns.forEach(indexColumn=>{
					data[table].doIndexData(indexColumn);
				})
			} else {console.log('Warning: table',table,'has to be indexed at least once to enable correct data processing and translation!')}
			if (tablesInfoObj[table].dependentTables){
				Object.keys(tablesInfoObj[table].dependentTables).forEach(dependentTable=>{
					let column = tablesInfoObj[table].dependentTables[dependentTable].column;
					let depColumn = tablesInfoObj[table].dependentTables[dependentTable].depColumn;
					data[table].setDependentColumn(dependentTable,column,depColumn);
					//data[table].extend(data[dependentTable]);
				})
			}
		})	
	}

	updateParentObj(data,table,subtable,parentObj,selectedRow){
		let columnName = data[table].dependentColumn[subtable].column;
		let depColumnName = data[table].dependentColumn[subtable].depColumn;
		if(!parentObj[table]){
			parentObj[table] = {};
		}
		let value=selectedRow[data[table][depColumnName]];
		parentObj[subtable]={};
		parentObj[subtable][columnName]=value;
		return parentObj;
	}

	configWalker(origdata,data,startTable,outputFormat,indexObj={},parentPath="",parentObj={}){
		let subParentObj = JSON.parse(JSON.stringify(parentObj));	
		let tableNamespace = Storage.xPathGetDataFromStorage(namespace);
		let startTableConfigs = tableNamespace.get(startTable);
		let tempObj;
		if(property.rememberIndices){
				tempObj = indexObj;
		} else {
			tempObj = subParentObj;
		}
		if(startTableConfigs){
			startTableConfigs.forEach((toPath,fromPath)=>{
				let iteratorObj;
				toPath=toPath.get('valueStorage');
				let tempToPath = [];
				toPath.forEach(toPathItem => {
					let tempToPathItem = toPathItem;
					Object.entries(tempObj).forEach(([toPathIterator,key]) => {
						if(toPathItem===toPathIterator||toPathItem.startsWith(toPathIterator+'/')){
							tempToPathItem = this.updatePathwIteratorPath(toPathIterator+'['+key+']',tempToPathItem);
						}
					})
					tempToPath.push(tempToPathItem);
				})
				if(iteratorObj){
					this.insertIterators(fromPath,toPath,iteratorObj,data,startTable,outputFormat);
				} else {
					let value = data.xPathGetDataWithIterator(parentPath+fromPath);
					if(value){
						data.dataToDataItem(startTable,fromPath,value,toPath,outputFormat,data,parentPath+fromPath,tempToPath);
					}
				}
			});
		}
		outputFormat.insertAttribute(startTable,tempObj,data,parentPath);
		if(origdata[startTable].dependentColumn){
			Object.entries(origdata[startTable].dependentColumn).forEach(([fileName,dependentColumn])=>{
				let nextParentPath = parentPath+"dependentData/"+fileName;
				if(data.xPathGetDataWithIterator(nextParentPath)){
					data.xPathGetDataWithIterator(nextParentPath).forEach((line,key)=>{
						let iterators = Storage.arrayGetDataFromStorage(['ITERATOR',namespace,fileName]);

						if(iterators&&iterators.has("WHOLE_FILE")){
							iterators.get("WHOLE_FILE").get("valueStorage").forEach(iterator=>{
								if(!subParentObj[iterator]){
									subParentObj[iterator] = 0;	
								}
								if(!indexObj[iterator]){
									indexObj[iterator]=0;
								}
								indexObj[iterator]++;
								subParentObj[iterator]++;

							})
						}
						//Recursive call
						this.configWalker(origdata,data,fileName,outputFormat,indexObj,nextParentPath+'/'+key+'/',subParentObj);	
					})
				}
			})
		}
	}

	insertIterators(fromPath,toPath,iteratorObj,data,fileName,output,i=0,cancelArray=[]){
		//build parentobj
		let iteratorKeys = [...iteratorObj.keys()];
		console.log("utils.insertIterators,iteratorKeys",iteratorObj,iteratorKeys);
		if(iteratorObj.size>i){
			let value = true;
			if(cancelArray.length<i+1){
				cancelArray.push(true);
			}
			let check = true;
			for(let j=1;check;j++) {
				let iteratorInputPath=iteratorKeys[i]+'['+j+']';
				let id = data.xPathGetDataWithIterator(iteratorInputPath)
				let iteratorOutputPath=iteratorObj.get(iteratorKeys[i])+'['+j+']';
				let outputPathWIterator=[];
				toPath.forEach(path=>{
					outputPathWIterator.push(this.updatePathwIteratorPath(iteratorOutputPath,path));
				})
				let inputPathWIterator=this.updatePathwIteratorPath(iteratorInputPath,fromPath);
				this.insertIterators(inputPathWIterator,outputPathWIterator,iteratorObj,data,fileName,output,i+1,cancelArray);
				if(iteratorObj.size===i+1){
					value = data.xPathGetDataWithIterator(inputPathWIterator);
					//check if id of row fits the general row
					if(!value){
						for (let c = cancelArray.length - 1; c >= 0; c--) {
							if(cancelArray[c]){
								cancelArray[c] = false;
								break;
							}
						}
						return false;
					} else {
						data.dataToDataItem(fileName,fromPath,value,toPath,output,outputPathWIterator);
						for (let k = 0; k < cancelArray.length; k++) {
							cancelArray[k] = true;
						}
					}
				}
				check = cancelArray[i];
			}
		}
	}

	isPrimitive(value) {
		return (value !== Object(value));
	}

	isLeaf(value){
		if(this.isPrimitive(value)){
			return true;
		}
		if(value.size===1&&value.has('#')){
			return true;
		}
		if(value.size===2&&value.has('#')&&value.has('@')){
			return true;
		}

	}

	strMapToObj(strMap){
		let obj = {};//Object.create(null);
		if(typeof strMap==='object'){
			for (let [key,value] of strMap){
				if(value.constructor.name!=='Object'){
					if(value.length===1){
						obj[key] = this.strMapToObj(value[0]);
					} else {
						let objArray = [];
						value.forEach((map) => {
							objArray.push(this.strMapToObj(map))
						})
						obj[key] = objArray;
					}
				} else{
					obj[key] = value;
				}
			}	
		} else {
			obj = strMap;
		}
		return obj;
	}

	objToMarray(obj){
		let strMap = new Map();
		if(obj.constructor.name==='Object'){
			Object.keys(obj).forEach(key=>{
				if(typeof obj[key]==='object'){
					if(obj[key].constructor.name==='Object'){
						strMap.set(key,[this.objToMarray(obj[key])]);
					} else if(obj[key].constructor.name==='Array'){
						let strArr = [];
						obj[key].forEach(entry=>{
							strArr.push([this.objToMarray(entry)]);
						})
						strMap.set(key,strArr);
					} else {
						console.log('Warning:this type:',obj[key].constructor.name,'is not handled yet!');
					}
				} else {
					strMap.set(key,[obj[key]]);
				}
			})
			return strMap;
		}
	}

	getCurrentIteratorFromPath(path){
		let iterator;
		let checkIterator = path.split('[');
		if (checkIterator.length>1){
			iterator =checkIterator[checkIterator.length-1].split(']')[0];
		} else iterator = 1;
		return iterator;
	}

	objToMap(obj){
		let strMap = new Map(Object.entries(obj));
		strMap.forEach((value,key)=>{
			if(this.isPrimitive(value)){
				strMap.set(key,value);
			}
			else {
				if(value.constructor.name==='Object'){
					strMap.set(key,this.objToMap(value));
				} else if (value.constructor.name==='Array') {
					strMap.set(key,new Map());
					value.forEach((item,index) => {
						if(!this.isPrimitive(item)){
							item = this.objToMap(item);
						}
						strMap.get(key).set(index+1+'',item);
					})
					
				} else if (value.constructor.name==='Map'){
					value.forEach((mapValue,mapKey)=>{
						strMap.set(mapKey,this.objToMap(mapValue));
					});
				} else {
					console.log("Warning: this constructor type:",value.constructor.name," is not handeled by utils.objToMap");
				}
			}	
		})
		return strMap;
	}
	error(string){
		console.log('\x1b[31m',...string,'\x1b[0m')
	}

	warning(string){
		console.log('\x1b[33m',...string,'\x1b[0m')
	}
}
export default (new Utils());

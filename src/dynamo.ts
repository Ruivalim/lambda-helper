import { DynamoDB } from "aws-sdk";

interface DynamoSettings{
	tableName: string
	stopOnError: boolean
}

export const dynamo = (settings: DynamoSettings) => {
	const ddb = new DynamoDB({ apiVersion: "2012-08-10" });
	const stopOnError = settings.stopOnError || false;
	const DynamoDBTypes = {
		number: "N",
		string: "S",
		boolean: "BOOL",
		array: "L",
		object: "M"
	}

	const notObjectToDynamoObj = (value: any) => {
		if( typeof value == "number" ){
			return value.toString();
		}else{
			return value;
		}
	}

	const arrayToDynamoObj = (arr: any) => {
		const Item = [];

		arr.map((item, index)=> {
			Item[index] = {};
			if( typeof item == "object" ){
				if( item instanceof Array ){
					Item[index][DynamoDBTypes['array']] = arrayToDynamoObj(item);
				}else{
					Item[index][DynamoDBTypes['object']] = objectToDynamoObj(item);
				}
			}else{
				Item[index][DynamoDBTypes[typeof item]] = notObjectToDynamoObj(item);
			}
		});

		return Item;
	}

	const objectToDynamoObj = (obj: object, keyIsAttributeValue: boolean = false) => {
		const Item = {};


		Object.keys(obj).map((key) => {
			const value = obj[key];
			const ObjValue = {};

			if( typeof value == "object" ){
				if( value instanceof Array ){
					ObjValue[DynamoDBTypes['array']] = arrayToDynamoObj(value);
				}else{
					ObjValue[DynamoDBTypes['object']] = objectToDynamoObj(value);
				}
			}else{
				ObjValue[DynamoDBTypes[typeof value]] = notObjectToDynamoObj(value);
			}

			if( keyIsAttributeValue ){
				Item[":"+key] = ObjValue;
			}else{
				Item[key] = ObjValue;
			}
		});

		return Item;
	};

	const makeFilterExpression = (searchParams: object) => {
		let FilterExpression = "";

		Object.keys(searchParams).map(key => {
			FilterExpression += `${key} = :${key},`
		});

		return FilterExpression.slice(0, -1);
	}

	const makeExpressionAttributeNames = (data: object) => {
		const ExpressionAttributeNames = {};

		Object.keys(data).map(key => {
			ExpressionAttributeNames["#"+key] = key;
		});

		return ExpressionAttributeNames;
	}

	const makeUpdateExpression = (data: object) => {
		let UpdateExpression = "SET";

		Object.keys(data).map(key => {
			UpdateExpression += ` #${key} = :${key},`;
		});

		return UpdateExpression.slice(0, -1);
	};

	return {
		save: (data: object) => {
			const Item = objectToDynamoObj(data);

			const DynamoSave: DynamoDB.DocumentClient.PutItemInput = {
				TableName: settings.tableName,
				Item
			}

			try{
				return ddb.putItem(DynamoSave).promise();
			}catch(error){
				if( stopOnError ){
					throw new Error(error);
				}
				return error
			}
		},
		delete: (key: object) => {
			const Key = objectToDynamoObj(key);

			const DynamoDelete: DynamoDB.DocumentClient.DeleteItemInput = {
				TableName: settings.tableName,
				Key
			}

			try{
				return ddb.deleteItem(DynamoDelete).promise();
			}catch(error){
				if( stopOnError ){
					throw new Error(error);
				}
				return error
			}
		},
		scan: (searchParams: object) => {
			const FilterExpression = makeFilterExpression(searchParams);
			const ExpressionAttributeValues = objectToDynamoObj(searchParams, true);

			const DynamoScan: DynamoDB.DocumentClient.ScanInput = {
				TableName: settings.tableName,
				FilterExpression,
				ExpressionAttributeValues
			}

			try{
				return ddb.scan(DynamoScan).promise();
			}catch(error){
				if( stopOnError ){
					throw new Error(error);
				}
				return error
			}
		},
		get: (key: object) => {
			const Key = objectToDynamoObj(key);

			const DynamoGet: DynamoDB.DocumentClient.GetItemInput = {
				TableName: settings.tableName,
				Key
			}

			try{
				return ddb.getItem(DynamoGet).promise();
			}catch(error){
				if( stopOnError ){
					throw new Error(error);
				}
				return error
			}
		},
		update: (key: object, data: object) => {
			const Key = objectToDynamoObj(key);
			const ExpressionAttributeNames = makeExpressionAttributeNames(data);
			const ExpressionAttributeValues = objectToDynamoObj(data, true);
			const UpdateExpression = makeUpdateExpression(data);

			const DynamoUpdate: DynamoDB.DocumentClient.UpdateItemInput = {
				TableName: settings.tableName,
				Key,
				ExpressionAttributeNames,
				ExpressionAttributeValues,
				UpdateExpression
			};

			try{
				return ddb.updateItem(DynamoUpdate).promise();
			}catch(error){
				if( stopOnError ){
					throw new Error(error);
				}
				return error
			}
		}
	}
};

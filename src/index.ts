import { DynamoDB } from "aws-sdk";
import { DynamoSettings } from "./interfaces";

export const dynamo = (settings: DynamoSettings) => {
	const ddb = new DynamoDB({ apiVersion: "2012-08-10" });
	const DynamoDBTypes = {
		number: "N",
		string: "S",
		boolean: "BOOL",
		array: "L",
		object: "M"
	}

	const objectToDynamoObj = (obj: object, keyIsAttributeValue: boolean = false) => {
		const Item = {};

		Object.keys(obj).map((key) => {
			const value = obj[key];
			const ObjValue = {};

			if( typeof value == "object" ){
				if( value instanceof Array ){
					ObjValue[DynamoDBTypes['array']] = value;
				}else{
					ObjValue[DynamoDBTypes['object']] = objectToDynamoObj(value);
				}
			}else{
				ObjValue[DynamoDBTypes[typeof value]] = value;
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

			return ddb.putItem(DynamoSave).promise();
		},
		delete: (key: object) => {
			const Key = objectToDynamoObj(key);

			const DynamoDelete: DynamoDB.DocumentClient.DeleteItemInput = {
				TableName: settings.tableName,
				Key
			}

			return ddb.deleteItem(DynamoDelete).promise();
		},
		scan: (searchParams: object) => {
			const FilterExpression = makeFilterExpression(searchParams);
			const ExpressionAttributeValues = objectToDynamoObj(searchParams, true);

			const DynamoScan: DynamoDB.DocumentClient.ScanInput = {
				TableName: settings.tableName,
				FilterExpression,
				ExpressionAttributeValues
			}

			return ddb.scan(DynamoScan).promise();
		},
		get: (key: object) => {
			const Key = objectToDynamoObj(key);

			const DynamoGet: DynamoDB.DocumentClient.GetItemInput = {
				TableName: settings.tableName,
				Key
			}

			return ddb.getItem(DynamoGet).promise();
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

			console.log(DynamoUpdate);
		}
	}
};

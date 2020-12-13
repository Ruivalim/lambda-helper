const {dynamo} = require("./dynamo");
import { DynamoDB } from "aws-sdk";

const ddb = dynamo({tableName: "testing"});
const ddbSdk = new DynamoDB({ apiVersion: "2012-08-10" });

test('dynamo helper - save', () => {
	expect(ddb.save({ name: "Rui Valim Junior" })).toEqual(ddbSdk.putItem({
		TableName: "testing",
		Item: {
			name: {
				S: "Rui Valim Junir"
			}
		}
	}))
});

# Lambda Helper

It's a small library to help build lambda functions on AWS

## Installation
```bash
yarn add @ruivalim/lambda-helper
```

## Usage

```javascript
import {dynamo} from "@ruivalim/lambda-helper"

const ddb = dynamo({tableName: "My-table"});

ddb.get({ ID: "record-id").then(data => {
    console.log(data);
});

const saveUser = async(data) => {
    await ddb.save(data);
}

saveUser({
    ID: "record-id",
    name: "Rui Valim",
    email: "r.valim.junior@gmail.com",
    admin: true
});

ddb.delete({ID: "record-id}).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});

ddb.scan({ admin: true }).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});


ddb.update({ id: "record-id" }, { name: "Rui Valim Jr" }).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/Ruivalim/lambda-helper/blob/master/LICENSE)

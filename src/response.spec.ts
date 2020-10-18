const {response, HttpStatusCode} = require("./response");

test('response helper - success', () => {
	const message = "success message";
	expect(response(HttpStatusCode.OK, message)).toStrictEqual({
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message }),
	})
});

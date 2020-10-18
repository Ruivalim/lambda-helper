interface ResponseSettings{
	AllowedOrigin?: string
	errorCode?: number
	successCode?: number
}

export const response = (settings: ResponseSettings) => {
	return {
		error: (message: any) => {
			return {
				statusCode: settings.errorCode || 500,
				headers: {
					"Access-Control-Allow-Origin": settings.AllowedOrigin || "*",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "error", message: message }),
			};
		},
		success: (message: any) => {
			return {
				statusCode: settings.successCode || 200,
				headers: {
					"Access-Control-Allow-Origin": settings.AllowedOrigin || "*",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "success", message: message }),
			};
		}
	}
}

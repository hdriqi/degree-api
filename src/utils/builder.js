const responseBuilder = ({
	code,
	message, 
	data
}) => {
	const response = {
		success: code === 200 ? true : false,
		message: message || 'Empty message',
		data: data || {},
	}

	if(code > 200) {
		response.errorCode = code
	}

	return response
}

export {
	responseBuilder as response
}

export default {
	response: responseBuilder
}
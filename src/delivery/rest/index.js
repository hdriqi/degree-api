import express from 'express'
import response from '../../utils/response'

const Router = express.Router()

Router.get('/', (req, res) => {
	res.json(response({
		code: 200,
		message: `Degree API is running properly`,
		data: {}
	}))
})

export default Router
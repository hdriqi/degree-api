import express from 'express'
import { setup as SetupRadiks } from 'radiks-server'

import organizations from './organizations'
import { response } from '../../utils/builder'

const Router = express.Router()

SetupRadiks().then(RadiksController => {
  Router.use('/radiks', RadiksController)
})

Router.get('/', (req, res) => {
	res.json(response({
		code: 200,
		message: `Degree API is running properly`,
		data: {}
	}))
})

Router.use('/v1/organizations', organizations)

export default Router
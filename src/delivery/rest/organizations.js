import express from 'express'

import servicesOrganizations from '../../services/organizations'
import { response } from '../../utils/builder'

const Router = express.Router()

Router.get('/', async (req, res) => {
	const result = await servicesOrganizations.query.getOrganizations({
		filter: req.query
	})

	res.json(response({
		code: result.code,
		message: result.message,
		data: result.data
	}))
})

Router.post('/', async (req, res) => {
	const result = await servicesOrganizations.mutation.createOrganization({
		name: req.body.name,
		logoUrl: req.body.logoUrl
	})

	res.json(response({
		code: result.code,
		message: result.message,
		data: result.data
	}))
})

export default Router
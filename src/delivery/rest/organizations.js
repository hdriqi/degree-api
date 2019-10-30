import express from 'express'

import resolversOrganizations from '../../resolvers/organizations'
import { response } from '../../utils/builder'

const Router = express.Router()

Router.get('/', async (req, res) => {
	const result = await resolversOrganizations.query.getOrganizations({
		filter: req.query
	})

	res.json(response({
		code: result.code,
		message: result.message,
		data: result.data
	}))
})

Router.post('/', async (req, res) => {
	const result = await resolversOrganizations.mutation.createOrganization({
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
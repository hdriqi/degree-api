import express from 'express'

import servicesCertificates from '../../services/certificates'
import { response } from '../../utils/builder'

const Router = express.Router()

Router.post('/', async (req, res) => {
	const result = await servicesCertificates.mutation.createCertificate({
		title: 'Blockstack Indonesia Membership',
		template: `html`,
		recipientName: `Kucing Meong`,
		recipientEmail: `meong@mailinator.com`,
		metadata: {
			status: 'Member',
			description: `Welcome to the party!`
		},
		revocationUrl: `https://blockstack-id.degree.network/blockstack-indonesia-membership/revocations`,
		issuer: {
			name: `Blockstack Indonesia`,
			logo: `logo`,
			publicKey: `xxx`,
			profileUrl: `yyy`
		},
		issuedOn: new Date().toISOString(),
		expiredOn: 0
	})

	res.json(response({
		code: result.code,
		message: result.message,
		data: result.data
	}))
})

Router.post('/multi', async (req, res) => {
	const result = await servicesCertificates.mutation.createCertificates([
		{
			title: 'Blockstack Indonesia Membership',
			template: `html`,
			recipientName: `Teto`,
			recipientEmail: `meong@mailinator.com`,
			metadata: {
				status: 'Member',
				description: `Welcome to the party!`
			},
			revocationUrl: `https://blockstack-id.degree.network/blockstack-indonesia-membership/revocations`,
			issuer: {
				name: `Blockstack Indonesia`,
				logo: `logo`,
				publicKey: `xxx`,
				profileUrl: `yyy`
			},
			issuedOn: new Date().toISOString(),
			expiredOn: 0
		},
		{
			title: 'Blockstack Indonesia Membership',
			template: `html`,
			recipientName: `Toti`,
			recipientEmail: `meong@mailinator.com`,
			metadata: {
				status: 'Member',
				description: `Welcome to the party!`
			},
			revocationUrl: `https://blockstack-id.degree.network/blockstack-indonesia-membership/revocations`,
			issuer: {
				name: `Blockstack Indonesia`,
				logo: `logo`,
				publicKey: `xxx`,
				profileUrl: `yyy`
			},
			issuedOn: new Date().toISOString(),
			expiredOn: 0
		},
		{
			title: 'Blockstack Indonesia Membership',
			template: `html`,
			recipientName: `Tito`,
			recipientEmail: `meong@mailinator.com`,
			metadata: {
				status: 'Member',
				description: `Welcome to the party!`
			},
			revocationUrl: `https://blockstack-id.degree.network/blockstack-indonesia-membership/revocations`,
			issuer: {
				name: `Blockstack Indonesia`,
				logo: `logo`,
				publicKey: `xxx`,
				profileUrl: `yyy`
			},
			issuedOn: new Date().toISOString(),
			expiredOn: 0
		}
	])

	res.json(response({
		code: result.code,
		message: result.message,
		data: result.data
	}))
})

export default Router
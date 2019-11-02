import express from 'express'
import bodyParser from 'body-parser'

import db from './utils/mongodb'

import router from './delivery/rest'
import servicesCertificates from './services/certificates'

const PORT = 8080

const app = express()

const main = async () => {
	await db.connect()
	
	await servicesCertificates.schedule.init()
	await db.agenda.start()

	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	app.use(router)

	app.listen(PORT, (err) => {
		if(err) {
			console.log(err)
		}
		console.log(`API running on PORT ${PORT}`)
	})
}

main()
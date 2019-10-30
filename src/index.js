import express from 'express'
import bodyParser from 'body-parser'

import db from './utils/mongodb'

import router from './delivery/rest'

const PORT = 8080

const app = express()

const main = async () => {
	await db.connect()

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
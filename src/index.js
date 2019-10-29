import express from 'express'
import router from './delivery/rest'

const PORT = 8080

const app = express()

app.use(router)

app.listen(PORT, (err) => {
	if(err) {
		console.log(err)
	}
	console.log(`API running on PORT ${PORT}`)
})
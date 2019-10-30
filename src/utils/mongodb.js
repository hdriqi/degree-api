import mongo from 'mongodb'

class DbClient {
	constructor() {
		this.mongoClient = mongo.MongoClient
		this.url = `mongodb://localhost:27017`
		this.dbName = `degree`
		this.ObjectId = mongo.ObjectId
	}

	async connect() {
		const client = new this.mongoClient(this.url)
		await client.connect()
		this[this.dbName] = client.db(this.dbName)
	}
}

export default new DbClient()
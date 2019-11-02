import db from '../../utils/mongodb'

const mutation = {
	async createOrganization({name, logoUrl, publicKey}) {
		await db.degree.collection('organizations').insertOne({
			name: name,
			logoUrl: logoUrl,
			publicKey: publicKey
		})

		return {
			code: 200,
			message: `Organization successfully created`,
			data: {
				_id: 123
			}
		}
	}
}

const query = {
	async getOrganizations({ filter = {}, skip = 0, limit = 10 }) {
		let matches = {}

		if(filter._id) {
			if(!db.ObjectId.isValid(filter._id)) {
				return {
					code: 400,
					message: `Invalid organization id`,
					data: {}
				}
			}
			matches['_id'] = db.ObjectId(filter._id)
		}

		const records = await db.degree.collection('organizations').find(matches)
			.skip(skip)
			.limit(limit)
			.toArray()

		const count = await db.degree.collection('organizations').countDocuments()

		return {
			code: 200,
			message: `Organization successfully fetched`,
			data: {
				records: records,
				_metadata: {
					skip: skip,
					limit: limit,
					count: count
				}
			}
		}
	}
}

export default {
	mutation: mutation,
	query: query
}
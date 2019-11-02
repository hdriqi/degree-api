import db from '../../utils/mongodb'
import chp from 'chainpoint-client'
import cpb from 'chainpoint-binary'
import crypto from 'crypto'
import stringify from 'fast-json-stable-stringify'

const sha3512 = require('js-sha3').sha3_512
const sha3384 = require('js-sha3').sha3_384
const sha3256 = require('js-sha3').sha3_256
const sha3224 = require('js-sha3').sha3_224

const local = {
	_isHex(value) {
		var hexRegex = /^[0-9A-Fa-f]{2,}$/
		var result = hexRegex.test(value)
		if (result) result = !(value.length % 2)
		return result
	},

	_parseMerkleProof(branches) {
		let ops = []
		branches.forEach(branch => {
			let localOps = branch.ops
			const anchorIdx = branch.ops.findIndex(x => x.anchors)
			localOps.splice(anchorIdx, 1)
			if(branch.branches) {
				localOps = localOps.concat(this._parseMerkleProof(branch.branches))
			}
			ops = localOps
		})
		return ops
	},

	_parseMerkleProofCal(branch) {
		if(branch.label === 'cal_anchor_branch') {
			return branch.ops
		}
		else {
			return this._parseMerkleProofCal(branch.branches[0])
		}
	},

	_parseMerkleProofBtc(branch) {
		if(branch.label === 'btc_anchor_branch') {
			return branch.ops
		}
		else {
			return this._parseMerkleProofBtc(branch.branches[0])
		}
	},

	_calculateMerkleRoot(startHash, ops) {
		let currentHashValue = Buffer.from(startHash, 'hex')
		let currentbranchOps = ops

		for (var o = 0; o < currentbranchOps.length; o++) {
			if (currentbranchOps[o].r) {
				// hex data gets treated as hex, otherwise it is converted to bytes assuming a ut8 encoded string
				let concatValue = local._isHex(currentbranchOps[o].r)
					? Buffer.from(currentbranchOps[o].r, 'hex')
					: Buffer.from(currentbranchOps[o].r, 'utf8')
				currentHashValue = Buffer.concat([currentHashValue, concatValue])
			} 
			else if (currentbranchOps[o].l) {
				// hex data gets treated as hex, otherwise it is converted to bytes assuming a ut8 encoded string
				let concatValue = local._isHex(currentbranchOps[o].l)
					? Buffer.from(currentbranchOps[o].l, 'hex')
					: Buffer.from(currentbranchOps[o].l, 'utf8')
				currentHashValue = Buffer.concat([concatValue, currentHashValue])
			} 
			else if (currentbranchOps[o].op) {
				switch (currentbranchOps[o].op) {
					case 'sha-224':
						currentHashValue = crypto
							.createHash('sha224')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-256':
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-384':
						currentHashValue = crypto
							.createHash('sha384')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-512':
						currentHashValue = crypto
							.createHash('sha512')
							.update(currentHashValue)
							.digest()
						break
					case 'sha3-224':
						currentHashValue = Buffer.from(sha3224.array(currentHashValue))
						break
					case 'sha3-256':
						currentHashValue = Buffer.from(sha3256.array(currentHashValue))
						break
					case 'sha3-384':
						currentHashValue = Buffer.from(sha3384.array(currentHashValue))
						break
					case 'sha3-512':
						currentHashValue = Buffer.from(sha3512.array(currentHashValue))
						break
					case 'sha-256-x2':
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						break
				}
			}
		}

		return currentHashValue
	},

	_calculateBtcInfo(startHash, calOps, btcOps) {
		let currentHashValue = Buffer.from(startHash, 'hex')
		let has256x2 = false
		let isFirst256x2 = false
		let rawTx = ''

		currentHashValue = this._calculateMerkleRoot(startHash, calOps)

		let opResultTable = btcOps.map(op => {
			if (op.r) {
				// hex data gets treated as hex, otherwise it is converted to bytes assuming a ut8 encoded string
				let concatValue = local._isHex(op.r) ? Buffer.from(op.r, 'hex') : Buffer.from(op.r, 'utf8')
				currentHashValue = Buffer.concat([currentHashValue, concatValue])
				return { opResult: currentHashValue, op: op, isFirst256x2: isFirst256x2 }
			} 
			else if (op.l) {
				// hex data gets treated as hex, otherwise it is converted to bytes assuming a ut8 encoded string
				let concatValue = local._isHex(op.l) ? Buffer.from(op.l, 'hex') : Buffer.from(op.l, 'utf8')
				currentHashValue = Buffer.concat([concatValue, currentHashValue])
				return { opResult: currentHashValue, op: op, isFirst256x2: isFirst256x2 }
			} 
			else if (op.op) {
				switch (op.op) {
					case 'sha-224':
						currentHashValue = crypto
							.createHash('sha224')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-256':
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-384':
						currentHashValue = crypto
							.createHash('sha384')
							.update(currentHashValue)
							.digest()
						break
					case 'sha-512':
						currentHashValue = crypto
							.createHash('sha512')
							.update(currentHashValue)
							.digest()
						break
					case 'sha3-224':
						currentHashValue = Buffer.from(sha3224.array(currentHashValue))
						break
					case 'sha3-256':
						currentHashValue = Buffer.from(sha3256.array(currentHashValue))
						break
					case 'sha3-384':
						currentHashValue = Buffer.from(sha3384.array(currentHashValue))
						break
					case 'sha3-512':
						currentHashValue = Buffer.from(sha3512.array(currentHashValue))
						break
					case 'sha-256-x2':
						// if this is the first double sha256, then the currentHashValue is the rawTx
						// on the public Bitcoin blockchain
						if (!has256x2) rawTx = currentHashValue
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						currentHashValue = crypto
							.createHash('sha256')
							.update(currentHashValue)
							.digest()
						if (!has256x2) {
							isFirst256x2 = true
							has256x2 = true
						} else {
							isFirst256x2 = false
						}
						break
				}
				return { opResult: currentHashValue, op: op, isFirst256x2: isFirst256x2 }
			}
		})
		
		let btcTxIdOpIndex = opResultTable.findIndex(result => {
			return result.isFirst256x2
		})

		let opReturnOpIndex = btcTxIdOpIndex - 3

		// get op return proof
		const trimCalOps = calOps.filter(x => !x.anchors)
		const trimBtcOps = btcOps.filter(x => !x.anchors)
		let mergedOps = trimCalOps.concat(trimBtcOps)
		const parseOpReturnProofIdx = mergedOps.findIndex(x => x.op === 'sha-256-x2')
		mergedOps = mergedOps.slice(0, parseOpReturnProofIdx - 2)
	
		return {
			opReturnValue: opResultTable[opReturnOpIndex].opResult.toString('hex'),
			btcTxId: opResultTable[btcTxIdOpIndex].opResult
				.toString('hex')
				.match(/.{2}/g)
				.reverse()
				.join(''),
			rawTx: rawTx.toString('hex'),
			ops: mergedOps
		}
	},

	async _updateCertificateAnchor(credential, anchoredData) {
		// get current credential hash
		const currentHash = crypto
			.createHash('sha256')
			.update(stringify(credential))
			.digest('hex')

		// get bitcoin info
		const chpObject = cpb.binaryToObjectSync(anchoredData.proof)
		const merkleProofCal = this._parseMerkleProofCal(chpObject.branches[0])
		const merkleProofBtc = this._parseMerkleProofBtc(chpObject.branches[0])
		const btcInfo = this._calculateBtcInfo(currentHash, merkleProofCal, merkleProofBtc)

		// update credential signature
		await db.degree.collection('certificates').updateOne({
			hash: currentHash
		}, {
			$set: {
				status: 'ANCHORED',
				signature: {
					merkleProof: btcInfo.ops,
					merkleRoot: btcInfo.opReturnValue,
					anchors: [
						{
							name: 'btc',
							txId: btcInfo.btcTxId,
							rawTxId: btcInfo.rawTx
						}
					]
				}
			}
		})

		// sent email to credential.recipientEmail
		console.log('sent email to recipient')
	}
}

const mutation = {
	async createCertificate(credential) {
		const currentHash = crypto
			.createHash('sha256')
			.update(stringify(credential))
			.digest('hex')

		const nodes1 = await chp.getNodes(3)
		const nodes2 = await chp.getNodes(3)
		
		let proofs1 = await chp.submitHashes([
			currentHash
		], nodes1)
		
		let proofs2 = await chp.submitHashes([
			currentHash
		], nodes2)

		const proofs = proofs1.concat(proofs2)

		await db.degree.collection('certificates').insertOne({
			version: 'degree/v1',
			hash: currentHash,
			credential: credential,
			status: 'ANCHORING',
			signature: {}
		})

		// get proof every 15 minutes
		const job = db.agenda.create('CERTIFICATE_CHECK', {
			credential: credential,
			proofs: proofs
		})
		const repeatRandomly = Math.floor(Math.random() * 20) + 10
		job.repeatEvery(`${repeatRandomly} minutes`)
		await job.save()

		// await db.agenda.every('1 minutes', 'CERTIFICATE_CHECK', {
		// 	credential: credential,
		// 	proofs: proofs
		// })

		return {
			code: 200,
			message: `Certificate successfully created`,
			data: {
				hash: currentHash
			}
		}
	},

	async createCertificates(credentials) {
		const credentialsPromised = credentials.map(async c => {
			return await this.createCertificate(c)
		})
		const results = await Promise.all(credentialsPromised)

		return {
			code: 200,
			message: `Multi-Certificates successfully created`,
			data: {
				hashes: results.map(result => result.data.hash)
			}
		}
	}
}

const query = {
	async getCertificates({ filter = {}, skip = 0, limit = 10 }) {
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

const schedule = {
	async init() {
		db.agenda.define('CERTIFICATE_CHECK', async job => {
			console.log('checking certificate anchor status')
			const { credential, proofs } = job.attrs.data
			const currentProofs = await chp.getProofs(proofs)
			const anchoredData = currentProofs.find(proof => {
				return proof.anchorsComplete.find(anchor => anchor === 'btc')
			})
			console.log(anchoredData)

			if(anchoredData) {
				await local._updateCertificateAnchor(credential, anchoredData)
				return job.remove()
			}
		})
	}
}

export default {
	mutation: mutation,
	query: query,
	schedule: schedule
}
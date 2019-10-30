import organizations from './organizations'

export default {
	mutation: {
		...organizations.mutation
	},
	query: {
		...organizations.query
	},
}
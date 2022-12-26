import { PrismaClient } from '@prisma/client'

const CARD_BATCH_INSERT_SIZE = 10

interface BulkData {
	id: string
	uri: string
	type: string
	name: string
	description: string
	download_uri: string
	updated_at: string
	size: number
	content_type: string
	content_encoding: string
}

interface Set {
	id: string
	code: string
	name: string
	icon_svg_uri: string
	card_count: number
	released_at: string
}

interface Card {
	id: string
	name: string
	printed_name?: string
	image_uris?: {
		normal: string
	}
	collector_number: string
	set_id: string
}

const prisma = new PrismaClient()

// Get data object from scryfall api
function fetchToJson<T>(url: string): Promise<T> {
	return fetch(url)
	.then(data => data.json())
	.then(({ data }) => data)
}

function getSets(): Promise<Set[]>{
	console.log('Getting sets...')
	return fetchToJson<Set[]>('https://api.scryfall.com/sets').then(sets => {
		console.log('Sets retrieved...')	
		return sets
	})
}

function getBulkCards(): Promise<Card[]> {
	console.log('Getting cards...')
	return fetchToJson('https://api.scryfall.com/bulk-data').then((bulks: BulkData[]) => 
		bulks.find(bulk => bulk.type === 'default_cards')
	)
	.then(bulkCards => fetch(bulkCards.download_uri))
	.then(data => data.json())
	.then(cards => {
			console.log('Cards retrieved...')
			return cards
	})
}

async function insertSets(sets: Set[]) {
	
	console.log('Inserting sets...')
	
	await prisma.$transaction(() => {
		const inserts = []

		for (const set of sets as Set[]) {
			const [year, month, day] = set.released_at
				.split('-')
				.map(n => parseInt(n))
			const releasedAt = new Date(year, month - 1, day)

			inserts.push(
				prisma.set.create({
					data: {
						id: set.id,
						code: set.code,
						name: set.name,
						icon_svg_uri: set.icon_svg_uri,
						card_count: set.card_count,
						released_at: releasedAt
					}
				})
			)
		}

		return Promise.all(inserts)
	}, {
		timeout: 10000
	})

	console.log('Sets inserted...')
}

async function insertCards(cards: Card[]) {
	
	const inserts = []
	let count = 0

	console.log(`Inserting cards... ${count}/${cards.length}`)

	for (const card of cards as Card[]) {
		inserts.push(prisma.card.create({
			data: {
				id: card.id,
				name: card.name,
				printed_name: card.printed_name,
				image: card.image_uris?.normal,
				collector_number: card.collector_number,
				set_id: card.set_id
			}
		}))

		if (inserts.length === CARD_BATCH_INSERT_SIZE) {
			await Promise.all(inserts)
			inserts.length = 0
			count += CARD_BATCH_INSERT_SIZE
			console.log(`Inserting cards... ${count}/${cards.length}`)
		}
	}

	if (inserts.length) {
		await Promise.all(inserts)
	}

	console.log('Cards inserted. All is good :)')
}

async function main() {
	
	const [_, cards] = await Promise.all([getSets().then(insertSets), getBulkCards()])
	await insertCards(cards)
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})

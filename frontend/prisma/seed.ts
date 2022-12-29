import { PrismaClient } from '@prisma/client'

interface MTGCard {
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

interface MTGSet {
	id: string
	code: string
	parent_set_code: string
	name: string
	icon_svg_uri: string
	card_count: number
	released_at: string
}

interface Card {
	id: string
	name: string
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

function getSets(): Promise<MTGSet[]> {
	console.log('Getting sets...')
	return fetchToJson<MTGSet[]>('https://api.scryfall.com/sets').then(sets => {
		console.log('Sets retrieved...')
		return sets
	})
}

function getBulkCards(): Promise<Card[]> {
	console.log('Getting cards...')
	return fetchToJson('https://api.scryfall.com/bulk-data')
		.then((bulks: MTGCard[]) => bulks.find(bulk => bulk.type === 'default_cards'))
		.then(bulkCards => fetch(bulkCards.download_uri))
		.then(data => data.json())
		.then(cards => {
			console.log('Cards retrieved...')
			return cards
		})
}

async function insertSets(sets: MTGSet[]) {
	console.log('Inserting sets...')

	await prisma.$transaction(
		async () => {
			for (const set of sets as MTGSet[]) {
				const [year, month, day] = set.released_at.split('-').map(n => parseInt(n))
				const releasedAt = new Date(year, month - 1, day)

				await prisma.set.create({
					data: {
						id: set.id,
						code: set.code,
						parent_set_code: set.parent_set_code,
						name: set.name,
						icon_svg_uri: set.icon_svg_uri,
						card_count: set.card_count,
						released_at: releasedAt
					}
				})
			}
		},
		{
			timeout: 10000
		}
	)

	console.log('Sets inserted...')
}

async function insertCards(cards: Card[]) {
	let count = 0
	console.log(`Inserting cards... ${count}/${cards.length}`)

	for (const card of cards as Card[]) {
		await prisma.card.create({
			data: {
				id: card.id,
				name: card.name,
				image: card.image_uris?.normal,
				collector_number: card.collector_number,
				set_id: card.set_id
			}
		})

		console.log(`Inserting cards... ${++count}/${cards.length}`)
	}

	console.log('Cards inserted. All is good :)')
}

async function main() {
	const start = new Date()
	console.log('Seeding start at ' + start)

	console.log('Setting WAL mode')
	await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL')
	await prisma.$disconnect()
	console.log('WAL mode setted')

	const [_, cards] = await Promise.all([getSets().then(insertSets), getBulkCards()])
	await insertCards(cards)

	const end = new Date()
	console.log('Seeding ended at ' + end)
	console.log(`Seeding duration: ${(end.getTime() - start.getTime()) / 1000} seconds`)
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

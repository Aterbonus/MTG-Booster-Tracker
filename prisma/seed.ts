import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import bigJson from 'big-json'

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
const readStream = fs.createReadStream(__dirname + '/cards.json')
const parseStream = bigJson.createParseStream()

parseStream.on('data', cardsJson => {
	async function main() {
		const sets = await fetch('https://api.scryfall.com/sets')
			.then(data => data.json())
			.then(({ data }) => data)

		await prisma.$transaction(async () => {
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
		})

		for (const card of cardsJson as Card[]) {
			await prisma.card.create({
				data: {
					id: card.id,
					name: card.name,
					printed_name: card.printed_name,
					image: card.image_uris?.normal,
					collector_number: card.collector_number,
					set_id: card.set_id
				}
			})
		}
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
})

readStream.pipe(parseStream)

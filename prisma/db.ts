import { Card as BaseMTGCard, Set as MTGSet } from '@prisma/client'
import initSqlJs from '../assets/sql-wasm.js'

interface Result {
	columns: string[]
	values: string[][]
}

interface SQLiteDB {
	exec: (stmt: string) => Result[]
}

export interface MTGCard extends BaseMTGCard {
	set_code: string
}
export class DB {
	#db!: SQLiteDB

	async init() {
		const sqlPromise = (await initSqlJs((file: string) => `/${file}`)) as any
		const dataPromise = fetch('/cards.db').then(res => res.arrayBuffer())
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		this.#db = new SQL.Database(new Uint8Array(buf))
	}

	getSets(): MTGSet[] {
		return this.exec<MTGSet>('SELECT * FROM "set"')
	}

	getSetCards(setId: string): MTGCard[] {
		return this.exec(`SELECT card.*, "set".code AS set_code FROM card JOIN "set" ON card.set_id = "set".id WHERE set_id = '${setId}'`)
	}

	// TODO: use prepared statement
	private exec<T>(query: string) {
		const results = this.#db.exec(query)[0]

		if (!results) {
			return []
		}

		const columnsLength = results.columns.length

		return results.values.map(row => {
			const r: {
				[key: string]: string
			} = {}

			for (let i = 0; i < columnsLength; ++i) {
				r[results.columns[i]] = row[i]
			}

			return r as T
		})
	}
}

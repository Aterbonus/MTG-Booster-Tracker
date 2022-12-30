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

	private parseExec<T>(execResult: Result) {
		return execResult.values.map(row => {
			const r: {
				[key: string]: string
			} = {}

			for (let i = 0; i < row.length; ++i) {
				r[execResult.columns[i]] = row[i]
			}

			return r as T
		})
	}

	getSets(): MTGSet[] {
		return this.parseExec<MTGSet>(this.#db.exec('SELECT * FROM "set"')[0])
	}

	getSetCards(setId: string): MTGCard[] {
		const cardsResult = this.#db.exec(
			`SELECT card.*, "set".code AS set_code FROM card JOIN "set" ON card.set_id = "set".id WHERE set_id = '${setId}'`
		)[0]

		return cardsResult ? this.parseExec(cardsResult) : []
	}
}

import { Card as BaseMTGCard, Set as MTGSet } from '@prisma/client'
import type { Database, ParamsObject, SqlValue } from 'sql.js'
import initSqlJs from '../assets/sql-wasm.js'

export interface MTGCard extends BaseMTGCard {
	set_code: string
}
export class DB {
	private db!: Database

	async init() {
		const sqlPromise = (await initSqlJs((file: string) => `/${file}`)) as any
		const dataPromise = fetch('/cards.db').then(res => res.arrayBuffer())
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		this.db = new SQL.Database(new Uint8Array(buf))
	}

	getSets(): MTGSet[] {
		return this.exec`SELECT * FROM "set"`
	}

	getSetCards(setId: string): MTGCard[] {
		return this.exec`SELECT card.*, "set".code AS set_code FROM card JOIN "set" ON card.set_id = "set".id WHERE set_id = ${setId}`
	}

	private exec<T>(queryTemplate: TemplateStringsArray, ...queryArguments: SqlValue[]): T[] {
		const query = queryTemplate.reduce((prev, curr, i) => prev + '$' + (i - 1) + curr)
		const args = queryArguments.reduce((prev, curr, i) => {
			prev['$' + i] = curr

			return prev
		}, {} as ParamsObject)

		const stmt = this.db.prepare(query)
		const results = []
		stmt.bind(args)

		while (stmt.step()) {
			results.push(stmt.getAsObject())
		}

		stmt.free()

		return results as T[]
	}
}

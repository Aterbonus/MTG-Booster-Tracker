import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardService {

	constructor(private prisma: PrismaService) {}

	async findMany(setId: string) {
		const cards = await this.prisma.card.findMany({
			where: {
				set_id: setId
			},
			take: 1000
		})

		cards.sort((a, b) => +a.collector_number.replace(/[\D]/g, '') - +b.collector_number.replace(/[\D]/g, ''))

		return cards
	}

}

import { Controller, Get, Query } from '@nestjs/common'
import { CardService } from './card.service'
import { FindManyCardDto } from './dtos/findManyCard.dto'

@Controller('cards')
export class CardController {
	constructor(private cardService: CardService) {}

	@Get()
	async findMany(@Query() findManyCardDto: FindManyCardDto) {
		return this.cardService.findMany(findManyCardDto)
	}
}

import { Controller, Get, Query } from '@nestjs/common'
import { CardService } from './card.service';

@Controller('cards')
export class CardController {

	constructor(private cardService: CardService) {}

	@Get()
	async findMany(@Query('set-id') setId?: string) {
		return this.cardService.findMany(setId)
	}

}

import { Controller, Get } from '@nestjs/common'
import { SetService } from './set.service'

@Controller('sets')
export class SetController {
	constructor(private setService: SetService) {}

	@Get()
	async findMany() {
		return this.setService.findMany()
	}
}

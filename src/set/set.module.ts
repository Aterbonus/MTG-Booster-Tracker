import { Module } from '@nestjs/common'
import { SetController } from './set.controller'
import { SetService } from './set.service'

@Module({
	controllers: [SetController],
	providers: [SetService]
})
export class SetModule {}

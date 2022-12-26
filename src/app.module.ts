import { Module } from '@nestjs/common'
import { CardModule } from './card/card.module'
import { PrismaModule } from './prisma/prisma.module'
import { SetModule } from './set/set.module'

@Module({
	imports: [CardModule, PrismaModule, SetModule]
})
export class AppModule {}

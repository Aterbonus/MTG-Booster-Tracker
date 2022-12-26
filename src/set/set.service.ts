import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SetService {
	constructor(private prisma: PrismaService) {}

	async findMany() {
		return this.prisma.set.findMany({
			orderBy: {
				released_at: 'desc'
			}
		})
	}
}

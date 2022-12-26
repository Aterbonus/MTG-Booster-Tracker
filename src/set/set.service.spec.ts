import { Test, TestingModule } from '@nestjs/testing'
import { SetService } from './set.service'

describe('SetService', () => {
	let service: SetService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SetService]
		}).compile()

		service = module.get<SetService>(SetService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})

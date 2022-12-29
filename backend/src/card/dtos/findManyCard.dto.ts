import { IsOptional, IsUUID } from 'class-validator'

export class FindManyCardDto {
	@IsOptional()
	@IsUUID()
	setId: string
}

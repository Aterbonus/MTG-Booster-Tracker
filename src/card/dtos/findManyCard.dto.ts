import { IsUUID } from 'class-validator';

export class FindManyCardDto {
	@IsUUID()
	setId: string
}
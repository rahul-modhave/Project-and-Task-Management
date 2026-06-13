import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ViewProjectDto {
    @IsString({ message: 'Project ID must be a string' })
    @IsNotEmpty({ message: 'Project ID is required' })
    @IsMongoId({ message: 'Project ID must be a valid MongoDB ObjectId' })
    projectId: string;
}

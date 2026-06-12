import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @IsOptional()
    @IsString({ message: 'Avatar must be a string' })
    avatar?: string;

    @IsOptional()
    @IsBoolean({ message: 'isVerified must be a boolean' })
    isVerified?: boolean;
}

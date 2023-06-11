import { IsNotEmpty } from 'class-validator';

export class musicDto {
    @IsNotEmpty({ message: 'mid不能为空' })
    mid: number;
}

import {IsNotEmpty, Length} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Length(2, 100)
  @IsNotEmpty()
  public name: string;

  @Column({default: ''})
  public description: string;

  @Column()
  @IsNotEmpty()
  public category: string;

  @Column({default: 0})
  public amount: number;

  @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
  public price: number;

  @Column({default: false})
  public hasExpiryDate: boolean;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}

import {IsNotEmpty} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Product} from './Product';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @IsNotEmpty()
  public name: string;

  @ManyToOne(() => Product, {eager: true})
  public product: Product;

  @Column({default: 1})
  public amount: number;

  @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
  public totalPrice: number;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}

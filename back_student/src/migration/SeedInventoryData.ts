import {getRepository, MigrationInterface, QueryRunner} from 'typeorm';
import {Order} from '../entity/Order';
import {Product} from '../entity/Product';

export class SeedInventoryData1572547308078 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    const productRepository = getRepository(Product);
    const orderRepository = getRepository(Order);

    const products = [
      { name: 'Chocolate', description: 'This is Chocolate and it is Sweet', category: 'Sweet', amount: 10, price: 4, hasExpiryDate: true },
      { name: 'Apple', description: 'This is Apple and it is healthy', category: 'Fruit', amount: 5, price: 2, hasExpiryDate: true },
      { name: 'Straw', description: 'This is Straw and you can use it for your drink', category: 'Kitchen', amount: 100, price: 1, hasExpiryDate: false },
      { name: 'Spoon', description: 'This is Spoon and it is useful while eating', category: 'Kitchen', amount: 3, price: 2, hasExpiryDate: false },
      { name: 'Sugar', description: 'This is Sugar and it is to make your life sweet', category: 'Sweet', amount: 15, price: 5, hasExpiryDate: true },
    ];

    const savedProducts = [];
    for (const p of products) {
      const product = new Product();
      product.name = p.name;
      product.description = p.description;
      product.category = p.category;
      product.amount = p.amount;
      product.price = p.price;
      product.hasExpiryDate = p.hasExpiryDate;
      savedProducts.push(await productRepository.save(product));
    }

    const apple = savedProducts.find(p => p.name === 'Apple');
    const straw = savedProducts.find(p => p.name === 'Straw');

    const order1 = new Order();
    order1.name = 'Apple order';
    order1.product = apple;
    order1.amount = 12;
    order1.totalPrice = apple.price * 12;
    await orderRepository.save(order1);

    const order2 = new Order();
    order2.name = 'Straw order';
    order2.product = straw;
    order2.amount = 7;
    order2.totalPrice = straw.price * 7;
    await orderRepository.save(order2);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DELETE FROM `order`');
    await queryRunner.query('DELETE FROM `product`');
  }
}

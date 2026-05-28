import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Order} from '../entity/Order';
import {Product} from '../entity/Product';

class OrderController {

  public static listAll = async (req: Request, res: Response) => {
    const orderRepository = getRepository(Order);
    const orders = await orderRepository.find({relations: ['product']});
    res.send(orders);
  };

  public static getOneById = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    const orderRepository = getRepository(Order);
    try {
      const order = await orderRepository.findOneOrFail(id, {
        relations: ['product'],
      });
      res.status(200).send(order);
    } catch (error) {
      res.status(404).send('Order not found');
    }
  };

  public static newOrder = async (req: Request, res: Response) => {
    const {name, productId, amount} = req.body;

    // Find the product
    const productRepository = getRepository(Product);
    let product;
    try {
      product = await productRepository.findOneOrFail(productId);
    } catch (error) {
      res.status(404).send('Product not found');
      return;
    }

    const order = new Order();
    order.name = name;
    order.product = product;
    order.amount = amount || 1;
    order.totalPrice = Number(product.price) * Number(amount || 1);

    const errors = await validate(order);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    const orderRepository = getRepository(Order);
    try {
      await orderRepository.save(order);
    } catch (e) {
      res.status(500).send('Error creating order');
      return;
    }
    res.status(201).send('Order created');
  };

  public static editOrder = async (req: Request, res: Response) => {
    const id = req.params.id;
    const {name, productId, amount} = req.body;

    const orderRepository = getRepository(Order);
    let order;
    try {
      order = await orderRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('Order not found');
      return;
    }

    if (productId) {
      const productRepository = getRepository(Product);
      try {
        const product = await productRepository.findOneOrFail(productId);
        order.product = product;
        order.totalPrice = Number(product.price) * Number(amount || order.amount);
      } catch (error) {
        res.status(404).send('Product not found');
        return;
      }
    }

    order.name = name;
    order.amount = amount;

    const errors = await validate(order);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await orderRepository.save(order);
    } catch (e) {
      res.status(500).send('Error updating order');
      return;
    }
    res.status(204).send();
  };

  public static deleteOrder = async (req: Request, res: Response) => {
    const id = req.params.id;
    const orderRepository = getRepository(Order);
    try {
      await orderRepository.findOneOrFail(id);
      await orderRepository.delete(id);
    } catch (error) {
      res.status(404).send('Order not found');
      return;
    }
    res.status(204).send();
  };

  public static getStats = async (req: Request, res: Response) => {
    const orderRepository = getRepository(Order);
    const orders = await orderRepository.find({relations: ['product']});
    const totalSales = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
    res.status(200).send({
      orderCount: orders.length,
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
    });
  };
}

export default OrderController;

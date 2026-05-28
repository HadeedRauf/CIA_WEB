import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Product} from '../entity/Product';

class ProductController {

  public static listAll = async (req: Request, res: Response) => {
    const productRepository = getRepository(Product);
    const products = await productRepository.find();
    res.send(products);
  };

  public static getOneById = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    const productRepository = getRepository(Product);
    try {
      const product = await productRepository.findOneOrFail(id);
      res.status(200).send(product);
    } catch (error) {
      res.status(404).send('Product not found');
    }
  };

  public static newProduct = async (req: Request, res: Response) => {
    const {name, category, amount, price} = req.body;
    const product = new Product();
    product.name = name;
    product.category = category;
    product.amount = amount || 0;
    product.price = price || 0;

    const errors = await validate(product);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    const productRepository = getRepository(Product);
    try {
      await productRepository.save(product);
    } catch (e) {
      res.status(409).send('Product name already in use');
      return;
    }
    res.status(201).send('Product created');
  };

  public static editProduct = async (req: Request, res: Response) => {
    const id = req.params.id;
    const {name, category, amount, price} = req.body;

    const productRepository = getRepository(Product);
    let product;
    try {
      product = await productRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('Product not found');
      return;
    }

    product.name = name;
    product.category = category;
    product.amount = amount;
    product.price = price;

    const errors = await validate(product);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await productRepository.save(product);
    } catch (e) {
      res.status(409).send('Product name already in use');
      return;
    }
    res.status(204).send();
  };

  public static deleteProduct = async (req: Request, res: Response) => {
    const id = req.params.id;
    const productRepository = getRepository(Product);
    try {
      await productRepository.findOneOrFail(id);
      await productRepository.delete(id);
    } catch (error) {
      res.status(404).send('Product not found');
      return;
    }
    res.status(204).send();
  };

  public static getStats = async (req: Request, res: Response) => {
    const productRepository = getRepository(Product);
    const products = await productRepository.find();
    const totalAmount = products.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalValue = products.reduce((sum, p) => sum + Number(p.price) * Number(p.amount), 0);
    res.status(200).send({
      productCount: products.length,
      totalAmount,
      totalValue: totalValue.toFixed(2),
    });
  };
}

export default ProductController;

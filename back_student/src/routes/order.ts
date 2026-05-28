import {Router} from 'express';
import OrderController from '../controller/OrderController';
import {checkJwt} from '../middlewares/checkJwt';
import {checkRole} from '../middlewares/checkRole';

const router = Router();

// Get all orders — admin only
router.get('/', [checkJwt, checkRole(['ADMIN'])], OrderController.listAll);

// Get order stats — admin only
router.get('/stats', [checkJwt, checkRole(['ADMIN'])], OrderController.getStats);

// Get one order — admin only
router.get('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], OrderController.getOneById);

// Create a new order — authenticated users
router.post('/', [checkJwt], OrderController.newOrder);

// Edit an order — admin only
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], OrderController.editOrder);

// Delete an order — admin only
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], OrderController.deleteOrder);

export default router;

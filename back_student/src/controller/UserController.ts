import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {getRepository} from 'typeorm';

import {User} from '../entity/User';

class UserController {
  public static listAll = async (req: Request, res: Response) => {
    // Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
    });

    // Send the users object
    res.send(users);
  };

  public static getOneById = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id: number = parseInt(req.params.id, 10);

    // Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, {
        select: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
      });
      res.status(200).send(user);
    } catch (error) {
      res.status(404).send('User not found');
    }
  };

  public static newUser = async (req: Request, res: Response) => {
    // Get parameters from the body
    const {username, password, role} = req.body;
    const user = new User();
    user.username = username;
    user.password = password;
    if (role !== 'NORMAL' && role !== 'ADMIN') {
      res.status(400).send('Provide role is unknown.');
      return;
    }
    user.role = role;

    // Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Hash the password, to securely store on DB
    user.hashPassword();

    // Try to save. If fails, the username is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }

    // If all ok, send 201 response
    res.status(201).send('User created');
  };

  public static editUser = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id = req.params.id;

    // Get values from the body
    const {username, role} = req.body;

    // Try to find user on database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      // If not found, send a 404 response
      res.status(404).send('User not found');
      return;
    }

    // Prevent removing admin role from the last admin account.
    if (user.role === 'ADMIN' && role === 'NORMAL') {
      const adminCount = await userRepository.count({where: {role: 'ADMIN'}});
      if (adminCount <= 1) {
        res.status(400).send('Cannot revert the last admin');
        return;
      }
    }

    // Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, that means username already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  public static deleteUser = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.findOneOrFail(id);
      await userRepository.delete(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }

    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default UserController;

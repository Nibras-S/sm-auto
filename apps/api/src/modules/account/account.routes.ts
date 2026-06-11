import { Router } from 'express';
import { authenticate, requireCustomer } from '../../middleware/auth';
import * as c from './account.controller';

export const accountRouter = Router();
accountRouter.use(authenticate, requireCustomer);

accountRouter.get('/profile', c.getProfile);
accountRouter.patch('/profile', c.updateProfile);

accountRouter.get('/addresses', c.listAddresses);
accountRouter.post('/addresses', c.addAddress);
accountRouter.patch('/addresses/:id', c.updateAddress);
accountRouter.delete('/addresses/:id', c.removeAddress);

accountRouter.get('/vehicles', c.listVehicles);
accountRouter.post('/vehicles', c.addVehicle);
accountRouter.patch('/vehicles/:id', c.updateVehicle);
accountRouter.delete('/vehicles/:id', c.removeVehicle);

accountRouter.get('/wishlist', c.getWishlist);
accountRouter.post('/wishlist', c.addWishlist);
accountRouter.post('/wishlist/merge', c.mergeWishlist);
accountRouter.delete('/wishlist/:slug', c.removeWishlist);

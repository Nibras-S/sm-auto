import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { signUpload } from './uploads.controller';

export const uploadsRouter = Router();

// Any authenticated staff member can request an upload signature; the actual
// writes that persist image references are permission-gated on their resource.
uploadsRouter.post('/sign', authenticate, requireAdmin, signUpload);

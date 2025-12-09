import { Router } from 'express';
import { register, login } from '../controllers/auth';

console.log('Auth Router Init:');
console.log('register is:', typeof register);
console.log('login is:', typeof login);

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;

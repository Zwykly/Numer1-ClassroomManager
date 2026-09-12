import type { App } from '../../../backend/app/src/index' 
import { treaty } from '@elysiajs/eden';

const eden = treaty<App>('http://localhost:3000');

export default eden;
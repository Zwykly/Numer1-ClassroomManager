import type { App } from '../../../backend/app/src/index' 
import { treaty } from '@elysiajs/eden';
import { API_URL } from './api-url';

const eden = treaty<App>(API_URL, {
    fetch: {
        credentials: 'include',
    },
});

export default eden;
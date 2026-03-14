import { ensure } from './ensure.js';
import { deprecated } from './objects/index.js';

/**
 * @desc This function has been deprecated. Please use {@link ensure} instead
 * @deprecated
 */
export const check = deprecated('Please use `ensure` instead')(ensure);

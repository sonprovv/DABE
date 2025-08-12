const Joi = require('joi');

const UserModel = Joi.object({
  uid: Joi.string().required(),
  username: Joi.string().required(),
  avatar: Joi.string().default('https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png'),
  background: Joi.string().default('https://res.cloudinary.com/dvofgx21o/image/upload/v1754337920/jobs/pnjgsgpqjwenorbmqsqj.jpg'),
  email: Joi.string().email().required(),
  tel: Joi.string().min(10).default('No updated'),
  location: Joi.string().default('No updated'),
  role: Joi.string().valid('admin', 'worker', 'viewer').required(),

  // role: viewer
  gender: Joi.alternatives().conditional('role', {
    is: 'viewer',
    then: Joi.string().valid('Male', 'Female', 'Other').default('Male'),
    otherwise: Joi.forbidden()
  }),

  dob: Joi.alternatives().conditional('role', {
    is: 'viewer',
    then: Joi.date().default(() => new Date('1990-01-01')),
    otherwise: Joi.forbidden()
  }),

  // role: worker
  offical: Joi.alternatives().conditional('role', {
    is: 'worker',
    then: Joi.boolean().default(false),
    otherwise: Joi.forbidden()
  }),

  createdAt: Joi.alternatives().conditional('role', {
    is: 'worker',
    then: Joi.date().default(() => new Date()),
    otherwise: Joi.forbidden()
  }),
  
  description: Joi.alternatives().conditional('role', {
    is: 'worker',
    then: Joi.string().default('No updated'),
    otherwise: Joi.forbidden()
  })
});

module.exports = UserModel;
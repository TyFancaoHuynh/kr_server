const Joi = require('joi');
const moment = require('moment');

const now = Date.now();
const cutoffDate = new Date(now - (1000 * 60 * 60 * 24 * 365.25 * 18));

const customValidate = Joi.extend({
  base: Joi.string(),
  name: 'string',
  language: {
    errorMissingEmail: 'email is invalid',
    errorPass: 'password must not contains name or email',
    errorDate: '!!Your age is not enough 18 or birthday is not valid'
  },
  rules: [
    {
      name: 'customPassword',
      validate(params, value, state, options) {
        if (state.parent.email) {
          return ![state.parent.firstName, state.parent.lastName, state.parent.email.substring(0, state.parent.email.lastIndexOf('@'))].some(e => value.includes(e)) ? value : this.createError('string.errorPass', {}, state, options);
        }
        return this.createError('string.errorMissingEmail', {}, state, options);
      }
    },
    {
      name: 'customDate',
      validate(params, value, state, options) {
        const date = new Date(value);
        const dateToMs = Date.parse(date);
        return (dateToMs < cutoffDate && moment(value, 'YYYY-MM-DD', true).isValid()) ? value : this.createError('string.errorDate', {}, state, options);
      }
    }
  ]
});
const DateJoi = Joi.extend({
  base: Joi.string(),
  name: 'date',
  language: {
    diff: 'is invalid format',
    error: 'is not correct '
  },
  rules: [
    {
      name: 'customDay',
      validate(params, value, state, options) {
        if (moment(value, 'YYYY-MM-DD', true).isValid()) {
          return (Date.parse(state.parent.checkinAt) < Date.parse(state.parent.checkoutAt) ? value : this.createError('date.error', {}, state, options));
        }
        return this.createError('date.diff', {}, state, options);
      }
    }
  ]
});

module.exports = {
  // POST /users
  register: {
    body: {
      email: Joi.string().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        .trim()
        .required()
        .options({
          language: {
            string: { regex: { base: '!!Not a type of email' } }
          }
        }),
      password: customValidate.string()
        .regex(/^(?=.*[0-9!@#$%^&*])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/)
        .required().customPassword()
        .options({
          language: {
            string: { regex: { base: '!!Password is not right' } }
          }
        }),
      firstName: Joi.string().max(35).required(),
      lastName: Joi.string().max(35).required(),
      birthday: customValidate.string().required().customDate()
    }
  },
  // POST /auth
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  // POST /auth/forgot/email
  forgot: {
    body: {
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        .trim()
        .required()
        .options({
          language: {
            string: { regex: { base: '!!Not a type of email' } }
          }
        })
    }
  },
  // POST /auth/reset
  resetPassword: {
    body: {
      password: Joi.string()
        .regex(/^(?=.*[0-9!@#$%^&*])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/)
        .required()
        .options({
          language: {
            string: { regex: { base: '!!Password is not right' } }
          }
        })
    }
  },
  // POST roomtype
  createRoomType: {
    body: {
      name: Joi.string().required(),
      description: Joi.string().required()
    }
  },
  // UPDATE /roomtypes/:roomtypeId
  updateRoomType: {
    body: {
      name: Joi.string().required(),
      description: Joi.string().required()
    },
    params: {
      roomTypeId: Joi.number().required()
    }
  },
  // UPDATE /users/:userId
  updateUser: {
    body: {
      phone: Joi.string().optional()
    },
    params: {
      userId: Joi.number().required()
    }
  },
  // POST /rooms
  createRoom: {
    body: {
      name: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
      bedRoom: Joi.string().optional(),
      bathRoom: Joi.number().integer().optional(),
      bed: Joi.string().optional(),
      numberOfPeople: Joi.number().integer().optional(),
      checkinAt: Joi.string().optional(),
      checkoutAt: Joi.string().optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      street: Joi.string().trim().optional(),
      userId: Joi.number().integer().optional(),
      addressId: Joi.number().integer().optional(),
      roomTypeId: Joi.number().integer().optional(),
      price: Joi.array().items(Joi.object().keys({
        type: Joi.string().optional(),
        cost: Joi.number().optional(),
        fee: Joi.number().optional()
      })),
      roomAvailability: Joi.array().items(Joi.object().keys({
        from: Joi.date().optional(),
        to: Joi.date().optional()
      })),
      roomFacility: Joi.array().items(Joi.object().keys({
        facilityId: Joi.number().optional()
      }))
    }
  },
  // UPDATE /rooms/:roomId
  updateRoom: {
    body: {
      name: Joi.string().trim().max(50).optional(),
      description: Joi.string().trim().max(500).optional(),
      bedRoom: Joi.string().optional(),
      bathRoom: Joi.number().integer().optional(),
      bedUse: Joi.number().integer().optional(),
      bed: Joi.string().optional(),
      numberOfPeople: Joi.number().integer().optional(),
      checkinAt: Joi.string().optional(),
      checkoutAt: Joi.string().optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      street: Joi.string().trim().optional(),
      userId: Joi.number().integer().optional(),
      addressId: Joi.number().integer().optional(),
      roomTypeId: Joi.number().integer().optional(),
      rule: Joi.string().optional()
    },
    params: {
      roomId: Joi.number().required()
    }
  },

  // POST/facilities
  createFacility: {
    body: {
      value: Joi.string().trim().required(),
      description: Joi.string().trim().optional(),
      key: Joi.string().trim().required()
    }
  },

  // UPDATE/facilities/:facilityId
  updateFacility: {
    body: {
      value: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
      key: Joi.string().trim().optional()
    },
    params: {
      facilityId: Joi.number().required()
    }
  },

  // CREATE /bookings
  createBooking: {
    body: {
      checkinAt: DateJoi.date().required().customDay(),
      checkoutAt: DateJoi.date().required().customDay(),
      numberOfPeople: Joi.number().integer().required(),
      userName: Joi.string().trim().required(),
      email: Joi.string().trim().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        .required()
        .options({
          language: {
            string: { regex: { base: '!!Not a type of email' } }
          }
        }),
      country: Joi.string().required(),
      phoneNumber: Joi.string().regex(/([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/).required()
        .options({
          language: {
            string: { regex: { base: 'Please enter a valid phone number ' } }
          }
        }),
      note: Joi.string().optional()
    }
  },
  // CREATE /price
  createPrice: {
    body: {
      type: Joi.string().optional(),
      cost: Joi.number().optional(),
      fee: Joi.number().optional(),
    }
  },
  updatePrice: {
    body: {
      type: Joi.string().optional(),
      cost: Joi.number().optional(),
      fee: Joi.number().optional()
    },
    params: {
      priceId: Joi.number().required()
    }
  },

  // CREATE /address
  createAddress: {
    body: {
      town: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
      zipCode: Joi.string().trim().optional()
    }
  },
  updateAddress: {
    body: {
      town: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
      zipCode: Joi.string().trim().optional()
    },
    params: {
      addressId: Joi.number().required()
    }
  },
  // Admin Destination
  createDestination: {
    body: {
      name: Joi.string().trim().required(),
      description: Joi.string().required(),
      image: Joi.string().required()
    }
  },
  updateDestination: {
    body: {
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      image: Joi.string().optional()
    },
    params: {
      destinationId: Joi.number().required()
    }
  }
};

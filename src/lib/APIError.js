const HttpStatus = require('http-status');

/**
 * Class representing an API error.
 * @extends Error
 */
class APIError {
  /**
   * Creates an API error.
   * @param {number} status - HTTP status code of error.
   * @param {string} message - Custom error message.
   */
  constructor(status = HttpStatus.INTERNAL_SERVER_ERROR, message) {
    this.status = status;
    this.message = message;
  }
}

module.exports = APIError;

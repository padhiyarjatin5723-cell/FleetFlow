class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
  
      this.success = false;
      this.statusCode = statusCode;
    }
  }
  
  export default ApiError;
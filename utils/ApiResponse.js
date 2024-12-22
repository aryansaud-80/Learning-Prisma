class ApiResponse {
  constructor(statusCode, message = 'Successfully fetched data', data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };

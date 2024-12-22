const option = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
};

export { option };

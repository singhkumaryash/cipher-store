const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error),
    );
  };
};

export { asyncHandler };

// We need asyncHandler because Express cannot catch errors inside async/await
// controllers, so this wrapper forwards errors safely to the error middleware.

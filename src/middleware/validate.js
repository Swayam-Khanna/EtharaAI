const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation Error',
      errors: formattedErrors
    });
  }
};

module.exports = validate;

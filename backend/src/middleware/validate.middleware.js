const validate = (schema) => {
    return (req, res, next) => {
      try {
        const payload = {
          body: req.body,
          params: req.params,
          query: req.query,
        };

        const result = schema.safeParse(payload);

        if (result.success) {
          req.body = result.data.body ?? req.body;
          req.params = result.data.params ?? req.params;
          req.query = result.data.query ?? req.query;
          return next();
        }

        const bodyResult = schema.safeParse(req.body);

        if (bodyResult.success) {
          req.body = bodyResult.data;
          return next();
        }
  
        return res.status(400).json({
          success: false,
          message: result.error.issues || result.error.message,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.issues || error.errors || error.message,
        });
      }
    };
  };
  
  export default validate;

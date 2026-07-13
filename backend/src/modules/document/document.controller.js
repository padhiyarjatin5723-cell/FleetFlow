import * as service from "./document.service.js";

export const createDocument = async (req, res, next) => {
  try {
    const document = await service.createDocument(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Document created successfully",
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await service.getAllDocuments();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Documents fetched successfully",
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await service.getDocumentById(req.params.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Document fetched successfully",
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const document = await service.updateDocument(req.params.id, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Document updated successfully",
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    await service.deleteDocument(req.params.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Document deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
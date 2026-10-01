const Code = require('../models/Code');
const { executeCode } = require('../services/pistonService');

const compileCode = async (req, res, next) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || code === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both language and source code',
      });
    }

    const result = await executeCode(language, code, stdin || '');

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};

const saveCode = async (req, res, next) => {
  try {
    const { codeId, title, language, code, roomId } = req.body;

    if (codeId) {
      let existingCode = await Code.findById(codeId);

      if (!existingCode) {
        return res.status(404).json({
          success: false,
          message: 'Code snippet not found',
        });
      }

      if (existingCode.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this code snippet',
        });
      }

      existingCode.title = title || existingCode.title;
      existingCode.language = language || existingCode.language;
      existingCode.code = code !== undefined ? code : existingCode.code;
      existingCode.roomId = roomId !== undefined ? roomId : existingCode.roomId;

      const updatedCode = await existingCode.save();

      return res.status(200).json({
        success: true,
        message: 'Workspace updated successfully',
        data: updatedCode,
      });
    }

    const newCode = await Code.create({
      title: title || 'Untitled Workspace',
      language: language || 'cpp',
      code: code || '',
      roomId: roomId || null,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Workspace saved successfully',
      data: newCode,
    });
  } catch (error) {
    next(error);
  }
};

const getUserCodes = async (req, res, next) => {
  try {
    const codes = await Code.find({ owner: req.user.id }).sort({
      updatedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: codes.length,
      data: codes,
    });
  } catch (error) {
    next(error);
  }
};

const getCodeById = async (req, res, next) => {
  try {
    const codeSnippet = await Code.findById(req.params.id);

    if (!codeSnippet) {
      return res.status(404).json({
        success: false,
        message: 'Code snippet not found',
      });
    }

    if (codeSnippet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this code snippet',
      });
    }

    res.status(200).json({
      success: true,
      data: codeSnippet,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCode = async (req, res, next) => {
  try {
    const codeSnippet = await Code.findById(req.params.id);

    if (!codeSnippet) {
      return res.status(404).json({
        success: false,
        message: 'Code snippet not found',
      });
    }

    if (codeSnippet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this code snippet',
      });
    }

    await codeSnippet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  compileCode,
  saveCode,
  getUserCodes,
  getCodeById,
  deleteCode,
};
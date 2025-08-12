const { CategoryModel, CategoryModelWithUID } = require("../models/CategoryModel");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const CategoryService = require("../services/CategoryService");

const createCategory = async (req, res) => {
    try {
        const rawData = req.body;

        const validated = await CategoryModel.validateAsync(rawData, { stripUnknown: true });
        await CategoryService.createCategory(validated);

        return successResponse(res, 200, 'Created successfully');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const getCategories = async (req, res) => {
    try {
        const categories = await CategoryService.getCategories();

        return successDataResponse(res, 400, categories, 'categories');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const updateCategory = async (req, res) => {
    try {
        const rawData = req.body;

        const validated = await CategoryModelWithUID.validateAsync(rawData, { stripUnknown: true });
        const updatedCategory = await CategoryService.updateCategory(validated);

        return successDataResponse(res, 200, updatedCategory, 'category');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { categoryUID } = req.body;

        await CategoryService.deleteCategory(categoryUID);

        return successResponse(res, 200, 'Deleted category successfully');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
}
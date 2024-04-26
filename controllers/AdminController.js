import Admin from '../models/AdminModel.js';
import { ethers } from 'ethers';

// Create new admin
export const createAdmin = async (req, res) => {
    try {
        if (ethers.isAddress(req.body.contract) === false || ethers.isAddress(req.body.address) === false) {
            res.status(401).json({ 
                success: false, 
                message: 'Contract or Admin address is not valid.'
            });
        } else {
            const admin = new Admin({
                contract: req.body.contract,
                address: req.body.address,
            });

            await admin.save();

            res.status(200).send({
                success: true,
                message: 'Admin address is registered successfully.'
            });
        }
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Delete admin
export const deleteAdmin = async (req, res) => {
    try {
        const result = await Admin.find({
            contract: req.body.contract,
            address: req.body.address,
        });

        if (result.length) {
            const admin = result[0];

            await admin.deleteOne();

            res.status(200).json({
                success: true,
                message: 'The admin is removed successfully.'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Cannot find out the admin.'
            });
        }
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Retrieve all admin
export const getAllAdmin = async (req, res) => {
    try {
        const result = await Admin.find({
            contract: req.params.id,
        });

        if (result.length) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(200).json({
                success: false,
                data: []
            });
        }
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Check admin info
export const getAdminOne = async (req, res) => {
    try {
        const result = await Admin.find({
            contract: req.body.contract,
            address: req.body.address,
        });

        if (result.length) {
            const admin = result[0];
            res.status(200).json({
                success: true,
                address: admin.address,
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Cannot find out the admin.'
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message 
        });
    }
};
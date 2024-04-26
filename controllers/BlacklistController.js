import Blacklist from '../models/BlacklistModel.js';
import { ethers } from 'ethers';

// Create new blacklist
export const createBlacklist = async (req, res) => {
    try {
        if (ethers.isAddress(req.body.address) === false) {
            res.status(401).json({ 
                success: false, 
                message: 'Blacklist address is not valid.'
            });
        } else {
            const blacklist = new Blacklist({
                address: req.body.address.toLowerCase(),
            });

            await blacklist.save();

            res.status(200).send({
                success: true,
                message: 'Blacklist address is registered successfully.'
            });
        }
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Delete blacklist
export const deleteBlacklist = async (req, res) => {
    try {
        const result = await Blacklist.find({
            address: req.body.address.toLowerCase(),
        });

        if (result.length) {
            const blacklist = result[0];

            await blacklist.deleteOne();

            res.status(200).json({
                success: true,
                message: 'The blacklist is removed successfully.'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Cannot find out the blacklist.'
            });
        }
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Retrieve all blacklist
export const getAllBlacklist = async (req, res) => {
    try {
        const result = await Blacklist.find();

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

// Find blacklist info
export const getBlacklistOne = async (req, res) => {
    try {
        const result = await Blacklist.find({
            address: req.body.address.toLowerCase(),
        });

        if (result.length) {
            const blacklist = result[0];
            res.status(200).json({
                success: true,
                address: blacklist.address,
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Cannot find out the blacklist.'
            });
        }
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};
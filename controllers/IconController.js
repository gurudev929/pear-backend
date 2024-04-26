import Icon from '../models/IconModel.js';
import { ethers } from 'ethers';
import fetch from 'node-fetch';

const checkImageUrl = async (imageUrl) => {
    try {        
        const response = await fetch(imageUrl, {headers: {}});
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

// Create new icon
export const createIcon = async (req, res) => {
    try {
        if (ethers.isAddress(req.body.address) === false) {
            res.status(401).json({ 
                success: false, 
                message: 'Token address is not valid.'
            });
        } else {
            const isIconValid = await checkImageUrl(req.body.url);
            if (!isIconValid) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Token icon url is not valid.'
                });
            } else {
                const icon = new Icon({
                    address: req.body.address.toString().toLowerCase(),
                    url: req.body.url,
                });

                await icon.save();

                res.status(200).send({
                    success: true,
                    message: 'The icon is registered successfully.',
                });
            }
        }
    } catch (error) {
        console.error(error.message);

        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
}


// Get icon info
export const getIcon = async (req, res) => {
    try {
        const result = await Icon.find({
            address: req.params.id.toString().toLowerCase()
        });

        if (result.length) {
            const icon = result[0];
            res.status(200).json({
                success: true,
                url: icon.url,
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Cannot find out the icon.'
            });
        }
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};
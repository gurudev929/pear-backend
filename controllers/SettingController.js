import Setting from '../models/SettingModel.js';

// Retrieve setting value
export const getSettingValue = async (req, res) => {
    try {
        const result = await Setting.find({
            contract: req.body.contract,
            name: req.body.setting,
        });

        if (result.length > 0) {
            res.status(200).json({
                success: true,
                data: result[0].value
            });
        } else {
            if (req.body.setting === 'reward_threshold') {
                const setting = new Setting({
                    contract: req.body.contract,
                    name: 'reward_threshold',
                    value: process.env.REWARD_THRESHOLD
                });
    
                await setting.save();
    
                res.status(200).send({
                    success: true,
                    data: setting.value,
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: null,
                });
            }
        }
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update setting value
export const setSettingValue = async (req, res) => {
    try {
        const result = await Setting.find({
            contract: req.body.contract,
            name: req.body.setting,
        });

        if (result.length > 0) {
            await Setting.updateOne(
                {
                    contract: req.body.contract,
                    name: req.body.setting
                },
                { 
                    $set: {
                        value: req.body.value
                    } 
                }, 
            );

            res.status(200).json({
                success: true,
                message: 'The setting is updated successfully.'
            });
        } else {
            if (req.body.setting === 'reward_threshold') {
                const setting = new Setting({
                    contract: req.body.contract,
                    name: 'reward_threshold',
                    value: req.body.value,
                });
    
                await setting.save();
    
                res.status(200).send({
                    success: true,
                    message: 'The setting is updated successfully.'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Cannot find out the setting.'
                });
            }
        }
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};
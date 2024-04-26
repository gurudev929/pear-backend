import Hash from '../models/HashModel.js';
import { genRandomString } from '../utils/Util.js';

// Create new hash
export const createHash = async (req, res) => {
  try {
    if (req.body.pool_id < 0) {
      res.status(400).send({
        success: false,
        message: 'Content can not be negative!' 
      });
    }

    const hash = new Hash({
      contract: req.body.contract,
      creator: req.body.creator,
      hash_value: genRandomString(12),
      pool_id: req.body.pool_id,
    });

    await hash.save();

    res.status(200).send({
      success: true,
      message: 'Hash value created successfully!!',
      hash: hash,
    });
  } catch (error) {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    log.Error(ip + ': ' + (error.message || 'Some error occurred while creating hash') + req.body);

    res.status(500).send({
      success: false,
      message: error.message || 'Some error occurred while creating hash',
    });
  }
};

// Retrieve all hash
export const getAllHash = async (req, res) => {
  try {
    const response = await Hash.find();
    res.status(200).json(
      response
    );
  } catch (error) {
    res.status(400).json({ 
      message: error.message 
    });
  }
};

// Retrieve pool index from hash
export const findPoolFromHash = async (req, res) => {
  try {
    const result = await Hash.find({
      hash_value: req.params.id 
    });

    if (result.length) {
      res.status(200).json({ 
        success: true,
        pool_id: result[0].pool_id 
      });
    } else {
      res.status(200).json({ 
        success: false,
        pool_id: null 
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const findHashFromPool = async (req, res) => {
  try {
    const result = await Hash.find({ 
      contract: req.body.contract,
      creator: req.body.creator,
      pool_id: req.params.id
    });

    if (result.length) {
      res.status(200).json({
        success: true,
        hash: result[0].hash_value
      });
    } else {
      res.status(200).json({
        success: false,
        hash: null
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

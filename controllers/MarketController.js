import dotenv from 'dotenv';
import api from 'api';
import { ethers, AlchemyProvider } from 'ethers';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import Blacklist from '../models/BlacklistModel.js';
import Setting from '../models/SettingModel.js';

import Log from 'node-file-logger';

import { marketAbi } from '../config/abi/market.js';
import { pearAbi } from '../config/abi/pear.js';

dotenv.config();

// Provider
const provider = new AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY);

// Signer
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract
const marketContract = new ethers.Contract(
    process.env.MARKET_CONTRACT_ADDRESS, 
    marketAbi,
    signer);

const pearContract = new ethers.Contract(
    process.env.PEAR_CONTRACT_ADDRESS, 
    pearAbi,
    signer);

const chainbase_sdk = new api('@chainbase/v1.0#2hsmm26liym3825');

const getTopHolderList = async () => {
    try {
        // get top 100 holders of PEAR token in mainnet by using chainbase API
        const response = await chainbase_sdk.getTopTokenHolders({
            chain_id: 1,
            contract_address: process.env.PEAR_CONTRACT_ADDRESS,
            page: 1,
            limit: 100,
            'x-api-key': process.env.CHAINBASE_API_KEY
        });
        if (response.data.code !== 0 || response.data.message !== 'ok') {
            return null;
        } else {
            return response.data.data;
        }
    } catch (error) {
        console.error(error.message);
        Log.Error(error.message);

        return null;
    }
}

const getHolderRate = async (holder_addr) => {
    try {
        var date = new Date(new Date().setDate(new Date().getDate() - 30));
        var fetch_start_timestamp = parseInt(date.getTime() / 1000);

        const response = await chainbase_sdk.getTokenTransfers({
            chain_id: 1,
            contract_address: process.env.PEAR_CONTRACT_ADDRESS,
            address: holder_addr,
            from_timestamp: fetch_start_timestamp,
            page: 1,
            limit: 100,
            'x-api-key': process.env.CHAINBASE_API_KEY
        });

        if (response.data.code !== 0 || response.data.message !== 'ok') {
            return null;
        }

        var current_timestamp = new Date().getTime();
        var current_balance = await pearContract.balanceOf(holder_addr);
        current_balance = parseFloat(ethers.formatEther(current_balance));
        var block_balance = current_balance;

        var rate_value = 0;

        response.data.data.forEach(trans => {
            var value = parseFloat(ethers.formatEther(trans.value));
            var block_timestamp = new Date(trans.block_timestamp).getTime();
            var date_diff = Math.round((current_timestamp - block_timestamp) / (1000 * 60 * 60 * 24));
            if (holder_addr.toLowerCase() === trans.to_address.toLowerCase()) {
                rate_value += (value * date_diff);
                block_balance -= value;
            } else {
                rate_value -= (value * date_diff);
                block_balance += value;
            }
        });
        rate_value += block_balance * 30;
        return rate_value;
    } catch (error) {
        Log.Error(error.message);
        return null;
    }
}

const getHolderListWithRate = async () => {
    try {
        const holder_list = await getTopHolderList();
        if (holder_list === null || holder_list.length === 0) {
            Log.Error('Error! getTopHolderList failed.');
            return null;
        } 

        var holder_count = 0;
        var holder_address_list = [];
        var holder_rate_list = [];

        for (var i=0; i<holder_list.length; i++) {
            var holder_addr = holder_list[i].wallet_address;

            const record = Blacklist.find({
                address: holder_addr
            });

            if (record.length === 0) {
                var holder_rate = await getHolderRate(holder_addr);

                if (holder_rate !== null) {
                    holder_address_list.push(holder_addr);
                    holder_rate_list.push(holder_rate);
                    holder_count += 1;

                    if (holder_count >= process.env.MAX_HOLDER_COUNT) {
                        return {
                            'count': holder_count,
                            'address': holder_address_list,
                            'rate': holder_rate_list,
                        };
                    }
                }
            }
        }

        return null;
    } catch (error) {
        Log.Error(error.message);
        return null;
    }
}

const distributeReward = async () => {
    try {
        const response = await getHolderListWithRate();

        Log.Info(response);

        if (response === null) {        
            Log.Error('Error! getHolderListWithRate failed.');
            return;
        }

        if (response.count === 0 || response.address.length === 0 ||
            response.rate.length === 0) {
            Log.Error('Error! getHolderListWithRate result is empty.');
            return;
        }

        if (response.count !== response.address.length || 
            response.count !== response.rate.length) {
            Log.Error('Error! getHolderListWithRate result is not match.');
            return;
        }

        await marketContract.distributeReward(
            response.address,
            response.rate
        );
    } catch (error) {
        Log.Error(error.message);
        return;
    }
}

export const checkRewardThreshold = async () => {
    try {
        const rewardSetting = await Setting.findOne({
            contract: process.env.MARKET_CONTRACT_ADDRESS, 
            name: 'reward_threshold'
        });

        const rewardThreshold = rewardSetting ? parseFloat(rewardSetting.value) 
            : parseFloat(process.env.REWARD_THRESHOLD);

        // get collected reward pool size from the contract
        var rewardCollected = await marketContract.rewardCollected();
        rewardCollected = ethers.formatEther(rewardCollected);

        // get ETH price from Moralis API
        const wEthContract = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        const response = await Moralis.EvmApi.token.getTokenPrice({
            address: wEthContract, 
            chain: EvmChain.ETHEREUM
        });
        const ethPrice = response?.result.usdPrice;

        const rewardPoolSize = rewardCollected * ethPrice;
        Log.Info('Reward => $' + rewardPoolSize);

        if (rewardPoolSize >= rewardThreshold) {
            Log.Info('Success! Reward threshold reached out!');

            const response = await distributeReward();
            Log.Info('Success! Reward distribution is completed.');
        }  
    } catch (error) {
        console.error(error);
        Log.Error(error.message);
    }
}

export const getTotalOfferCount = async (req, res) => {
    try {
        const totalOfferCount = await marketContract.totalOffers();
        res.status(200).json({ 
            total: totalOfferCount 
        });
    } catch (error) {
        res.status(400).json({ 
            message: error.message 
        });
    }
}

export const getPearTokenRanking = async (req, res) => {
    try {
        if (ethers.isAddress(req.body.address) === false) {
            res.status(401).json({ 
                success: false, 
                message: 'Wallet address is not valid.'
            });
        } else {
            const address = req.body.address;
            let response, page = 1, count = 0, rank = 0, isExist = false;
    
            while(true) {
                response = await chainbase_sdk.getTopTokenHolders({
                    chain_id: 1,
                    contract_address: '0x5dCD6272C3cbb250823F0b7e6C618bce11B21f90',
                    page: page,
                    limit: 100,
                    'x-api-key': process.env.CHAINBASE_API_KEY
                });
    
                count = response.data.count;
                for (let i=0; i<response.data.data.length; i++) {
                    rank += 1;
                    if (response.data.data[i].wallet_address === address.toLowerCase()) {
                        isExist = true;
                        break;
                    }
                }
    
                if (isExist) {
                    break;
                } else {
                    if (count === rank) {
                        break;
                    } else {
                        page = page + 1;
                    }
                }
            }

            if(isExist) {
                res.status(200).json({ 
                    success: true,
                    rank: rank 
                });
            } else {
                res.status(400).json({ 
                    success: false,
                    rank: null,
                    message: 'Cannot find out PEAR holding rank.'
                });
            }
        }
    } catch (error) {
        console.error(error.message);
        Log.Error(error.message);

        res.status(400).json({ 
            success: false,
            rank: null,
            message: error.message 
        });
    }
}

export const runDistributeReward = async (req, res) => {
    try {
        const addressList = req.body.address;
        const rateList = req.body.rate;

        if (addressList.length === 0 || rateList.length === 0) {
            Log.Error('Error! Input array cannot be empty.');

            res.status(400).json({
                success: false,
                message: 'Input array cannot be empty.'
            });
        } else if (addressList.length !== rateList.length) {
            Log.Error('Error! Input arrays are not matched.');

            res.status(400).json({
                success: false,
                message: 'Input arrays are not matched.'
            });
        } else {
            const response = await marketContract.distributeReward(
                addressList,
                rateList
            );

            console.log(response);

            const txReceipt = await provider.getTransaction(response.hash);

            console.log(txReceipt);

            Log.Info('Success! response => ' + response);

            res.status(200).json({
                success: true,
                message: 'Reward distribution is completed successfully.'
            });
        }
    } catch (error) {
        Log.Error(error.message);

        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

export const testTopHolders = async (req, res) => {
    try {
        Log.Info('testTopHolders result!');

        const holder_list = await getTopHolderList();

        const result_length = holder_list ? holder_list.length : 0;
        Log.Info(result_length);

        if (holder_list === null || holder_list.length === 0) {
            Log.Error('Error! getTopHolderList failed.');
            
            res.status(400).json({ 
                success: false,
                data: null,
            });
        } else {
            var holder_count = 0;
            var holder_address_list = [];
            var holder_rate_list = [];

            for (var i=0; i<holder_list.length; i++) {
                var holder_addr = holder_list[i].wallet_address;
                Log.Info('holder_addr => ' + holder_addr);

                const record = await Blacklist.find({
                    address: holder_addr
                });

                if (record.length === 0) {
                    var holder_rate = await getHolderRate(holder_addr);
                    Log.Info('holder_rate => ' + holder_rate);

                    if (holder_rate !== null) {
                        holder_address_list.push(holder_addr);
                        holder_rate_list.push(holder_rate);
                        holder_count += 1;

                        if (holder_count >= process.env.MAX_HOLDER_COUNT) {
                            break;
                        }
                    }
                }
            }

            res.status(200).json({ 
                success: true,
                data: {
                    'count': holder_count,
                    'address': holder_address_list,
                    'rate': holder_rate_list,
                }
            });
        }        
    } catch (error) {
        console.log(error);
        Log.Error(error.message);

        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}
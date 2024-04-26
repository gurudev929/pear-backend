import Moralis from 'moralis';
import cron from 'node-cron';
import { checkRewardThreshold } from '../controllers/MarketController.js';
import log from 'node-file-logger';

export const genRandomString = (length) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  var charLength = chars.length;
  var result = "";

  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }

  return result;
};

export const startMoralis = async () => {
  try {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  } catch (error) {
    log.Error('Could not start Moralis. ', error.message);
  }
};

export const startCronJob = async () => {
  try {
    cron.schedule('*/5 * * * *', async () => {
      console.log('Cron job for PEAR ...');
      await checkRewardThreshold();
    });
  } catch (error) {
    log.Error('Could not start cron job for PEAR. ', error.message);
  }
};

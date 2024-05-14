import { ethers } from 'hardhat';

export interface networkConfigItem {
  name?: string;
  subscriptionId?: string;
  gasLane?: string;
  interval?: string;
  entranceFee?: BigInt;
  callbackGasLimit?: string;
  vrfCoordinatorV2?: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: 'localhost',
    subscriptionId: '588',
    gasLane:
      '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae', // 30 gwei
    interval: '30',
    entranceFee: ethers.parseEther('0.01'),
    callbackGasLimit: '500000',
  },
  11155111: {
    name: 'sepolia',
    subscriptionId: '588',
    gasLane:
      '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae', // 30 gwei
    interval: '30',
    entranceFee: ethers.parseEther('0.01'),
    callbackGasLimit: '500000',
    vrfCoordinatorV2: '0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b',
  },
  1: {
    name: 'mainnet',
    interval: '30',
  },
};

export const developmentChains = ['hardhat', 'localhost'];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

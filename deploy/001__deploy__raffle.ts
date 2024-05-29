import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  networkConfigItem,
} from '../helper-hardhat-config';
import verify from '../utils/verify';

const FUND_AMOUNT = '1000000000000000000000';

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // const chainId = 31337
  let vrfCoordinatorV2Address: string | undefined,
    subscriptionId: string | undefined;

  const deploymentAddress = (await deployments.get('VRFCoordinatorV2Mock'))
    .address;
  const vrfCoordinatorV2Mock = await ethers.getContractAt(
    'VRFCoordinatorV2Mock',
    deploymentAddress
  );
  if (chainId == 31337) {
    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();
    const txResponse = await vrfCoordinatorV2Mock.createSubscription({
      from: deployer,
    });
    const txReceipt = await txResponse.wait();
    const logs = await txReceipt?.logs[0]!;

    if (logs && 'args' in logs) {
      subscriptionId = logs.args[0];
    }
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId!, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address =
      networkConfig[network.config.chainId!]['vrfCoordinatorV2'];
    subscriptionId = networkConfig[network.config.chainId!]['subscriptionId'];
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log('----------------------------------------------------');
  const args: any[] = [
    networkConfig[network.config.chainId!]['entranceFee'],
    vrfCoordinatorV2Address,
    networkConfig[network.config.chainId!]['gasLane'],
    subscriptionId,
    networkConfig[network.config.chainId!]['callbackGasLimit'],
    networkConfig[network.config.chainId!]['interval'],
  ];

  const raffle = await deploy('Raffle', {
    from: deployer,
    args: args!,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });
  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...');
    await verify(raffle.address, args);
  }
  if (chainId === 31337) {
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId!, raffle.address);
  }

  log('Run This Contract with command:');
  const networkName = network.name == 'hardhat' ? 'localhost' : network.name;
  log(`yarn hardhat run scripts/enterRaffle.ts --network ${networkName}`);
  log('----------------------------------------------------');
};
export default deployRaffle;
deployRaffle.tags = ['all', 'raffle'];

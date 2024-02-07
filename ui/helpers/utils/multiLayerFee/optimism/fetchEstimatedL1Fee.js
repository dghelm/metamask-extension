import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { hexToDecimal } from '../../../../../shared/modules/conversion.utils';
import buildUnserializedTransaction from '../buildUnserializedTransaction';

// Snippet of the ABI that we need
// Should we need more of it at some point, the full ABI can be found here:
// https://github.com/ethereum-optimism/optimism/blob/develop/gas-oracle/abis/OVM_GasPriceOracle.json
const OPTIMISM_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
    name: 'getL1Fee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// BlockExplorer link: https://optimistic.etherscan.io/address/0x420000000000000000000000000000000000000f#code
const OPTIMISM_GAS_PRICE_ORACLE_ADDRESS =
  '0x420000000000000000000000000000000000000F';

export default async function fetchEstimatedL1Fee(
  chainId,
  txMeta,
  ethersProvider,
) {
  console.log('enter fetchEstimatedL1Fee');
  const chainIdAsDecimalNumber = Number(hexToDecimal(chainId));
  const provider = global.ethereumProvider
    ? new Web3Provider(global.ethereumProvider, chainIdAsDecimalNumber)
    : ethersProvider;

  if (process.env.IN_TEST) {
    provider.detectNetwork = async () => ({
      name: 'optimism',
      chainId: chainIdAsDecimalNumber,
    });
  }
  const contract = new Contract(
    OPTIMISM_GAS_PRICE_ORACLE_ADDRESS,
    OPTIMISM_GAS_PRICE_ORACLE_ABI,
    provider,
  );
  console.log('serializing tx...');
  const serializedTransaction =
    buildUnserializedTransaction(txMeta).serialize();
  console.log('calling getL1Fee Contract');
  try {
    const result = await contract.getL1Fee(serializedTransaction);
    console.log('l1feeResult', result);
    return result?.toHexString();
  } catch (error) {
    console.error(error);
    return '0x0';
  }
}

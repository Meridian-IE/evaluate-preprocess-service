import { ethers } from 'ethers'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { newDelegatedEthAddress } from '@glif/filecoin-address'

const {
  RPC_URL = 'https://api.calibration.node.glif.io/rpc/v0',
  IE_CONTRACT_ADDRESS = '0xedb63b83ca55233432357a7aa2b150407f8ea256',
  WALLET_SEED = 'test test test test test test test test test test test junk'
} = process.env

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const signer = ethers.Wallet.fromMnemonic(WALLET_SEED).connect(provider)
console.log(
  'Wallet address:',
  signer.address,
  newDelegatedEthAddress(signer.address, 't').toString()
)

export const ieContract = new ethers.Contract(
  IE_CONTRACT_ADDRESS,
  JSON.parse(
    await fs.readFile(
      fileURLToPath(new URL('./abi.json', import.meta.url)),
      'utf8'
    )
  ),
  provider
)
export const ieContractWithSigner = ieContract.connect(signer)

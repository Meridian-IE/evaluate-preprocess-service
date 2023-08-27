import { ethers } from 'ethers'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { preprocess } from './lib/preprocess.js'

const {
  RPC_URL = 'https://api.calibration.node.glif.io/rpc/v0',
  IE_CONTRACT_ADDRESS = '0xedb63b83ca55233432357a7aa2b150407f8ea256',
} = process.env

// Set up contract
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const ieContract = new ethers.Contract(
  IE_CONTRACT_ADDRESS,
  JSON.parse(
    await fs.readFile(
      fileURLToPath(new URL('./abi.json', import.meta.url)),
      'utf8'
    )
  ),
  provider
)

const db = {
  aggregates: []
}

// Listen for events
ieContract.on('MeasurementAdded', (cid, _roundIndex) => {
  const roundIndex = Number(_roundIndex)
  console.log('Event: MeasurementAdded', { cid, roundIndex })

  // Preprocess
  preprocess(db, cid, roundIndex).catch(console.error)
})

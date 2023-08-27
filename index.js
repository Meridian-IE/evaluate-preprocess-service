import { ethers } from 'ethers'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

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
  preprocess(cid, roundIndex).catch(console.error)
})

// Preprocess
const preprocess = async (cid, roundIndex) => {
  const measurements = await fetchMeasurements(cid)
  console.log(`fetched ${measurements.length} measurements`)

  const honest = []
  const fraudulent = []
  for (const measurement of measurements) {
    if (isHonestMeasurement(measurement)) {
      honest.push(measurement)
    } else {
      fraudulent.push(measurement)
    }
  }

  const aggregated = {
    roundIndex,
    honest: aggregate(honest),
    fraudulent: aggregate(fraudulent)
  }
  console.log('Result:', aggregated)
  db.aggregates.push(aggregated)
}

// Fetch measurements
// Mock implementation, while I'm figuring out how to work IPFS
const peerIds = []
for (let i = 0; i < 25; i++) {
  peerIds.push(randomUUID())
}
const fetchMeasurements = async cid => {
  const measurements = []
  for (let i = 0; i < Math.random() * 1000; i++) {
    measurements.push({
      jobId: randomUUID(),
      peerId: peerIds[Math.floor(Math.random() * peerIds.length)],
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      cid: cid
    })
  }
  return measurements
}

// Detect fraud
// Simulate 10% fraud
const isHonestMeasurement = measurement => {
  return Math.random() < 0.9
}

// Aggregate
const aggregate = measurements => {
  const measurementsPerPeer = {}
  for (const m of measurements) {
    measurementsPerPeer[m.peerId] = (measurementsPerPeer[m.peerId] || 0) + 1
  }
  return measurementsPerPeer
}

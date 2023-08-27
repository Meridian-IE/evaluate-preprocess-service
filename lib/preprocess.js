import { randomUUID } from 'node:crypto'
import { generateMnemonic } from '@zondax/filecoin-signing-tools'
import { ethers } from 'ethers'

// Preprocess
export const preprocess = async ({ db, cid, roundIndex }) => {
  const measurements = await fetchMeasurements(cid)
  console.log(`Fetched ${measurements.length} measurements`)

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
  console.log([
    'Result:',
    aggregated.honest.total,
    'honest,',
    aggregated.fraudulent.total,
    'fraudulent measurements'
  ].join(' '))
  db.aggregates.push(aggregated)
}

// Fetch measurements
// Mock implementation, while I'm figuring out how to work IPFS
const peerIds = []
for (let i = 0; i < 25; i++) {
  peerIds.push(ethers.Wallet.fromMnemonic(generateMnemonic()).address)
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
  const aggregated = {
    total: measurements.length,
    peers: {}
  }
  for (const m of measurements) {
    aggregated.peers[m.peerId] = (aggregated.peers[m.peerId] || 0) + 1
  }
  return aggregated
}
import { randomUUID } from 'node:crypto'

// Preprocess
export const preprocess = async (db, cid, roundIndex) => {
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
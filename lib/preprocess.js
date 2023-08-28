import { Web3Storage } from 'web3.storage'

const { WEB3_STORAGE_API_TOKEN } = process.env
const web3Storage = new Web3Storage({ token: WEB3_STORAGE_API_TOKEN })

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
const fetchMeasurements = async cid => {
  const res = await web3Storage.get(cid)
  const files = await res.files()
  const measurements = JSON.parse(await files[0].text())
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
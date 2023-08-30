import { Web3Storage } from 'web3.storage'
import assert from 'node:assert'
import { ethers } from 'ethers'

const { WEB3_STORAGE_API_TOKEN } = process.env
const web3Storage = new Web3Storage({ token: WEB3_STORAGE_API_TOKEN })

// Preprocess
export const preprocess = async ({ db, cid, roundIndex }) => {
  const measurements = (await fetchMeasurements(cid))
    .filter(measurement => {
      try {
        assertValidMeasurement(measurement)
        return true
      } catch (err) {
        console.error('Invalid measurement', err.message, measurement)
        return false
      }
    })
  console.log(`Fetched ${measurements.length} valid measurements`)

  if (!db.measurements[roundIndex]) {
    db.measurements[roundIndex] = []
  }
  db.measurements[roundIndex].push(...measurements)
}

// Fetch measurements
const fetchMeasurements = async cid => {
  const res = await web3Storage.get(cid)
  const files = await res.files()
  const measurements = JSON.parse(await files[0].text())
  return measurements
}

const assertValidMeasurement = measurement => {
  assert(
    typeof measurement === 'object' && measurement !== null,
    'object required'
  )
  assert(ethers.utils.isAddress(measurement.peerId), 'valid peer id required')
}

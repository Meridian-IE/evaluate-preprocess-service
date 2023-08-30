
import { preprocess } from './lib/preprocess.js'
import { evaluate } from './lib/evaluate.js'
import { ieContract } from './lib/contract.js'

const db = {
  aggregates: [],
  cidsSeen: [],
  roundsSeen: []
}

// Listen for events
ieContract.on('MeasurementsAdded', (cid, _roundIndex) => {
  const roundIndex = Number(_roundIndex)
  if (db.cidsSeen.includes(cid)) {
    return
  }
  db.cidsSeen.push(cid)

  console.log('Event: MeasurementsAdded', { roundIndex })
  // Preprocess
  preprocess({ db, cid, roundIndex }).catch(console.error)
})

ieContract.on('RoundStart', _roundIndex => {
  const roundIndex = Number(_roundIndex)
  if (db.roundsSeen.includes(roundIndex)) {
    return
  }
  db.roundsSeen.push(roundIndex)

  console.log('Event: RoundStart', { roundIndex })
  // Evaluate previous round
  evaluate({ db, roundIndex: roundIndex - 1 }).catch(console.error)
})

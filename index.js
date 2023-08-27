
import { preprocess } from './lib/preprocess.js'
import { evaluate } from './lib/evaluate.js'
import { ieContract } from './lib/contract.js'

const db = {
  aggregates: []
}

// Listen for events
ieContract.on('MeasurementAdded', (cid, _roundIndex) => {
  const roundIndex = Number(_roundIndex)
  console.log('Event: MeasurementAdded', { roundIndex })

  // Preprocess
  preprocess({ db, cid, roundIndex }).catch(console.error)
})

ieContract.on('RoundStart', _roundIndex => {
  const roundIndex = Number(_roundIndex)
  console.log('Event: RoundStart', { roundIndex })

  // Evaluate previous round
  evaluate({ db, roundIndex: roundIndex - 1 }).catch(console.error)
})

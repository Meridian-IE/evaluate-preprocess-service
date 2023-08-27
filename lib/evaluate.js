export const evaluate = async ({ db, ieContract, roundIndex }) => {
  // TODO await all measurements have been preprocessed
  // Get measurements
  // const round = await ieContract.getRound(roundIndex)
  // const cids = round[1]
  // Fetch aggregates
  const aggregates = db.aggregates
    .filter(aggregate => aggregate.roundIndex === roundIndex)
  // Calculate reward shares
  let total = 0
  const peers = {}
  for (const aggregate of aggregates) {
    for (const [peerId, peerTotal] of Object.entries(aggregate.honest.peers)) {
      if (!peers[peerId]) {
        peers[peerId] = 0
      }
      peers[peerId] = (peers[peerId] || 0) + peerTotal
      total += peerTotal
    }
  }
  for (const [peerId, peerTotal] of Object.entries(peers)) {
    peers[peerId] = peerTotal / total
  }
  console.log({ peers })
}
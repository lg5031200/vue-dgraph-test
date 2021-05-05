const dgraph = require('dgraph-js-http')

// Create a client stub.
function newClientStub() {
  return new dgraph.DgraphClientStub('http://localhost:8080')
}

// Create a client.
function newClient(clientStub) {
  return new dgraph.DgraphClient(clientStub)
}

// Drop All - discard all data and start from a clean slate.
async function dropAll(dgraphClient) {
  await dgraphClient.alter({ dropAll: true })
}

// Set schema.
async function setSchema(dgraphClient) {
  const schema = `
    process_name: string @index(hash) .
    processEdges: [uid] .
    check: string .
    next: uid .
    process_edge_name: string .
  `
  await dgraphClient.alter({ schema: schema })
  console.log('Set schema success!')
}

// Create data using JSON.
async function createData(dgraphClient) {
  // Create a new transaction.
  const txn = dgraphClient.newTxn()
  try {
    // Create data.
    const p = [
      {
        'dgraph.type': 'Process',
        uid: '_:sickLeave',
        process_name: '病假',
        processEdges: [
          {
            'dgraph.type': 'ProcessEdge',
            uid: '_:rootToFirst',
            process_edge_name: 'whatever',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              processEdges: [
                {
                  'dgraph.type': 'ProcessEdge',
                  uid: '_:firstToSecond',
                  process_edge_name: 'whatever',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    processEdges: [
                      {
                        'dgraph.type': 'ProcessEdge',
                        process_edge_name: 'over_than_3_days',
                        check: "{leaveDays} > 3 && {leaveType} == '病假'",
                        next: {
                          'dgraph.type': 'Process',
                          uid: '_:generalManagerSign',
                          process_name: '總經理簽核',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      {
        'dgraph.type': 'Process',
        uid: '_:personalLeave',
        process_name: '事假',
        processEdges: [
          {
            'dgraph.type': 'ProcessEdge',
            uid: '_:rootToFirst',
            process_edge_name: 'whatever',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              processEdges: [
                {
                  'dgraph.type': 'ProcessEdge',
                  uid: '_:firstToSecond',
                  process_edge_name: 'whatever',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    processEdges: [
                      {
                        'dgraph.type': 'ProcessEdge',
                        process_edge_name: 'over_than_3_days',
                        check: "{leaveDays} > 3 && {leaveType} == '事假'",
                        next: {
                          'dgraph.type': 'Process',
                          uid: '_:generalManagerSign',
                          process_name: '總經理簽核',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      {
        'dgraph.type': 'Process',
        uid: '_:weddingLeave',
        process_name: '婚假',
        processEdges: [
          {
            'dgraph.type': 'ProcessEdge',
            uid: '_:rootToFirst',
            process_edge_name: 'whatever',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              processEdges: [
                {
                  'dgraph.type': 'ProcessEdge',
                  uid: '_:firstToSecond',
                  process_edge_name: 'whatever',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    processEdges: [
                      {
                        'dgraph.type': 'ProcessEdge',
                        process_edge_name: 'over_than_5_days',
                        check: "{leaveDays} > 5 && {leaveType} == '婚假'",
                        next: {
                          'dgraph.type': 'Process',
                          uid: '_:generalManagerSign',
                          process_name: '總經理簽核',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    ]

    // Run mutation.
    const assigned = await txn.mutate({ setJson: p })

    // Commit transaction.
    await txn.commit()

    // Get uid of the outermost object (person named "Alice").
    // Assigned#getUidsMap() returns a map from blank node names to uids.
    // For a json mutation, blank node names "blank-0", "blank-1", ... are used
    // for all the created nodes.
    // console.log(
    //   `Created person named "Alice" with uid = ${assigned.data.uids['blank-0']}\n`
    // );

    console.log('\nAll created nodes (map from blank node names to uids):')
    Object.keys(assigned.data.uids).forEach((key) =>
      console.log(`${key} => ${assigned.data.uids[key]}`)
    )
  } finally {
    // Clean up. Calling this after txn.commit() is a no-op
    // and hence safe.
    await txn.discard()
  }
}

// Query for data.
async function queryData(dgraphClient) {
  // Run query.
  const query = `query leaveProcess($leaveProcessType: string) {
    leaveProcess(func: eq(process_name, $leaveProcessType) )  {
      process_name
      processEdges {
        process_edge_name
        check
        next {
          process_name
          processEdges {
            process_edge_name
            check
            next {
              process_name
              processEdges {
                process_edge_name
                check
                next {
                  process_name
                }
              }
            }
          }
        }
      }
    }
  }`
  const vars = { $leaveProcessType: '病假' }
  const res = await dgraphClient.newTxn().queryWithVars(query, vars)
  const ppl = res.data

  await traversalProcess(ppl.leaveProcess[0])

  return ppl
}

async function traversalProcess(process) {
  const application = { applicant: 'Jason', leaveDays: 31, leaveType: '事假' }

  console.log(process)
  if (process.processEdges) {
    process.processEdges.forEach(async (edge) => {
      const isValid = await isValidEdge(edge.check, application)
      if (isValid) {
        await traversalProcess(edge.next)
      }
    })
  }
}

async function isValidEdge(check, application) {
  const { applicant, leaveDays, leaveType } = application
  if (check === 'whatever') {
    return true
  }
  if (check !== 'whatever') {
    var replaceArray = ['applicant', 'leaveDays', 'leaveType']
    var replaceWith = [applicant, leaveDays, leaveType]

    for (var i = 0; i <= replaceArray.length - 1; i++) {
      check = check.replace(
        new RegExp('{' + replaceArray[i] + '}', 'gi'),
        typeof replaceWith[i] == 'string'
          ? `'${replaceWith[i]}'`
          : replaceWith[i]
      )
    }

    console.log(check)
    console.log(eval(check))

    return eval(check)
  }
}

async function main() {
  const dgraphClient = await getDgraphClient()
  await dropAll(dgraphClient)
  await setSchema(dgraphClient)
  await createData(dgraphClient)
}

function getDgraphClient() {
  const dgraphClientStub = newClientStub()
  const dgraphClient = newClient(dgraphClientStub)

  return dgraphClient
}

main()
  .then(() => {
    console.log('\nDONE!')
  })
  .catch((e) => {
    console.log('ERROR: ', e)
  })

export { getDgraphClient, queryData }

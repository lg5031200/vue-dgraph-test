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
    rules: [uid] .
    check: string .
    next: uid .
    rule_name: string .
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
        rules: [
          {
            'dgraph.type': 'Rule',
            uid: '_:rootToFirst',
            rule_name: '(無論如何)',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              rules: [
                {
                  'dgraph.type': 'Rule',
                  uid: '_:firstToSecond',
                  rule_name: '(無論如何)',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    rules: [
                      {
                        'dgraph.type': 'Rule',
                        rule_name: '(病假且大於3天)',
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
        rules: [
          {
            'dgraph.type': 'Rule',
            uid: '_:rootToFirst',
            rule_name: '(無論如何)',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              rules: [
                {
                  'dgraph.type': 'Rule',
                  uid: '_:firstToSecond',
                  rule_name: '(無論如何)',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    rules: [
                      {
                        'dgraph.type': 'Rule',
                        rule_name: '(事假且大於3天)',
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
        rules: [
          {
            'dgraph.type': 'Rule',
            uid: '_:rootToFirst',
            rule_name: '(無論如何)',
            check: 'whatever',
            next: {
              'dgraph.type': 'Process',
              uid: '_:agentSign',
              process_name: '職務代理人簽核',
              rules: [
                {
                  'dgraph.type': 'Rule',
                  uid: '_:firstToSecond',
                  rule_name: '(無論如何)',
                  check: 'whatever',
                  next: {
                    'dgraph.type': 'Process',
                    uid: '_:departmentHeadSign',
                    process_name: '部門主管簽核',
                    rules: [
                      {
                        'dgraph.type': 'Rule',
                        rule_name: '(婚假且大於5天)',
                        check: "{leaveDays} > 5 && {leaveType} == '婚假'",
                        next: {
                          'dgraph.type': 'Process',
                          uid: '_:presonalManagerSign',
                          process_name: '人事主管簽核',
                          rules: [
                            {
                              'dgraph.type': 'Rule',
                              rule_name: '(無論如何)',
                              check: 'whatever',
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
          },
        ],
      },
    ]

    // Run mutation.
    await txn.mutate({ setJson: p })

    // Commit transaction.
    await txn.commit()

    // Get uid of the outermost object (person named "Alice").
    // Assigned#getUidsMap() returns a map from blank node names to uids.
    // For a json mutation, blank node names "blank-0", "blank-1", ... are used
    // for all the created nodes.
    // console.log(
    //   `Created person named "Alice" with uid = ${assigned.data.uids['blank-0']}\n`
    // );

    console.log('All created nodes (map from blank node names to uids):')
    // Object.keys(assigned.data.uids).forEach((key) =>
    //   console.log(`${key} => ${assigned.data.uids[key]}`)
    // );
  } finally {
    // Clean up. Calling this after txn.commit() is a no-op
    // and hence safe.
    await txn.discard()
  }
}

// Query for data.
async function queryData(dgraphClient, application) {
  result = []
  const { leaveType } = application
  // Run query.
  const query = `query leaveProcess($leaveProcessType: string) {
    leaveProcess(func: eq(process_name, $leaveProcessType) )  {
      process_name
      rules {
        rule_name
        check
        next {
          process_name
          rules {
            rule_name
            check
            next {
              process_name
              rules {
                rule_name
                check
                next {
                  process_name
                  rules {
                    rule_name
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
      }
    }
  }`
  const vars = { $leaveProcessType: leaveType }
  const res = await dgraphClient.newTxn().queryWithVars(query, vars)
  const ppl = res.data

  return await traversalProcess(ppl.leaveProcess[0], application)
}
var result = []

async function traversalProcess(process, application) {
  const { rules } = process
  const rulesLength = rules ? rules.length : -1
  console.log(`開始遞迴 & push 當前 ${process.process_name} 節點--------`)
  result.push({
    node_name: process.process_name,
  })
  if (rulesLength > 0) {
    console.log(`下一個節點有條件需審核--------`)
    for (const [index, edge] of Object.entries(rules)) {
      if (await isValidEdge(edge.check, application)) {
        console.log(`條件通過 & push ${edge.rule_name} 節點--------`)
        result.push({
          node_name: edge.rule_name,
        })
        console.log(`仍有下一個節點--------`)
        if (edge.next) {
          console.log('執行子遞迴--------')
          await traversalProcess(edge.next, application)
        } else {
          break
        }
      } else if (index == rulesLength - 1) {
        console.log("條件全部失敗, 回傳結果--------')")
        break
      } else {
        console.log(`${edge.rule_name} 條件失敗, 看下一個條件--------`)
        continue
      }
    }
  } else {
    console.log("沒有下一個條件節點了, 回傳結果--------')")
  }
  // 遍歷結束, 回傳結果
  return result
}

function isValidEdge(check, application) {
  const { username, leaveDays, leaveType } = application
  if (check === 'whatever') {
    return true
  } else {
    const replaceArray = ['username', 'leaveDays', 'leaveType']
    const replaceWith = [username, leaveDays, leaveType]
    for (var i = 0; i <= replaceArray.length - 1; i++) {
      check = check.replace(
        new RegExp('{' + replaceArray[i] + '}', 'gi'),
        typeof replaceWith[i] == 'string'
          ? `'${replaceWith[i]}'`
          : replaceWith[i]
      )
    }
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
    console.log('DONE!')
  })
  .catch((e) => {
    console.log('ERROR: ', e)
  })

export { getDgraphClient, queryData }

import R from 'react'
import Term from 'react-console-emulator'

import verifyKey from '../../generated/verification_key.json'
import { ALPHABET, MAX_WORD_LENGTH } from '../../constants/settings'
import { Hint, Scalars } from '../../generated'

type TerminalVerifyArgs = Readonly<{
    solutionHash: Scalars['WordHash']
    guess: string
    hints: ReadonlyArray<Hint>
    publicSignals: ReadonlyArray<string>
    proof: Readonly<Record<string, unknown>>
}>

function delay<T>(delayInMs: number, fn?: () => T): Promise<T> {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve(fn?.() as T)
        }, delayInMs)
    )
}

async function delayUntilReady<T>(
    isReadyFn: () => boolean,
    fn?: () => T
): Promise<T> {
    while (!isReadyFn()) {
        await delay(500)
    }
    return fn?.() as T
}

const commands = {
    verify: {
        fn: () => {},
    },
    check: {
        fn: () => {},
    },
}

function TerminalRef(_: any, ref: R.Ref<unknown>) {
    const term = R.useRef<any>(null)

    R.useImperativeHandle(
        ref,
        () => ({
            clear() {
                term.current.clearStdout()
                term.current.state.stdout = []
            },
            async verify({
                publicSignals,
                proof,
                solutionHash,
                guess,
                hints,
            }: TerminalVerifyArgs) {
                term.current.pushToStdout('Verifying the returned data...')
                await delay(1000, () => {
                    term.current.pushToStdout(
                        `publicSignals: ${JSON.stringify(publicSignals)}`
                    )
                })
                await delay(300, () => {
                    term.current.pushToStdout(`proof: ${JSON.stringify(proof)}`)
                })

                const h = publicSignals.slice(0, MAX_WORD_LENGTH)
                const g = publicSignals.slice(MAX_WORD_LENGTH, -1)
                const sh = publicSignals[publicSignals.length - 1]

                let isValid = true
                let isReady = true

                const commands = {
                    check: {
                        fn: async (...args: ReadonlyArray<string>) => {
                            switch (args[0]) {
                                case 'solutionHash': {
                                    isReady = false
                                    await delay(300)

                                    isReady = true
                                    if (sh !== solutionHash) {
                                        isValid = false
                                        return '❌'
                                    }
                                    return '✅'
                                }
                                case 'guess': {
                                    isReady = false
                                    await delay(300)
                                    const isSameGuess = guess
                                        .split('')
                                        .map((c) => c.toLowerCase())
                                        .map((c) => ALPHABET.indexOf(c) + 1)
                                        .map(String)
                                        .every((v, i) => v === g[i])

                                    isReady = true
                                    if (!isSameGuess) {
                                        isValid = false
                                        return '❌'
                                    }
                                    return '✅'
                                }
                                case 'hints': {
                                    isReady = false
                                    await delay(300)
                                    const isSameHints = hints.every(
                                        (v, i) =>
                                            v ===
                                            Object.values(Hint)[Number(h[i])]
                                    )
                                    isReady = true
                                    if (!isSameHints) {
                                        isValid = false
                                        return '❌'
                                    }
                                    return '✅'
                                }
                                default:
                                    throw new Error(`Wrong command ${args[0]}`)
                            }
                        },
                    },
                    validate: {
                        fn: async () => {
                            isReady = false
                            term.current.pushToStdout(
                                `verification key: ${JSON.stringify(verifyKey)}`
                            )
                            await delay(1000)
                            const isProofValid = await (
                                window as any
                            ).snarkjs.plonk.verify(
                                verifyKey,
                                publicSignals,
                                proof
                            )

                            isReady = true
                            if (!isProofValid) {
                                isValid = false
                                return '❌'
                            }
                            return '✅'
                        },
                    },
                }

                term.current.state.commands = commands
                await delay(1000)
                term.current.terminalInput.current.value = `check solutionHash ${sh}`
                term.current.processCommand()
                await delayUntilReady(() => isReady)
                term.current.terminalInput.current.value = `check guess ${JSON.stringify(
                    g
                )}`
                term.current.processCommand()
                await delayUntilReady(() => isReady)
                term.current.terminalInput.current.value = 'validate proof'
                term.current.processCommand()
                await delayUntilReady(() => isReady)
                term.current.terminalInput.current.value = `check hints ${JSON.stringify(
                    h
                )}`
                term.current.processCommand()
                await delayUntilReady(() => isReady)
                term.current.pushToStdout(
                    isValid
                        ? 'The zk proof is valid ! The server is not cheating 🎉'
                        : 'Incorrect zk proof 🤔... Try to reload.'
                )
            },
        }),
        []
    )

    return (
        <Term
            ref={term}
            style={{ minHeight: '100%' }}
            styleEchoBack="fullInherit" // Inherit echo styling from prompt
            disabled={true} // Disable input
            disableOnProcess={true}
            noDefaults={true}
            commands={commands}
            promptLabel={'>'}
            noHistory={true}
        />
    )
}

export const Terminal = R.forwardRef(TerminalRef)

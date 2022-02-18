export { useGuessLazyQuery as useGuessQuery } from '../generated'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const query = /* GraphQL */ `
    query Guess($guess: ValidGuess!) {
        guess(input: { guess: $guess }) {
            hints
            publicSignals
            proof
        }
    }
`

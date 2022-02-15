export { useGuessLazyQuery as useGuessQuery } from '../generated'

const query = /* GraphQL */ `
    query Guess($guess: ValidGuess!) {
        guess(input: { guess: $guess }) {
            hints
            publicSignals
            proof
        }
    }
`

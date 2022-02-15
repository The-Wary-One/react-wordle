export { useInitGameLazyQuery as useInitGameQuery } from '../generated'

const initGameQuery = /* GraphQL */ `
    query InitGame {
        solutionHash
        validGuesses
    }
`

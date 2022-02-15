import { Hint } from '../generated'

export const getStatuses = (
    guesses: ReadonlyArray<string>,
    allHints: ReadonlyArray<ReadonlyArray<Hint>>
): { [key: string]: Hint } => {
    const hintObj: { [key: string]: Hint } = {}

    guesses.forEach((word, i) => {
        word.split('').forEach((letter, j) => {
            hintObj[letter] = allHints[i][j]
        })
    })

    return hintObj
}

import { Scalars, Hint } from '../generated'

export const isWordInWordList = (
    validGuesses: ReadonlyArray<Scalars['ValidGuess']>,
    word: string
) => {
    return validGuesses.includes(word.toLowerCase() as any)
}

export const isWinningWord = (hints: ReadonlyArray<Hint>) => {
    return hints.every((h) => h === Hint.GoodPosition)
}

const today = new Date()
today.setUTCHours(0, 0, 0, 0)

export const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

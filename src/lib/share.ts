import { GAME_TITLE } from '../constants/strings'
import { Hint } from '../generated'

export const shareStatus = (
    guesses: ReadonlyArray<string>,
    allHints: ReadonlyArray<ReadonlyArray<Hint>>,
    lost: boolean
) => {
    navigator.clipboard.writeText(
        `${GAME_TITLE} ${lost ? 'X' : guesses.length}/6\n\n` +
            generateEmojiGrid(allHints)
    )
}

export const generateEmojiGrid = (
    allHints: ReadonlyArray<ReadonlyArray<Hint>>
) => {
    return allHints
        .map((hints) => {
            return hints
                .map((h) => {
                    switch (h) {
                        case Hint.GoodPosition:
                            return '🟩'
                        case Hint.BadPosition:
                            return '🟨'
                        default:
                            return '⬜'
                    }
                })
                .join('')
        })
        .join('\n')
}

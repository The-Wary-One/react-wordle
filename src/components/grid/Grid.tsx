import { MAX_CHALLENGES } from '../../constants/settings'
import { Hint } from '../../generated'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
    guesses: ReadonlyArray<string>
    currentGuess: string
    allHints: ReadonlyArray<ReadonlyArray<Hint>>
    isRevealing?: boolean
}

export const Grid = ({
    guesses,
    currentGuess,
    allHints,
    isRevealing,
}: Props) => {
    const empties =
        guesses.length < MAX_CHALLENGES - 1
            ? Array.from(Array(MAX_CHALLENGES - 1 - guesses.length))
            : []

    return (
        <div className="pb-6">
            {guesses.map((guess, i) => (
                <CompletedRow
                    key={i}
                    guess={guess}
                    hints={allHints[i]}
                    isRevealing={isRevealing && guesses.length - 1 === i}
                />
            ))}
            {guesses.length < MAX_CHALLENGES && (
                <CurrentRow guess={currentGuess} />
            )}
            {empties.map((_, i) => (
                <EmptyRow key={i} />
            ))}
        </div>
    )
}

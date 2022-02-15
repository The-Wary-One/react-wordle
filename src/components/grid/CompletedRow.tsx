import { Hint } from '../../generated'
import { Cell } from './Cell'

type Props = {
    guess: string
    hints: ReadonlyArray<Hint>
    isRevealing?: boolean
}

export const CompletedRow = ({ guess, hints, isRevealing }: Props) => (
    <div className="flex justify-center mb-1">
        {guess.split('').map((letter, i) => (
            <Cell
                key={i}
                value={letter}
                status={hints[i]}
                position={i}
                isRevealing={isRevealing}
                isCompleted
            />
        ))}
    </div>
)

import { useState, useEffect } from 'react'

import App from './_App'
import { useInitGameQuery } from './hooks/useInitGameQuery'
import type { Scalars } from './generated'
import { Alert } from './components/alerts/Alert'

export default function Init() {
    const [initGame, initGameResponse] = useInitGameQuery()
    useEffect(() => {
        initGame()
    }, [initGame])

    const [validGuesses, setValidGuesses] = useState<
        ReadonlyArray<Scalars['ValidGuess']>
    >([])
    const [solutionHash, setSolutionHash] = useState<Scalars['WordHash']>(
        '' as unknown as Scalars['WordHash']
    )

    useEffect(() => {
        if (initGameResponse.data) {
            setSolutionHash(initGameResponse.data.solutionHash)
            setValidGuesses(initGameResponse.data.validGuesses)
        }
    }, [initGameResponse.data])

    if (initGameResponse.error) {
        return (
            <Alert
                message={initGameResponse.error.message}
                isOpen={!!initGameResponse.error}
            />
        )
    }

    if (solutionHash && validGuesses.length) {
        return <App validGuesses={validGuesses} solutionHash={solutionHash} />
    }

    return (
        <Alert
            message={'Loading...'}
            isOpen={!!initGameResponse.loading}
            variant={'info'}
        />
    )
}

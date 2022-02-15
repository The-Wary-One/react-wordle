import { useState, useEffect, useRef } from 'react'
import {
    InformationCircleIcon,
    ChartBarIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/outline'

import './App.css'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { Terminal } from './components/terminal/Terminal'
import {
    GAME_TITLE,
    WIN_MESSAGES,
    GAME_COPIED_MESSAGE,
    ABOUT_GAME_MESSAGE,
    NOT_ENOUGH_LETTERS_MESSAGE,
    WORD_NOT_FOUND_MESSAGE,
    CORRECT_WORD_MESSAGE,
} from './constants/strings'
import {
    MAX_WORD_LENGTH,
    MAX_CHALLENGES,
    ALERT_TIME_MS,
    REVEAL_TIME_MS,
    GAME_LOST_INFO_DELAY,
} from './constants/settings'
import { isWordInWordList, isWinningWord } from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
    loadGameStateFromLocalStorage,
    saveGameStateToLocalStorage,
} from './lib/localStorage'
import { useGuessQuery } from './hooks/useGuessQuery'
import { Scalars, Hint } from './generated'

type AppProps = {
    solutionHash: Scalars['WordHash']
    validGuesses: ReadonlyArray<Scalars['ValidGuess']>
}

function App({ solutionHash, validGuesses }: AppProps) {
    const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches

    const [guess, guessResponse] = useGuessQuery()
    const [currentGuess, setCurrentGuess] = useState('')
    const [allHints, setAllHints] = useState<
        ReadonlyArray<ReadonlyArray<Hint>>
    >([])
    const [guesses, setGuesses] = useState<ReadonlyArray<string>>(() => {
        const loaded = loadGameStateFromLocalStorage()
        if (loaded?.solutionHash !== solutionHash) {
            return []
        }
        setAllHints(loaded.allHints)
        if (loaded.isGameWon) {
            setIsGameWon(true)
        }
        if (loaded.guesses.length === MAX_CHALLENGES && !loaded.isGameWon) {
            setIsGameLost(true)
        }
        return loaded.guesses
    })
    const [isGameWon, setIsGameWon] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
    const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
    const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] =
        useState(false)
    const [isGameLost, setIsGameLost] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme')
            ? localStorage.getItem('theme') === 'dark'
            : prefersDarkMode
            ? true
            : false
    )
    const [successAlert, setSuccessAlert] = useState('')
    const [isRevealing, setIsRevealing] = useState(false)
    const [isWaiting, setIsWaiting] = useState(false)
    const [stats, setStats] = useState(() => loadStats())

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkMode])

    const handleDarkMode = (isDark: boolean) => {
        setIsDarkMode(isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }

    useEffect(() => {
        saveGameStateToLocalStorage({
            guesses,
            solutionHash,
            allHints,
            isGameWon,
        })
    }, [guesses])

    useEffect(() => {
        if (isGameWon) {
            setTimeout(() => {
                setSuccessAlert(
                    WIN_MESSAGES[
                        Math.floor(Math.random() * WIN_MESSAGES.length)
                    ]
                )

                setTimeout(() => {
                    setSuccessAlert('')
                    setIsStatsModalOpen(true)
                }, ALERT_TIME_MS)
            }, REVEAL_TIME_MS * MAX_WORD_LENGTH)
        }
        if (isGameLost) {
            setTimeout(() => {
                setIsStatsModalOpen(true)
            }, GAME_LOST_INFO_DELAY)
        }
    }, [isGameWon, isGameLost])

    const onChar = (value: string) => {
        if (
            currentGuess.length < MAX_WORD_LENGTH &&
            guesses.length < MAX_CHALLENGES &&
            !isGameWon &&
            !isWaiting
        ) {
            setCurrentGuess(`${currentGuess}${value}`)
        }
    }

    const onDelete = () => {
        if (!isWaiting) {
            setCurrentGuess(currentGuess.slice(0, -1))
        }
    }

    const onEnter = () => {
        if (isGameWon || isGameLost || isWaiting) {
            return
        }

        if (!(currentGuess.length === MAX_WORD_LENGTH)) {
            setIsNotEnoughLetters(true)
            return setTimeout(() => {
                setIsNotEnoughLetters(false)
            }, ALERT_TIME_MS)
        }

        if (!isWordInWordList(validGuesses, currentGuess)) {
            setIsWordNotFoundAlertOpen(true)
            return setTimeout(() => {
                setIsWordNotFoundAlertOpen(false)
            }, ALERT_TIME_MS)
        }

        setIsWaiting(true)
        guess({
            variables: {
                guess: currentGuess.toLowerCase() as unknown as Scalars['ValidGuess'],
            },
        })
    }

    const terminal = useRef<any>(null)

    useEffect(() => {
        async function effect() {
            if (guessResponse.data) {
                const { hints, publicSignals, proof } = guessResponse.data.guess

                terminal.current.clear()
                await terminal.current.verify({
                    publicSignals,
                    proof,
                    solutionHash,
                    guess: currentGuess,
                    hints,
                })

                setAllHints([...allHints, hints])
                setIsRevealing(true)
                // turn this back off after all
                // chars have been revealed
                setTimeout(() => {
                    setIsRevealing(false)
                }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

                setIsWaiting(false)
                const winningWord = isWinningWord(hints)

                if (
                    currentGuess.length === MAX_WORD_LENGTH &&
                    guesses.length < MAX_CHALLENGES &&
                    !isGameWon
                ) {
                    setGuesses([...guesses, currentGuess])
                    setCurrentGuess('')

                    if (winningWord) {
                        setStats(
                            addStatsForCompletedGame(stats, guesses.length)
                        )
                        return setIsGameWon(true)
                    }

                    if (guesses.length === MAX_CHALLENGES - 1) {
                        setStats(
                            addStatsForCompletedGame(stats, guesses.length + 1)
                        )
                        setIsGameLost(true)
                    }
                }
            }
        }
        effect()
    }, [guessResponse.data])

    useEffect(() => {
        setIsWaiting(false)
    }, [guessResponse.error])

    return (
        <div className="pt-2 pb-8 grid grid-cols-3 gap-1 sm:px-6 lg:px-8">
            <div className="col-start-2">
                <div className="flex w-80 mx-auto items-center mb-8 mt-20">
                    <h1 className="text-xl ml-2.5 grow font-bold dark:text-white">
                        {GAME_TITLE}
                    </h1>
                    {isDarkMode ? (
                        <SunIcon
                            className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
                            onClick={() => handleDarkMode(!isDarkMode)}
                        />
                    ) : (
                        <MoonIcon
                            className="h-6 w-6 mr-2 cursor-pointer"
                            onClick={() => handleDarkMode(!isDarkMode)}
                        />
                    )}
                    <InformationCircleIcon
                        className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
                        onClick={() => setIsInfoModalOpen(true)}
                    />
                    <ChartBarIcon
                        className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
                        onClick={() => setIsStatsModalOpen(true)}
                    />
                </div>

                <Grid
                    guesses={guesses}
                    allHints={allHints}
                    currentGuess={currentGuess}
                    isRevealing={isRevealing}
                />

                <Keyboard
                    onChar={onChar}
                    onDelete={onDelete}
                    onEnter={onEnter}
                    guesses={guesses}
                    allHints={allHints}
                    isRevealing={isRevealing}
                />
                <InfoModal
                    isOpen={isInfoModalOpen}
                    handleClose={() => setIsInfoModalOpen(false)}
                />
                <StatsModal
                    isOpen={isStatsModalOpen}
                    handleClose={() => setIsStatsModalOpen(false)}
                    guesses={guesses}
                    allHints={allHints}
                    gameStats={stats}
                    isGameLost={isGameLost}
                    isGameWon={isGameWon}
                    handleShare={() => {
                        setSuccessAlert(GAME_COPIED_MESSAGE)
                        return setTimeout(
                            () => setSuccessAlert(''),
                            ALERT_TIME_MS
                        )
                    }}
                />
                <AboutModal
                    isOpen={isAboutModalOpen}
                    handleClose={() => setIsAboutModalOpen(false)}
                />

                <button
                    type="button"
                    className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
                    onClick={() => setIsAboutModalOpen(true)}
                >
                    {ABOUT_GAME_MESSAGE}
                </button>

                <Alert
                    message={guessResponse.error?.message ?? ''}
                    isOpen={!!guessResponse.error}
                />
                <Alert
                    message={'Loading...'}
                    isOpen={!!guessResponse.loading}
                    variant={'info'}
                />
                <Alert
                    message={NOT_ENOUGH_LETTERS_MESSAGE}
                    isOpen={isNotEnoughLetters}
                />
                <Alert
                    message={WORD_NOT_FOUND_MESSAGE}
                    isOpen={isWordNotFoundAlertOpen}
                />
                <Alert
                    message={CORRECT_WORD_MESSAGE(solutionHash)}
                    isOpen={isGameLost && !isRevealing}
                />
                <Alert
                    message={successAlert}
                    isOpen={successAlert !== ''}
                    variant="success"
                />
            </div>
            <div className="pt-14 min-h-full">
                <Terminal ref={terminal} />
            </div>
        </div>
    )
}

export default App

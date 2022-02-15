import type { JSONObject } from '@zkwordle/server/src/graphql/scalars'
import type { NonEmptyString } from '@zkwordle/server/src/graphql/scalars'
import type { ValidGuess } from '@zkwordle/server/src/graphql/scalars'
import type { WordHash } from '@zkwordle/server/src/graphql/scalars'
import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>
}
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
    Float: number
    /** See https://www.graphql-scalars.dev/docs/scalars/json-object */
    JSONObject: JSONObject
    /** See https://www.graphql-scalars.dev/docs/scalars/non-empty-string */
    NonEmptyString: NonEmptyString
    /** A valid lowercase word of the right length */
    ValidGuess: ValidGuess
    /** A hash corresponding to a word */
    WordHash: WordHash
}

export type GuessInput = {
    readonly guess: Scalars['ValidGuess']
}

export type GuessZkPayload = {
    readonly __typename?: 'GuessZKPayload'
    /** The hints */
    readonly hints: ReadonlyArray<Hint>
    /** The generated zk proof to verify */
    readonly proof: Scalars['JSONObject']
    /**
     * The content of the public.json file required to verify the proof.
     * It is composed by the hint, the guess and the wordHash.
     */
    readonly publicSignals: ReadonlyArray<Scalars['NonEmptyString']>
}

/** A letter hint */
export enum Hint {
    /** The letter isn't in the word */
    Absent = 'Absent',
    /** The letter is in the wrong position */
    BadPosition = 'BadPosition',
    /** The letter is in the right position */
    GoodPosition = 'GoodPosition',
}

export type Query = {
    readonly __typename?: 'Query'
    readonly guess: GuessZkPayload
    readonly solutionHash: Scalars['WordHash']
    readonly validGuesses: ReadonlyArray<Scalars['ValidGuess']>
}

export type QueryGuessArgs = {
    input: GuessInput
}

export type GuessQueryVariables = Exact<{
    guess: Scalars['ValidGuess']
}>

export type GuessQuery = {
    readonly __typename?: 'Query'
    readonly guess: {
        readonly __typename?: 'GuessZKPayload'
        readonly hints: ReadonlyArray<Hint>
        readonly publicSignals: ReadonlyArray<NonEmptyString>
        readonly proof: JSONObject
    }
}

export type InitGameQueryVariables = Exact<{ [key: string]: never }>

export type InitGameQuery = {
    readonly __typename?: 'Query'
    readonly solutionHash: WordHash
    readonly validGuesses: ReadonlyArray<ValidGuess>
}

export const GuessDocument = gql`
    query Guess($guess: ValidGuess!) {
        guess(input: { guess: $guess }) {
            hints
            publicSignals
            proof
        }
    }
`

/**
 * __useGuessQuery__
 *
 * To run a query within a React component, call `useGuessQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuessQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuessQuery({
 *   variables: {
 *      guess: // value for 'guess'
 *   },
 * });
 */
export function useGuessQuery(
    baseOptions: Apollo.QueryHookOptions<GuessQuery, GuessQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions }
    return Apollo.useQuery<GuessQuery, GuessQueryVariables>(
        GuessDocument,
        options
    )
}
export function useGuessLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GuessQuery, GuessQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions }
    return Apollo.useLazyQuery<GuessQuery, GuessQueryVariables>(
        GuessDocument,
        options
    )
}
export type GuessQueryHookResult = ReturnType<typeof useGuessQuery>
export type GuessLazyQueryHookResult = ReturnType<typeof useGuessLazyQuery>
export type GuessQueryResult = Apollo.QueryResult<
    GuessQuery,
    GuessQueryVariables
>
export const InitGameDocument = gql`
    query InitGame {
        solutionHash
        validGuesses
    }
`

/**
 * __useInitGameQuery__
 *
 * To run a query within a React component, call `useInitGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useInitGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInitGameQuery({
 *   variables: {
 *   },
 * });
 */
export function useInitGameQuery(
    baseOptions?: Apollo.QueryHookOptions<InitGameQuery, InitGameQueryVariables>
) {
    const options = { ...defaultOptions, ...baseOptions }
    return Apollo.useQuery<InitGameQuery, InitGameQueryVariables>(
        InitGameDocument,
        options
    )
}
export function useInitGameLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        InitGameQuery,
        InitGameQueryVariables
    >
) {
    const options = { ...defaultOptions, ...baseOptions }
    return Apollo.useLazyQuery<InitGameQuery, InitGameQueryVariables>(
        InitGameDocument,
        options
    )
}
export type InitGameQueryHookResult = ReturnType<typeof useInitGameQuery>
export type InitGameLazyQueryHookResult = ReturnType<
    typeof useInitGameLazyQuery
>
export type InitGameQueryResult = Apollo.QueryResult<
    InitGameQuery,
    InitGameQueryVariables
>

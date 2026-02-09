import type { Platform } from "./platform"
import type { ProblemData, SaveProblemResponse, SaveAttemptResponse, ReviewProblemResponse } from "./api"

import type { ProblemResponse as ApiProblemResponse } from "./api"

// Message types for communication between content script and background
export type MessageType =
    | { type: "GET_AUTH_STATUS" }
    | { type: "GET_PROBLEM"; platform: Platform; slug: string }
    | { type: "SAVE_PROBLEM"; platform: Platform; slug: string; notes?: string; solution?: string }
    | { type: "SAVE_ATTEMPT"; platform: Platform; platformKey: string; startedAt: string; endedAt: string; durationSec: number }
    | { type: "REVIEW_PROBLEM"; platform: Platform; slug: string; rating?: number; timeSpentMs?: number; clientEventId?: string }
    | { type: "CONNECT" }
    | { type: "DISCONNECT" }

// Response types
export type AuthStatusResponse = {
    isAuthenticated: boolean
    user?: {
        username: string | null
        email: string | null
        image: string | null
        name: string | null
    }
}

export type ProblemResponse = ApiProblemResponse

export type ConnectResponse = {
    success: boolean
    error?: string
}

export type MessageResponse =
    | AuthStatusResponse
    | ProblemResponse
    | ConnectResponse
    | SaveProblemResponse
    | SaveAttemptResponse
    | ReviewProblemResponse
    | { success: boolean; error?: string }

/**
 * Send a message to the background script
 */
export function sendMessage<T extends MessageResponse>(message: MessageType): Promise<T> {
    try {
        if (!chrome?.runtime?.id) {
            return Promise.reject(new Error("EXTENSION_CONTEXT_INVALID"))
        }
    } catch {
        return Promise.reject(new Error("EXTENSION_CONTEXT_INVALID"))
    }
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
                return
            }
            resolve(response as T)
        })
    })
}

/**
 * Get authentication status from background
 */
export function getAuthStatus(): Promise<AuthStatusResponse> {
    return sendMessage<AuthStatusResponse>({ type: "GET_AUTH_STATUS" })
}

/**
 * Request problem data from background
 */
export function getProblem(platform: Platform, slug: string): Promise<ProblemResponse> {
    return sendMessage<ProblemResponse>({ type: "GET_PROBLEM", platform, slug })
}

/**
 * Save notes and/or solution for a problem
 */
export function saveProblem(
    platform: Platform,
    slug: string,
    notes?: string,
    solution?: string
): Promise<SaveProblemResponse> {
    return sendMessage<SaveProblemResponse>({ type: "SAVE_PROBLEM", platform, slug, notes, solution })
}

/**
 * Save an attempt (time spent) for a problem
 */
export function saveAttempt(
    platform: Platform,
    platformKey: string,
    startedAt: string,
    endedAt: string,
    durationSec: number
): Promise<SaveAttemptResponse> {
    return sendMessage<SaveAttemptResponse>({
        type: "SAVE_ATTEMPT",
        platform,
        platformKey,
        startedAt,
        endedAt,
        durationSec,
    })
}

/**
 * Mark a problem as reviewed
 */
export function reviewProblem(
    platform: Platform,
    slug: string,
    rating?: number,
    meta?: { timeSpentMs?: number; clientEventId?: string }
): Promise<ReviewProblemResponse> {
    return sendMessage<ReviewProblemResponse>({
        type: "REVIEW_PROBLEM",
        platform,
        slug,
        rating,
        timeSpentMs: meta?.timeSpentMs,
        clientEventId: meta?.clientEventId,
    })
}

/**
 * Initiate connect flow
 */
export function connect(): Promise<ConnectResponse> {
    return sendMessage<ConnectResponse>({ type: "CONNECT" })
}

/**
 * Disconnect from Smarana
 */
export function disconnect(): Promise<{ success: boolean }> {
    return sendMessage<{ success: boolean }>({ type: "DISCONNECT" })
}

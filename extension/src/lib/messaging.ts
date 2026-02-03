import type { Platform } from "./platform"
import type { ProblemData, SaveProblemResponse } from "./api"

import type { ProblemResponse as ApiProblemResponse } from "./api"

// Message types for communication between content script and background
export type MessageType =
    | { type: "GET_AUTH_STATUS" }
    | { type: "GET_PROBLEM"; platform: Platform; slug: string }
    | { type: "SAVE_PROBLEM"; platform: Platform; slug: string; notes?: string; solution?: string }
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
    | { success: boolean; error?: string }

/**
 * Send a message to the background script
 */
export function sendMessage<T extends MessageResponse>(message: MessageType): Promise<T> {
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

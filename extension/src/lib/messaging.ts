import type { Platform } from "./platform"
import type { ProblemData } from "./api"

// Message types for communication between content script and background
export type MessageType =
    | { type: "GET_AUTH_STATUS" }
    | { type: "GET_PROBLEM"; platform: Platform; slug: string }
    | { type: "CONNECT" }
    | { type: "DISCONNECT" }

// Response types
export type AuthStatusResponse = {
    isAuthenticated: boolean
    user?: {
        username: string | null
        email: string | null
    }
}

export type ProblemResponse = {
    found: boolean
    problem: ProblemData | null
    error?: string
}

export type ConnectResponse = {
    success: boolean
    error?: string
}

export type MessageResponse =
    | AuthStatusResponse
    | ProblemResponse
    | ConnectResponse
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

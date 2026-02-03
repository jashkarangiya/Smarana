export const OVERLAY_CSS = `
/* ========== CSS VARIABLES (single source of truth) ========== */
:host {
    --sm-bg: 9, 9, 11;                  /* rgba(9, 9, 11, 0.92) */
    --sm-panel: 24, 24, 27;             /* rgba(24, 24, 27, 0.78) */
    --sm-border: 255, 255, 255;         /* rgba(255, 255, 255, 0.08) */
    --sm-text: 255, 255, 255;           /* rgba(255, 255, 255, 0.92) */
    --sm-muted: 255, 255, 255;          /* rgba(255, 255, 255, 0.62) */
    --sm-muted2: 255, 255, 255;         /* rgba(255, 255, 255, 0.45) */
    --sm-accent: 187, 115, 49;          /* #BB7331 */
    --sm-accent-rgb: 187, 115, 49;
    
    --sm-radius-xl: 22px;
    --sm-radius-lg: 16px;
    --sm-radius-pill: 999px;

    --sm-shadow: 0 24px 80px rgba(0, 0, 0, 0.70);
    --sm-blur: blur(18px);

    /* Button Gradient from user request logic (or keeping simple solid if preferred, but user passed a solid color in example. let's stick to their .sm-btn-primary bg) */
    --sm-btn-bg: rgba(187, 115, 49, 1);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.smarana-app {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(var(--sm-text), 0.92);
    -webkit-font-smoothing: antialiased;
}

/* ========== BUBBLE (collapsed state) ========== */
.bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(var(--sm-bg), 0.92);
    border: 1px solid rgba(var(--sm-border), 0.08);
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: var(--sm-blur);
    -webkit-backdrop-filter: var(--sm-blur);
}

.bubble:active { cursor: grabbing; }

.bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(var(--sm-accent-rgb), 0.14), 0 4px 24px rgba(0, 0, 0, 0.5);
    border-color: rgba(var(--sm-accent-rgb), 1);
}

.bubble-logo {
    transition: transform 0.2s ease;
    border-radius: 8px;
}

.bubble:hover .bubble-logo { transform: scale(1.1); }

.bubble-status {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(var(--sm-bg), 1);
}

.bubble-status-loading {
    background: rgba(var(--sm-accent-rgb), 1);
    animation: pulse 1.5s ease-in-out infinite;
}
.bubble-status-ok { background: #00b8a3; }
.bubble-status-due { background: #ffc01e; }
.bubble-status-warning { background: #ff6b6b; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* ========== PANEL (expanded state) ========== */
.panel {
    width: clamp(320px, 34vw, 400px);
    max-height: min(80vh, 600px);
    
    /* 👇 more opaque, readable */
    background: rgba(var(--sm-bg), 0.92);

    /* premium glass */
    backdrop-filter: var(--sm-blur);
    -webkit-backdrop-filter: var(--sm-blur);

    border: 1px solid rgba(var(--sm-border), 0.08);
    border-radius: var(--sm-radius-xl);

    /* subtle depth */
    box-shadow: var(--sm-shadow);

    overflow: hidden;
    display: flex;
    flex-direction: column;
}


/* ========== HEADER ========== */
.smr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 14px 10px;
    border-bottom: 1px solid rgba(var(--sm-border), 0.06);
    cursor: grab;
}

.smr-header:active { cursor: grabbing; }

.smr-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.smr-logo {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: contain;
}

.smr-title {
    font-weight: 650;
    letter-spacing: 0.2px;
    color: rgba(var(--sm-text), 0.92);
    font-size: 16px;
}

.smr-title span {
    color: rgba(var(--sm-accent-rgb), 1);
}

.smr-pill {
    font-size: 10px;
    letter-spacing: 0.12em;
    padding: 4px 8px;
    border-radius: var(--sm-radius-pill);
    border: 1px solid rgba(var(--sm-border), 0.10);
    background: rgba(var(--sm-panel), 0.55);
    color: rgba(var(--sm-text), 0.72);
    text-transform: uppercase;
    font-weight: 500;
}

.smr-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(var(--sm-border), 0.08);
    background: rgba(var(--sm-panel), 0.55);
    color: rgba(var(--sm-text), 0.75);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    pointer-events: auto;
}

.smr-close-btn:hover {
    background: rgba(var(--sm-panel), 0.75);
    color: rgba(var(--sm-text), 1);
}

/* ========== BODY ========== */
.smr-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

/* Custom Scrollbar */
.smr-body::-webkit-scrollbar { width: 6px; }
.smr-body::-webkit-scrollbar-track { background: transparent; }
.smr-body::-webkit-scrollbar-thumb {
    background: rgba(var(--sm-border), 0.12);
    border-radius: 3px;
}
.smr-body::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--sm-border), 0.2);
}

/* ========== META ROW ========== */
.smr-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
}

.smr-difficulty {
    padding: 5px 10px;
    border-radius: var(--sm-radius-pill);
    font-weight: 600;
    font-size: 12px;
    border: 1px solid rgba(var(--sm-border), 0.1);
    background: rgba(var(--sm-panel), 0.4);
}

.smr-easy { color: #58d3b0; border-color: rgba(88, 211, 176, 0.25); }
.smr-medium { color: #ffc01e; border-color: rgba(255, 192, 30, 0.25); }
.smr-hard { color: #ff6b6b; border-color: rgba(255, 107, 107, 0.25); }

.smr-muted { color: rgba(var(--sm-muted), 0.62); font-size: 12px; }

/* ========== STATUS BANNER ========== */
.smr-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.smr-banner-due {
    border: 1px solid rgba(255, 192, 30, 0.30);
    background: rgba(255, 192, 30, 0.12);
    color: #ffc01e;
}

.smr-banner-upcoming {
    border: 1px solid rgba(0, 184, 163, 0.30);
    background: rgba(0, 184, 163, 0.12);
    color: #00b8a3;
}

.smr-banner-neutral {
    border: 1px solid rgba(var(--sm-border), 0.08);
    background: rgba(var(--sm-panel), 0.3);
    color: rgba(var(--sm-muted), 0.62);
}

.smr-banner-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px currentColor;
    opacity: 0.3;
}

/* ========== CARDS ========== */
.smr-card {
    border-radius: var(--sm-radius-lg);
    border: 1px solid rgba(var(--sm-border), 0.08);
    background: rgba(var(--sm-panel), 0.78);
    overflow: hidden;
}

.smr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(var(--sm-border), 0.08);
    background: rgba(255, 255, 255, 0.02);
}

.smr-card-label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 10px;
    font-weight: 600;
    color: rgba(var(--sm-muted), 0.62);
}

.smr-card-body {
    padding: 12px;
    max-height: 140px;
    overflow-y: auto;
    min-height: 40px;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(var(--sm-text), 0.92);
}

.smr-prewrap { white-space: pre-wrap; }

.smr-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.30);
    border-radius: 0 0 var(--sm-radius-lg) var(--sm-radius-lg);
}

.smr-muted-2 { color: rgba(var(--sm-muted2), 0.45); font-style: italic; }

.smr-reveal-btn {
    border-radius: var(--sm-radius-pill);
    padding: 4px 10px;
    background: transparent;
    border: 1px solid rgba(var(--sm-accent-rgb), 0.40);
    color: rgba(var(--sm-accent-rgb), 1);
    font-weight: 600;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.smr-reveal-btn:hover {
    background: rgba(var(--sm-accent-rgb), 0.15);
}

/* ========== FOOTER ========== */
.smr-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    margin-top: auto;
}

.smr-primary-btn {
    flex: 1;
    height: 48px;
    padding: 0 24px;
    min-width: 140px;
    border-radius: var(--sm-radius-pill);
    border: 1px solid rgba(255,255,255,0.10);
    cursor: pointer;
    font-weight: 600;
    color: #0b0b0d;
    background: var(--sm-btn-bg);
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-decoration: none;
    font-size: 15px;
    letter-spacing: 0.01em;
    transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
}

.smr-primary-btn:hover {
    filter: brightness(1.05);
    box-shadow: 0 0 0 4px rgba(var(--sm-accent-rgb), 0.14);
}

.smr-primary-btn:active {
    transform: translateY(1px);
}

.smr-primary-btn:focus-visible {
    outline: 2px solid rgba(var(--sm-accent-rgb), 0.55);
    outline-offset: 2px;
}

.smr-icon-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(var(--sm-border), 0.1);
    background: rgba(var(--sm-panel), 0.6);
    color: rgba(var(--sm-text), 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.smr-icon-btn:hover {
    background: rgba(var(--sm-panel), 0.8);
    color: rgba(var(--sm-text), 1);
}

/* ========== EMPTY/CONNECT/ERROR STATES ========== */
.smr-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
}

.smr-empty-icon {
    margin-bottom: 16px;
    opacity: 0.5;
}

.smr-empty-title {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 6px;
    color: rgba(var(--sm-text), 0.92);
}

.smr-subtext {
    color: rgba(var(--sm-muted), 0.62);
    line-height: 1.4;
    max-width: 30ch;
    margin: 0 auto 20px;
    font-size: 13px;
}

.smr-error-text { color: #ff6b6b; }

/* ========== LOADING STATE ========== */
.smr-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
    color: rgba(var(--sm-text), 0.55);
}

.smr-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-top-color: rgba(var(--sm-accent-rgb), 1);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ========== EDIT MODE ========== */
.smr-edit {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.smr-edit-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.smr-edit-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(var(--sm-muted), 0.62);
}

.smr-edit-textarea {
    width: 100%;
    min-height: 70px;
    max-height: 140px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(var(--sm-border), 0.12);
    background: rgba(var(--sm-panel), 0.4);
    color: rgba(var(--sm-text), 0.92);
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.2s ease;
}

.smr-edit-textarea:focus {
    outline: none;
    border-color: rgba(var(--sm-accent-rgb), 1);
}

.smr-secondary-btn {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(var(--sm-border), 0.1);
    background: rgba(var(--sm-panel), 0.4);
    color: rgba(var(--sm-text), 0.8);
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.smr-secondary-btn:hover {
    background: rgba(var(--sm-panel), 0.6);
}

@media (max-width: 440px) {
    .panel {
        width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
    }
}
`;

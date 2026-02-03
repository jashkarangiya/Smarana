export const OVERLAY_CSS = `
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.smarana-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.92);
    -webkit-font-smoothing: antialiased;
}

/* Bubble (collapsed state) */
.bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(10, 10, 12, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.bubble:active {
    cursor: grabbing;
}

.bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(187, 115, 49, 0.14), 0 4px 24px rgba(0, 0, 0, 0.4);
    border-color: #BB7331;
}

.bubble-logo {
    transition: transform 0.2s ease;
}

.bubble:hover .bubble-logo {
    transform: scale(1.1);
}

.bubble-status {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(10, 10, 12, 0.98);
}

.bubble-status-loading {
    background: #BB7331;
    animation: pulse 1.5s ease-in-out infinite;
}

.bubble-status-ok { background: #00b8a3; }
.bubble-status-due { background: #ffc01e; }
.bubble-status-warning { background: #ff6b6b; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Panel (expanded state) */
.panel {
    width: 360px;
    max-height: 520px;
    background: rgba(10, 10, 12, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    cursor: grab;
}

.panel-header:active {
    cursor: grabbing;
}

.panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #BB7331;
    font-size: 14px;
}

.platform-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-btn:hover {
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.06);
}

.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Custom Scrollbar */
.panel-body::-webkit-scrollbar {
    width: 6px;
}
.panel-body::-webkit-scrollbar-track {
    background: transparent;
}
.panel-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}
.panel-body::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Loading state */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
}

.spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #BB7331;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Empty states */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
}

.empty-icon {
    margin-bottom: 16px;
    opacity: 0.6;
}

.empty-title {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.92);
}

.empty-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    margin-bottom: 20px;
}

.error-text { color: #ff6b6b; }

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    border: none;
}

.btn-primary {
    background: #BB7331;
    color: #fff;
    box-shadow: 0 2px 8px rgba(187, 115, 49, 0.2);
}

.btn-primary:hover {
    background: #d4843a;
    box-shadow: 0 0 0 4px rgba(187, 115, 49, 0.14);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.06);
}

.btn-ghost {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    padding: 8px;
}

.btn-ghost:hover {
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.03);
}

/* Problem Info */
.problem-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
}

.difficulty { font-weight: 600; font-size: 13px; }
.review-count { color: rgba(255, 255, 255, 0.4); font-size: 12px; }

/* Status Badge */
.status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 12px;
}

.status-overdue { background: rgba(255, 107, 107, 0.12); color: #ff6b6b; }
.status-due { background: rgba(255, 192, 30, 0.12); color: #ffc01e; }
.status-upcoming { background: rgba(0, 184, 163, 0.12); color: #00b8a3; }
.status-neutral { background: rgba(255, 255, 255, 0.03); color: rgba(255, 255, 255, 0.6); }

/* Blocks */
.block {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 12px;
}

.block-header {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.block-content {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 160px;
    overflow-y: auto;
}

.block-content::-webkit-scrollbar { width: 4px; }
.block-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.block-content-hidden {
    font-style: italic;
    color: rgba(255, 255, 255, 0.4);
}

.solution-toggle {
    background: none;
    border: none;
    color: #BB7331;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    padding: 2px 6px;
}
.solution-toggle:hover { text-decoration: underline; }

/* Footer */
.panel-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.open-btn { flex: 1; }

/* Edit Mode */
.edit-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.edit-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.edit-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
}

.edit-notes,
.edit-solution {
    width: 100%;
    min-height: 80px;
    max-height: 160px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.92);
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.2s ease;
}

.edit-solution {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 12px;
}

.edit-notes:focus,
.edit-solution:focus {
    outline: none;
    border-color: #BB7331;
}

.edit-notes::placeholder,
.edit-solution::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.edit-notes::-webkit-scrollbar,
.edit-solution::-webkit-scrollbar {
    width: 4px;
}

.edit-notes::-webkit-scrollbar-thumb,
.edit-solution::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.save-btn {
    flex: 1;
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.save-btn.error {
    background: #ff6b6b;
}
`;

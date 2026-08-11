// Plain constants only — no Pusher client instantiation here. This file gets imported
// from BOTH the server route (lib/pusher.ts side) and the browser component
// (lib/pusher-client.ts side), so it must have zero side effects. If these lived inside
// pusher-client.ts instead, importing them into a server route would execute pusher-js's
// browser-oriented setup code on the server too — not what we want.
export const REPORTS_CHANNEL = "reports-channel"
export const NEW_REPORT_EVENT = "new-report"
export const COMMENTS_CHANNEL="comment-added"
export const NEW_COMMENTS_EVENT="new-comment"
export const UPVOTE_CHANNEL='upvote-channel'
export const NEW_UPVOTE_EVENT='upvote-added'
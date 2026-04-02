'use client'

const PENDING_GUEST_MERGE_KEY = 'pendingGuestMergeUserId'

export function rememberPendingGuestMerge(userId: string | null | undefined) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  window.localStorage.setItem(PENDING_GUEST_MERGE_KEY, userId)
}

export function getPendingGuestMergeUserId() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(PENDING_GUEST_MERGE_KEY)
}

export function clearPendingGuestMerge() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(PENDING_GUEST_MERGE_KEY)
}
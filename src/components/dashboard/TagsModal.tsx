'use client'

import { useState } from 'react'
import type { TagType } from '@/types/itemType'
import { createTag, updateTag, deleteTag } from '@/lib/items/tags'
import { XMarkIcon } from '@heroicons/react/24/outline'
import DashboardViewportPortal from './DashboardViewportPortal'

type TagsModalProps = {
  tags: TagType[]
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function TagsModal({ tags, isOpen, onClose, onUpdate }: TagsModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      await createTag(newTagName, newTagDescription)
      setNewTagName('')
      setNewTagDescription('')
      setIsCreating(false)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTag = async (id: string) => {
    if (!editingName.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      await updateTag(id, editingName, editingDescription)
      setEditingId(null)
      setEditingName('')
      setEditingDescription('')
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    setIsLoading(true)
    setError(null)
    try {
      await deleteTag(id)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <DashboardViewportPortal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-rose-900">Manage Tags</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="themed-scrollbar flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Create New Tag */}
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                + Create New Tag
              </button>
            ) : (
              <form onSubmit={handleCreateTag} className="space-y-3">
                <input
                  type="text"
                  placeholder="Tag name (e.g., Birthday, Wedding)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-rose-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewTagName('')
                      setNewTagDescription('')
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Existing Tags */}
          <div className="space-y-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <div key={tag.id} className="rounded-lg border border-gray-200 p-3">
                  {editingId === tag.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleUpdateTag(tag.id)
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tag.name}</p>
                        {tag.description && (
                          <p className="text-xs text-gray-600">{tag.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Slug: {tag.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(tag.id)
                            setEditingName(tag.name)
                            setEditingDescription(tag.description || '')
                          }}
                          disabled={isLoading}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={isLoading}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">No tags created yet. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardViewportPortal>
  )
}

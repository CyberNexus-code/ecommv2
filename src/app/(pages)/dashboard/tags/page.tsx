'use client'

import { useState, useEffect } from 'react'
import { getAllTags, createTag, updateTag, deleteTag } from '@/lib/items/tags'
import type { TagType } from '@/types/itemType'

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      setError(null)
      const { tags: tagsData } = await getAllTags()
      setTags(tagsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setActionLoading(true)
    setError(null)
    try {
      await createTag(newTagName, newTagDescription)
      setNewTagName('')
      setNewTagDescription('')
      setIsCreating(false)
      await loadTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !editingName.trim()) return

    setActionLoading(true)
    setError(null)
    try {
      await updateTag(editingId, editingName, editingDescription)
      setEditingId(null)
      setEditingName('')
      setEditingDescription('')
      await loadTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    setActionLoading(true)
    setError(null)
    try {
      await deleteTag(id)
      await loadTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
    } finally {
      setActionLoading(false)
    }
  }

  const startEdit = (tag: TagType) => {
    setEditingId(tag.id)
    setEditingName(tag.name)
    setEditingDescription(tag.description || '')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-rose-900 md:text-3xl">Manage Tags</h1>
        <p className="mt-2 text-sm text-stone-600">
          Create and organize tags to help customers filter products by theme, color, and other attributes.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-rose-900">
          {isCreating ? 'Create New Tag' : 'Add a New Tag'}
        </h2>

        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            + Create Tag
          </button>
        ) : (
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Summer Collection"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Description</label>
              <textarea
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Save Tag
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                  setNewTagDescription('')
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-rose-900">
          Tags ({tags.length})
        </h2>

        {loading ? (
          <p className="text-stone-600">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-stone-600">No tags yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {tags.map((tag) => (
              <div key={tag.id} className="rounded-lg border border-stone-200 p-4">
                {editingId === tag.id ? (
                  <form onSubmit={handleUpdateTag} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700">Name</label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700">Description</label>
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-rose-900">{tag.name}</h3>
                        {tag.description && (
                          <p className="text-sm text-stone-600">{tag.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tag)}
                        className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={actionLoading}
                        className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

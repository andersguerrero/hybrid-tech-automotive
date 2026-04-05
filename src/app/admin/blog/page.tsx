'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Plus, Edit, Trash2, X, ArrowLeft } from 'lucide-react'
import { blogPosts as initialPosts } from '@/data'
import type { BlogPost } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BlogAdminPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState(initialPosts)
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    author: 'Hybrid Tech Team',
    publishedAt: new Date().toISOString().split('T')[0],
    category: '',
    image: '',
    slug: ''
  })

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        if (data.success && data.posts && data.posts.length > 0) {
          setPosts(data.posts)
          localStorage.setItem('admin_blog', JSON.stringify(data.posts))
          return
        }
      } catch (error) {
        console.error('Error loading blog posts from API:', error)
      }
      // Fallback to localStorage
      const savedPosts = localStorage.getItem('admin_blog')
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts)
          setPosts(parsed)
        } catch (error) {
          console.error('Error loading saved blog posts:', error)
        }
      }
    }
    loadPosts()
  }, [])

  // Guardar posts en localStorage y API cuando cambien
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('admin_blog', JSON.stringify(posts))
      // Persistir en el servidor
      fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts })
      }).catch(error => console.error('Error saving blog posts to API:', error))
    }
  }, [posts])

  const handleAdd = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: 'Hybrid Tech Team',
      publishedAt: new Date().toISOString().split('T')[0],
      category: '',
      image: '',
      slug: ''
    })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (post: BlogPost) => {
    setFormData(post)
    setEditingId(post.id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t.admin.confirmDeletePost)) {
      setPosts(posts.filter(p => p.id !== id))
      setSavedMessage(t.admin.postDeleted)
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleSave = () => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.image || !formData.category) {
      alert(t.admin.fillRequiredFields)
      return
    }

    if (editingId) {
      setPosts(posts.map(p => 
        p.id === editingId ? { ...formData as BlogPost, id: editingId } : p
      ))
      setSavedMessage(t.admin.postUpdated)
    } else if (isAdding) {
      const newId = (posts.length + 1).toString()
      const slug = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ''
      setPosts([...posts, { ...formData as BlogPost, id: newId, slug }])
      setSavedMessage(t.admin.postAdded)
    }
    
    setIsAdding(false)
    setEditingId(null)
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: 'Hybrid Tech Team',
      publishedAt: new Date().toISOString().split('T')[0],
      category: '',
      image: '',
      slug: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.admin.backToPanel}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t.admin.blogManagement}</h1>
              <p className="text-xl text-blue-100">{t.admin.blogManagementDesc}</p>
            </div>
            {!isAdding && !editingId && (
              <button onClick={handleAdd} className="btn-secondary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>{t.admin.addNew}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {savedMessage && (
        <section className="section-padding pt-8">
          <div className="container-custom">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
              {savedMessage}
            </div>
          </div>
        </section>
      )}

      {(isAdding || editingId) && (
        <section className="section-padding pt-8">
          <div className="container-custom max-w-4xl">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Título del artículo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Resumen (Excerpt)</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Breve descripción del artículo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Autor</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Publicación</label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Battery Maintenance, Fuel Economy, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contenido Completo</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={10}
                    placeholder="Contenido completo del artículo..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Guardar</span>
                  </button>
                  <button onClick={handleCancel} className="btn-outline">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isAdding && !editingId && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="card relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="bg-primary-500 text-white p-2 rounded hover:bg-primary-600 transition-colors" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors" 
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {post.image && (
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">{post.category}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}


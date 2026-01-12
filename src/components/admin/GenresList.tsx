'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Genre {
  id: string;
  name: string;
  slug: string;
  _count: {
    radios: number;
  };
}

interface GenresListProps {
  genres: Genre[];
}

export function GenresList({ genres }: GenresListProps) {
  const router = useRouter();
  const [newGenreName, setNewGenreName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGenreName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création');
        return;
      }

      setNewGenreName('');
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(genreId: string) {
    if (!editingName.trim()) return;

    setError(null);

    try {
      const response = await fetch(`/api/genres/${genreId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
    }
  }

  async function handleDelete(genreId: string, radiosCount: number) {
    if (radiosCount > 0) {
      if (!confirm(`Ce genre est associé à ${radiosCount} radio(s). Voulez-vous vraiment le supprimer ?`)) {
        return;
      }
    } else if (!confirm('Êtes-vous sûr de vouloir supprimer ce genre ?')) {
      return;
    }

    setDeletingId(genreId);

    try {
      const response = await fetch(`/api/genres/${genreId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
        return;
      }

      router.refresh();
    } catch {
      alert('Une erreur est survenue');
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(genre: Genre) {
    setEditingId(genre.id);
    setEditingName(genre.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName('');
  }

  return (
    <div className="space-y-6">
      {/* Create new genre */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Nouveau genre</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <Input
              id="newGenre"
              type="text"
              placeholder="Nom du genre (ex: Jazz, Rock, Électronique...)"
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isCreating}>
            Ajouter
          </Button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-(--error)">{error}</p>
        )}
      </div>

      {/* Genres list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-(--muted) border-b border-(--border) bg-(--secondary)/50">
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Radios</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {genres.map((genre) => (
                <tr key={genre.id} className="hover:bg-(--secondary)/30 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === genre.id ? (
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{genre.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 text-xs rounded bg-(--secondary) text-(--muted)">
                      {genre.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-(--primary)/10 text-(--primary)">
                      {genre._count.radios}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === genre.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(genre.id)}
                          >
                            Sauver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(genre)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(genre.id, genre._count.radios)}
                            isLoading={deletingId === genre.id}
                            className="text-(--error) hover:bg-(--error)/10"
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {genres.length === 0 && (
          <div className="p-8 text-center text-(--muted)">
            Aucun genre trouvé
          </div>
        )}
      </div>
    </div>
  );
}

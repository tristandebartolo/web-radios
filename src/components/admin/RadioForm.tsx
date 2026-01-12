'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Radio {
  id: string;
  name: string;
  streamUrl: string;
  streamType: string;
  logoUrl: string | null;
  description: string | null;
  country: string | null;
  region: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  isActive: boolean;
  genreIds: string[];
}

interface RadioFormProps {
  radio?: Radio;
  genres: Genre[];
}

const STREAM_TYPES = [
  { value: 'MP3', label: 'MP3' },
  { value: 'HLS', label: 'HLS (.m3u8)' },
  { value: 'AAC', label: 'AAC' },
  { value: 'OGG', label: 'OGG' },
];

export function RadioForm({ radio, genres }: RadioFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(radio?.genreIds || []);

  const isEditing = !!radio;

  function toggleGenre(genreId: string) {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      streamUrl: formData.get('streamUrl') as string,
      streamType: formData.get('streamType') as string,
      logoUrl: formData.get('logoUrl') as string,
      description: formData.get('description') as string,
      country: formData.get('country') as string,
      region: formData.get('region') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      facebookUrl: formData.get('facebookUrl') as string,
      twitterUrl: formData.get('twitterUrl') as string,
      youtubeUrl: formData.get('youtubeUrl') as string,
      genreIds: selectedGenres,
    };

    if (!data.name || !data.streamUrl) {
      setError('Nom et URL du flux sont requis');
      setIsLoading(false);
      return;
    }

    try {
      const url = isEditing ? `/api/radios/${radio.id}` : '/api/radios';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erreur lors de l\'enregistrement');
        return;
      }

      router.push('/admin/radios');
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-(--error)/10 border border-(--error)/20 text-(--error) text-sm">
          {error}
        </div>
      )}

      {/* Informations principales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informations principales</h2>

        <Input
          id="name"
          name="name"
          type="text"
          label="Nom de la radio *"
          placeholder="Ex: France Info, NTS Radio..."
          defaultValue={radio?.name || ''}
          required
        />

        <Input
          id="streamUrl"
          name="streamUrl"
          type="url"
          label="URL du flux audio *"
          placeholder="https://stream.example.com/live.mp3"
          defaultValue={radio?.streamUrl || ''}
          required
        />

        <div>
          <label htmlFor="streamType" className="block text-sm font-medium text-(--foreground) mb-1.5">
            Type de flux
          </label>
          <select
            id="streamType"
            name="streamType"
            defaultValue={radio?.streamType || 'MP3'}
            className="w-full px-4 py-2.5 rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
          >
            {STREAM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="description"
          name="description"
          type="text"
          label="Description"
          placeholder="Une courte description de la radio"
          defaultValue={radio?.description || ''}
        />
      </div>

      {/* Genres */}
      <div className="space-y-4 pt-4 border-t border-(--border)">
        <h2 className="text-lg font-semibold">Genres musicaux</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedGenres.includes(genre.id)
                  ? 'bg-(--primary) text-white'
                  : 'bg-(--secondary) text-(--foreground) hover:bg-(--card-hover)'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        {genres.length === 0 && (
          <p className="text-sm text-(--muted)">Aucun genre disponible</p>
        )}
      </div>

      {/* Localisation */}
      <div className="space-y-4 pt-4 border-t border-(--border)">
        <h2 className="text-lg font-semibold">Localisation</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="country"
            name="country"
            type="text"
            label="Pays"
            placeholder="France"
            defaultValue={radio?.country || ''}
          />

          <Input
            id="region"
            name="region"
            type="text"
            label="Région"
            placeholder="Île-de-France"
            defaultValue={radio?.region || ''}
          />
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-4 pt-4 border-t border-(--border)">
        <h2 className="text-lg font-semibold">Apparence</h2>

        <Input
          id="logoUrl"
          name="logoUrl"
          type="url"
          label="URL du logo"
          placeholder="https://example.com/logo.png"
          defaultValue={radio?.logoUrl || ''}
        />
      </div>

      {/* Liens externes */}
      <div className="space-y-4 pt-4 border-t border-(--border)">
        <h2 className="text-lg font-semibold">Liens externes</h2>

        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          label="Site web"
          placeholder="https://www.maradio.com"
          defaultValue={radio?.websiteUrl || ''}
        />

        <Input
          id="facebookUrl"
          name="facebookUrl"
          type="url"
          label="Facebook"
          placeholder="https://www.facebook.com/maradio"
          defaultValue={radio?.facebookUrl || ''}
        />

        <Input
          id="twitterUrl"
          name="twitterUrl"
          type="url"
          label="X (Twitter)"
          placeholder="https://x.com/maradio"
          defaultValue={radio?.twitterUrl || ''}
        />

        <Input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          label="YouTube"
          placeholder="https://www.youtube.com/@maradio"
          defaultValue={radio?.youtubeUrl || ''}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEditing ? 'Enregistrer' : 'Créer la radio'}
        </Button>
      </div>
    </form>
  );
}

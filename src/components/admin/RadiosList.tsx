"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

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
  isActive: boolean;
  genres: Genre[];
}

interface RadiosListProps {
  radios: Radio[];
}

export function RadiosList({ radios }: RadiosListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete(radioId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette radio ?")) {
      return;
    }

    setDeletingId(radioId);

    try {
      const response = await fetch(`/api/radios/${radioId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
        return;
      }

      router.refresh();
    } catch {
      alert("Une erreur est survenue");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(radio: Radio) {
    setTogglingId(radio.id);

    try {
      const response = await fetch(`/api/radios/${radio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !radio.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de la mise à jour");
        return;
      }

      router.refresh();
    } catch {
      alert("Une erreur est survenue");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-(--muted) border-b border-(--border) bg-(--secondary)/50">
              <th className="px-6 py-4 font-medium">Radio</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Genres</th>
              <th className="px-6 py-4 font-medium">Pays</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {radios.map((radio) => (
              <tr
                key={radio.id}
                className="hover:bg-(--secondary)/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {radio.logoUrl ? (
                      <Image
                        src={radio.logoUrl}
                        alt={radio.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-(--secondary) flex items-center justify-center text-4lg">
                        <span className="wrd-radio"></span>
                      </div>
                    )}
                    <div>
                      <Link href={`/radios/${radio.id}`}>
                        <p className="font-medium">{radio.name}</p>
                      </Link>
                      {radio.description && (
                        <p className="text-xs text-(--muted) truncate max-w-50">
                          {radio.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-(--secondary) text-foreground">
                    {radio.streamType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {radio.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-0.5 text-xs rounded-full bg-(--primary)/10 text-(--primary)"
                      >
                        {genre.name}
                      </span>
                    ))}
                    {radio.genres.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-(--muted)">
                        +{radio.genres.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-(--muted)">
                  {radio.country || "-"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(radio)}
                    disabled={togglingId === radio.id}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      radio.isActive
                        ? "bg-(--success)/20 text-(--success)"
                        : "bg-(--error)/20 text-(--error)"
                    }`}
                  >
                    {togglingId === radio.id
                      ? "..."
                      : radio.isActive
                      ? "Actif"
                      : "Inactif"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/radios/${radio.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(radio.id)}
                      isLoading={deletingId === radio.id}
                      className="text-(--error) hover:bg-(--error)/10"
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {radios.length === 0 && (
        <div className="p-8 text-center text-(--muted)">
          Aucune radio trouvée
        </div>
      )}
    </div>
  );
}

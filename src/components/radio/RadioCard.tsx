"use client";

import Image from "next/image";
import Link from "next/link";
import { usePlayer, type RadioForPlayer } from "@/context/PlayerContext";
import { PlayButton } from "@/components/player/PlayButton";
import { FavoriteButton } from "@/components/radio/FavoriteButton";
import { cn } from "@/lib/utils/cn";

interface RadioCardProps {
  radio: RadioForPlayer;
}

export function RadioCard({ radio }: RadioCardProps) {
  const { currentRadio, isPlaying } = usePlayer();

  const isCurrentRadio = currentRadio?.id === radio.id;
  const isActive = isCurrentRadio && isPlaying;

  return (
    <div
      className={cn(
        "group relative rounded-2xl p-px transition-all duration-300 flex",
        "hover:bg-(--card-hover) hover:scale-[1.02]",
        isActive && "bg-linear-to-r from-blue-500 to-purple-500"
      )}
    >
      <div className="bg-gray-900 p-3 rounded-2xl w-full">
        {/* Logo */}
        <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-(--secondary)">
          {radio.logoUrl ? (
            <Image
              src={radio.logoUrl}
              alt={radio.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              📻
            </div>
          )}

          {/* Play button overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
              isActive && "opacity-100"
            )}
          >
            <PlayButton radio={radio} size="lg" />
          </div>

          {/* Stream type badge & Favorite button */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <FavoriteButton radioId={radio.id} size="sm" />
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
              {radio.streamType}
            </span>
          </div>

          {/* Playing indicator */}
          {isActive && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <div className="flex items-end gap-0.5 h-4">
                <span
                  className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]"
                  style={{ height: "60%", animationDelay: "0ms" }}
                />
                <span
                  className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]"
                  style={{ height: "100%", animationDelay: "150ms" }}
                />
                <span
                  className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]"
                  style={{ height: "40%", animationDelay: "300ms" }}
                />
                <span
                  className="w-1 bg-(--success) rounded-full animate-[bounce_0.5s_ease-in-out_infinite]"
                  style={{ height: "80%", animationDelay: "450ms" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Link href={`/radios/${radio.id}`} className="block group/link">
            <h3 className="font-semibold truncate mb-1 group-hover/link:text-(--primary) transition-colors">
              {radio.name}
            </h3>
          </Link>
          {radio.description && (
            <p className="text-sm text-(--muted) truncate mb-2">
              {radio.description}
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1 items-center">
            {radio.genres.slice(0, 2).map((genre) => (
              <Link key={genre.id} href={`/radios?genre=${genre.slug}`} className="px-2 py-1 text-xs rounded-full bg-(--primary)/10 text-(--primary)">
                {genre.name}
              </Link>
            ))}
            {radio.genres.length > 2 && (
              <span className="px-1 py-0.5 text-xs text-(--muted)">
                +{radio.genres.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { StreamType } from '@prisma/client';

// GET /api/radios - Liste des radios (public) avec pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const activeOnly = searchParams.get('active') !== 'false';
    const sortField = searchParams.get('sortField') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 50);

    const where = {
      ...(activeOnly && { isActive: true }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(genre && {
        genres: {
          some: { slug: genre },
        },
      }),
      ...(country && { country }),
    };

    // Construire l'orderBy dynamique
    const orderBy: Record<string, 'asc' | 'desc'>[] = [];
    if (sortField === 'country') {
      orderBy.push({ country: sortOrder as 'asc' | 'desc' });
    }
    orderBy.push({ name: sortField === 'name' ? (sortOrder as 'asc' | 'desc') : 'asc' });
    orderBy.push({ id: 'asc' }); // Pour assurer un ordre stable

    const radios = await prisma.radio.findMany({
      where,
      include: {
        genres: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      take: limit + 1, // On prend 1 de plus pour savoir s'il y a une page suivante
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip le curseur lui-même
      }),
    });

    const hasNextPage = radios.length > limit;
    const items = hasNextPage ? radios.slice(0, -1) : radios;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    // Compter le total pour l'affichage
    const total = await prisma.radio.count({ where });

    return NextResponse.json({
      items,
      nextCursor,
      hasNextPage,
      total,
    });
  } catch (error) {
    console.error('Error fetching radios:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/radios - Créer une radio (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, streamUrl, streamType, logoUrl, description, country, region, websiteUrl, facebookUrl, twitterUrl, youtubeUrl, genreIds } = body;

    if (!name || !streamUrl) {
      return NextResponse.json(
        { error: 'Nom et URL du flux requis' },
        { status: 400 }
      );
    }

    // Validate streamType
    const validStreamTypes: StreamType[] = ['MP3', 'HLS', 'AAC', 'OGG'];
    const type = (streamType?.toUpperCase() || 'MP3') as StreamType;
    if (!validStreamTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de flux invalide' },
        { status: 400 }
      );
    }

    const radio = await prisma.radio.create({
      data: {
        name,
        streamUrl,
        streamType: type,
        logoUrl: logoUrl || null,
        description: description || null,
        country: country || null,
        region: region || null,
        websiteUrl: websiteUrl || null,
        facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
        createdById: session.user.id,
        ...(genreIds?.length && {
          genres: {
            connect: genreIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        genres: true,
      },
    });

    return NextResponse.json(radio, { status: 201 });
  } catch (error) {
    console.error('Error creating radio:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

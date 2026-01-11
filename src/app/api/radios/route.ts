import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { StreamType } from '@prisma/client';

// GET /api/radios - Liste des radios (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const activeOnly = searchParams.get('active') !== 'false';

    const radios = await prisma.radio.findMany({
      where: {
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
      },
      include: {
        genres: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(radios);
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
    const { name, streamUrl, streamType, logoUrl, description, country, region, genreIds } = body;

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

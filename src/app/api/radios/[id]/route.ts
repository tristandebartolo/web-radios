import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { StreamType } from '@prisma/client';

// GET /api/radios/[id] - Détail d'une radio (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const radio = await prisma.radio.findUnique({
      where: { id },
      include: {
        genres: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!radio) {
      return NextResponse.json({ error: 'Radio non trouvée' }, { status: 404 });
    }

    return NextResponse.json(radio);
  } catch (error) {
    console.error('Error fetching radio:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/radios/[id] - Modifier une radio (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, streamUrl, streamType, logoUrl, description, country, region, websiteUrl, facebookUrl, twitterUrl, youtubeUrl, isActive, genreIds } = body;

    const radio = await prisma.radio.findUnique({
      where: { id },
    });

    if (!radio) {
      return NextResponse.json({ error: 'Radio non trouvée' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (streamUrl !== undefined) updateData.streamUrl = streamUrl;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
    if (description !== undefined) updateData.description = description || null;
    if (country !== undefined) updateData.country = country || null;
    if (region !== undefined) updateData.region = region || null;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl || null;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl || null;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl || null;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (streamType !== undefined) {
      const validStreamTypes: StreamType[] = ['MP3', 'HLS', 'AAC', 'OGG'];
      const type = streamType.toUpperCase() as StreamType;
      if (!validStreamTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Type de flux invalide' },
          { status: 400 }
        );
      }
      updateData.streamType = type;
    }

    // Handle genres update
    if (genreIds !== undefined) {
      updateData.genres = {
        set: genreIds.map((gid: string) => ({ id: gid })),
      };
    }

    const updatedRadio = await prisma.radio.update({
      where: { id },
      data: updateData,
      include: {
        genres: true,
      },
    });

    return NextResponse.json(updatedRadio);
  } catch (error) {
    console.error('Error updating radio:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/radios/[id] - Supprimer une radio (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    const radio = await prisma.radio.findUnique({
      where: { id },
    });

    if (!radio) {
      return NextResponse.json({ error: 'Radio non trouvée' }, { status: 404 });
    }

    await prisma.radio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting radio:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

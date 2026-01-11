import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

// GET /api/genres/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        radios: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        _count: {
          select: { radios: true },
        },
      },
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre non trouvé' }, { status: 404 });
    }

    return NextResponse.json(genre);
  } catch (error) {
    console.error('Error fetching genre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/genres/[id] - Modifier un genre (admin only)
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
    const { name } = body;

    const genre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre non trouvé' }, { status: 404 });
    }

    const updateData: { name?: string; slug?: string } = {};

    if (name) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new name/slug conflicts with another genre
      const existing = await prisma.genre.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [{ name: updateData.name }, { slug: updateData.slug }],
            },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Ce nom de genre est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedGenre);
  } catch (error) {
    console.error('Error updating genre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/genres/[id] - Supprimer un genre (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { radios: true },
        },
      },
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre non trouvé' }, { status: 404 });
    }

    await prisma.genre.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

import { PrismaClient, Role, StreamType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // USERS
  // ============================================

  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const userPasswordHash = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@webradios.local' },
    update: {},
    create: {
      email: 'admin@webradios.local',
      passwordHash: adminPasswordHash,
      name: 'Administrateur',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@webradios.local' },
    update: {},
    create: {
      email: 'user@webradios.local',
      passwordHash: userPasswordHash,
      name: 'Utilisateur Test',
      role: Role.USER,
    },
  });

  console.log('✅ Users created');

  // ============================================
  // GENRES
  // ============================================

  const genresData = [
    { name: 'Pop', slug: 'pop' },
    { name: 'Rock', slug: 'rock' },
    { name: 'Jazz', slug: 'jazz' },
    { name: 'Électronique', slug: 'electronique' },
    { name: 'Classique', slug: 'classique' },
    { name: 'Hip-Hop', slug: 'hip-hop' },
    { name: 'World', slug: 'world' },
    { name: 'News', slug: 'news' },
    { name: 'Ambient', slug: 'ambient' },
    { name: 'Indie', slug: 'indie' },
  ];

  const genres: Record<string, string> = {};

  for (const genre of genresData) {
    const created = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
    genres[genre.slug] = created.id;
  }

  console.log('✅ Genres created');

  // ============================================
  // RADIOS
  // ============================================

  const radiosData = [
    {
      name: 'France Info',
      streamUrl: 'https://stream.radiofrance.fr/franceinfo/franceinfo_hifi.m3u8',
      streamType: StreamType.HLS,
      logoUrl: 'https://www.radiofrance.fr/s3/cruiser-production/2022/05/7d8e4e08-f92f-4424-9e8c-14f2c2f3e5c5/400x400_rf_omm_0000043805_dnc.0057.jpg',
      description: "L'actualité en continu",
      country: 'France',
      genres: ['news'],
    },
    {
      name: 'FIP',
      streamUrl: 'https://stream.radiofrance.fr/fip/fip_hifi.m3u8',
      streamType: StreamType.HLS,
      logoUrl: 'https://www.radiofrance.fr/s3/cruiser-production/2021/10/f5c8c594-7b32-4d22-9ece-0cc73e60c7a3/400x400_rf_omm_0000009449_dnc.0045.jpg',
      description: 'La radio musicale la plus éclectique',
      country: 'France',
      genres: ['jazz', 'world', 'electronique'],
    },
    {
      name: 'France Musique',
      streamUrl: 'https://stream.radiofrance.fr/francemusique/francemusique_hifi.m3u8',
      streamType: StreamType.HLS,
      logoUrl: 'https://www.radiofrance.fr/s3/cruiser-production/2022/06/f8d2b594-ad2c-4b23-8c88-f9c1c3c2c5c5/400x400_rf_omm_0000000766_dnc.0025.jpg',
      description: 'La musique classique et plus encore',
      country: 'France',
      genres: ['classique', 'jazz'],
    },
    {
      name: 'NTS Radio',
      streamUrl: 'https://stream-relay-geo.ntslive.net/stream',
      streamType: StreamType.MP3,
      logoUrl: 'https://media.ntslive.co.uk/resize/800x800/27de4bf5-4fa4-4e00-91d2-e3fc6b0f46e6_1609177200.png',
      description: 'Underground music from London',
      country: 'United Kingdom',
      genres: ['electronique', 'indie', 'hip-hop'],
    },
    {
      name: 'SomaFM Groove Salad',
      streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
      streamType: StreamType.MP3,
      logoUrl: 'https://somafm.com/img3/groovesalad-400.jpg',
      description: 'A nicely chilled plate of ambient beats',
      country: 'United States',
      genres: ['ambient', 'electronique'],
    },
    {
      name: 'SomaFM DEF CON',
      streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
      streamType: StreamType.MP3,
      logoUrl: 'https://somafm.com/img3/defcon-400.jpg',
      description: 'Music for hacking',
      country: 'United States',
      genres: ['electronique'],
    },
    {
      name: 'Jazz Radio',
      streamUrl: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3',
      streamType: StreamType.MP3,
      logoUrl: 'https://www.jazzradio.fr/uploads/images/logo-jazzradio.png',
      description: 'Le meilleur du jazz',
      country: 'France',
      genres: ['jazz'],
    },
    {
      name: 'Radio Paradise',
      streamUrl: 'https://stream.radioparadise.com/aac-320',
      streamType: StreamType.AAC,
      logoUrl: 'https://www.radioparadise.com/graphics/fb_logo.png',
      description: 'Eclectic DJ-mixed music',
      country: 'United States',
      genres: ['rock', 'indie', 'world'],
    },
  ];

  for (const radio of radiosData) {
    const genreConnections = radio.genres
      .map((slug) => genres[slug])
      .filter(Boolean)
      .map((id) => ({ id }));

    // Générer un slug propre basé sur le nom
    const radioSlug = radio.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin

    await prisma.radio.upsert({
      where: {
        id: radioSlug,
      },
      update: {
        genres: {
          set: genreConnections,
        },
      },
      create: {
        id: radioSlug,
        name: radio.name,
        streamUrl: radio.streamUrl,
        streamType: radio.streamType,
        logoUrl: radio.logoUrl,
        description: radio.description,
        country: radio.country,
        createdById: admin.id,
        genres: {
          connect: genreConnections,
        },
      },
    });
  }

  console.log('✅ Radios created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Comptes de test:');
  console.log('   Admin: admin@webradios.local / admin123');
  console.log('   User:  user@webradios.local / user123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

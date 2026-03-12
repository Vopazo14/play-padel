import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Martín García",
        email: "martin@example.com",
        password,
        profile: { create: { skillLevel: 3.0, preferredSide: "DRIVE", city: "Buenos Aires", bio: "Juego los fines de semana en Palermo" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Sofía Rodríguez",
        email: "sofia@example.com",
        password,
        profile: { create: { skillLevel: 2.5, preferredSide: "REVES", city: "Buenos Aires", bio: "Principiante entusiasta" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Lucas Pérez",
        email: "lucas@example.com",
        password,
        profile: { create: { skillLevel: 4.0, preferredSide: "DRIVE", city: "Córdoba", bio: "Ex jugador de tenis, me pasé al pádel" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Ana Martínez",
        email: "ana@example.com",
        password,
        profile: { create: { skillLevel: 3.5, preferredSide: "REVES", city: "Buenos Aires" } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Pablo Fernández",
        email: "pablo@example.com",
        password,
        profile: { create: { skillLevel: 2.0, preferredSide: "BOTH", city: "Rosario" } },
      },
    }),
  ]);

  const [martin, sofia, lucas, ana, pablo] = users;

  // Create matches
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  const matches = await Promise.all([
    // Match 1: Open, needs 1 more player
    prisma.match.create({
      data: {
        title: "Partido tarde Palermo",
        description: "Partido amigable en Palermo. Todos bienvenidos niveles 2-4",
        scheduledAt: new Date(tomorrow.setHours(20, 0, 0, 0)),
        location: "Club Palermo",
        city: "Buenos Aires",
        skillLevelMin: 2.0,
        skillLevelMax: 4.0,
        maxPlayers: 4,
        currentPlayers: 3,
        organizerId: martin.id,
        players: {
          create: [
            { userId: martin.id, role: "ORGANIZER" },
            { userId: sofia.id, role: "PLAYER" },
            { userId: ana.id, role: "PLAYER" },
          ],
        },
      },
    }),

    // Match 2: Full match
    prisma.match.create({
      data: {
        title: "Americano del sábado",
        description: "Americano rotativo. 4 jugadores, 90 minutos.",
        scheduledAt: new Date(inTwoDays.setHours(10, 0, 0, 0)),
        location: "Centro de Pádel Belgrano",
        city: "Buenos Aires",
        format: "AMERICANO",
        skillLevelMin: 3.0,
        skillLevelMax: 5.0,
        maxPlayers: 4,
        currentPlayers: 4,
        status: "FULL",
        organizerId: lucas.id,
        players: {
          create: [
            { userId: lucas.id, role: "ORGANIZER" },
            { userId: martin.id, role: "PLAYER" },
            { userId: sofia.id, role: "PLAYER" },
            { userId: ana.id, role: "PLAYER" },
          ],
        },
      },
    }),

    // Match 3: Open in Córdoba
    prisma.match.create({
      data: {
        title: "Partido mañana Córdoba",
        description: "Busco 3 jugadores para mañana en Nueva Córdoba",
        scheduledAt: new Date(inThreeDays.setHours(19, 0, 0, 0)),
        location: "Córdoba Pádel Club",
        city: "Córdoba",
        skillLevelMin: 1.5,
        skillLevelMax: 4.0,
        maxPlayers: 4,
        currentPlayers: 1,
        organizerId: lucas.id,
        players: {
          create: [{ userId: lucas.id, role: "ORGANIZER" }],
        },
      },
    }),

    // Match 4: Open in Rosario
    prisma.match.create({
      data: {
        title: "Pádel Rosario fin de semana",
        scheduledAt: new Date(inTwoDays.setHours(18, 30, 0, 0)),
        location: "Club Atlético Rosario",
        city: "Rosario",
        skillLevelMin: 1.0,
        skillLevelMax: 3.0,
        maxPlayers: 4,
        currentPlayers: 2,
        organizerId: pablo.id,
        players: {
          create: [
            { userId: pablo.id, role: "ORGANIZER" },
            { userId: sofia.id, role: "PLAYER" },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users and ${matches.length} matches`);
  console.log("\n📧 Test accounts (password: password123):");
  users.forEach((u) => console.log(`   - ${u.email} (${u.name})`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

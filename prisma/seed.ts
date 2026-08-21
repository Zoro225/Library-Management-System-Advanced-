import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding database...");

  // ---- Users ----
  const adminPassword = await hash("Admin@123");
  const staffPassword = await hash("Staff@123");
  const studentPassword = await hash("Student@123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@library.com" },
    update: {},
    create: {
      name: "Ava Admin",
      email: "admin@library.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@library.com" },
    update: {},
    create: {
      name: "Sam Staff",
      email: "staff@library.com",
      passwordHash: staffPassword,
      role: "STAFF",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@library.com" },
    update: {},
    create: {
      name: "Stu Student",
      email: "student@library.com",
      passwordHash: studentPassword,
      role: "STUDENT",
    },
  });

  const extraStudents = [
    { name: "Priya Nair", email: "priya@library.com" },
    { name: "Daniel Osei", email: "daniel@library.com" },
    { name: "Mei Lin", email: "mei@library.com" },
  ];
  const studentRecords: Record<string, string> = { student: student.id };
  for (const s of extraStudents) {
    const rec = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: studentPassword,
        role: "STUDENT",
      },
    });
    studentRecords[s.email] = rec.id;
  }

  // ---- Categories ----
  const categoryNames = [
    "Action",
    "Sci-Fi",
    "Fantasy",
    "Mystery",
    "Romance",
    "Non-Fiction",
    "Biography",
    "History",
    "Horror",
    "Self-Help",
    "Young Adult",
    "Poetry",
  ];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = cat.id;
  }

  // ---- Tags ----
  const tagNames = [
    "Bestseller",
    "Award-Winning",
    "Classic",
    "New Arrival",
    "Series",
    "Short Read",
    "Thriller",
    "Adventure",
    "Staff Pick",
    "Book Club Favorite",
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag.id;
  }

  // ---- Books ----
  const books = [
    { title: "The Last Horizon", author: "Maria Chen", category: "Sci-Fi", tags: ["Bestseller", "New Arrival"], description: "A gripping tale of humanity's last colony ship searching for a new home.", coverColor: "#2563eb", totalCopies: 3 },
    { title: "Nebula's Edge", author: "Maria Chen", category: "Sci-Fi", tags: ["Series", "Adventure"], description: "The sequel to The Last Horizon — the colonists face a new threat.", coverColor: "#1d4ed8", totalCopies: 3 },
    { title: "Signal From Kepler", author: "Owen Marsh", category: "Sci-Fi", tags: ["New Arrival", "Thriller"], description: "A first-contact story that turns into a race against a hidden countdown.", coverColor: "#0369a1", totalCopies: 2 },
    { title: "The Clockwork Sky", author: "Ines Bergman", category: "Sci-Fi", tags: ["Award-Winning"], description: "A floating city runs on a machine no one alive still understands.", coverColor: "#0891b2", totalCopies: 2 },

    { title: "Shadow Protocol", author: "James Cole", category: "Action", tags: ["Thriller", "Series"], description: "An elite operative races against time to stop a global conspiracy.", coverColor: "#dc2626", totalCopies: 4 },
    { title: "Iron Vendetta", author: "James Cole", category: "Action", tags: ["Series", "Thriller"], description: "The stakes escalate in the second Shadow Protocol novel.", coverColor: "#b91c1c", totalCopies: 2 },
    { title: "Red Perimeter", author: "Talia Okafor", category: "Action", tags: ["New Arrival", "Adventure"], description: "A border agent uncovers a smuggling ring that reaches the top of government.", coverColor: "#991b1b", totalCopies: 3 },
    { title: "Zero Hour Extraction", author: "Marcus Weld", category: "Action", tags: ["Bestseller"], description: "A hostage rescue team has ninety minutes before the building goes dark for good.", coverColor: "#ef4444", totalCopies: 2 },

    { title: "The Crown of Embers", author: "Elena Vasquez", category: "Fantasy", tags: ["Award-Winning", "Series"], description: "A young mage must reclaim her throne from an ancient evil.", coverColor: "#7c3aed", totalCopies: 2 },
    { title: "Whispers of the Fae", author: "Elena Vasquez", category: "Fantasy", tags: ["New Arrival", "Adventure"], description: "A standalone fantasy adventure set in the world of Crown of Embers.", coverColor: "#6d28d9", totalCopies: 3 },
    { title: "The Salt Throne", author: "Yusuf Demir", category: "Fantasy", tags: ["Staff Pick"], description: "A exiled prince builds an army from the outcasts of a dying desert kingdom.", coverColor: "#8b5cf6", totalCopies: 2 },
    { title: "Gardens of Ash", author: "Freya Lindqvist", category: "Fantasy", tags: ["Book Club Favorite", "Series"], description: "Two rival houses of gardeners wage a slow, beautiful war of magic.", coverColor: "#a855f7", totalCopies: 3 },

    { title: "Silent Witness", author: "Robert Hale", category: "Mystery", tags: ["Bestseller", "Thriller"], description: "A detective unravels a decades-old murder in a small coastal town.", coverColor: "#0f766e", totalCopies: 2 },
    { title: "The Quiet Alibi", author: "Robert Hale", category: "Mystery", tags: ["Short Read"], description: "A short, twisty mystery perfect for a single evening.", coverColor: "#115e59", totalCopies: 4 },
    { title: "The Locked Ward", author: "Naomi Petrov", category: "Mystery", tags: ["Award-Winning", "Staff Pick"], description: "A nurse investigates a patient's disappearance from a hospital with no exits.", coverColor: "#134e4a", totalCopies: 2 },
    { title: "Nine Doors", author: "Callum Reyes", category: "Mystery", tags: ["New Arrival", "Thriller"], description: "A locked-room mystery aboard a train that never reaches its final stop.", coverColor: "#0d9488", totalCopies: 3 },

    { title: "Beneath a Paris Sky", author: "Sophie Laurent", category: "Romance", tags: ["Classic"], description: "Two strangers find love amid the cafes and cobblestones of Paris.", coverColor: "#db2777", totalCopies: 3 },
    { title: "The Wrong Kind of Forever", author: "Nora Fitzgerald", category: "Romance", tags: ["Bestseller", "Book Club Favorite"], description: "Childhood rivals reunite years later and discover the rivalry was never the whole story.", coverColor: "#e11d48", totalCopies: 3 },
    { title: "Letters to No One", author: "Claire Dupont", category: "Romance", tags: ["Short Read"], description: "A woman finds a box of unsent love letters and sets out to deliver them.", coverColor: "#f43f5e", totalCopies: 2 },

    { title: "Atomic Habits Revisited", author: "Dr. Alan Frost", category: "Non-Fiction", tags: ["Bestseller", "New Arrival"], description: "Practical strategies for building better habits, backed by science.", coverColor: "#16a34a", totalCopies: 5 },
    { title: "The Quiet Economy", author: "Devika Rao", category: "Non-Fiction", tags: ["Staff Pick"], description: "A clear-eyed look at the informal economies that keep cities running.", coverColor: "#15803d", totalCopies: 2 },
    { title: "Deep Work, Deeper Rest", author: "Marcus Cho", category: "Self-Help", tags: ["Bestseller"], description: "Why recovery, not hustle, is the real productivity lever.", coverColor: "#22c55e", totalCopies: 3 },
    { title: "The Art of Saying No", author: "Renee Tanaka", category: "Self-Help", tags: ["Short Read", "Staff Pick"], description: "A practical guide to boundaries without the guilt.", coverColor: "#4ade80", totalCopies: 2 },

    { title: "The Wright Brothers", author: "Nancy Byrne", category: "Biography", tags: ["Award-Winning"], description: "The story of the two brothers who changed the world with flight.", coverColor: "#ca8a04", totalCopies: 2 },
    { title: "A Life in Ink", author: "Harold Fenwick", category: "Biography", tags: ["Book Club Favorite"], description: "The memoir of a war correspondent who covered five decades of conflict.", coverColor: "#a16207", totalCopies: 2 },

    { title: "Empires of Sand", author: "Farouk Idris", category: "History", tags: ["Classic", "Adventure"], description: "A sweeping account of the great desert empires of antiquity.", coverColor: "#92400e", totalCopies: 2 },
    { title: "The Last Telegram", author: "Margaret Osei", category: "History", tags: ["New Arrival"], description: "How a single message changed the outcome of a forgotten war.", coverColor: "#b45309", totalCopies: 2 },

    { title: "What the House Remembers", author: "Lila Ashworth", category: "Horror", tags: ["Award-Winning", "Staff Pick"], description: "A family restores an old house and wakes something that never left it.", coverColor: "#450a0a", totalCopies: 2 },
    { title: "The Hollow Choir", author: "Victor Amsel", category: "Horror", tags: ["New Arrival", "Thriller"], description: "A small town's annual choir festival hides a ritual centuries old.", coverColor: "#7f1d1d", totalCopies: 2 },

    { title: "Static and Stars", author: "Priya Malhotra", category: "Young Adult", tags: ["Bestseller", "New Arrival"], description: "Two teens broadcasting a pirate radio show accidentally start a movement.", coverColor: "#f97316", totalCopies: 4 },
    { title: "The Cartography of Us", author: "Jonah Pierce", category: "Young Adult", tags: ["Book Club Favorite"], description: "A road trip novel about mapping the parts of yourself you've never shown anyone.", coverColor: "#fb923c", totalCopies: 3 },

    { title: "Small Hours", author: "Noor Siddiqui", category: "Poetry", tags: ["Classic", "Short Read"], description: "A collection on night shifts, cities, and the people who keep them running.", coverColor: "#525252", totalCopies: 2 },
    { title: "Ghazals for the Unwritten", author: "Imran Qureshi", category: "Poetry", tags: ["Classic", "Short Read"], description: "A slim collection that folds the old ghazal form around distinctly modern heartbreaks.", coverColor: "#737373", totalCopies: 2 },

    { title: "The Mumbai Orbit", author: "Karthik Subramaniam", category: "Sci-Fi", tags: ["New Arrival", "Adventure"], description: "A space elevator rising from Mumbai's harbor becomes the center of a near-future scramble for the stars.", coverColor: "#0e7490", totalCopies: 3 },

    { title: "Monsoon Protocol", author: "Gurpreet Singh", category: "Action", tags: ["Thriller", "Series"], description: "An intelligence officer has one flooded Delhi night to stop a handover that could topple a government.", coverColor: "#c1121f", totalCopies: 3 },

    { title: "The Serpent's Court", author: "Lakshmi Menon", category: "Fantasy", tags: ["Award-Winning", "Series"], description: "A mythology-steeped tale of a hidden naga kingdom stirring beneath Kerala's backwaters.", coverColor: "#9333ea", totalCopies: 2 },
    { title: "Ashes of Indraprastha", author: "Aditya Deshmukh", category: "Fantasy", tags: ["Staff Pick"], description: "A wandering scribe pieces together the legend of a lost city said to have burned seven times and risen eight.", coverColor: "#6b21a8", totalCopies: 2 },

    { title: "The Vanishing at Victoria Terminus", author: "Meera Rajan", category: "Mystery", tags: ["Bestseller", "Thriller"], description: "A railway clerk's disappearance from one of Mumbai's busiest stations unravels a decades-old debt.", coverColor: "#14b8a6", totalCopies: 3 },

    { title: "Two Springs in Srinagar", author: "Ritika Banerjee", category: "Romance", tags: ["Book Club Favorite"], description: "A love story that returns to the same Kashmiri valley twice, a generation apart, to ask if some things wait.", coverColor: "#ec4899", totalCopies: 2 },

    { title: "The Spice Route Ledger", author: "Sourav Chatterjee", category: "Non-Fiction", tags: ["Staff Pick"], description: "A ledger-keeper's-eye account of the trade networks that once stitched the Indian Ocean together.", coverColor: "#166534", totalCopies: 2 },

    { title: "The Patience of Rivers", author: "Ananya Gupta", category: "Self-Help", tags: ["Bestseller"], description: "Lessons on stillness and persistence drawn from a childhood spent along a slow, wide river.", coverColor: "#86efac", totalCopies: 3 },

    { title: "Letters from the Deccan", author: "Arjun Bhatt", category: "Biography", tags: ["Award-Winning"], description: "The fictionalized memoir of a village schoolteacher whose classroom became a quiet center of a changing era.", coverColor: "#854d0e", totalCopies: 2 },

    { title: "Partition Lines", author: "Simran Kaur", category: "History", tags: ["Classic", "New Arrival"], description: "Two families drawn apart by a new border try to keep a decades-long correspondence alive.", coverColor: "#78350f", totalCopies: 2 },

    { title: "The Banyan's Whisper", author: "Rohan Sharma", category: "Horror", tags: ["New Arrival", "Thriller"], description: "A village in rural Tamil Nadu keeps its distance from an ancient banyan tree, and for good reason.", coverColor: "#601b1b", totalCopies: 2 },

    { title: "Diaspora Diaries", author: "Neha Kapoor", category: "Young Adult", tags: ["Bestseller", "New Arrival"], description: "A teenager splits her year between Chennai and Toronto and keeps two very different diaries to make sense of it.", coverColor: "#fdba74", totalCopies: 3 },
  ];

  const createdBooks: Record<string, string> = {};
  for (const b of books) {
    const existing = await prisma.book.findFirst({ where: { title: b.title } });
    if (existing) {
      createdBooks[b.title] = existing.id;
      continue;
    }

    const created = await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        description: b.description,
        coverColor: b.coverColor,
        totalCopies: b.totalCopies,
        availableCopies: b.totalCopies,
        categoryId: categories[b.category],
        tags: {
          create: b.tags.map((t) => ({ tagId: tags[t] })),
        },
      },
    });
    createdBooks[b.title] = created.id;
  }

  // ---- Sample borrow activity, so dashboards aren't empty on first look ----
  async function ensureRequest(
    bookTitle: string,
    studentId: string,
    status: "PENDING" | "APPROVED" | "RETURNED",
    daysAgo: number,
    opts: { renewalRequested?: boolean } = {}
  ) {
    const bookId = createdBooks[bookTitle];
    if (!bookId) return;

    const existing = await prisma.borrowRequest.findFirst({
      where: { bookId, studentId },
    });
    if (existing) {
      if (opts.renewalRequested !== undefined && existing.renewalRequested !== opts.renewalRequested) {
        await prisma.borrowRequest.update({
          where: { id: existing.id },
          data: { renewalRequested: opts.renewalRequested },
        });
      }
      return;
    }

    const requestedAt = new Date();
    requestedAt.setDate(requestedAt.getDate() - daysAgo);

    if (status === "PENDING") {
      await prisma.borrowRequest.create({
        data: { bookId, studentId, status: "PENDING", requestedAt },
      });
      return;
    }

    const decidedAt = new Date(requestedAt);
    decidedAt.setDate(decidedAt.getDate() + 1);
    const dueDate = new Date(decidedAt);
    dueDate.setDate(dueDate.getDate() + 14);

    if (status === "APPROVED") {
      await prisma.$transaction([
        prisma.borrowRequest.create({
          data: {
            bookId,
            studentId,
            status: "APPROVED",
            requestedAt,
            decidedAt,
            dueDate,
            approvedById: staff.id,
            renewalRequested: opts.renewalRequested ?? false,
          },
        }),
        prisma.book.update({
          where: { id: bookId },
          data: { availableCopies: { decrement: 1 } },
        }),
      ]);
      return;
    }

    // RETURNED
    const returnedAt = new Date(decidedAt);
    returnedAt.setDate(returnedAt.getDate() + 10);
    await prisma.borrowRequest.create({
      data: {
        bookId,
        studentId,
        status: "RETURNED",
        requestedAt,
        decidedAt,
        dueDate,
        returnedAt,
        approvedById: staff.id,
      },
    });
  }

  await ensureRequest("Signal From Kepler", studentRecords["student"], "PENDING", 1);
  await ensureRequest("The Wrong Kind of Forever", studentRecords["priya@library.com"], "PENDING", 2);
  await ensureRequest("Shadow Protocol", studentRecords["student"], "APPROVED", 5);
  await ensureRequest("The Crown of Embers", studentRecords["daniel@library.com"], "APPROVED", 3, {
    renewalRequested: true,
  });
  await ensureRequest("Silent Witness", studentRecords["mei@library.com"], "RETURNED", 30);
  await ensureRequest("Nine Doors", studentRecords["student"], "APPROVED", 20);

  console.log("Seeding complete.");
  console.log("");
  console.log("Login credentials:");
  console.log("  Admin:   admin@library.com   / Admin@123");
  console.log("  Staff:   staff@library.com   / Staff@123");
  console.log("  Student: student@library.com / Student@123");
  console.log(`  Books:   ${books.length}, Categories: ${categoryNames.length}, Tags: ${tagNames.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

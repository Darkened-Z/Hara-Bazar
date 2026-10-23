import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

// Packshot-style illustration for a product: a pack shape picked by category,
// in the category colour, with the product name on the label.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(name: string, max = 13) {
  const lines: string[] = [];
  for (const word of name.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= max) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  return lines.slice(0, 4);
}

// Each shape: the pack outline, plus the label box (x, y, w, h) the name is written in.
const SHAPES: Record<string, { body: string; label: [number, number, number, number] }> = {
  bottle: {
    body: `<rect x="178" y="58" width="44" height="34" rx="6" fill="C"/><path d="M168 92h64c0 26 34 34 34 70v170a20 20 0 0 1-20 20H154a20 20 0 0 1-20-20V162c0-36 34-44 34-70z" fill="C"/>`,
    label: [146, 182, 108, 120],
  },
  sack: {
    body: `<path d="M120 96c20-12 140-12 160 0l14 16-8 230a14 14 0 0 1-14 14H128a14 14 0 0 1-14-14l-8-230z" fill="C"/><path d="M128 102c30 10 114 10 144 0" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none"/>`,
    label: [136, 170, 128, 130],
  },
  box: {
    body: `<path d="M128 104l22-26h132l-22 26z" fill="C" opacity=".7"/><path d="M260 104l22-26v236l-22 26z" fill="C" opacity=".55"/><rect x="128" y="104" width="132" height="236" rx="4" fill="C"/>`,
    label: [138, 150, 112, 130],
  },
  carton: {
    body: `<path d="M140 120l20-50h80l20 50z" fill="C" opacity=".75"/><rect x="186" y="56" width="28" height="14" rx="3" fill="C"/><rect x="140" y="120" width="120" height="226" rx="6" fill="C"/>`,
    label: [148, 168, 104, 128],
  },
  bag: {
    body: `<path d="M120 84h160l-10 22 14 210-14 24H130l-14-24 14-210z" fill="C"/><path d="M120 84l10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>`,
    label: [138, 156, 124, 132],
  },
  spray: {
    body: `<path d="M188 52h40l18 16h-30v20h-28z" fill="C" opacity=".8"/><rect x="180" y="88" width="40" height="26" rx="4" fill="C"/><path d="M160 114h80c14 0 22 12 22 26v186a20 20 0 0 1-20 20h-84a20 20 0 0 1-20-20V140c0-14 8-26 22-26z" fill="C"/>`,
    label: [150, 170, 100, 128],
  },
};

const SHAPE_FOR: Record<string, keyof typeof SHAPES> = {
  "oil-ghee": "bottle", "rice-flour": "sack", spices: "box", dairy: "carton",
  beverages: "bottle", snacks: "bag", cleaning: "spray", "personal-care": "box",
};

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [row] = await db
    .select({ name: products.name, color: categories.color, category: categories.slug })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  const name = row?.name ?? "Product";
  const color = row?.color ?? "#2E7D32";
  const shape = SHAPES[SHAPE_FOR[row?.category ?? ""] ?? "box"];
  const [lx, ly, lw, lh] = shape.label;
  const lines = wrap(name);
  const fs = lines.some((l) => l.length > 10) ? 15 : 17;
  const startY = ly + lh / 2 - ((lines.length - 1) * (fs + 4)) / 2 + fs / 3;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${color}" fill-opacity=".08"/>
  <ellipse cx="200" cy="362" rx="96" ry="12" fill="#000" fill-opacity=".08"/>
  ${shape.body.replace(/"C"/g, `"${color}"`)}
  <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="8" fill="#fff" fill-opacity=".94"/>
  <rect x="${lx}" y="${ly}" width="${lw}" height="6" rx="3" fill="${color}" fill-opacity=".5"/>
  ${lines
    .map((l, i) => `<text x="${lx + lw / 2}" y="${startY + i * (fs + 4)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="700" fill="#1C1C1E">${esc(l)}</text>`)
    .join("\n  ")}
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}

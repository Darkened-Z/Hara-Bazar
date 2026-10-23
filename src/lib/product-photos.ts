// Real pack photos in public/products (from Open Food Facts, CC BY-SA, see CREDITS.json).
// Products without one fall back to the drawn packshot at /product-image/[slug].
const PHOTOS = new Set([
  "canola-cooking-oil-1l",
  "chakki-atta-10kg",
  "dalda-banaspati-ghee-1kg",
  "dalda-cooking-oil-5l",
  "falak-basmati-rice-1kg",
  "harpic-toilet-cleaner-500ml",
  "kurkure-masala-munch",
  "lays-classic-large",
  "lifebuoy-soap-bar",
  "lux-soap-bar-pack-of-6",
  "mehran-chili-powder-400g",
  "milky-mist-cheese-spread-200g",
  "nestle-everyday-900g",
  "nurpur-full-cream-milk-1l",
  "olpers-full-cream-milk-1l-x6",
  "pakistan-basmati-long-grain-rice-5kg",
  "peek-freans-sooper-12-pack",
  "rooh-afza-800ml",
  "shan-chicken-white-karahi",
  "shan-karahi-masala",
  "sunflower-cooking-oil-3l",
  "surf-excel-washing-powder-3kg",
  "tapal-danedar-tea-950g",
  "vim-dishwash-bar-300g",
]);

export const productImage = (slug: string) => (PHOTOS.has(slug) ? `/products/${slug}.jpg` : `/product-image/${slug}`);

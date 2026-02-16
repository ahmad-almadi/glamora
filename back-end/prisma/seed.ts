import { prisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

console.log("=== SEED SCRIPT STARTING ===");

async function main() {
  console.log("🌱 Starting seed...");

  // Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        authProvider: "local",
      },
    });
    console.log("✅ Admin user created");
  } else {
    console.log("✅ Admin already exists");
  }

  // Create Categories
  const categoryNames = [
    "Dresses",
    "Tops",
    "Bottoms",
    "Outerwear",
    "Accessories",
    "Bags",
    "Jewelry",
    "Activewear",
    "Swimwear",
  ];

  const createdCategories: any[] = [];
  for (const name of categoryNames) {
    let category = await prisma.category.findUnique({ where: { name } });
    if (!category) {
      category = await prisma.category.create({ data: { name } });
      console.log(`✅ Category created: ${name}`);
    } else {
      console.log(`✅ Category exists: ${name}`);
    }
    createdCategories.push(category);
  }

  // Standard colors and sizes
  const COLORS = ["Black", "White", "Red", "Blue", "Pink", "Gray"];
  const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const ONE_SIZE = ["One Size"];

  // Product name templates
  const productNames: Record<string, string[]> = {
    Dresses: [
      "Elegant Evening Dress", "Summer Floral Dress", "Little Black Dress", "Bohemian Maxi Dress", "Cocktail Party Dress",
      "Casual T-Shirt Dress", "Wrap Midi Dress", "Off-Shoulder Dress", "Classic Shirt Dress", "Silk Slip Dress",
      "A-Line Dress", "Cozy Sweater Dress", "Bodycon Dress", "Peasant Dress", "Halter Neck Dress",
      "Tiered Ruffle Dress", "Denim Shirt Dress", "Lace Evening Dress", "Maxi Shirt Dress", "Pleated Midi Dress",
      "Fit and Flare Dress", "Empire Waist Dress", "Sheath Dress", "Smock Dress", "Pinafore Dress",
      "Tunic Dress", "Asymmetric Hem Dress", "Balloon Sleeve Dress", "Cut-Out Dress", "Velvet Dress",
      "Satin Slip Dress", "Knit Dress", "Chambray Dress", "Polka Dot Dress", "Striped Dress",
      "Floral Print Dress", "Sequin Dress", "Chiffon Dress", "Jersey Dress", "Corduroy Dress",
      "Ribbed Dress", "Crochet Dress", "Embroidered Dress", "Printed Maxi Dress", "Belted Dress",
      "Puff Sleeve Dress", "Midi Wrap Dress", "Backless Dress", "High-Low Dress", "Ruffled Dress"
    ],
    Tops: [
      "Classic White T-Shirt", "Silk Blouse", "Crop Top", "Striped Button-Up", "Off-Shoulder Top",
      "Turtleneck Sweater", "Peplum Top", "Basic Tank Top", "Wrap Top", "Graphic Tee",
      "Lace Cami", "Oversized Sweater", "Halter Top", "Button Cardigan", "Ruffle Blouse",
      "V-Neck Sweater", "Bodysuit", "Polo Shirt", "Peasant Top", "Sequin Top",
      "Cowl Neck Top", "Henley Shirt", "Bell Sleeve Top", "Tunic Top", "Mesh Top",
      "Corset Top", "Tie-Front Top", "Ribbed Knit Top", "Satin Cami", "Longline Blazer",
      "Cropped Sweater", "Flannel Shirt", "Denim Shirt", "Knit Pullover", "Sleeveless Top",
      "Long Sleeve Tee", "Hoodie", "Sweatshirt", "Zip-Up Hoodie", "Thermal Top",
      "Baseball Tee", "Raglan Top", "Muscle Tank", "Racerback Tank", "Sports Bra Top",
      "Bralette Top", "Tube Top", "Bandeau Top", "Kimono Top", "Poncho Top"
    ],
    Bottoms: [
      "Skinny Jeans", "High-Waisted Trousers", "Denim Shorts", "Faux Leather Pants", "Midi Skirt",
      "Yoga Pants", "Pleated Skirt", "Cargo Pants", "Mini Skirt", "Wide Leg Jeans",
      "Pencil Skirt", "Joggers", "Maxi Skirt", "Boyfriend Jeans", "Culottes",
      "Leggings", "Flare Jeans", "Bermuda Shorts", "A-Line Skirt", "Palazzo Pants",
      "Chino Pants", "Tennis Skirt", "Straight Leg Jeans", "Wrap Skirt", "Track Pants",
      "Denim Skirt", "Capri Pants", "Tiered Skirt", "Corduroy Pants", "Slit Skirt",
      "Mom Jeans", "Paperbag Pants", "Bike Shorts", "Sweatpants", "Linen Pants",
      "Bootcut Jeans", "Cargo Shorts", "Circle Skirt", "Trouser Pants", "Athletic Shorts",
      "Jean Shorts", "Pleated Pants", "Skort", "Harem Pants", "Cropped Pants",
      "Drawstring Pants", "Knit Pants", "Satin Skirt", "Tulle Skirt", "Sequin Skirt"
    ],
    Outerwear: [
      "Leather Moto Jacket", "Classic Trench Coat", "Denim Jacket", "Puffer Jacket", "Tailored Blazer",
      "Wool Coat", "Bomber Jacket", "Long Cardigan", "Hooded Parka", "Peacoat",
      "Teddy Bear Coat", "Rain Jacket", "Suede Jacket", "Cape Coat", "Windbreaker",
      "Faux Fur Coat", "Quilted Jacket", "Shacket", "Cropped Jacket", "Utility Jacket",
      "Anorak", "Varsity Jacket", "Knit Poncho", "Moto Jacket", "Field Jacket",
      "Fleece Jacket", "Biker Jacket", "Duffle Coat", "Softshell Jacket", "Long Overcoat",
      "Jean Jacket", "Sherpa Jacket", "Track Jacket", "Hooded Jacket", "Zip Jacket",
      "Parka Coat", "Belted Coat", "Wrap Coat", "Down Jacket", "Insulated Jacket",
      "Leather Blazer", "Corduroy Jacket", "Velvet Blazer", "Tweed Jacket", "Camel Coat",
      "Trench Jacket", "Military Jacket", "Aviator Jacket", "Collarless Jacket", "Cropped Blazer"
    ],
    Accessories: [
      "Silk Scarf", "Wide Brim Hat", "Leather Belt", "Knit Beanie", "Baseball Cap",
      "Bucket Hat", "Hair Clips Set", "Padded Headband", "Velvet Scrunchies", "Bow Hair Tie",
      "Fedora Hat", "French Beret", "Sports Visor", "Cotton Bandana", "Neck Gaiter",
      "Leather Gloves", "Knit Mittens", "Arm Warmers", "Leg Warmers", "Suspenders",
      "Aviator Sunglasses", "Reading Glasses", "Silk Tie", "Bow Tie", "Pocket Square",
      "Silver Cufflinks", "Compact Umbrella", "Leather Keychain", "Phone Case", "Watch Band",
      "Cat Eye Sunglasses", "Round Sunglasses", "Wayfarer Sunglasses", "Oversized Sunglasses", "Sport Sunglasses",
      "Wool Scarf", "Infinity Scarf", "Pashmina Shawl", "Knit Scarf", "Cashmere Scarf",
      "Straw Hat", "Panama Hat", "Newsboy Cap", "Trucker Hat", "Snapback Cap",
      "Hair Pins", "Bobby Pins", "Hair Bands", "Claw Clips", "Barrettes"
    ],
    Bags: [
      "Leather Handbag", "Crossbody Bag", "Canvas Tote Bag", "Evening Clutch", "Laptop Backpack",
      "Leather Wallet", "Shoulder Bag", "Bucket Bag", "Structured Satchel", "Hobo Bag",
      "Messenger Bag", "Wristlet", "Belt Bag", "Duffel Bag", "Weekender Bag",
      "Coin Purse", "Card Holder", "Laptop Bag", "Cosmetic Bag", "Evening Bag",
      "Mini Backpack", "Drawstring Bag", "Foldover Clutch", "Chain Bag", "Saddle Bag",
      "Box Bag", "Zipper Pouch", "Travel Bag", "Gym Bag", "Envelope Clutch",
      "Tote Backpack", "Convertible Bag", "Camera Bag", "Doctor Bag", "Frame Bag",
      "Bowling Bag", "Barrel Bag", "Half Moon Bag", "Top Handle Bag", "Flap Bag",
      "Quilted Bag", "Studded Bag", "Fringe Bag", "Woven Bag", "Straw Bag",
      "Nylon Bag", "Suede Bag", "Patent Bag", "Canvas Bag", "Velvet Bag"
    ],
    Jewelry: [
      "Statement Necklace", "Gold Hoop Earrings", "Layered Necklace", "Diamond Studs", "Leather Watch",
      "Charm Bracelet", "Pendant Necklace", "Cuff Bracelet", "Drop Earrings", "Velvet Choker",
      "Silver Anklet", "Stackable Rings", "Gold Bangle", "Ear Cuff", "Body Chain",
      "Vintage Brooch", "Toe Ring", "Friendship Bracelet", "Photo Locket", "Tassel Earrings",
      "Tennis Bracelet", "Cocktail Ring", "Chain Necklace", "Huggie Earrings", "Beaded Bracelet",
      "Cross Necklace", "Midi Ring", "Pearl Necklace", "Chandelier Earrings", "Leather Bracelet",
      "Infinity Necklace", "Stud Set", "Link Bracelet", "Dangle Earrings", "Signet Ring",
      "Bar Necklace", "Threader Earrings", "Wrap Bracelet", "Coin Necklace", "Climber Earrings",
      "Snake Chain", "Pearl Earrings", "Rope Bracelet", "Heart Necklace", "Geometric Earrings",
      "Initial Necklace", "Crystal Earrings", "Leather Necklace", "Minimalist Ring", "Vintage Earrings"
    ],
    Activewear: [
      "Sports Bra", "Yoga Leggings", "Running Shorts", "Workout Tank", "Track Jacket",
      "Compression Tights", "Gym Shorts", "Pullover Hoodie", "Sweatpants", "Crop Top",
      "Windbreaker Jacket", "Cycling Shorts", "Training Tee", "Capri Leggings", "Muscle Tank",
      "Jogger Pants", "Long Sleeve Shirt", "Bike Shorts", "Zip-Up Jacket", "Athletic Skirt",
      "Performance Polo", "Training Pants", "Racerback Tank", "Thermal Top", "Athletic Shorts",
      "Fleece Hoodie", "Seamless Leggings", "Quarter Zip", "Mesh Leggings", "Reflective Jacket",
      "Sports Tank", "Running Tights", "Gym Hoodie", "Workout Shorts", "Training Jacket",
      "Yoga Top", "Running Jacket", "Fitness Pants", "Athletic Top", "Warm-Up Pants",
      "Performance Shorts", "Training Hoodie", "Yoga Pants", "Running Top", "Gym Pants",
      "Workout Jacket", "Athletic Leggings", "Training Top", "Running Pants", "Fitness Top"
    ],
    Swimwear: [
      "One-Piece Swimsuit", "Bikini Set", "High-Waisted Bikini", "Tankini", "Rash Guard",
      "Beach Cover-Up", "Board Shorts", "Halter Bikini", "Bikini Bottom", "Monokini",
      "Beach Sarong", "Swim Skirt", "Triangle Bikini", "Bandeau Bikini", "Swim Dress",
      "Beach Kaftan", "Sports Bikini", "Swim Leggings", "Plunge Swimsuit", "Beach Pants",
      "Cut-Out Swimsuit", "Swim Trunks", "Crochet Bikini", "Swim Capris", "Wrap Bikini",
      "Swim Tank", "Ruffle Bikini", "Long Sleeve Suit", "Swim Romper", "Mesh Cover-Up",
      "Athletic Swimsuit", "Retro Bikini", "String Bikini", "Push-Up Bikini", "Sporty Tankini",
      "Swim Shorts", "Beach Tunic", "Swim Top", "Boy Short Bottom", "Swim Skort",
      "Halter Swimsuit", "Strapless Bikini", "Tie-Side Bikini", "Swim Bra", "Beach Dress",
      "Swim Crop Top", "High Neck Suit", "Scoop Back Suit", "V-Neck Swimsuit", "Swim Bodysuit"
    ]
  };

  // Image URLs by category
  const imageUrls: Record<string, string[]> = {
    Dresses: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446"
    ],
    Tops: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "https://images.unsplash.com/photo-1564859228273-274232fdb516",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"
    ],
    Bottoms: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1",
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa"
    ],
    Outerwear: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0"
    ],
    Accessories: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee",
      "https://images.unsplash.com/photo-1624222247344-550fb60583bb",
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531",
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
    ],
    Bags: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      "https://images.unsplash.com/photo-1627123424574-724758594e93"
    ],
    Jewelry: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314"
    ],
    Activewear: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1",
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
      "https://images.unsplash.com/photo-1564859228273-274232fdb516"
    ],
    Swimwear: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b"
    ]
  };

  console.log("🌱 Creating products...");

  for (const category of createdCategories) {
    const names = productNames[category.name];
    const images = imageUrls[category.name];
    
    for (let i = 0; i < 50; i++) {
      const productName = names[i];
      const price = parseFloat((Math.random() * (200 - 25) + 25).toFixed(2));
      const quantity = Math.floor(Math.random() * (120 - 30) + 30);
      const isNew = Math.random() > 0.6;
      
      // Determine sizes
      let sizes = CLOTHING_SIZES;
      if (["Accessories", "Bags", "Jewelry"].includes(category.name)) {
        sizes = ONE_SIZE;
      } else if (category.name === "Swimwear" && (productName.includes("Sarong") || productName.includes("Kaftan") || productName.includes("Cover-Up"))) {
        sizes = ONE_SIZE;
      }
      
      // Select 2-4 random colors
      const numColors = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...COLORS].sort(() => 0.5 - Math.random());
      const colors = shuffled.slice(0, numColors);
      
      // Select image
      const imageUrl = images[i % images.length] + "?w=500";
      
      const product = await prisma.product.create({
        data: {
          name: productName,
          price,
          description: `Premium ${productName.toLowerCase()} crafted with quality materials. Perfect addition to your wardrobe.`,
          quantity,
          isNew,
          imageUrl,
          categoryId: category.id,
          sizes,
          colors,
        },
      });

      // Create variants
      for (const size of sizes) {
        for (const color of colors) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              size,
              color,
              stock: Math.floor(Math.random() * 25) + 5,
            },
          });
        }
      }

      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/50 products for ${category.name}`);
      }
    }
    console.log(`✅ Completed ${category.name}: 50 products`);
  }

  // Create Site Settings
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        storeName: "Glamora",
        storeEmail: "contact@glamora.com",
        storePhone: "+1 234 567 890",
        storeAddress: "123 Fashion Street, New York, NY 10001",
        currency: "USD",
        timezone: "America/New_York",
      },
    });
    console.log("✅ Site settings created");
  }

  console.log("🎉 Seed completed successfully!");
  console.log(`📊 Total: ${createdCategories.length} categories, ${createdCategories.length * 50} products`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

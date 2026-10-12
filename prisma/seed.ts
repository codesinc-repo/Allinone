import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=70",
  laptop: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=70",
  chair: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=70",
  cycle: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=70",
  camera: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=70",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=70",
  house1: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=70",
  house2: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=70",
  plot: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=70",
  apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=70",
  car1: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=70",
  car2: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=70",
  bike: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=70",
  scooter: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800&q=70",
};

async function main() {
  console.log("Clearing existing data…");
  await prisma.review.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.eChallan.deleteMany();
  await prisma.report.deleteMany();
  await prisma.directoryEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users…");
  const admin = await prisma.user.create({
    data: {
      email: "admin@superapp.test",
      name: "Super Admin",
      role: "ADMIN",
      phone: "+91 90000 00001",
      passwordHash: await bcrypt.hash("admin1234", 10),
    },
  });

  const users = await Promise.all(
    [
      ["Priya Sharma", "priya@superapp.test", "+91 98111 11111"],
      ["Rohit Patel", "rohit@superapp.test", "+91 98222 22222"],
      ["Anjali Nair", "anjali@superapp.test", "+91 98333 33333"],
      ["Kabir Mehta", "kabir@superapp.test", "+91 98444 44444"],
      ["Sana Khan", "sana@superapp.test", "+91 98555 55555"],
      ["Vikram Rao", "vikram@superapp.test", "+91 98666 66666"],
    ].map(([name, email, phone]) =>
      prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: "USER",
          passwordHash: bcrypt.hashSync("password", 10),
        },
      }),
    ),
  );
  const [priya, rohit, anjali, kabir, sana, vikram] = users;

  console.log("Creating categories…");
  const cat = async (
    name: string,
    module: string,
    icon?: string,
  ) =>
    prisma.category.create({
      data: {
        name,
        module,
        icon,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
    });

  // Marketplace
  const mElectronics = await cat("Electronics", "MARKETPLACE", "📱");
  const mFurniture = await cat("Furniture", "MARKETPLACE", "🛋");
  const mFashion = await cat("Fashion", "MARKETPLACE", "👕");
  const mBooks = await cat("Books", "MARKETPLACE", "📚");
  const mSports = await cat("Sports & Fitness", "MARKETPLACE", "⚽");

  // Services
  const sElectrician = await cat("Electrician", "SERVICES", "💡");
  const sPlumber = await cat("Plumber", "SERVICES", "🚿");
  const sMason = await cat("Mason (Raj Mistri)", "SERVICES", "🧱");
  const sLabour = await cat("Labour", "SERVICES", "👷");
  const sCleaning = await cat("Deep Cleaning", "SERVICES", "🧹");
  const sCarpenter = await cat("Carpenter", "SERVICES", "🪚");

  // Directory
  const dGovt = await cat("Government Offices", "DIRECTORY", "🏛");
  const dHealth = await cat("Hospitals & Clinics", "DIRECTORY", "🏥");
  const dEdu = await cat("Education", "DIRECTORY", "🎓");
  const dUtility = await cat("Utilities", "DIRECTORY", "⚡");
  const dEmergency = await cat("Emergency Services", "DIRECTORY", "🚨");
  const dPrivate = await cat("Private Services", "DIRECTORY", "💼");

  console.log("Creating operators…");
  const ops = await Promise.all([
    // Mobile
    { name: "Jio", code: "JIO", type: "MOBILE" },
    { name: "Airtel", code: "ARTL", type: "MOBILE" },
    { name: "Vi (Vodafone Idea)", code: "VI", type: "MOBILE" },
    { name: "BSNL", code: "BSNL", type: "MOBILE" },
    // DTH
    { name: "Tata Play", code: "TPLAY", type: "DTH" },
    { name: "Dish TV", code: "DISH", type: "DTH" },
    { name: "Airtel Digital TV", code: "ADTV", type: "DTH" },
    { name: "Sun Direct", code: "SUND", type: "DTH" },
    // FASTag
    { name: "ICICI FASTag", code: "ICFT", type: "FASTAG" },
    { name: "HDFC FASTag", code: "HDFT", type: "FASTAG" },
    { name: "Paytm FASTag", code: "PTFT", type: "FASTAG" },
    // Electricity
    { name: "Gujarat Electricity Board", code: "GEB", type: "ELECTRICITY" },
    { name: "Tata Power - Mumbai", code: "TPM", type: "ELECTRICITY" },
    { name: "BSES Delhi", code: "BSES", type: "ELECTRICITY" },
    { name: "Adani Electricity", code: "AEL", type: "ELECTRICITY" },
    // Loan
    { name: "HDFC Bank Loans", code: "HDFCL", type: "LOAN" },
    { name: "ICICI Loans", code: "ICICL", type: "LOAN" },
    { name: "Bajaj Finserv", code: "BAJ", type: "LOAN" },
    // Credit Card
    { name: "HDFC Credit Card", code: "HDFCC", type: "CREDIT_CARD" },
    { name: "SBI Card", code: "SBIC", type: "CREDIT_CARD" },
    { name: "Axis Credit Card", code: "AXIS", type: "CREDIT_CARD" },
  ].map((o) => prisma.operator.create({ data: o })));

  const jio = ops[0], airtel = ops[1], tataPlay = ops[4], icici = ops[8], geb = ops[11];

  console.log("Creating product listings…");
  const products = [
    {
      title: "iPhone 13 Pro (128GB) — immaculate condition",
      description: "Barely used, 94% battery health, box + original charger. No scratches.",
      price: 48000,
      condition: "USED",
      categoryId: mElectronics.id,
      sellerId: priya.id,
      images: [IMG.phone],
      location: "Ahmedabad, Satellite",
    },
    {
      title: "MacBook Air M1 — 8GB/256GB",
      description: "2 years old. Perfect for students. Comes with sleeve.",
      price: 62000,
      condition: "USED",
      categoryId: mElectronics.id,
      sellerId: rohit.id,
      images: [IMG.laptop],
      location: "Mumbai, Powai",
    },
    {
      title: "Herman Miller-style ergonomic chair",
      description: "Lumbar support, adjustable arms. Moving abroad, must sell.",
      price: 8500,
      condition: "USED",
      categoryId: mFurniture.id,
      sellerId: anjali.id,
      images: [IMG.chair],
      location: "Bangalore, Indiranagar",
    },
    {
      title: "Hero Lectro E-cycle (new)",
      description: "Unused, still in box. 25 km range on single charge.",
      price: 32000,
      condition: "NEW",
      categoryId: mSports.id,
      sellerId: kabir.id,
      images: [IMG.cycle],
      location: "Pune, Baner",
    },
    {
      title: "Canon EOS 200D DSLR + 18-55mm",
      description: "Shutter count under 5k. Includes extra battery and 64GB card.",
      price: 24000,
      condition: "USED",
      categoryId: mElectronics.id,
      sellerId: sana.id,
      images: [IMG.camera],
      location: "Delhi, Dwarka",
    },
    {
      title: "UPSC prep books (full set, 2024)",
      description: "NCERT + Laxmikanth + Spectrum + Shankar IAS. Light notes.",
      price: 3500,
      condition: "USED",
      categoryId: mBooks.id,
      sellerId: vikram.id,
      images: [IMG.books],
      location: "Jaipur, C-Scheme",
    },
    {
      title: "Samsung Galaxy S23 — brand new sealed",
      description: "Won in a contest. Full warranty. 256GB Phantom Black.",
      price: 68000,
      condition: "NEW",
      categoryId: mElectronics.id,
      sellerId: priya.id,
      images: [IMG.phone],
      location: "Ahmedabad, Bodakdev",
    },
  ];
  const createdProducts = await Promise.all(
    products.map((p) =>
      prisma.listing.create({
        data: { ...p, type: "PRODUCT", status: "ACTIVE", images: JSON.stringify(p.images) },
      }),
    ),
  );

  console.log("Creating property listings…");
  const properties = [
    {
      title: "3BHK semi-furnished house with garden",
      subtype: "HOUSE",
      description: "Independent house, 3BR/3BA, covered parking, west-facing garden.",
      price: 12500000,
      meta: { bedrooms: 3, area: "2400 sq ft" },
      sellerId: rohit.id,
      images: [IMG.house1],
      location: "Ahmedabad, Thaltej",
    },
    {
      title: "2BHK apartment in gated society",
      subtype: "APARTMENT",
      description: "7th floor, east-facing, lift + 24/7 security. 2 covered parkings.",
      price: 8200000,
      meta: { bedrooms: 2, area: "1150 sq ft" },
      sellerId: anjali.id,
      images: [IMG.apartment],
      location: "Pune, Kharadi",
    },
    {
      title: "Residential plot, 150 sq yd — NA titled",
      subtype: "PLOT",
      description: "Clear title, east-facing, near school and bus stop.",
      price: 2200000,
      meta: { area: "150 sq yd" },
      sellerId: kabir.id,
      images: [IMG.plot],
      location: "Surat, Vesu",
    },
    {
      title: "4BHK villa in gated community",
      subtype: "HOUSE",
      description: "Modular kitchen, servant quarter, community pool access.",
      price: 25000000,
      meta: { bedrooms: 4, area: "3800 sq ft" },
      sellerId: sana.id,
      images: [IMG.house2],
      location: "Bangalore, Whitefield",
    },
  ];
  await Promise.all(
    properties.map((p) =>
      prisma.listing.create({
        data: {
          type: "PROPERTY",
          subtype: p.subtype,
          title: p.title,
          description: p.description,
          price: p.price,
          location: p.location,
          sellerId: p.sellerId,
          status: "ACTIVE",
          images: JSON.stringify(p.images),
          meta: JSON.stringify(p.meta),
        },
      }),
    ),
  );

  console.log("Creating vehicle listings…");
  const vehicles = [
    {
      title: "2019 Honda City VX — single owner",
      subtype: "CAR",
      condition: "USED",
      description: "Service history complete, insurance till 2026. Petrol.",
      price: 850000,
      meta: { year: 2019, km: 42000, fuel: "Petrol", listingMode: "SALE" },
      sellerId: priya.id,
      images: [IMG.car1],
      location: "Ahmedabad",
    },
    {
      title: "2021 Hyundai Creta SX Turbo",
      subtype: "CAR",
      condition: "USED",
      description: "Top-end variant, panoramic sunroof. Garage-kept.",
      price: 1550000,
      meta: { year: 2021, km: 28000, fuel: "Petrol", listingMode: "SALE" },
      sellerId: rohit.id,
      images: [IMG.car2],
      location: "Mumbai",
    },
    {
      title: "Royal Enfield Classic 350 (2020)",
      subtype: "BIKE",
      condition: "USED",
      description: "Classic chrome. Full service record.",
      price: 128000,
      meta: { year: 2020, km: 18500, fuel: "Petrol", listingMode: "SALE" },
      sellerId: kabir.id,
      images: [IMG.bike],
      location: "Pune",
    },
    {
      title: "Swift Dzire — self-drive rental",
      subtype: "CAR",
      description: "Automatic, well maintained. KYC + security deposit required.",
      price: 2200,
      meta: { year: 2022, km: 24000, fuel: "Petrol", listingMode: "RENTAL" },
      sellerId: anjali.id,
      images: [IMG.car1],
      location: "Bangalore",
    },
    {
      title: "Activa 6G rental — per day",
      subtype: "BIKE",
      description: "Great for city errands. Helmet included.",
      price: 350,
      meta: { year: 2023, km: 12000, fuel: "Petrol", listingMode: "RENTAL" },
      sellerId: sana.id,
      images: [IMG.scooter],
      location: "Delhi",
    },
  ];
  await Promise.all(
    vehicles.map((v) =>
      prisma.listing.create({
        data: {
          type: "VEHICLE",
          subtype: v.subtype,
          title: v.title,
          description: v.description,
          price: v.price,
          condition: v.condition,
          location: v.location,
          sellerId: v.sellerId,
          status: "ACTIVE",
          images: JSON.stringify(v.images),
          meta: JSON.stringify(v.meta),
        },
      }),
    ),
  );

  console.log("Creating service providers…");
  const providers = await Promise.all([
    {
      name: "Rajesh Electricals",
      categoryId: sElectrician.id,
      bio: "15+ years in domestic & commercial wiring. Same-day visits.",
      phone: "+91 98100 11223",
      serviceArea: "Ahmedabad (Satellite, Bodakdev, Thaltej)",
      availability: "Mon-Sat 8am-8pm",
      rating: 4.7,
      reviewCount: 32,
      verified: true,
    },
    {
      name: "QuickFlow Plumbers",
      categoryId: sPlumber.id,
      bio: "Leak repair, bathroom fittings, overhead tanks. Emergency 24/7.",
      phone: "+91 98100 22334",
      serviceArea: "Bangalore (South)",
      availability: "24/7 emergency",
      rating: 4.5,
      reviewCount: 48,
      verified: true,
    },
    {
      name: "Suresh Mistri",
      categoryId: sMason.id,
      bio: "Brick, plaster, flooring. 20 years of experience.",
      phone: "+91 98100 33445",
      serviceArea: "Pune (Kothrud, Baner)",
      availability: "Mon-Sat",
      rating: 4.4,
      reviewCount: 18,
      verified: false,
    },
    {
      name: "Mahesh Labour Services",
      categoryId: sLabour.id,
      bio: "Shifting, loading/unloading, daily-wage labour on call.",
      phone: "+91 98100 44556",
      serviceArea: "Mumbai (Western line)",
      availability: "Daily 7am-7pm",
      rating: 4.2,
      reviewCount: 24,
      verified: false,
    },
    {
      name: "ShineHome Deep Cleaning",
      categoryId: sCleaning.id,
      bio: "Professional sofa, kitchen, bathroom deep cleaning with eco-friendly products.",
      phone: "+91 98100 55667",
      serviceArea: "Delhi NCR",
      availability: "Daily",
      rating: 4.8,
      reviewCount: 61,
      verified: true,
    },
    {
      name: "Woodcraft Carpenter",
      categoryId: sCarpenter.id,
      bio: "Modular kitchens, wardrobes, furniture repair.",
      phone: "+91 98100 66778",
      serviceArea: "Hyderabad",
      availability: "Mon-Sun 9am-7pm",
      rating: 4.6,
      reviewCount: 27,
      verified: true,
    },
    {
      name: "Ravi the Electrician",
      categoryId: sElectrician.id,
      bio: "Fuse, inverter, AC installation. Quick response.",
      phone: "+91 98100 77889",
      serviceArea: "Jaipur",
      availability: "Mon-Sat 9am-6pm",
      rating: 4.1,
      reviewCount: 11,
      verified: false,
    },
  ].map((p) => prisma.serviceProvider.create({ data: p })));

  console.log("Creating service requests and reviews…");
  await prisma.serviceRequest.createMany({
    data: [
      {
        providerId: providers[0].id,
        userId: priya.id,
        description: "Living room ceiling light is flickering.",
        location: "Satellite, Ahmedabad",
        preferredTime: "Sat morning",
        status: "COMPLETED",
      },
      {
        providerId: providers[1].id,
        userId: anjali.id,
        description: "Kitchen sink leak",
        location: "Indiranagar, Bangalore",
        preferredTime: "ASAP",
        status: "CONTACTED",
      },
      {
        providerId: providers[4].id,
        userId: sana.id,
        description: "Full sofa + carpet deep clean before Diwali",
        location: "Dwarka, Delhi",
        preferredTime: "Weekend",
        status: "NEW",
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        providerId: providers[0].id,
        userId: priya.id,
        rating: 5,
        comment: "Rajesh fixed everything in 20 minutes. Super responsive.",
      },
      {
        providerId: providers[1].id,
        userId: anjali.id,
        rating: 4,
        comment: "Fast arrival, slight delay with parts but got it done.",
      },
      {
        providerId: providers[4].id,
        userId: rohit.id,
        rating: 5,
        comment: "Our kitchen looks brand new. Totally worth it.",
      },
      {
        providerId: providers[5].id,
        userId: kabir.id,
        rating: 5,
        comment: "Beautifully built wardrobe — exactly what we discussed.",
      },
    ],
  });

  console.log("Creating directory entries…");
  await prisma.directoryEntry.createMany({
    data: [
      // Government
      {
        name: "RTO — Regional Transport Office",
        categoryId: dGovt.id,
        description: "Driving licence, vehicle registration, fitness certificates.",
        address: "Subhash Bridge, Ahmedabad - 380027",
        phone: "+91 79 2755 3333",
        website: "https://parivahan.gov.in",
        hours: "Mon-Fri 10:30am-5pm",
        isPaid: false,
        featured: true,
      },
      {
        name: "Municipal Corporation (AMC)",
        categoryId: dGovt.id,
        description: "Property tax, birth/death certificates, water & drainage.",
        address: "Danapith, Ahmedabad - 380001",
        phone: "+91 79 2539 1811",
        website: "https://ahmedabadcity.gov.in",
        hours: "Mon-Fri 11am-6pm",
        isPaid: false,
      },
      {
        name: "Passport Seva Kendra",
        categoryId: dGovt.id,
        description: "Fresh passport & re-issue appointments.",
        address: "Mithakhali, Ahmedabad - 380009",
        phone: "+91 1800 258 1800",
        website: "https://passportindia.gov.in",
        hours: "Mon-Sat 9am-4pm",
        isPaid: false,
      },
      // Health
      {
        name: "Civil Hospital Ahmedabad",
        categoryId: dHealth.id,
        description: "Public tertiary care hospital. Emergency 24/7.",
        address: "Asarwa, Ahmedabad - 380016",
        phone: "+91 79 2268 3721",
        hours: "24/7",
        isPaid: false,
        featured: true,
      },
      {
        name: "Apollo Hospitals",
        categoryId: dHealth.id,
        description: "Multi-specialty private hospital with 24/7 emergency.",
        address: "Plot 1A, GIDC, Bhat, Gandhinagar",
        phone: "+91 79 6670 1800",
        website: "https://apollohospitals.com",
        hours: "24/7",
        isPaid: true,
        featured: true,
      },
      // Education
      {
        name: "IIM Ahmedabad",
        categoryId: dEdu.id,
        description: "Premier management institute.",
        address: "Vastrapur, Ahmedabad",
        phone: "+91 79 7152 4444",
        website: "https://iima.ac.in",
        hours: "Mon-Fri 9am-5pm",
        isPaid: false,
      },
      // Utility
      {
        name: "Torrent Power — complaints",
        categoryId: dUtility.id,
        description: "Electricity complaints and new connection.",
        address: "Torrent House, Off Ashram Road, Ahmedabad",
        phone: "+91 79 2621 2800",
        website: "https://torrentpower.com",
        hours: "24/7 complaints",
        isPaid: false,
      },
      {
        name: "Adani Gas",
        categoryId: dUtility.id,
        description: "PNG supply, new connection, bill payment support.",
        address: "Shantigram, Ahmedabad",
        phone: "+91 79 2555 5555",
        isPaid: false,
      },
      // Emergency
      {
        name: "Police Control Room (Dial 100)",
        categoryId: dEmergency.id,
        description: "City police emergency.",
        address: "Shahibaug, Ahmedabad",
        phone: "100",
        hours: "24/7",
        isPaid: false,
        featured: true,
      },
      {
        name: "Fire Brigade (Dial 101)",
        categoryId: dEmergency.id,
        description: "Fire and rescue services.",
        address: "Dhanvantari Hall, Shahibaug",
        phone: "101",
        hours: "24/7",
        isPaid: false,
      },
      // Private
      {
        name: "Sona Legal Associates",
        categoryId: dPrivate.id,
        description: "Property law, agreements, title verification.",
        address: "SG Highway, Ahmedabad",
        phone: "+91 98250 00001",
        website: "https://sonalegal.example",
        hours: "Mon-Sat 10am-7pm",
        isPaid: true,
      },
      {
        name: "CA Vohra & Co",
        categoryId: dPrivate.id,
        description: "Chartered accountants — tax, audit, GST, ROC.",
        address: "Navrangpura, Ahmedabad",
        phone: "+91 98250 00002",
        hours: "Mon-Sat 10am-7pm",
        isPaid: true,
      },
    ],
  });

  console.log("Creating sample transactions…");
  const sampleTx = [
    { user: priya.id, op: jio.id, type: "MOBILE", ref: "9811111111", amount: 299, status: "SUCCESS" },
    { user: priya.id, op: tataPlay.id, type: "DTH", ref: "100012345678", amount: 450, status: "SUCCESS" },
    { user: rohit.id, op: airtel.id, type: "MOBILE", ref: "9822222222", amount: 599, status: "PENDING" },
    { user: anjali.id, op: geb.id, type: "ELECTRICITY", ref: "GEB-5567123", amount: 1245, status: "SUCCESS" },
    { user: kabir.id, op: icici.id, type: "FASTAG", ref: "MH12AB1234", amount: 500, status: "SUCCESS" },
    { user: sana.id, op: airtel.id, type: "MOBILE", ref: "9855500000", amount: 199, status: "FAILED", message: "Mock provider rejected: invalid reference ending in 0000." },
  ];
  for (const t of sampleTx) {
    await prisma.transaction.create({
      data: {
        userId: t.user,
        operatorId: t.op,
        type: t.type,
        amount: t.amount,
        reference: t.ref,
        status: t.status,
        providerRef: `MOCK-${t.type.slice(0, 3)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        message: t.message ?? (t.status === "SUCCESS" ? "Transaction completed by mock provider." : t.status === "PENDING" ? "Awaiting provider confirmation." : undefined),
      },
    });
  }

  console.log("Creating sample reports…");
  const firstListing = createdProducts[0];
  await prisma.report.create({
    data: {
      targetType: "LISTING",
      targetId: firstListing.id,
      reporterId: anjali.id,
      reason: "Suspected fraud",
    },
  });
  await prisma.report.create({
    data: {
      targetType: "PROVIDER",
      targetId: providers[3].id,
      reporterId: vikram.id,
      reason: "Did not show up",
    },
  });

  console.log("Creating sample inquiries…");
  await prisma.inquiry.create({
    data: {
      listingId: createdProducts[1].id,
      buyerId: kabir.id,
      message: "Hi, is this still available? Can I come see it this weekend?",
      contact: "+91 98444 44444",
    },
  });

  console.log("Done.");
  console.log("\nDemo accounts:");
  console.log("  admin@superapp.test / admin1234  (ADMIN)");
  console.log("  priya@superapp.test / password   (USER)");
  console.log("  rohit@superapp.test / password   (USER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

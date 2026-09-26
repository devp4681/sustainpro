import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  admins,
  homepageContent,
  aboutContent,
  services,
  industries,
  researchAreas,
  publications,
  softwareItems,
  trainingTypes,
  events,
  siteSettings,
  contactInfo,
  donations,
  jobPositions,
  sirProfile
} from "@workspace/db";

async function main() {
  console.log("Starting database seeding...");

  try {
    // 1. Seed Admin
    console.log("Seeding admin...");
    const passwordHash = await bcrypt.hash("Admin@123", 12);
    await db.insert(admins).values({
      email: "admin@sustainpro.com",
      passwordHash,
      name: "SustainPro Admin",
      role: "admin",
      mustChangePassword: true,
    }).onConflictDoNothing();

    // 2. Seed Site Settings
    console.log("Seeding site settings...");
    await db.insert(siteSettings).values({
      id: 1,
      siteName: "SustainPro Process SolutionTM LLP",
      logoUrl: "/logo.jpeg",
      faviconUrl: "/favicon.ico",
      seoTitle: "SustainPro Process SolutionTM LLP",
      seoDescription: "Engineering a Greener Tomorrow. Global engineering consultancy specializing in chemical engineering, process optimization, and sustainable industrial innovation.",
      socialLinks: {
        "linkedin": "https://linkedin.com/company/sustainpro"
      },
    }).onConflictDoNothing();

    // 3. Seed Contact Info
    console.log("Seeding contact info...");
    await db.insert(contactInfo).values({
      id: 1,
      address: "K-501, Samarthya Status,\nSabarmati, Ahmedabad, 380019, India",
      phone: "8735045762",
      email: "sustain.process@gmail.com",
      googleMapsLink: "",
      officeHours: "Monday - Friday: 9:00 AM - 6:00 PM",
    }).onConflictDoNothing();

    // 3b. One-time data fix: migrate legacy placeholder contact values in an
    // existing dev DB to the canonical ones, without clobbering admin edits.
    const [existingContact] = await db.select().from(contactInfo).limit(1);
    if (existingContact) {
      const contactFix: { phone?: string; email?: string } = {};
      if (existingContact.phone === "+91 98765 43210") {
        contactFix.phone = "8735045762";
      }
      if (existingContact.email === "contact@sustainpro.com") {
        contactFix.email = "sustain.process@gmail.com";
      }
      if (Object.keys(contactFix).length > 0) {
        await db
          .update(contactInfo)
          .set({ ...contactFix, updatedAt: new Date().toISOString() })
          .where(eq(contactInfo.id, existingContact.id));
        if (contactFix.phone) {
          console.log("Fixed legacy contact phone -> 8735045762");
        }
        if (contactFix.email) {
          console.log("Fixed legacy contact email -> sustain.process@gmail.com");
        }
      }
    }

    // 4. Seed Donations Block
    console.log("Seeding donations...");
    await db.insert(donations).values({
      id: 1,
      bankName: "State Bank of India",
      accountHolder: "SustainPro Process Solutions",
      accountNumber: "12345678901",
      ifscCode: "SBIN0001234",
      upiId: "sustainpro@sbi",
      qrCodeUrl: "",
    }).onConflictDoNothing();

    // 5. Seed Homepage Content
    console.log("Seeding homepage content...");
    await db.insert(homepageContent).values({
      id: 1,
      heroBadge: "Engineering a Greener Tomorrow",
      heroTitle: "Process Optimization & Sustainable Solutions",
      heroSubtitle: "Global engineering consultancy specializing in chemical engineering, modeling, and sustainable industrial innovation.",
    }).onConflictDoNothing();

    // 5b. One-time data fix: update existing homepage heroTitle & heroSubtitle
    const [existingHome] = await db.select().from(homepageContent).limit(1);
    if (existingHome) {
      const updates: any = {};
      if (existingHome.heroTitle && existingHome.heroTitle.startsWith("Advanced ")) {
        updates.heroTitle = existingHome.heroTitle.replace("Advanced ", "");
      }
      if (existingHome.heroSubtitle && existingHome.heroSubtitle.includes("advanced ")) {
        updates.heroSubtitle = existingHome.heroSubtitle.replace(/advanced\s+/gi, "");
      }
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        await db.update(homepageContent).set(updates).where(eq(homepageContent.id, existingHome.id));
        console.log("Fixed homepage content: removed 'Advanced'");
      }
    }

    // Re-insert to continue seeding (onConflictDoNothing protects existing)
    await db.insert(homepageContent).values({
      id: 1,
      heroBadge: "Engineering a Greener Tomorrow",
      heroTitle: "Process Optimization & Sustainable Solutions",
      heroSubtitle: "Global engineering consultancy specializing in chemical engineering, modeling, and sustainable industrial innovation.",
      heroBgImage: "/hero-bg.png",
      stats: [
        { "value": "10+", "label": "Global Projects" },
        { "value": "30%", "label": "Avg Energy Saved" },
        { "value": "100%", "label": "Sustainable Focus" }
      ],
      servicesTitle: "Comprehensive Engineering Solutions",
      servicesSubtitle: "We deliver end-to-end technical excellence across the entire chemical and process engineering lifecycle.",
      sustainabilityTitle: "Pioneering the Transition to Efficient and Sustainable Solutions",
      sustainabilityText: "At SustainPro Process SolutionTM LLP, we partner with chemical, petrochemical, pharmaceutical, and biochemical industries to design smarter, optimize existing processes, and implement sustainable engineering solutions. Our expertise combines process engineering, simulation, and data-driven optimization to improve productivity, reduce resource and energy consumption, and enhance environmental performance. We are committed to helping organizations achieve operational excellence while building a more sustainable future.",
      sustainabilityItems: [
        "Engineering Solutions",
        "Process Excellence",
        "Sustainability",
        "Training and Consulting"
      ],
      ctaTitle: "Ready to Optimize Your Operations?",
      ctaSubtitle: "Partner with our world-class engineering team to drive efficiency, sustainability, and innovation in your facility.",
    }).onConflictDoNothing();

    // 6. Seed About Page Content
    console.log("Seeding about page content...");
    const defaultAdvisors = [
      {
        name: "1. Sridhar Dalai",
        title: "Assistant Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/sridhar_dalai.png",
        bio: "Expertise in chemical process engineering, process design and optimization, process simulation, scale-up, mass and energy integration, and industrial problem-solving. His professional experience includes applying engineering principles to improve process performance, resource utilization, and operational efficiency, with a strong focus on practical solutions for industry.",
        link: "https://ahduni.edu.in/faculty/sridhar-dalai/"
      },
      {
        name: "2. Dharamashi Rabari",
        title: "Associate Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/dharamashi_rabari.png",
        bio: "Expertise in chemical process engineering, process simulation, optimization, separation processes, and thermodynamic analysis, with a focus on translating engineering principles into practical solutions for industrial process improvement. His professional experience includes applying these principles to process intensification for cleaner production, water treatment, catalysis, carbon footprint reduction, and sustainable industrial solutions.",
        link: "https://ahduni.edu.in/academics/schools-centres/school-of-engineering-and-applied-science/people-1/dharamashi-rabari/"
      }
    ];

    await db.insert(aboutContent).values({
      id: 1,
      heroTitle: "SustainPro Process SolutionTM LLP",
      heroSubtitle: "Engineering a greener tomorrow through innovative process solutions, technical excellence, and sustainable practices.",
      heroBgImage: "/about-bg.png",
      whoWeAreTitle: "Who We Are",
      whoWeAreText: "SustainPro Process SolutionTM LLP is a premium global engineering consultancy. We specialize in chemical engineering, process optimization, and sustainable industrial innovation. Our team of leading experts collaborates with industries to improve efficiency, minimize environmental impact, and advance innovative green technologies.",
      visionTitle: "Our Vision",
      visionText: "To be the global leader in driving the industrial transition towards sustainable and highly optimized processes.",
      missionTitle: "Our Mission",
      missionText: "Delivering unparalleled engineering expertise that maximizes operational efficiency while minimizing environmental footprint.",
      valuesTitle: "Core Values",
      valuesText: "Integrity, innovation, sustainability, and technical excellence form the foundation of every project we undertake.",
      leadershipTitle: "Leadership",
      leadershipText: "Led by academicians with strong expertise in chemical engineering and extensive experience in industry-focused research, consultancy, and R&D.",
      advisors: defaultAdvisors,
    }).onConflictDoNothing();

    const [existingAbout] = await db.select().from(aboutContent).limit(1);
    if (existingAbout) {
      if (!existingAbout.advisors || (Array.isArray(existingAbout.advisors) && existingAbout.advisors.length === 0)) {
        await db.update(aboutContent)
          .set({
            advisors: defaultAdvisors,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(aboutContent.id, existingAbout.id));
        console.log("Fixed missing/empty advisors field in existing aboutContent.");
      }
    }

    // 7. Seed Services
    console.log("Seeding services...");
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      await db.insert(services).values([
        {
          title: "Process Engineering & Design",
          description: "Comprehensive process engineering from concept to execution.",
          icon: "Settings",
          details: ["Process flow diagrams (PFD)", "Design calculations", "Equipment sizing", "Process intensification"],
          order: 1,
        },
        {
          title: "Modeling & Simulation",
          description: "Digital representations of physical processes and thermodynamic analysis.",
          icon: "BarChart",
          details: ["Process Modeling & Simulation", "CFD modeling", "Digital process engineering", "Process Engineering"],
          order: 2,
        },
        {
          title: "Process Optimization",
          description: "Maximizing yield and resolving operational bottlenecks.",
          icon: "Zap",
          details: ["Plant performance analysis", "Energy Integration", "Mass Integration", "Water Integration"],
          order: 3,
        },
        {
          title: "Sustainability & Green Engineering",
          description: "Engineering solutions for a circular economy.",
          icon: "Leaf",
          details: ["Green chemistry", "Circular economy integration", "Carbon capture & utilization", "Sustainable process development"],
          order: 4,
        },
        {
          title: "Industrial R&D & Tech Evaluation",
          description: "Bridging the gap between research and industrial application.",
          icon: "TestTube",
          details: ["Feasibility studies", "Technology assessment", "Pilot-scale development", "Innovation support"],
          order: 5,
        },
        {
          title: "Training & Professional Development",
          description: "Empowering the next generation of engineers.",
          icon: "GraduationCap",
          details: ["Industrial Workshops", "Chemical Engineering Refresher Course", "Technical training", "Technical Skill Development"],
          order: 6,
        },
      ]);
    }

    // 8. Seed Industries
    console.log("Seeding industries...");
    const existingIndustries = await db.select().from(industries).limit(1);
    if (existingIndustries.length === 0) {
      await db.insert(industries).values([
        { name: "Chemical", icon: "Factory", description: "Process design and optimization for bulk chemical manufacturing.", order: 1 },
        { name: "Petrochemical", icon: "Droplet", description: "Advanced simulations and efficiency improvements for downstream processing.", order: 2 },
        { name: "Pharmaceutical", icon: "Pill", description: "Precision engineering for API manufacturing and scalable production.", order: 3 },
        { name: "Energy Sector", icon: "Zap", description: "Transitioning traditional energy into sustainable, lower-carbon models.", order: 4 },
        { name: "Specialty Chemicals", icon: "Beaker", description: "Customized process solutions for complex, high-value chemical products.", order: 5 },
        { name: "Environmental Engineering", icon: "Recycle", description: "Waste reduction, circular economy workflows, and emission control.", order: 6 },
        { name: "Research & Academic", icon: "GraduationCap", description: "Collaborations on cutting-edge process innovations and tech transfer.", order: 7 },
      ]);
    }

    // 9. Seed Research Focus Areas & Publications
    console.log("Seeding research...");
    const existingAreas = await db.select().from(researchAreas).limit(1);
    if (existingAreas.length === 0) {
      await db.insert(researchAreas).values([
        { title: "Green solvents & Deep Eutectic Solvents (DES)", order: 1 },
        { title: "Carbon capture & utilization", order: 2 },
        { title: "Sustainable process design", order: 3 },
        { title: "Industrial R&D partnerships", order: 4 },
        { title: "Publications & patents", order: 5 },
      ]);
    }

    const existingPubs = await db.select().from(publications).limit(1);
    if (existingPubs.length === 0) {
      await db.insert(publications).values([
        { title: "Sustainable Optimization of Chemical Processes Vol 1", authors: "Dr. A. Sharma, Dr. B. Patel", journal: "Journal of Green Engineering", year: 2024, order: 1 },
        { title: "Sustainable Optimization of Chemical Processes Vol 2", authors: "Dr. A. Sharma, Prof. C. Mehta", journal: "Journal of Green Engineering", year: 2024, order: 2 },
        { title: "Sustainable Optimization of Chemical Processes Vol 3", authors: "Dr. B. Patel, Dr. D. Desai", journal: "Journal of Green Engineering", year: 2024, order: 3 },
      ]);
    }

    // 10. Seed Software
    console.log("Seeding software...");
    const existingSoftware = await db.select().from(softwareItems).limit(1);
    if (existingSoftware.length === 0) {
      await db.insert(softwareItems).values([
        { title: "Process Simulation Tools", description: "Expert integration of Aspen Plus, HYSYS, and advanced thermodynamic models.", icon: "MonitorPlay", order: 1 },
        { title: "Digital Platforms", description: "Custom dashboards and real-time monitoring interfaces for plant operations.", icon: "Cpu", order: 2 },
        { title: "Interactive Previews", description: "3D facility rendering and CFD result visualization for better decision making.", icon: "BoxSelect", order: 3 },
      ]);
    }

    // 11. Seed Training Programs
    console.log("Seeding training types...");
    const existingTraining = await db.select().from(trainingTypes).limit(1);
    if (existingTraining.length === 0) {
      await db.insert(trainingTypes).values([
        { title: "Industrial Workshops", description: "Hands-on training for plant engineers focusing on modelling and simulation, energy integration using software.", icon: "Briefcase", order: 1 },
        { title: "Chemical Engineering Refresher Course", description: "Strengthening fundamental chemical engineering knowledge through practical, industry-oriented refresher training.", icon: "BookOpen", order: 2 },
        { title: "Process Design course", description: "Building practical skills in process engineering design through industry-oriented concepts, methods, and applications.", icon: "Pencil", order: 3 },
        { title: "Technical Seminars", description: "Practical technical seminars on process safety, industrial operations, sustainability, and emerging engineering practices.", icon: "Calendar", order: 4 },
      ]);
    }

    // 12. Seed Events
    console.log("Seeding events...");
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        { title: "Process Simulation Workshop", date: "Oct 15, 2024", type: "Industrial Workshop", venue: "Seminar Hall A / Online", order: 1 },
        { title: "Green Chemistry Integration in Manufacturing", date: "Nov 02, 2024", type: "Specialized Workshop", venue: "Research Lab B", order: 2 },
        { title: "Energy Optimization Masterclass", date: "Dec 10, 2024", type: "Technical Training", venue: "Main Auditorium / Zoom", order: 3 },
      ]);
    }

    // 13. Seed Job Positions (Careers)
    console.log("Seeding job positions...");
    const existingPositions = await db.select().from(jobPositions).limit(1);
    if (existingPositions.length === 0) {
      await db.insert(jobPositions).values([
        { title: "Software Engineer", isOpen: false, order: 1 },
        { title: "Flutter Developer", isOpen: false, order: 2 },
        { title: "Backend Developer", isOpen: false, order: 3 },
        { title: "AI/ML Engineer", isOpen: false, order: 4 },
        { title: "Marketing", isOpen: false, order: 5 },
        { title: "HR", isOpen: false, order: 6 },
        { title: "Sales", isOpen: false, order: 7 },
        { title: "UI/UX Designer", isOpen: false, order: 8 },
        { title: "Intern", isOpen: false, order: 9 },
      ]);
    }

    // 14. Seed Sir Profile
    console.log("Seeding sir profile...");
    const existingProfile = await db.select().from(sirProfile).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(sirProfile).values({
        fullName: "Sir",
        designation: "Founder & Director",
        email: "sustain.process@gmail.com",
        phone: "8735045762",
        city: "",
        fullAddress: "",
        photoUrl: null,
        bio: "",
      });
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));

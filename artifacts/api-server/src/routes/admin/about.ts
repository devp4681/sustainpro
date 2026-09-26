import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, aboutContent } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get about page content
router.get("/about", async (req, res) => {
  try {
    let [content] = await db.select().from(aboutContent).limit(1);
    if (!content) {
      // Defaults if not seeded
      content = {
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
        advisors: [],
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(content);
  } catch (error) {
    req.log.error(error, "Get about content error");
    res.status(500).json({ error: "Internal server error retrieving about content" });
  }
});

// Update about page content
router.put("/about", requireAuth, async (req, res) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroBgImage,
      whoWeAreTitle,
      whoWeAreText,
      visionTitle,
      visionText,
      missionTitle,
      missionText,
      valuesTitle,
      valuesText,
      leadershipTitle,
      leadershipText,
      advisors,
    } = req.body;

    const [existing] = await db.select().from(aboutContent).limit(1);

    if (existing) {
      const [updated] = await db
        .update(aboutContent)
        .set({
          heroTitle,
          heroSubtitle,
          heroBgImage,
          whoWeAreTitle,
          whoWeAreText,
          visionTitle,
          visionText,
          missionTitle,
          missionText,
          valuesTitle,
          valuesText,
          leadershipTitle,
          leadershipText,
          advisors,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(aboutContent.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(aboutContent)
        .values({
          heroTitle,
          heroSubtitle,
          heroBgImage,
          whoWeAreTitle,
          whoWeAreText,
          visionTitle,
          visionText,
          missionTitle,
          missionText,
          valuesTitle,
          valuesText,
          leadershipTitle,
          leadershipText,
          advisors,
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update about content error");
    res.status(500).json({ error: "Internal server error updating about content" });
  }
});

export default router;

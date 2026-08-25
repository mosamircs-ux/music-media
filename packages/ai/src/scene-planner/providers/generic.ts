import {
  generateId,
  type AIProvider,
  type ScenePlan,
  type ScenePlanInput,
  type PlannedScene,
  type ScenePromptContext,
  type CaptionStyleSuggestion,
  type MusicAnalysisResult,
  type NormalizedTrack,
  type VisualStyle,
} from "@musicmotion/shared";
import { sanitizeScenePlan } from "../schemas";

/**
 * Generic / Rule-Based Algorithmic AI Scene Planner Provider.
 * Provides instant, zero-dependency, highly structured scene planning
 * with guaranteed visual continuity, musical tempo-awareness, and camera pacing.
 */
export class GenericAIProvider implements AIProvider {
  readonly id = "generic";
  readonly name = "MusicMotion Creative Algorithmic Planner";

  async generateScenePlan(input: ScenePlanInput): Promise<ScenePlan> {
    const totalDuration = Math.max(
      1,
      input.duration || (input.endTime - input.startTime) || 15
    );

    const style: VisualStyle = (input.visualStyle as VisualStyle) || "Cinematic";
    const track = input.track;
    const userPrompt = input.userDescription?.trim() || "";

    // 1. Analyze music energy & tempo to choose scene count
    const musicAnalysis = await this.analyzeMusic(track);
    const targetSceneCount =
      input.targetSceneCount ||
      (totalDuration <= 10 ? 2 : totalDuration <= 20 ? 3 : 4);

    const sceneDuration = Math.round((totalDuration / targetSceneCount) * 100) / 100;

    // 2. Select consistent color palette and continuity motifs based on style & mood
    const { palette, motif, mood, lighting } = this.getStyleAtmosphere(
      style,
      track.genre,
      track.mood
    );

    const title = userPrompt
      ? `${userPrompt.slice(0, 30)} — ${track.title}`
      : `${track.title} Visual Journey`;

    const visualConcept = userPrompt
      ? `${userPrompt}. Rendered in ${style} aesthetic with ${lighting} and ${mood} atmosphere.`
      : `A breathtaking ${style} visual narrative for "${track.title}" by ${track.artist}, featuring ${motif} with ${lighting}.`;

    const continuityGuidelines = `Subject: ${motif}. Consistent color grading (${palette.join(
      ", "
    )}), atmospheric volumetric lighting, 9:16 vertical framing across all shots.`;

    // 3. Build sequence of coherent scenes with progressive camera movement
    const cameraMotions = [
      "Establishing Wide Crane Down",
      "Tracking Medium Shot",
      "Dynamic Orbit 360",
      "Climactic Low-Angle Push-In",
    ];

    const transitions = ["fade", "dissolve", "zoom_in", "slide_left"];

    const scenes: PlannedScene[] = [];
    let currentTime = 0;

    for (let i = 0; i < targetSceneCount; i++) {
      const isLast = i === targetSceneCount - 1;
      const start = Math.round(currentTime * 100) / 100;
      const end = isLast
        ? totalDuration
        : Math.round((currentTime + sceneDuration) * 100) / 100;
      const dur = Math.round((end - start) * 100) / 100;
      currentTime = end;

      // Find matching captions within this scene window
      const relevantCaptions = (input.captions || [])
        .filter((c) => c.startTime >= start && c.startTime < end)
        .map((c) => c.text);

      const sceneMood =
        i === 0
          ? `${mood} Introduction`
          : isLast
          ? `${mood} Climax & Resolution`
          : `${mood} Rising Intensity`;

      const camera = cameraMotions[i % cameraMotions.length];
      const transition = transitions[i % transitions.length];

      // Construct detailed prompt adhering to continuity
      const scenePrompt = this.buildScenePrompt({
        style,
        motif,
        lighting,
        sceneIndex: i,
        totalScenes: targetSceneCount,
        camera,
        captions: relevantCaptions,
        userPrompt,
        trackTitle: track.title,
      });

      scenes.push({
        id: generateId(),
        order: i,
        startTime: start,
        endTime: end,
        duration: dur,
        prompt: scenePrompt,
        negativePrompt:
          "low quality, blurry, deformed, distorted, text overlays, extra limbs, ugly, noisy",
        mood: sceneMood,
        camera,
        transition,
        transitionDuration: 0.5,
        captionSuggestions: relevantCaptions,
        visualContinuityNotes: `Matches color grading (${palette[0]}) and ${motif}.`,
      });
    }

    const rawPlan: ScenePlan = {
      title,
      visualConcept,
      visualStyle: style,
      mood: musicAnalysis.mood,
      colorPalette: palette,
      continuityGuidelines,
      totalDuration,
      scenes,
      createdAt: new Date().toISOString(),
    };

    return sanitizeScenePlan(rawPlan, totalDuration);
  }

  async generateVisualPrompt(context: ScenePromptContext): Promise<string> {
    const { track, visualStyle, sceneIndex, totalScenes, captionText, camera } =
      context;
    const { motif, lighting } = this.getStyleAtmosphere(
      visualStyle as VisualStyle,
      track.genre,
      track.mood
    );

    const captionRef = captionText ? ` illustrating lyric "${captionText}",` : "";
    const cameraRef = camera ? ` camera movement: ${camera},` : "";

    return `Scene ${sceneIndex + 1} of ${totalScenes}: ${visualStyle} visual of ${motif},${captionRef}${cameraRef} ${lighting}, cinematic anamorphic lens flares, masterwork 8k wallpaper render, vertical 9:16 aspect ratio`;
  }

  async generateCaptionStyle(
    _track: NormalizedTrack,
    visualStyle: string
  ): Promise<CaptionStyleSuggestion> {

    const styleLower = visualStyle.toLowerCase();

    if (styleLower.includes("neon") || styleLower.includes("cyber")) {
      return {
        preset: "Neon",
        animation: "Pop",
        fontFamily: "Outfit",
        color: "#38bdf8",
        background: "rgba(15, 23, 42, 0.8)",
        rationale: "Vibrant glowing typography matching cyberpunk aesthetic",
      };
    }

    if (styleLower.includes("anime") || styleLower.includes("dreamy")) {
      return {
        preset: "Modern",
        animation: "Word-by-word",
        fontFamily: "Montserrat",
        color: "#fbcfe8",
        background: "rgba(0, 0, 0, 0.6)",
        rationale: "Clean animated text highlighting melodic beat rhythm",
      };
    }

    if (styleLower.includes("minimal")) {
      return {
        preset: "Minimal",
        animation: "Fade",
        fontFamily: "Inter",
        color: "#ffffff",
        background: "transparent",
        rationale: "Subtle minimalist drop-shadow style",
      };
    }

    return {
      preset: "Modern",
      animation: "Pop",
      fontFamily: "Inter",
      color: "#ffffff",
      background: "rgba(0, 0, 0, 0.7)",
      rationale: "High-contrast universal readable modern subtitles",
    };
  }

  async analyzeMusic(
    track: NormalizedTrack,
    _lyrics?: string[]
  ): Promise<MusicAnalysisResult> {
    const bpm = track.bpm || 120;
    const energy: "low" | "medium" | "high" | "explosive" =
      bpm > 140
        ? "explosive"
        : bpm > 115
        ? "high"
        : bpm > 85
        ? "medium"
        : "low";

    const suggestedPacing: "fast-cuts" | "medium-dynamic" | "slow-cinematic" =
      bpm > 130
        ? "fast-cuts"
        : bpm > 95
        ? "medium-dynamic"
        : "slow-cinematic";

    const recommendedSceneCount =
      suggestedPacing === "fast-cuts"
        ? 4
        : suggestedPacing === "medium-dynamic"
        ? 3
        : 2;

    const genre = track.genre || "Electronic / Pop";
    const mood = track.mood || "Dynamic Cinematic";

    return {
      genre,
      mood,
      energy,
      bpm,
      suggestedPacing,
      recommendedSceneCount,
      storyTheme: `Audio-visual story inspired by ${track.title} with ${mood.toLowerCase()} energy and ${suggestedPacing} rhythm.`,
    };
  }

  private getStyleAtmosphere(
    style: VisualStyle,
    genre = "Pop",
    mood = "Atmospheric"
  ) {
    switch (style) {
      case "Anime":
        return {
          palette: ["#f43f5e", "#a855f7", "#38bdf8", "#fde047"],
          motif: "a futuristic anime character with expressive stylized lighting in a vibrant sky city",
          mood: "Energetic Anime",
          lighting: "Makoto Shinkai style golden hour and radiant volumetric clouds",
        };
      case "Dark":
        return {
          palette: ["#09090b", "#71717a", "#dc2626", "#18181b"],
          motif: "a solitary cloaked figure surrounded by moody brutalist architecture and shadows",
          mood: "Dark & Mysterious",
          lighting: "deep chiaroscuro shadows with harsh dramatic crimson rim lights",
        };
      case "Dreamy":
        return {
          palette: ["#c084fc", "#f472b6", "#67e8f9", "#ffffff"],
          motif: "ethereal floating islands, iridescent crystal waters, and celestial stars",
          mood: "Surreal & Dreamy",
          lighting: "soft pastel luminescence, shimmering bokeh, and dreamy fog",
        };
      case "Retro":
        return {
          palette: ["#f97316", "#e11d48", "#8b5cf6", "#06b6d4"],
          motif: "an 80s synthwave sports car racing along a glowing holographic sunset grid",
          mood: "Nostalgic Synthwave",
          lighting: "warm neon pink and cyan glows with retro VHS film grain",
        };
      case "Realistic":
        return {
          palette: ["#1e293b", "#334155", "#e2e8f0", "#94a3b8"],
          mood: "Photorealistic Documentary",
          motif: "a dramatic natural landscape with raw realistic cinematic detail",
          lighting: "natural overcast cinematic sunlight with authentic depth of field",
        };
      case "Fantasy":
        return {
          palette: ["#10b981", "#6366f1", "#f59e0b", "#ec4899"],
          motif: "an ancient mystical enchanted forest with glowing arcane runes and floating spirits",
          mood: "Epic Fantasy",
          lighting: "bioluminescent flora, mystical golden embers, and moonbeams",
        };
      case "Minimal":
        return {
          palette: ["#000000", "#ffffff", "#64748b", "#cbd5e1"],
          motif: "sleek minimalist geometric architecture and clean negative space",
          mood: "Modern Minimalist",
          lighting: "pure diffused studio lighting with sharp architectural shadows",
        };
      case "Music Video":
      case "Cinematic":
      default:
        return {
          palette: ["#020617", "#6366f1", "#ec4899", "#38bdf8"],
          motif: `a charismatic protagonist in a cyberpunk metropolis reflecting the ${mood.toLowerCase()} beats`,
          mood: `Cinematic ${genre}`,
          lighting: "anamorphic blue lens flares, reflections in wet asphalt, and rich neon backlighting",
        };
    }
  }

  private buildScenePrompt(opts: {
    style: VisualStyle;
    motif: string;
    lighting: string;
    sceneIndex: number;
    totalScenes: number;
    camera: string;
    captions: string[];
    userPrompt: string;
    trackTitle: string;
  }): string {
    const { style, motif, lighting, sceneIndex, totalScenes, camera, captions, userPrompt, trackTitle } = opts;

    let sceneAction = "";
    if (sceneIndex === 0) {
      sceneAction = "Establishing sequence revealing the world and atmosphere";
    } else if (sceneIndex === totalScenes - 1) {
      sceneAction = "Climactic visual finale with high energy and motion";
    } else {
      sceneAction = "Dynamic narrative progression tracking the central action";
    }

    const captionClause = captions.length > 0 ? ` Visualizing lyric theme: "${captions.join(" / ")}".` : "";
    const userClause = userPrompt ? ` Creative context: ${userPrompt}.` : "";

    return `${style} shot: ${sceneAction} featuring ${motif}.${captionClause}${userClause} Camera direction: ${camera}. Lighting: ${lighting}. High production value cinematic still, 8k resolution, vertical 9:16 composition for "${trackTitle}".`;
  }
}

import type { VisualGenerationProvider } from "@musicmotion/shared";
import { MockVisualGenerationProvider } from "./providers/mock";
import { ReplicateVisualGenerationProvider } from "./providers/replicate";

type SupportedProvider = "mock" | "replicate" | "stability";

/**
 * VisualGenerationRegistry
 *
 * Resolves the correct VisualGenerationProvider from the VISUAL_PROVIDER
 * environment variable. Business logic always talks to this registry —
 * never to a specific provider directly.
 *
 * To add a new provider: create a class implementing VisualGenerationProvider
 * and add it to the switch statement below.
 */
class VisualGenerationRegistryClass {
  private provider: VisualGenerationProvider | null = null;

  getProvider(): VisualGenerationProvider {
    if (this.provider) return this.provider;

    const name = (process.env.VISUAL_PROVIDER ?? "mock") as SupportedProvider;
    this.provider = this.resolveProvider(name);
    return this.provider;
  }

  /** Force a specific provider (useful in tests). */
  setProvider(provider: VisualGenerationProvider): void {
    this.provider = provider;
  }

  /** Clear cached provider (useful in tests). */
  reset(): void {
    this.provider = null;
  }

  private resolveProvider(name: SupportedProvider): VisualGenerationProvider {
    switch (name) {
      case "mock":
        return new MockVisualGenerationProvider();

      case "replicate": {
        const apiKey = process.env.REPLICATE_API_KEY;
        if (!apiKey) {
          console.warn(
            "[VisualGenerationRegistry] REPLICATE_API_KEY not set — falling back to mock provider"
          );
          return new MockVisualGenerationProvider();
        }
        return new ReplicateVisualGenerationProvider({
          apiKey,
          model: process.env.REPLICATE_MODEL,
        });
      }

      case "stability":
        // Stub — Stability AI provider not yet implemented
        console.warn("[VisualGenerationRegistry] stability provider not implemented, using mock");
        return new MockVisualGenerationProvider();

      default:
        console.warn(`[VisualGenerationRegistry] Unknown provider "${name}", using mock`);
        return new MockVisualGenerationProvider();
    }
  }
}

export const visualGenerationRegistry = new VisualGenerationRegistryClass();

import { describe, it, expect } from "vitest";
import { resolveTheme } from "./resolver";
import { lightTheme, darkTheme, createTheme } from "./defaults";
import type { PartialHarkenTheme } from "./types";

describe("resolveTheme", () => {
  describe("base theme resolution", () => {
    it("returns all required color tokens from light theme", () => {
      const resolved = resolveTheme(lightTheme);

      expect(resolved.colors.primary).toBe(lightTheme.colors.primary);
      expect(resolved.colors.background).toBe(lightTheme.colors.background);
      expect(resolved.colors.text).toBe(lightTheme.colors.text);
      expect(resolved.colors.surface).toBeDefined();
    });

    it("returns all required color tokens from dark theme", () => {
      const resolved = resolveTheme(darkTheme);

      expect(resolved.colors.primary).toBe(darkTheme.colors.primary);
      expect(resolved.colors.background).toBe(darkTheme.colors.background);
      expect(resolved.colors.text).toBe(darkTheme.colors.text);
      expect(resolved.colors.surface).toBeDefined();
    });

    it("returns spacing, radii, sizing, and opacity", () => {
      const resolved = resolveTheme(lightTheme);

      expect(resolved.spacing.sm).toBe(lightTheme.spacing.sm);
      expect(resolved.radii.md).toBe(lightTheme.radii.md);
      expect(resolved.sizing.buttonMinHeight).toBeDefined();
      expect(resolved.opacity.disabled).toBeDefined();
    });
  });

  describe("component token fallbacks", () => {
    describe("chip tokens", () => {
      it("falls back chipBackground to surface", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.chipBackground).toBe(resolved.colors.surface);
      });

      it("uses explicit chipBackground when provided", () => {
        const overrides: PartialHarkenTheme = {
          colors: { chipBackground: "#custom" },
        };
        const resolved = resolveTheme(lightTheme, overrides);
        expect(resolved.colors.chipBackground).toBe("#custom");
      });

      it("uses custom surface when chipBackground not provided", () => {
        const overrides: PartialHarkenTheme = {
          colors: { surface: "#custom-surface" },
        };
        const resolved = resolveTheme(lightTheme, overrides);
        expect(resolved.colors.chipBackground).toBe("#custom-surface");
      });

      it("falls back chipBorder to border", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.chipBorder).toBe(resolved.colors.border);
      });

      it("falls back chipBackgroundSelected to primary", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.chipBackgroundSelected).toBe(resolved.colors.primary);
      });

      it("falls back chipTextSelected to textOnPrimary", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.chipTextSelected).toBe(resolved.colors.textOnPrimary);
      });
    });

    describe("input tokens", () => {
      it("falls back inputBackground to surface", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.inputBackground).toBe(resolved.colors.surface);
      });

      it("falls back inputBorder to border", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.inputBorder).toBe(resolved.colors.border);
      });

      it("falls back inputBorderFocused to borderFocused", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.inputBorderFocused).toBe(resolved.colors.borderFocused);
      });

      it("falls back inputBorderError to error", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.inputBorderError).toBe(resolved.colors.error);
      });
    });

    describe("button tokens", () => {
      it("falls back buttonPrimaryBackground to primary", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.buttonPrimaryBackground).toBe(resolved.colors.primary);
      });

      it("falls back buttonSecondaryBackground to surface", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.buttonSecondaryBackground).toBe(resolved.colors.surface);
      });

      it("falls back buttonGhostText to text", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.buttonGhostText).toBe(resolved.colors.text);
      });
    });

    describe("tile tokens", () => {
      it("falls back tileBackground to surface", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.tileBackground).toBe(resolved.colors.surface);
      });

      it("falls back tileBorder to border", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.tileBorder).toBe(resolved.colors.border);
      });
    });

    describe("upload tokens", () => {
      it("falls back uploadProgressFill to primary", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.uploadProgressFill).toBe(resolved.colors.primary);
      });

      it("falls back uploadBadgeSuccess to success", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.uploadBadgeSuccess).toBe(resolved.colors.success);
      });
    });

    describe("form tokens", () => {
      it("defaults formBackground to background for backwards compatibility", () => {
        const resolved = resolveTheme(lightTheme);
        expect(resolved.colors.formBackground).toBe(resolved.colors.background);
      });

      it("uses explicit formBackground when provided", () => {
        const overrides: PartialHarkenTheme = {
          colors: { formBackground: "#333333" },
        };
        const resolved = resolveTheme(lightTheme, overrides);
        expect(resolved.colors.formBackground).toBe("#333333");
      });

      it("can use transparent formBackground for modal embedding", () => {
        const overrides: PartialHarkenTheme = {
          colors: { formBackground: "transparent" },
        };
        const resolved = resolveTheme(lightTheme, overrides);
        expect(resolved.colors.formBackground).toBe("transparent");
      });
    });
  });

  describe("spacing fallbacks", () => {
    it("falls back chipPaddingVertical to sm", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.spacing.chipPaddingVertical).toBe(resolved.spacing.sm);
    });

    it("falls back chipPaddingHorizontal to md", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.spacing.chipPaddingHorizontal).toBe(resolved.spacing.md);
    });

    it("falls back formPadding to lg", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.spacing.formPadding).toBe(resolved.spacing.lg);
    });

    it("uses explicit spacing when provided", () => {
      const overrides: PartialHarkenTheme = {
        spacing: { chipPaddingVertical: 20 },
      };
      const resolved = resolveTheme(lightTheme, overrides);
      expect(resolved.spacing.chipPaddingVertical).toBe(20);
    });
  });

  describe("radii fallbacks", () => {
    it("falls back chip radius to full", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.radii.chip).toBe(resolved.radii.full);
    });

    it("falls back input radius to md", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.radii.input).toBe(resolved.radii.md);
    });

    it("falls back button radius to md", () => {
      const resolved = resolveTheme(lightTheme);
      expect(resolved.radii.button).toBe(resolved.radii.md);
    });

    it("uses explicit radii when provided", () => {
      const overrides: PartialHarkenTheme = {
        radii: { chip: 4 },
      };
      const resolved = resolveTheme(lightTheme, overrides);
      expect(resolved.radii.chip).toBe(4);
    });
  });

  describe("sizing overrides", () => {
    it("uses explicit sizing when provided", () => {
      const overrides: PartialHarkenTheme = {
        sizing: { tileSize: 100 },
      };
      const resolved = resolveTheme(lightTheme, overrides);
      expect(resolved.sizing.tileSize).toBe(100);
    });
  });

  describe("opacity overrides", () => {
    it("uses explicit opacity when provided", () => {
      const overrides: PartialHarkenTheme = {
        opacity: { disabled: 0.5 },
      };
      const resolved = resolveTheme(lightTheme, overrides);
      expect(resolved.opacity.disabled).toBe(0.5);
    });
  });

  describe("component aliases", () => {
    it("builds chip component aliases correctly", () => {
      const resolved = resolveTheme(lightTheme);
      const { chip } = resolved.components;

      expect(chip.background).toBe(resolved.colors.chipBackground);
      expect(chip.border).toBe(resolved.colors.chipBorder);
      expect(chip.paddingVertical).toBe(resolved.spacing.chipPaddingVertical);
      expect(chip.radius).toBe(resolved.radii.chip);
    });

    it("builds input component aliases correctly", () => {
      const resolved = resolveTheme(lightTheme);
      const { input } = resolved.components;

      expect(input.background).toBe(resolved.colors.inputBackground);
      expect(input.border).toBe(resolved.colors.inputBorder);
      expect(input.padding).toBe(resolved.spacing.inputPadding);
      expect(input.radius).toBe(resolved.radii.input);
      expect(input.minHeight).toBe(resolved.sizing.inputMinHeight);
    });

    it("builds button component aliases correctly", () => {
      const resolved = resolveTheme(lightTheme);
      const { button } = resolved.components;

      expect(button.primary.background).toBe(resolved.colors.buttonPrimaryBackground);
      expect(button.secondary.border).toBe(resolved.colors.buttonSecondaryBorder);
      expect(button.ghost.text).toBe(resolved.colors.buttonGhostText);
      expect(button.radius).toBe(resolved.radii.button);
      expect(button.minHeight).toBe(resolved.sizing.buttonMinHeight);
    });

    it("builds form component aliases correctly", () => {
      const resolved = resolveTheme(lightTheme);
      const { form } = resolved.components;

      expect(form.background).toBe(resolved.colors.formBackground);
      expect(form.padding).toBe(resolved.spacing.formPadding);
      expect(form.sectionGap).toBe(resolved.spacing.sectionGap);
      expect(form.radius).toBe(resolved.radii.form);
    });
  });

  describe("modal embedding recipe", () => {
    it("supports the minimal modal embedding theme with transparent background", () => {
      const modalTheme: PartialHarkenTheme = {
        colors: {
          surface: "#2d2d2d",
          chipBackground: "#3d3d3d",
          chipBorder: "#4d4d4d",
          formBackground: "transparent", // explicit transparent for modal embedding
          text: "#ffffff",
          textSecondary: "#a0a0a0",
          textPlaceholder: "#666666",
          primary: "#0066ff",
        },
      };

      const resolved = resolveTheme(darkTheme, modalTheme);

      // Verify explicit overrides
      expect(resolved.colors.surface).toBe("#2d2d2d");
      expect(resolved.colors.chipBackground).toBe("#3d3d3d");
      expect(resolved.colors.chipBorder).toBe("#4d4d4d");
      expect(resolved.colors.formBackground).toBe("transparent");
      expect(resolved.colors.text).toBe("#ffffff");
      expect(resolved.colors.primary).toBe("#0066ff");

      // Verify component aliases reflect the overrides
      expect(resolved.components.chip.background).toBe("#3d3d3d");
      expect(resolved.components.chip.border).toBe("#4d4d4d");
      expect(resolved.components.form.background).toBe("transparent");
    });

    it("correctly cascades surface to components when not explicitly set", () => {
      const modalTheme: PartialHarkenTheme = {
        colors: {
          surface: "#2d2d2d",
          // chipBackground not set - should fall back to surface
          // inputBackground not set - should fall back to surface
        },
      };

      const resolved = resolveTheme(darkTheme, modalTheme);

      // Both should fall back to custom surface
      expect(resolved.colors.chipBackground).toBe("#2d2d2d");
      expect(resolved.colors.inputBackground).toBe("#2d2d2d");
      expect(resolved.components.chip.background).toBe("#2d2d2d");
      expect(resolved.components.input.background).toBe("#2d2d2d");
    });
  });

  describe("backwards compatibility", () => {
    it("treats backgroundSecondary as alias for surface", () => {
      const overrides: PartialHarkenTheme = {
        colors: {
          backgroundSecondary: "#legacy-value",
        },
      };

      const resolved = resolveTheme(lightTheme, overrides);

      // Both surface and backgroundSecondary should have the legacy value
      expect(resolved.colors.surface).toBe("#legacy-value");
      expect(resolved.colors.backgroundSecondary).toBe("#legacy-value");
    });

    it("prefers surface over backgroundSecondary when both provided", () => {
      const overrides: PartialHarkenTheme = {
        colors: {
          surface: "#new-value",
          backgroundSecondary: "#legacy-value",
        },
      };

      const resolved = resolveTheme(lightTheme, overrides);

      // surface takes precedence
      expect(resolved.colors.surface).toBe("#new-value");
    });
  });
});

describe("createTheme", () => {
  describe("sizing and opacity merging", () => {
    it("preserves base sizing when overrides omit sizing", () => {
      const baseWithSizing = {
        ...lightTheme,
        sizing: { tileSize: 100, buttonMinHeight: 60 },
      };

      const result = createTheme(baseWithSizing, {
        colors: { primary: "#ff0000" },
      });

      expect(result.sizing).toEqual({ tileSize: 100, buttonMinHeight: 60 });
    });

    it("preserves base opacity when overrides omit opacity", () => {
      const baseWithOpacity = {
        ...lightTheme,
        opacity: { disabled: 0.4, pressed: 0.9 },
      };

      const result = createTheme(baseWithOpacity, {
        colors: { primary: "#ff0000" },
      });

      expect(result.opacity).toEqual({ disabled: 0.4, pressed: 0.9 });
    });

    it("merges sizing from base and overrides", () => {
      const baseWithSizing = {
        ...lightTheme,
        sizing: { tileSize: 100, buttonMinHeight: 60 },
      };

      const result = createTheme(baseWithSizing, {
        sizing: { tileSize: 120 }, // Override one, keep the other
      });

      expect(result.sizing).toEqual({ tileSize: 120, buttonMinHeight: 60 });
    });

    it("merges opacity from base and overrides", () => {
      const baseWithOpacity = {
        ...lightTheme,
        opacity: { disabled: 0.4, pressed: 0.9 },
      };

      const result = createTheme(baseWithOpacity, {
        opacity: { disabled: 0.5 }, // Override one, keep the other
      });

      expect(result.opacity).toEqual({ disabled: 0.5, pressed: 0.9 });
    });
  });
});

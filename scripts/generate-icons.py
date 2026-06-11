#!/usr/bin/env python3
"""Generate Expo/Android icon assets from the MobiIndicator logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SRC = ASSETS / "logo-icon.png"
SIZE = 1024
SAFE = int(SIZE * 0.66)


def fit(img: Image.Image, max_side: int) -> Image.Image:
    copy = img.copy()
    copy.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    return copy


def center(canvas: Image.Image, img: Image.Image) -> None:
    x = (canvas.width - img.width) // 2
    y = (canvas.height - img.height) // 2
    canvas.paste(img, (x, y), img)


def main() -> None:
    logo = Image.open(SRC).convert("RGBA")

    icon = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    center(icon, fit(logo, int(SIZE * 0.88)))
    icon.save(ASSETS / "icon.png")

    foreground = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    center(foreground, fit(logo, SAFE))
    foreground.save(ASSETS / "android-icon-foreground.png")

    background = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    background.save(ASSETS / "android-icon-background.png")

    gray = ImageOps.grayscale(fit(logo, SAFE)).convert("RGBA")
    gray.putalpha(gray.split()[0])
    mono = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    center(mono, gray)
    mono.save(ASSETS / "android-icon-monochrome.png")

    splash = Image.new("RGBA", (SIZE, SIZE), (5, 5, 8, 255))
    center(splash, fit(logo, int(SIZE * 0.42)))
    splash.save(ASSETS / "splash-icon.png")

    favicon = fit(logo, 48)
    favicon.save(ASSETS / "favicon.png")

    print(f"Generated icons from {SRC.name}")


if __name__ == "__main__":
    main()

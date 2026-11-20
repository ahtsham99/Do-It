"""Generate app + PWA icons. Run: python3 scripts/generate-icons.py"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK = (14, 14, 13, 255)
EMBER = (201, 163, 107, 255)  # brass
WHITE = (255, 255, 255, 255)
S = 2048  # supersample


def mark(draw, cx, cy, r, bg=EMBER, fg=INK):
    """A brass disc with a bold "C" cut out of it (C for Chair)."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=bg)
    w = int(r * 0.26)
    rr = r * 0.52
    draw.arc([cx - rr, cy - rr, cx + rr, cy + rr], start=42, end=318, fill=fg, width=w)


def icon(size, path, scale=0.30, bg=INK, transparent=False, rounded=False):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0) if transparent else bg)
    d = ImageDraw.Draw(img)
    if rounded:
        img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=bg)
    mark(d, S / 2, S / 2, S * scale)
    img.resize((size, size), Image.LANCZOS).save(os.path.join(ROOT, path))


def solid(size, path, color):
    Image.new("RGBA", (size, size), color).save(os.path.join(ROOT, path))


# Native (Expo)
icon(1024, "assets/images/icon.png")
icon(1024, "assets/images/splash-icon.png", scale=0.42, transparent=True)
icon(1024, "assets/images/android-icon-foreground.png", scale=0.22, transparent=True)
solid(1024, "assets/images/android-icon-background.png", INK)
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
mark(ImageDraw.Draw(img), S / 2, S / 2, S * 0.22, bg=WHITE, fg=(0, 0, 0, 0))
img.resize((1024, 1024), Image.LANCZOS).save(os.path.join(ROOT, "assets/images/android-icon-monochrome.png"))
icon(64, "assets/images/favicon.png", scale=0.46, rounded=True)

# PWA / web
icon(192, "public/icons/icon-192.png")
icon(512, "public/icons/icon-512.png")
icon(512, "public/icons/maskable-512.png", scale=0.24)
icon(180, "public/icons/apple-touch-icon.png")
icon(32, "public/favicon-32.png", scale=0.46, rounded=True)
print("icons written")

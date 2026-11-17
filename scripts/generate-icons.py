"""Generate app + PWA icons. Run: python3 scripts/generate-icons.py"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK = (20, 18, 15, 255)
EMBER = (232, 97, 60, 255)
WHITE = (255, 255, 255, 255)
S = 2048  # supersample


def mark(draw, cx, cy, r, bg=EMBER, fg=WHITE):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=bg)
    w = int(r * 0.2)
    pts = [(cx - r * 0.45, cy + r * 0.02), (cx - r * 0.12, cy + r * 0.34), (cx + r * 0.5, cy - r * 0.32)]
    draw.line(pts, fill=fg, width=w, joint="curve")
    for p in (pts[0], pts[-1]):
        draw.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=fg)


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

"""
Stop-motion collage video generator.
Output: 1080x1920 (9:16), 12 fps, MP4.

Structure
---------
0–3 s  : chaotic grey/newsprint phase — clock shapes, phone rectangles, rough edges
3 s+   : vibrant yellow phase — flowers, street signs, urban detail collages

Aesthetics: paper-cutout edges, film grain, high contrast.
"""

import random
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
from moviepy import ImageSequenceClip

# ---------------------------------------------------------------------------
# Global constants
# ---------------------------------------------------------------------------
W, H = 1080, 1920
FPS = 12
PHASE1_FRAMES = FPS * 3          # 36 frames  (0–3 s)
PHASE2_FRAMES = FPS * 4          # 48 frames  (3–7 s)
TOTAL_FRAMES = PHASE1_FRAMES + PHASE2_FRAMES

GREY_BG_RANGE = (200, 230)       # light grey newsprint shades
YELLOW_BG    = (255, 215, 0)

RNG = random.Random(42)
NP_RNG = np.random.default_rng(42)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def rng_color(palette):
    return RNG.choice(palette)


def rough_polygon(draw, points, fill, outline, roughness=6):
    """Draw a polygon with slightly jittered vertices for paper-cutout feel."""
    pts = []
    for (x, y) in points:
        pts.append((
            x + RNG.randint(-roughness, roughness),
            y + RNG.randint(-roughness, roughness),
        ))
    draw.polygon(pts, fill=fill, outline=outline)


def rough_rectangle(draw, x0, y0, x1, y1, fill, outline=None, roughness=5):
    """Rectangle with wobbly corners."""
    corners = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    rough_polygon(draw, corners, fill, outline, roughness)


def add_rough_white_border(draw, x0, y0, x1, y1, thickness=8):
    """Torn-paper white edge around a rectangle."""
    steps = 40
    for side in range(4):
        for _ in range(steps):
            if side == 0:   bx, by = RNG.randint(x0, x1), RNG.randint(y0 - thickness, y0 + thickness)
            elif side == 1: bx, by = RNG.randint(x1 - thickness, x1 + thickness), RNG.randint(y0, y1)
            elif side == 2: bx, by = RNG.randint(x0, x1), RNG.randint(y1 - thickness, y1 + thickness)
            else:           bx, by = RNG.randint(x0 - thickness, x0 + thickness), RNG.randint(y0, y1)
            r = RNG.randint(3, thickness)
            draw.ellipse([bx - r, by - r, bx + r, by + r],
                         fill=(255, 255, 255, RNG.randint(180, 255)))


def film_grain(img, intensity=30):
    """Add multiplicative film grain."""
    arr = np.array(img).astype(np.int16)
    noise = NP_RNG.integers(-intensity, intensity + 1, arr.shape[:2], dtype=np.int16)
    if arr.ndim == 3:
        noise = noise[:, :, np.newaxis]
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def high_contrast(img, factor=1.4):
    return ImageEnhance.Contrast(img).enhance(factor)


def draw_clock(draw, cx, cy, radius, color, frame_idx):
    """Analogue clock face — hands move each frame."""
    # face
    rough_polygon(draw,
        [(cx + radius * math.cos(math.radians(a)),
          cy + radius * math.sin(math.radians(a)))
         for a in range(0, 360, 9)],
        fill=color, outline=(30, 30, 30), roughness=3)
    # ticks
    for m in range(12):
        angle = math.radians(m * 30 - 90)
        r_in  = radius * 0.8
        r_out = radius * 0.95
        draw.line([(cx + r_in  * math.cos(angle), cy + r_in  * math.sin(angle)),
                   (cx + r_out * math.cos(angle), cy + r_out * math.sin(angle))],
                  fill=(20, 20, 20), width=3)
    # minute hand (fast spin per frame)
    min_angle = math.radians(frame_idx * 12 - 90)
    draw.line([(cx, cy),
               (cx + radius * 0.7 * math.cos(min_angle),
                cy + radius * 0.7 * math.sin(min_angle))],
              fill=(10, 10, 10), width=4)
    # hour hand
    hr_angle = math.radians(frame_idx * 3 - 90)
    draw.line([(cx, cy),
               (cx + radius * 0.5 * math.cos(hr_angle),
                cy + radius * 0.5 * math.sin(hr_angle))],
              fill=(10, 10, 10), width=6)


def draw_phone(draw, x0, y0, x1, y1, screen_color):
    """Phone silhouette with screen rectangle."""
    rough_rectangle(draw, x0, y0, x1, y1,
                    fill=(40, 40, 40), outline=(20, 20, 20), roughness=4)
    # screen inset
    px, py = 12, 30
    rough_rectangle(draw, x0 + px, y0 + py, x1 - px, y1 - py,
                    fill=screen_color, outline=None, roughness=2)
    # home button bump
    bx = (x0 + x1) // 2
    draw.ellipse([bx - 8, y1 - 22, bx + 8, y1 - 6],
                 fill=(60, 60, 60))


def draw_newsprint_texture(draw, seed_offset):
    """Horizontal scan-line hatching to mimic newsprint."""
    step = RNG.randint(4, 8)
    for y in range(0, H, step):
        alpha = RNG.randint(10, 40)
        draw.line([(0, y), (W, y)],
                  fill=(0, 0, 0, alpha), width=1)
    # random dark blobs
    for _ in range(RNG.randint(8, 20)):
        bx = RNG.randint(0, W)
        by = RNG.randint(0, H)
        bw = RNG.randint(20, 120)
        bh = RNG.randint(4, 20)
        draw.rectangle([bx, by, bx + bw, by + bh],
                       fill=(0, 0, 0, RNG.randint(15, 50)))


def draw_flower(draw, cx, cy, radius, color, petals=6, frame_idx=0):
    """Simple petal flower — rotates per frame."""
    rot = math.radians(frame_idx * 15)
    for p in range(petals):
        angle = rot + math.radians(p * 360 / petals)
        px = cx + radius * math.cos(angle)
        py = cy + radius * math.sin(angle)
        pr = radius * 0.55
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=color)
    # centre
    draw.ellipse([cx - radius * 0.3, cy - radius * 0.3,
                  cx + radius * 0.3, cy + radius * 0.3],
                 fill=(255, 255, 255))


def draw_street_sign(draw, x0, y0, x1, y1, text_lines, bg=(0, 100, 0)):
    """Green (or colour) rectangular street sign."""
    rough_rectangle(draw, x0, y0, x1, y1,
                    fill=bg, outline=(255, 255, 255), roughness=4)
    # white border inset
    draw.rectangle([x0 + 6, y0 + 6, x1 - 6, y1 - 6], outline=(255, 255, 255), width=2)
    # text — use default bitmap font (no external font needed)
    font = ImageFont.load_default(size=28)
    lh = 34
    total = len(text_lines) * lh
    ty = (y0 + y1) // 2 - total // 2
    for line in text_lines:
        bbox = font.getbbox(line)
        tw = bbox[2] - bbox[0]
        draw.text(((x0 + x1) // 2 - tw // 2, ty), line,
                  fill=(255, 255, 255), font=font)
        ty += lh


def draw_urban_details(draw, frame_idx):
    """Scatter urban micro-elements: arrows, dots, grid lines."""
    accent = [(255, 80, 0), (0, 0, 0), (255, 255, 255), (200, 0, 200)]
    # crosswalk stripes
    stripe_x = RNG.randint(100, 700)
    for i in range(6):
        sy = RNG.randint(1200, 1700) + i * 30
        draw.rectangle([stripe_x, sy, stripe_x + 180, sy + 18],
                       fill=RNG.choice([(255, 255, 255), (0, 0, 0)]))
    # random circles
    for _ in range(RNG.randint(3, 8)):
        cx = RNG.randint(50, W - 50)
        cy = RNG.randint(50, H - 50)
        r  = RNG.randint(8, 40)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     outline=RNG.choice(accent), width=3)
    # scattered text fragments
    words = ["STOP", "ONE WAY", "YIELD", "NO TURN", "WALK", "SIGNAL",
             "CROSS", "SPEED", "LIMIT", "25", "ZONE", "EXIT"]
    font = ImageFont.load_default(size=RNG.choice([22, 32, 44]))
    for _ in range(RNG.randint(2, 5)):
        wx = RNG.randint(0, W - 200)
        wy = RNG.randint(0, H - 60)
        draw.text((wx, wy), RNG.choice(words),
                  fill=RNG.choice(accent), font=font)


# ---------------------------------------------------------------------------
# Frame builders
# ---------------------------------------------------------------------------

def make_phase1_frame(frame_idx):
    """Grey newsprint chaos."""
    rng_seed = frame_idx * 1337
    RNG.seed(rng_seed)

    bg_shade = RNG.randint(*GREY_BG_RANGE)
    img = Image.new("RGBA", (W, H), (bg_shade, bg_shade, bg_shade, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    # newsprint texture layer
    draw_newsprint_texture(draw, frame_idx)

    grey_palette = [
        (50, 50, 50), (80, 80, 80), (120, 120, 120),
        (160, 160, 160), (200, 200, 200), (240, 240, 240),
    ]

    # --- torn paper shapes in background ---
    for _ in range(RNG.randint(4, 8)):
        x0 = RNG.randint(-100, W - 100)
        y0 = RNG.randint(-100, H - 100)
        w  = RNG.randint(200, 600)
        h  = RNG.randint(150, 500)
        shade = RNG.randint(170, 245)
        rough_rectangle(draw, x0, y0, x0 + w, y0 + h,
                        fill=(shade, shade, shade, 220),
                        outline=(30, 30, 30), roughness=10)
        add_rough_white_border(draw, x0, y0, x0 + w, y0 + h, thickness=12)

    # --- clocks ---
    num_clocks = RNG.randint(1, 3)
    for _ in range(num_clocks):
        cx = RNG.randint(150, W - 150)
        cy = RNG.randint(150, H - 150)
        r  = RNG.randint(80, 200)
        shade = RNG.randint(180, 240)
        draw_clock(draw, cx, cy, r, (shade, shade, shade), frame_idx)

    # --- phone rectangles ---
    num_phones = RNG.randint(1, 3)
    for _ in range(num_phones):
        pw = RNG.randint(80, 160)
        ph = RNG.randint(160, 320)
        px = RNG.randint(0, W - pw)
        py = RNG.randint(0, H - ph)
        screen_shade = RNG.randint(50, 130)
        draw_phone(draw, px, py, px + pw, py + ph,
                   (screen_shade, screen_shade, screen_shade))
        add_rough_white_border(draw, px, py, px + pw, py + ph, thickness=8)

    # --- scattered halftone dots ---
    for _ in range(RNG.randint(30, 60)):
        dx = RNG.randint(0, W)
        dy = RNG.randint(0, H)
        dr = RNG.randint(2, 10)
        alpha = RNG.randint(40, 120)
        draw.ellipse([dx - dr, dy - dr, dx + dr, dy + dr],
                     fill=(0, 0, 0, alpha))

    img = img.convert("RGB")
    img = high_contrast(img, factor=1.5)
    img = film_grain(img, intensity=35)
    return img


def make_phase2_frame(frame_idx):
    """Vibrant yellow collage."""
    rng_seed = (PHASE1_FRAMES + frame_idx) * 2053
    RNG.seed(rng_seed)

    img = Image.new("RGBA", (W, H), YELLOW_BG + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    vivid_palette = [
        (255, 50,  50),   # red
        (255, 140, 0),    # orange
        (0,   180, 80),   # green
        (0,   80,  200),  # blue
        (180, 0,   180),  # purple
        (255, 220, 0),    # bright yellow (same family)
        (255, 255, 255),  # white
        (10,  10,  10),   # black
    ]

    # --- background paper chunks ---
    for _ in range(RNG.randint(5, 10)):
        x0 = RNG.randint(-150, W - 100)
        y0 = RNG.randint(-150, H - 100)
        w  = RNG.randint(200, 700)
        h  = RNG.randint(150, 600)
        col = RNG.choice(vivid_palette)
        alpha = RNG.randint(140, 220)
        rough_rectangle(draw, x0, y0, x0 + w, y0 + h,
                        fill=col + (alpha,),
                        outline=(0, 0, 0), roughness=12)
        add_rough_white_border(draw, x0, y0, x0 + w, y0 + h, thickness=14)

    # --- flowers ---
    num_flowers = RNG.randint(2, 5)
    for _ in range(num_flowers):
        cx = RNG.randint(80, W - 80)
        cy = RNG.randint(80, H - 80)
        r  = RNG.randint(50, 160)
        col = RNG.choice([c for c in vivid_palette if c not in [(255, 220, 0), (255, 255, 255)]])
        petals = RNG.choice([5, 6, 8])
        draw_flower(draw, cx, cy, r, col, petals, frame_idx)

    # --- street signs ---
    num_signs = RNG.randint(1, 3)
    sign_texts = [
        ["MAIN ST"],
        ["ONE", "WAY"],
        ["STOP"],
        ["NO LEFT", "TURN"],
        ["SPEED", "LIMIT", "25"],
        ["YIELD"],
        ["WALK /", "DON'T WALK"],
    ]
    sign_colors = [(0, 100, 0), (180, 0, 0), (0, 0, 160), (100, 60, 0)]
    for _ in range(num_signs):
        sw = RNG.randint(160, 340)
        sh = RNG.randint(100, 220)
        sx = RNG.randint(0, W - sw)
        sy = RNG.randint(0, H - sh)
        bg = RNG.choice(sign_colors)
        texts = RNG.choice(sign_texts)
        draw_street_sign(draw, sx, sy, sx + sw, sy + sh, texts, bg)
        add_rough_white_border(draw, sx, sy, sx + sw, sy + sh, thickness=10)

    # --- urban detail collage ---
    draw_urban_details(draw, frame_idx)

    # --- extra bold outlines / hatching ---
    for _ in range(RNG.randint(2, 5)):
        lx0 = RNG.randint(0, W)
        ly0 = RNG.randint(0, H)
        lx1 = RNG.randint(0, W)
        ly1 = RNG.randint(0, H)
        draw.line([(lx0, ly0), (lx1, ly1)],
                  fill=RNG.choice([(0, 0, 0), (255, 255, 255)]),
                  width=RNG.randint(3, 10))

    img = img.convert("RGB")
    img = high_contrast(img, factor=1.45)
    img = film_grain(img, intensity=25)
    return img


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Generating {TOTAL_FRAMES} frames at {FPS} fps "
          f"({TOTAL_FRAMES / FPS:.1f} s) …")

    frames = []

    for i in range(PHASE1_FRAMES):
        if i % 6 == 0:
            print(f"  Phase 1 frame {i + 1}/{PHASE1_FRAMES}")
        frame = make_phase1_frame(i)
        frames.append(np.array(frame))

    for i in range(PHASE2_FRAMES):
        if i % 6 == 0:
            print(f"  Phase 2 frame {i + 1}/{PHASE2_FRAMES}")
        frame = make_phase2_frame(i)
        frames.append(np.array(frame))

    print("Encoding MP4 …")
    clip = ImageSequenceClip(frames, fps=FPS)
    output = "stop_motion_collage.mp4"
    clip.write_videofile(output, codec="libx264", fps=FPS, logger="bar",
                         ffmpeg_params=["-pix_fmt", "yuv420p",
                                        "-crf", "18",
                                        "-preset", "fast"])
    print(f"\nDone → {output}")


if __name__ == "__main__":
    main()

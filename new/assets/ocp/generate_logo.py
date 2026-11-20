"""Generate the Open Cryptanalysis Platform wordmark. Usage: python generate_logo.py [directory]"""
import argparse
from math import cos, radians, sin
from pathlib import Path

# Outer O, inner C, and horizontal bar/P, in that order.
PALETTES = {
    "on-light": ("#153d2e", "#2f7854", "#67a984"),
    "on-dark": ("#72ab8b", "#99cfae", "#cfead8"),
}


def open_circle(radius, opening_half_angle):
    """Return a circular arc centered on (52, 54) with its opening facing right."""
    angle = radians(opening_half_angle)
    x = 52 + radius * cos(angle)
    y = radius * sin(angle)
    return f"M{x:.3f} {54-y:.3f}A{radius} {radius} 0 1 0 {x:.3f} {54+y:.3f}"


def wordmark(outer, inner, bar):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="308" height="108" viewBox="0 0 308 108" role="img" aria-labelledby="ocp-title">
  <title id="ocp-title">Open Cryptanalysis Platform</title>
  <g fill="none" stroke-width="8" stroke-linecap="round">
    <path stroke="{outer}" d="{open_circle(44, 17)}"/>
    <path stroke="{bar}" d="M39 54H107"/>
    <path stroke="{inner}" d="{open_circle(27, 33)}"/>
  </g>
  <g fill="none" stroke-width="9" stroke-linecap="square">
    <rect stroke="{outer}" x="135" y="29" width="39" height="51" rx="19.5"/>
    <path stroke="{inner}" d="M230 39c-4-7-9-10-17-10-14 0-22 10-22 25s8 26 22 26c8 0 14-4 18-11"/>
    <path stroke="{bar}" d="M251 79V30h18c11 0 18 6 18 15s-7 15-18 15h-18"/>
  </g>
</svg>
'''


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path, nargs="?", default=Path("."))
    directory = parser.parse_args().directory
    directory.mkdir(parents=True, exist_ok=True)
    for background, colors in PALETTES.items():
        (directory / f"ocp-{background}.svg").write_text(wordmark(*colors), encoding="utf-8")

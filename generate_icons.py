import subprocess
import os

svg_content_standard = '''<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1769FF" />
      <stop offset="55%" stop-color="#0755E9" />
      <stop offset="100%" stop-color="#053BA6" />
    </linearGradient>
    <linearGradient id="maneGrad" x1="272" y1="80" x2="448" y2="432" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7DD3FC" />
      <stop offset="50%" stop-color="#38A5FF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
  </defs>

  <!-- Outer Rounded Royal Crest -->
  <rect width="512" height="512" rx="112" fill="url(#shieldGrad)" />

  <!-- Subtle Arabesque Ring -->
  <circle cx="256" cy="256" r="200" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="9.6" />

  <!-- Inner Arabian Horse Emblem Scaled 8x (from 64x64 viewbox) -->
  <g transform="matrix(8, 0, 0, 8, 0, 0)">
    <!-- Mane Waves -->
    <path d="M35 12C43 13 51 18 53 25C48 24 44 25 41 28C48 29 53 34 54 41C49 39 45 40 42 43C46 45 49 49 49 54H36L35 12Z" fill="url(#maneGrad)" opacity="0.95" />
    <path d="M37 17C44 19 49 23 50 28C45 27 42 28 39 31" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.75" />

    <!-- Arabian Stallion Silhouette -->
    <path d="M43 54H20.5C21.5 46.5 24.5 40.5 28.5 36.5C29.5 35.5 29.2 34 27.8 33.8C23.2 33.4 18.8 35.2 15.5 35.2C12.8 35.2 10.5 33.2 10.5 30.4C10.5 28.6 11.6 27 13.2 25.8C16.2 23.5 18.2 20.2 19.8 16.5L22.5 9.5L25.8 14.2L29.5 8.5L31.2 14.8C38.5 19.2 43.5 28.5 44 39.5C44.2 44.8 43.6 49.8 43 54Z" fill="#FFFFFF" />

    <!-- Eye & Nostril -->
    <path d="M20.5 22.2C21.8 21.4 23.6 21.6 24.5 22.8C23.2 23.5 21.5 23.3 20.5 22.2Z" fill="#0755E9" />
    <circle cx="14.2" cy="30.2" r="1.2" fill="#0755E9" />

    <!-- Bridle Accent -->
    <path d="M15.5 32.2C20.5 31.2 25.5 28.8 29.5 24.5" stroke="#38A5FF" stroke-width="1.6" stroke-linecap="round" />

    <!-- Bottom Accent Bar -->
    <rect x="18" y="55.5" width="28" height="2.8" rx="1.4" fill="#38A5FF" />
  </g>
</svg>'''

svg_content_maskable = '''<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGradM" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1769FF" />
      <stop offset="55%" stop-color="#0755E9" />
      <stop offset="100%" stop-color="#053BA6" />
    </linearGradient>
    <linearGradient id="maneGradM" x1="272" y1="80" x2="448" y2="432" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7DD3FC" />
      <stop offset="50%" stop-color="#38A5FF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
  </defs>

  <!-- Full-Bleed Background for Maskable Icon Safe Zone -->
  <rect width="512" height="512" fill="url(#shieldGradM)" />

  <!-- Subtle Arabesque Ring in Center -->
  <circle cx="256" cy="256" r="170" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="8" />

  <!-- Horse Icon centered with 20% safe zone padding -->
  <g transform="matrix(6.4, 0, 0, 6.4, 51.2, 51.2)">
    <!-- Mane Waves -->
    <path d="M35 12C43 13 51 18 53 25C48 24 44 25 41 28C48 29 53 34 54 41C49 39 45 40 42 43C46 45 49 49 49 54H36L35 12Z" fill="url(#maneGradM)" opacity="0.95" />
    <path d="M37 17C44 19 49 23 50 28C45 27 42 28 39 31" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.75" />

    <!-- Arabian Stallion Silhouette -->
    <path d="M43 54H20.5C21.5 46.5 24.5 40.5 28.5 36.5C29.5 35.5 29.2 34 27.8 33.8C23.2 33.4 18.8 35.2 15.5 35.2C12.8 35.2 10.5 33.2 10.5 30.4C10.5 28.6 11.6 27 13.2 25.8C16.2 23.5 18.2 20.2 19.8 16.5L22.5 9.5L25.8 14.2L29.5 8.5L31.2 14.8C38.5 19.2 43.5 28.5 44 39.5C44.2 44.8 43.6 49.8 43 54Z" fill="#FFFFFF" />

    <!-- Eye & Nostril -->
    <path d="M20.5 22.2C21.8 21.4 23.6 21.6 24.5 22.8C23.2 23.5 21.5 23.3 20.5 22.2Z" fill="#0755E9" />
    <circle cx="14.2" cy="30.2" r="1.2" fill="#0755E9" />

    <!-- Bridle Accent -->
    <path d="M15.5 32.2C20.5 31.2 25.5 28.8 29.5 24.5" stroke="#38A5FF" stroke-width="1.6" stroke-linecap="round" />

    <!-- Bottom Accent Bar -->
    <rect x="18" y="55.5" width="28" height="2.8" rx="1.4" fill="#38A5FF" />
  </g>
</svg>'''

with open('public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content_standard)

with open('/tmp/maskable.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content_maskable)

# Generate PNGs using ImageMagick
subprocess.run(['convert', '-background', 'none', '-density', '300', 'public/icon.svg', '-resize', '512x512', 'public/pwa-512x512.png'], check=True)
subprocess.run(['convert', '-background', 'none', '-density', '300', 'public/icon.svg', '-resize', '192x192', 'public/pwa-192x192.png'], check=True)
subprocess.run(['convert', '-background', 'none', '-density', '300', 'public/icon.svg', '-resize', '180x180', 'public/apple-touch-icon.png'], check=True)
subprocess.run(['convert', '-background', 'none', '-density', '300', 'public/icon.svg', '-resize', '32x32', 'public/favicon-32x32.png'], check=True)
subprocess.run(['convert', '-background', 'none', '-density', '300', '/tmp/maskable.svg', '-resize', '512x512', 'public/pwa-maskable-512x512.png'], check=True)
subprocess.run(['convert', '-background', 'none', '-density', '300', '/tmp/maskable.svg', '-resize', '192x192', 'public/pwa-maskable-192x192.png'], check=True)

print("Icons generated successfully!")

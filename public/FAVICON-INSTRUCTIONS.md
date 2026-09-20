# Favicon Generation Instructions

## Required Favicon Files

The following favicon files should be generated from your logo design:

### Files Needed:
1. **favicon-16x16.png** - 16x16 pixels (browser tabs)
2. **favicon-32x32.png** - 32x32 pixels (browser tabs, bookmarks)
3. **apple-touch-icon.png** - 180x180 pixels (iOS home screen)
4. **favicon.svg** - Already exists (modern browsers with SVG support)

## How to Generate

### Option 1: Online Tools
Use a favicon generator service like:
- https://realfavicongenerator.net/
- https://favicon.io/
- Upload your `galingph-logo.png` or `galingph-brand.png`

### Option 2: Design Tools
Using Figma, Photoshop, or Illustrator:
1. Open your logo file
2. Create artboards with the sizes above
3. Export as PNG with transparent background
4. Save to `/public` folder

### Option 3: Command Line (ImageMagick)
```bash
# From your logo PNG file:
convert galingph-logo.png -resize 16x16 favicon-16x16.png
convert galingph-logo.png -resize 32x32 favicon-32x32.png
convert galingph-logo.png -resize 180x180 apple-touch-icon.png
```

## Current Status
✅ favicon.svg - Exists
✅ site.webmanifest - Created
✅ HTML meta tags - Added
⚠️ favicon-16x16.png - Use existing logo as fallback
⚠️ favicon-32x32.png - Use existing logo as fallback  
⚠️ apple-touch-icon.png - Use existing logo as fallback

## Temporary Solution
The site will use `favicon.svg` as the primary favicon. The PNG files can be generated later from the existing logo assets.

You can use `galingph-logo.png` or `galingph-brand.png` as temporary fallbacks by copying them:
```bash
cp public/galingph-logo.png public/favicon-32x32.png
cp public/galingph-logo.png public/favicon-16x16.png
cp public/galingph-logo.png public/apple-touch-icon.png
```

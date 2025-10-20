# Blog System Guide

## ✅ What's Been Set Up

Your Norwegian-only blog is now fully functional with:

- ✅ Content Collections with type-safe schema validation
- ✅ Blog listing page at `/no/blogg`
- ✅ Dynamic blog post pages at `/no/blogg/[slug]`
- ✅ Navigation links in header and footer (Norwegian only)
- ✅ SEO optimization with meta tags and structured data
- ✅ Tailwind Pro styling for professional appearance
- ✅ One example blog post to use as a template

## 📝 Creating New Blog Posts

### Step 1: Create the Markdown File

Create a new `.md` file in `src/content/blog/`:

```bash
# Example: Create a new blog post
touch src/content/blog/hvordan-koble-quick3-med-woocommerce.md
```

### Step 2: Add Frontmatter

Copy this template and customize:

```markdown
---
title: "Your Blog Post Title"
description: "SEO meta description (150-160 characters recommended)"
pubDate: 2025-10-14
image: "/blog/your-image.jpg"
imageAlt: "Description of the image for accessibility"
authorName: "Ole Hansen"
authorRole: "CEO, Iniva AS"
authorImage: "/authors/ole-hansen.jpg"
draft: false
---

## Your content here

Write your blog post content using markdown...
```

**Required fields:**
- `title`: Post title
- `description`: SEO meta description
- `pubDate`: Publication date (YYYY-MM-DD)
- `image`: Hero image path
- `imageAlt`: Image alt text for accessibility
- `authorName`: Author's full name
- `authorRole`: Author's role/title
- `authorImage`: Author photo path

**Optional fields:**
- `draft`: Set to `true` to hide from listing (default: false)
- `updatedDate`: Date of last update (YYYY-MM-DD)

### Step 3: Add Hero Image

1. Create or find an image (1200x675px recommended)
2. Save it in `public/blog/your-image.jpg`
3. Reference it in frontmatter: `image: "/blog/your-image.jpg"`

### Step 3.5: Add Author Photo (First Time Only)

If you haven't already added your author photo:

1. Prepare a professional headshot (256x256px recommended)
2. Save it in `public/authors/ole-hansen.jpg`
3. See `public/authors/README.md` for image guidelines
4. Once added, you can reuse the same photo for all your blog posts

### Step 4: Write Content

Use standard Markdown syntax:

```markdown
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Bullet point lists
- Another item

1. Numbered lists
2. Another item

[Link text](https://example.com)

> Blockquote for emphasis

`Inline code`

\`\`\`javascript
// Code block with syntax highlighting
const example = "Hello World";
\`\`\`
```

### Step 5: Preview Locally

```bash
cd website
npm run dev
# Visit http://localhost:4321/no/blogg
```

## 📋 Your Planned Blog Posts

Based on your list, here are the files to create:

- [ ] `src/content/blog/hvorfor-integrere-quick3-med-woocommerce.md` ✅ **DONE (example)**
- [ ] `src/content/blog/hvordan-koble-quick3-med-woocommerce.md`
- [ ] `src/content/blog/hva-koster-det-aa-koble-quick3-til-woocommerce.md`
- [ ] `src/content/blog/fordeler-med-woocommerce-for-quick3-nettbutikk.md`
- [ ] `src/content/blog/slik-fungerer-lagerstyring-mellom-quick3-og-woocommerce.md`

## 🎨 Styling

The blog uses Tailwind Pro components and custom typography:

- Professional heading styles
- Proper spacing and readability
- Responsive images with rounded corners
- Code blocks with syntax highlighting
- Blockquotes with indigo accent border
- Hover effects on links
- Author cards with photo, name, and role

## 🔍 SEO Features

Each blog post automatically includes:

- ✅ Meta title and description
- ✅ OpenGraph tags for social sharing
- ✅ Structured data (BlogPosting schema with author info)
- ✅ Breadcrumb navigation
- ✅ Proper heading hierarchy
- ✅ Image alt text for accessibility
- ✅ Author attribution for trust and credibility

## 📱 Responsive Design

The blog is fully responsive:
- Desktop: Full layout with large images
- Tablet: Adjusted spacing
- Mobile: Stacked layout, optimized for reading

## 🚀 Publishing Workflow

1. **Draft Mode**: Set `draft: true` in frontmatter to hide from listing
2. **Write Content**: Create your blog post with markdown
3. **Add Image**: Upload hero image to `public/blog/`
4. **Test Locally**: Run `npm run dev` and preview
5. **Publish**: Set `draft: false` and commit to git
6. **Build**: Run `npm run build` to generate static files
7. **Deploy**: Push to your hosting (Netlify, Vercel, etc.)

## 🔗 URLs

- Blog listing: `https://quick3-for-woocommerce.no/no/blogg`
- Individual post: `https://quick3-for-woocommerce.no/no/blogg/[slug]`

The slug is automatically generated from the filename (without `.md`).

## 📸 Finding Images

Free stock photos:
- [Unsplash](https://unsplash.com) - High quality free images
- [Pexels](https://pexels.com) - Free stock photos
- [Pixabay](https://pixabay.com) - Free images and videos

Create custom graphics:
- [Canva](https://canva.com) - Easy design tool
- [Figma](https://figma.com) - Professional design tool

## 🎯 SEO Tips

1. **Title**: Keep under 60 characters for Google
2. **Description**: 150-160 characters, include target keyword
3. **Headings**: Use H2 and H3 for structure
4. **Internal Links**: Link to other pages on your site
5. **Images**: Always add descriptive alt text
6. **Content Length**: Aim for 1000+ words for SEO value

## ✨ Example Blog Post

Check out `src/content/blog/hvorfor-integrere-quick3-med-woocommerce.md` for a complete example with:
- Proper frontmatter structure
- Heading hierarchy
- Lists and formatting
- Internal links
- Call-to-action sections
- FAQ section

## 🆘 Need Help?

If you encounter issues:
1. Check the Astro docs: https://docs.astro.build/en/guides/content-collections/
2. Verify frontmatter fields match the schema
3. Ensure images exist in `public/blog/`
4. Check console for build errors

Happy blogging! 📝

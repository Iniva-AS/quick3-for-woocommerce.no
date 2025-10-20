import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		image: z.string(),
		imageAlt: z.string(),
		draft: z.boolean().default(false),
		authorName: z.string(),
		authorRole: z.string(),
		authorImage: z.string(),
	}),
});

const partners = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		logo: z.string(),
		profileImage: z.string().optional(),
		description: z.string(),
		website: z.string().url(),
		email: z.string().email(),
		phone: z.string(),
		location: z.string(),
		services: z.array(z.string()),
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, partners };

export const IMAGE_VARIANTS = [
	'thumbnail',
	'small',
	'medium',
	'large',
	'xlarge',
	'public'
] as const;

export type ImageVariant = (typeof IMAGE_VARIANTS)[number];

export const SRCSET_VARIANTS: { variant: ImageVariant; width: number }[] = [
	{ variant: 'thumbnail', width: 320 },
	{ variant: 'small', width: 640 },
	{ variant: 'medium', width: 960 },
	{ variant: 'large', width: 1280 },
	{ variant: 'xlarge', width: 1920 },
];

export const IMAGE_CDN_URL = 'https://images.woofswelcome.app';

export function buildImageUrl(imageId: string, variant: ImageVariant = 'medium'): string {
	return `${IMAGE_CDN_URL}/${imageId}/${variant}`;
}

export function buildResponsiveSrcSet(
	imageId: string,
	variants: { variant: ImageVariant; width: number }[] = SRCSET_VARIANTS,
): string {
	return variants
		.map(({ variant, width }) => `${buildImageUrl(imageId, variant)} ${width}w`)
		.join(', ');
}

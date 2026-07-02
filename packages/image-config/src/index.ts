export const IMAGE_VARIANTS = [
	'thumbnail',
	'small',
	'medium',
	'large',
	'xlarge',
	'public'
] as const;

export type ImageVariant = (typeof IMAGE_VARIANTS)[number];

const CF_DELIVERY_URL = 'https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ';

const VARIANT_PARAMS: Record<ImageVariant, string> = {
	thumbnail: 'w=320,q=80,fit=cover,f=webp',
	small:     'w=640,q=80,fit=cover,f=webp',
	medium:    'w=960,q=85,fit=cover,f=webp',
	large:     'w=1280,q=85,fit=cover,f=webp',
	xlarge:    'w=1920,q=90,fit=cover,f=webp',
	public:    'w=1920,q=90,fit=cover,f=webp',
};

export const SRCSET_VARIANTS: { variant: ImageVariant; width: number }[] = [
	{ variant: 'thumbnail', width: 320 },
	{ variant: 'small', width: 640 },
	{ variant: 'medium', width: 960 },
	{ variant: 'large', width: 1280 },
	{ variant: 'xlarge', width: 1920 },
];

export function buildImageUrl(imageId: string, variant: ImageVariant = 'medium'): string {
	return `${CF_DELIVERY_URL}/${imageId}/${VARIANT_PARAMS[variant]}`;
}

export function buildResponsiveSrcSet(
	imageId: string,
	variants: { variant: ImageVariant; width: number }[] = SRCSET_VARIANTS,
): string {
	return variants
		.map(({ variant, width }) => `${buildImageUrl(imageId, variant)} ${width}w`)
		.join(', ');
}

export const merchProducts = [
  {
    "slug": "taurus-shirt",
    "name": "Taurus zodiac shirt",
    "productId": "6ad179eb85955f92a50529a4",
    "kind": "shirt",
    "priceCents": 3400,
    "allowedVariantIds": [78991, 78992, 78993, 78994, 78995, 79142, 101450]
  },
  {
    "slug": "aries-shirt",
    "name": "Aries zodiac shirt",
    "productId": "6ad187092a7b57e9090d14b4",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "gemini-shirt",
    "name": "Gemini zodiac shirt",
    "productId": "6ad18969537e1bc495097972",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "cancer-shirt",
    "name": "Cancer zodiac shirt",
    "productId": "6ad189b22a7b57e9090d16c8",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "leo-shirt",
    "name": "Leo zodiac shirt",
    "productId": "6ad18a27437482413208f93f",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "virgo-shirt",
    "name": "Virgo zodiac shirt",
    "productId": "6ad18a75102829824802e66c",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "libra-shirt",
    "name": "Libra zodiac shirt",
    "productId": "6ad18b03eb958f0a3a00b072",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "scorpio-shirt",
    "name": "Scorpio zodiac shirt",
    "productId": "6ad18b7716a1d5c8d601510c",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "sagittarius-shirt",
    "name": "Sagittarius zodiac shirt",
    "productId": "6ad18bcf47a196f8200d2add",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "capricorn-shirt",
    "name": "Capricorn zodiac shirt",
    "productId": "6ad18c63e9129153fd0b7969",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "aquarius-shirt",
    "name": "Aquarius zodiac shirt",
    "productId": "6ad18ced437482413208fba2",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "pisces-shirt",
    "name": "Pisces zodiac shirt",
    "productId": "6ad18da4437482413208fc04",
    "kind": "shirt",
    "priceCents": 3400
  },
  {
    "slug": "love-candle",
    "name": "Love candle",
    "productId": "6ad2936df124a2c13f09d7f6",
    "kind": "candle",
    "priceCents": 2800
  },
  {
    "slug": "prosperity-candle",
    "name": "Prosperity candle",
    "productId": "6ad293148e63605db603d6c8",
    "kind": "candle",
    "priceCents": 2800
  },
  {
    "slug": "protection-candle",
    "name": "Protection candle",
    "productId": "6ad29211f3b2ab4a880cf6ce",
    "kind": "candle",
    "priceCents": 2800
  },
  {
    "slug": "clarity-candle",
    "name": "Clarity candle",
    "productId": "6ad291963f42a07d4c090f9a",
    "kind": "candle",
    "priceCents": 2800
  },
  {
    "slug": "peace-candle",
    "name": "Peace candle",
    "productId": "6ad290f9be99720e8e0bd1b7",
    "kind": "candle",
    "priceCents": 2800
  },
  {
    "slug": "writing-hour-candle",
    "name": "The Writing Hour candle",
    "productId": "6ad293d13f42a07d4c09111b",
    "kind": "candle",
    "priceCents": 2800
  }
] as const;

export type MerchProduct = (typeof merchProducts)[number];

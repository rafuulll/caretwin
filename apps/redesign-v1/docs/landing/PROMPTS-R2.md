# Prompts de imagens · landing r2

04/11/2026. Ferramenta nativa `image_gen`, sem fallback CLI. Três cenas editoriais sintéticas e uma pose de personagem. Os SVGs foram desenhados diretamente em código; não são rasterizações de imagens geradas.

## Movimento durante o dia

Resultado usado: `public/assets/rotina-dia-r2.webp`. Fundo opaco. Prompt:

> Create a premium editorial photograph for CareTwin, a Brazilian family routine wearable brand. Wide landscape 4:3 composition, no text. Candid cropped view of a woman around 68 walking naturally on a quiet leafy urban park path in soft early morning sunlight, relaxed everyday blue cotton shirt, neutral trousers; frame from shoulder to mid-thigh, focus on her naturally swinging hand and wrist, not her face. She wears a modest dark navy silicone wrist wearable with a rounded square black glass face, approximately 1.3 inch screen, no visible numbers, logos or health metrics, screen turned slightly away. It must look like a plausible conceptual prototype, not an Apple watch and not luxury jewelry. Authentic mature skin texture, natural anatomy, one wrist device only. Understated contemporary fintech campaign photography, elegant negative space and real organic shadows, pale green/cream surroundings with rich but restrained blues. Product and everyday autonomy are the subject, not sport or medicine. No hospital, medical uniform, icons, graphic overlays, floating objects, 3D cartoon, typography or watermark. Beautiful photographic detail with physically credible hand and strap, crisp wearable in a softly focused lived-in scene. This is conceptual editorial imagery, not a testimonial.

## Descanso durante a noite

Resultado usado: `public/assets/rotina-noite-r2.webp`. Fundo opaco. A cena diurna foi fornecida como referência apenas do wearable. Prompt:

> Create a second editorial photograph for the same CareTwin campaign as the supplied daytime reference. Reference is for the wrist wearable's exact discreet dark navy silicone strap and rounded square black glass case only. New scene: an older woman's relaxed forearm and natural hand resting comfortably on pale ivory linen bedding at night; wrist device visible near the center, screen dark with no text, measurements or illuminated medical signals. No faces needed. A little soft pale blue cotton sleeve, a peaceful bedroom, subtle warm bedside light from the edge of frame mixed with very soft indigo evening light in the background. Premium quiet candid photographic composition, wide 4:3, physically correct mature skin and five fingers, believable scale of wearable and hand. No whole person sleeping unnaturally, no posed clenched hand, no icons, moon graphics, stars, text, logos or watermark. Avoid a pitch-black or neon scene: the skin, strap and linen must remain clear and elegantly lit. Cropped editorial detail that complements a daylight walking wrist image. This is conceptual editorial imagery for motion-based sleep estimation, not medical monitoring. Keep wearable appearance visually consistent with reference.

## Proximidade no cotidiano

Resultado usado: `public/assets/familia-cotidiano-r2.webp`. Fundo opaco. Prompt:

> A highly professional editorial lifestyle photograph for CareTwin, Brazilian family care technology. Landscape 4:3 image with a warm and modern fintech campaign feeling. A woman about 68 with short natural salt-and-pepper hair and medium brown skin, wearing a soft pale blue cotton blouse, is sitting at a sunlit apartment dining table with her adult daughter about 35 in an ivory shirt. A quiet spontaneous moment: both looking toward each other with a subtle genuine smile, older woman relaxed and self-directed, adult daughter listening, no posing toward camera. Hands relaxed on the table, no touching gestures required. One simple dark navy square-face routine wearable on the older woman's wrist, discreet and plausible, no legible screen. A small coffee cup on the table, warm off-white walls and pale blue curtain, a little soft natural greenery outside. Show from waist up, a considered candid composition, natural pores and age, believable human anatomy, actual photographic lens rendering, soft directional daylight, off-white and ink-blue palette. Mature, dignified, warm and contemporary, never sentimental stock hospital advertising. No medicine, nurses, stethoscopes, smartphone screens, hearts, icons, written text, logos or watermark. No chairs as still-life objects. Image will be disclosed as AI-generated editorial illustration, not a photograph of customers.

## Ritmo invertido

Referência: pose 12 da prancha original em `docs/redesign/estudos/mascotes/ritmo-poses-v1/ritmo-12-poses.png`, fornecida à ferramenta. Fundo transparente solicitado. Primeiro prompt:

> Edit the supplied CareTwin character sheet. Isolate ONLY the character in the bottom-right cell, pose 12 / Oi de novo. Create a pristine high resolution standalone transparent PNG cutout of that exact upside-down blue Ritmo mascot, without any cell, words, sheet, title, border, cream background or extra shapes. Preserve its original professional 2D illustration style with subtle dimensional shading, asymmetric single blue body, stubby arms, large cream eyes with navy pupils, original expression, and pale blue wave crossing the body (at the top because upside down). No chest stripes, no new limbs, no ears, no 3D remake. Keep the exact upside-down pose and anatomy from that reference cell. Center the isolated mascot with generous transparent margin, clean crisp antialiased edges, no ground shadow. This is extraction and cleanup for a small website closing illustration, not redesign of the character.

O primeiro resultado foi substituído por uma limpeza direcionada, com o próprio resultado como alvo e a prancha original como referência. Resultado usado: `public/assets/ritmo-oi-r2.webp`. Canal alfa confirmado. Segundo prompt:

> Precise transparent cutout cleanup of the FIRST supplied image. Keep the upside-down blue CareTwin Ritmo character, its eyes, mouth, pale blue body wave, asymmetrical anatomy, arms, pose and flat illustration shading EXACTLY. Remove absolutely ALL background, black field, blue halo, glow, bloom, rim fog and shadow OUTSIDE the actual character silhouette. The SECOND image is only a reference for the intended crisp clean illustration edges in the bottom-right pose. Output the first character alone on a truly transparent alpha background, no backdrop color, no halo and no extra blue surrounding it. Professional brand production cutout, crisp clean antialiased silhouette, generous transparent margins. Do not add new shapes or change the face.

## Preparação dos arquivos

PNG originais preservados localmente fora do bundle. Conversão WebP com qualidade 88, alfa 100; cenas em 1200×900 e Ritmo em 640×427. Não houve mudança semântica das imagens durante a conversão. Os arquivos efetivamente consumidos estão versionados em `public/assets/` e disponíveis em `/marca`.

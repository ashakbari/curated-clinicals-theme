/* ============================================================
   PRODUCT REVIEWS GENERATOR — Curated Clinicals
   Seeded by product handle so the same reviews render every load.
   Aggregate rating and count come from data attributes on the
   review section (hardcoded in the catalogue and product page),
   and individual reviews are synthesized to match that
   distribution. Showcase content only.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Seeded random helpers ---------- */

  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

  /* ---------- Data pools ---------- */

  var FIRST_NAMES = [
    'Jessica', 'Sarah', 'Emily', 'Olivia', 'Sophia', 'Mia', 'Ava', 'Charlotte', 'Amelia', 'Isabella',
    'Madison', 'Hannah', 'Abigail', 'Elizabeth', 'Lauren', 'Megan', 'Brittany', 'Ashley', 'Samantha', 'Lindsay',
    'Rachel', 'Stephanie', 'Nicole', 'Danielle', 'Kayla', 'Alyssa', 'Victoria', 'Natalie', 'Allison', 'Brooke',
    'Hayley', 'Caroline', 'Catherine', 'Claire', 'Grace', 'Hannah', 'Kelsey', 'Lillian', 'Madeline', 'Maya',
    'Aaliyah', 'Priya', 'Aisha', 'Mei', 'Yuki', 'Sofia', 'Camila', 'Valentina', 'Isabel', 'Lucia',
    'Jennifer', 'Karen', 'Susan', 'Patricia', 'Linda', 'Barbara', 'Margaret', 'Sandra', 'Donna', 'Carol',
    'Michelle', 'Laura', 'Amanda', 'Melissa', 'Deborah', 'Helen', 'Christina', 'Anna', 'Andrea', 'Diane',
    'Michael', 'David', 'James', 'John', 'Robert', 'William', 'Daniel', 'Matthew', 'Andrew', 'Joseph',
    'Christopher', 'Ryan', 'Joshua', 'Tyler', 'Nathan', 'Brandon', 'Justin', 'Adam', 'Sean', 'Mark',
    'Tom', 'Alex', 'Brian', 'Eric', 'Greg', 'Ian', 'Jason', 'Kevin', 'Luke', 'Owen'
  ];

  var LAST_INITIALS = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'J.', 'K.', 'L.', 'M.', 'N.', 'P.', 'R.', 'S.', 'T.', 'V.', 'W.', 'Y.'];

  /* ---------- Per-product specifics ---------- */
  /* Each entry: format (the kind of product), ingredient (hero active),
     feature (a signature thing reviewers latch onto), short (how
     reviewers refer to it casually). Reviews weave these into templates
     so every product's reviews read about THAT product, not generic. */

  var PRODUCT_CONTEXT = {
    'skinceuticals-ce-ferulic': { format: 'serum', ingredient: 'pure 15% L-ascorbic acid', feature: 'the iconic orange-bottle finish', short: 'CE Ferulic' },
    'skinceuticals-triple-lipid-restore-2-4-2': { format: 'moisturizer', ingredient: 'the 2:4:2 lipid ratio', feature: 'how it restores my barrier without feeling heavy', short: 'Triple Lipid' },
    'skinceuticals-phloretin-cf': { format: 'serum', ingredient: 'phloretin and 10% vitamin C', feature: 'finally a vitamin C my oily skin loves', short: 'Phloretin CF' },
    'skinceuticals-h-a-intensifier': { format: 'serum', ingredient: 'proxylane and multi-weight HA', feature: 'how it plumps without looking slick', short: 'HA Intensifier' },
    'skinceuticals-silymarin-cf': { format: 'serum', ingredient: 'silymarin and 15% vitamin C', feature: 'the matte finish that does not lift makeup', short: 'Silymarin CF' },
    'skinceuticals-hydrating-b5-gel': { format: 'gel', ingredient: 'B5 and hyaluronic acid', feature: 'the absorb-and-disappear texture', short: 'B5 Gel' },
    'skinceuticals-retinol': { format: 'retinol', ingredient: 'pure encapsulated retinol', feature: 'the three strength tiers to step up through', short: 'SkinCeuticals Retinol' },
    'skinceuticals-a-g-e-interrupter-advanced': { format: 'cream', ingredient: 'proxylane and blueberry extract', feature: 'the anti-glycation focus', short: 'AGE Interrupter' },
    'skinceuticals-retexturing-activator': { format: 'serum', ingredient: 'the hydroxyethyl urea complex', feature: 'the glow-now effect', short: 'Retexturing Activator' },
    'skinceuticals-phyto-corrective-gel': { format: 'gel', ingredient: 'cucumber and thyme botanicals', feature: 'the cooling redness-calm', short: 'Phyto Corrective' },
    'skinceuticals-serum-10-aox': { format: 'serum', ingredient: '10% L-ascorbic acid', feature: 'a vitamin C that does not sting', short: 'Serum 10' },
    'skinceuticals-p-tiox-serum': { format: 'serum', ingredient: 'acetyl hexapeptide and niacinamide', feature: 'how it softens expression lines', short: 'P-TIOX' },
    'skinceuticals-cell-cycle-catalyst-serum': { format: 'serum', ingredient: 'the cellular renewal complex', feature: 'the brightness that shows up by week three', short: 'Cell Cycle Catalyst' },
    'skinceuticals-emollience': { format: 'cream', ingredient: 'three nutrient algae extracts', feature: 'the lavender-mint finish that comforts', short: 'Emollience' },
    'skinceuticals-soothing-cleanser': { format: 'cleanser', ingredient: 'orchid and cucumber extracts', feature: 'the non-stripping cushion', short: 'Soothing Cleanser' },
    'skinceuticals-tripeptide-r-neck-repair': { format: 'neck cream', ingredient: '0.2% retinol and tripeptide complex', feature: 'finally a neck product that works', short: 'Tripeptide-R' },
    'skinceuticals-advanced-rgn-6': { format: 'cream', ingredient: 'the 6-active regenerative complex', feature: 'the speed of post-procedure recovery', short: 'RGN-6' },
    'lha-serum': { format: 'serum', ingredient: 'LHA, salicylic, glycolic and dioic acid', feature: 'how it tackles acne and texture together', short: 'LHA Serum' },
    'skinceuticals-aox-lip-repair': { format: 'lip treatment', ingredient: 'silymarin and hyaluronic acid', feature: 'antioxidant protection for the lip line', short: 'AOX Lip' },
    'zo-growth-factor-serum': { format: 'serum', ingredient: 'plant growth factors and ZPRO complex', feature: 'the high-end-facial feel every day', short: 'Growth Factor Serum' },
    'zo-wrinkle-and-texture-repair': { format: 'retinol cream', ingredient: '0.5% retinol with buddleja stem cells', feature: 'the smooth-skin wake-up', short: 'Wrinkle + Texture Repair' },
    'zo-brightalive-skin-brightener': { format: 'brightener', ingredient: 'tranexamic acid and niacinamide', feature: 'real brightening without retinol drama', short: 'Brightalive' },
    'zo-gentle-cleanser': { format: 'cleanser', ingredient: 'sodium lauroyl oat amino acids', feature: 'how it cleans without that tight feeling', short: 'ZO Gentle Cleanser' },
    'zo-exfoliating-polish': { format: 'polish', ingredient: 'ultra-fine magnesium crystals', feature: 'the glass-skin smoothness after one use', short: 'Exfoliating Polish' },
    'zo-complexion-renewal-pads': { format: 'pads', ingredient: 'glycolic acid in pre-soaked pads', feature: 'the morning pore-tightening swipe', short: 'Renewal Pads' },
    'zo-aggressive-anti-aging-program': { format: 'system', ingredient: 'the multi-step ZO anti-aging stack', feature: 'how it transforms skin over six weeks', short: 'Aggressive Anti-Aging' },
    'zo-daily-skincare-program': { format: 'system', ingredient: 'the four foundational ZO products', feature: 'the foolproof daily structure', short: 'Daily Skincare Program' },
    'zo-growth-factor-serum-eye': { format: 'eye serum', ingredient: 'growth factors with hyaluronate', feature: 'the cooling-tip applicator', short: 'GF Eye Serum' },
    'zo-renewal-creme': { format: 'cream', ingredient: 'acetyl hexapeptide and ZCORE complex', feature: 'gentle enough for every night', short: 'Renewal Creme' },
    'zo-hydrating-creme': { format: 'cream', ingredient: 'colloidal oatmeal and peptides', feature: 'the eczema-flare lifesaver factor', short: 'Hydrating Creme' },
    'zo-firming-serum': { format: 'serum', ingredient: 'sodium DNA and ZCORE complex', feature: 'how it lifts around the jawline', short: 'Firming Serum' },
    'zo-exfoliation-accelerator': { format: 'accelerator', ingredient: 'a gentle leave-on acid blend', feature: 'turnover boost without irritation', short: 'Exfoliation Accelerator' },
    'zo-skin-brightening-program-and-texture-repair': { format: 'system', ingredient: 'retinol plus brightening actives', feature: 'the years-of-sun-damage rescue', short: 'Brightening + Texture Program' },
    'zo-skin-brightening-program-kit-non-retinol': { format: 'system', ingredient: 'a non-retinol brightening stack', feature: 'effective brightening without retinol sensitivity', short: 'Non-Retinol Brightening Kit' },
    'zo-skin-normalizing-system': { format: 'system', ingredient: 'oil-balancing salicylic and retinol stack', feature: 'how it calms inflamed oily skin', short: 'Skin Normalizing System' },
    'zo-dual-action-scrub': { format: 'scrub', ingredient: 'lactic and salicylic acid with wax beads', feature: 'physical and chemical exfoliation in one step', short: 'Dual Action Scrub' },
    'zo-calming-toner': { format: 'toner', ingredient: 'witch hazel and sodium hyaluronate', feature: 'the calm-after-cleansing feel', short: 'Calming Toner' },
    'zo-exfoliating-cleanser': { format: 'cleanser', ingredient: 'salicylic acid and jojoba esters', feature: 'daily exfoliation without irritation', short: 'Exfoliating Cleanser' },
    'zo-getting-skin-ready-kit': { format: 'starter kit', ingredient: 'the cleanser-polish-pads trio', feature: 'the perfect ZO on-ramp', short: 'Getting Skin Ready' },
    'zo-acne-treatment-pads': { format: 'pads', ingredient: '2% salicylic acid pads', feature: 'the overnight pimple flatten', short: 'Acne Treatment Pads' },
    'zo-skin-brightening-sheet-mask': { format: 'sheet mask', ingredient: 'green tea and panthenol', feature: 'the pre-event glow boost', short: 'Brightening Sheet Mask' },
    'zo-gentle-cleanser-travel-size': { format: 'travel cleanser', ingredient: 'the same oat amino acid formula', feature: 'travel-friendly mini Gentle Cleanser', short: 'Gentle Cleanser Travel' },
    'zo-wrinkle-and-texture-repair-travel-size': { format: 'travel retinol', ingredient: 'the same 0.5% retinol formula', feature: 'travel-size ZO retinol consistency', short: 'Wrinkle + Texture Travel' },
    'zo-exfoliating-cleanser-travel-size': { format: 'travel cleanser', ingredient: 'the same salicylic acid formula', feature: 'travel-friendly daily exfoliation', short: 'Exfoliating Cleanser Travel' },
    'skinbetter-science-alpharet-overnight-cream': { format: 'cream', ingredient: 'patented AlphaRet (retinoid plus AHA)', feature: 'zero irritation with retinoid-grade results', short: 'AlphaRet Overnight' },
    'skinbetter-science-alto-advanced-defense-and-repair': { format: 'serum', ingredient: '19 antioxidants including vitamins C and E', feature: 'the layered antioxidant defense', short: 'Alto Defense' },
    'skinbetter-science-eyemax-alpharet-overnight': { format: 'eye cream', ingredient: 'AlphaRet for the eye area', feature: 'a gentle eye-area retinoid', short: 'EyeMax AlphaRet' },
    'skinbetter-science-even-intensive-correcting-serum-face': { format: 'serum', ingredient: 'b.r.y.t. Technology with alpha-arbutin', feature: 'the stubborn-pigmentation lift', short: 'Even Intensive' },
    'skinbetter-science-interfuse-treatment-cream-face-neck': { format: 'cream', ingredient: 'InterFuse Technology with five-collagen complex', feature: 'how it lifts face and neck together', short: 'Interfuse Face + Neck' },
    'skinbetter-science-mystro-active-balance-serum': { format: 'serum', ingredient: 'P.A.T.H. adaptogenic complex', feature: 'how it stabilizes moody skin', short: 'Mystro' },
    'skinbetter-science-alpharet-clearing-serum': { format: 'serum', ingredient: 'AlphaRet plus salicylic acid', feature: 'the acne and anti-aging two-for-one', short: 'AlphaRet Clearing' },
    'skinbetter-science-trio-luxe-moisture-treatment': { format: 'cream', ingredient: 'the velvety lipid and HA trio', feature: 'the luxurious sink-in finish', short: 'Trio Luxe' },
    'skinbetter-science-hydration-boosting-cream-face': { format: 'cream', ingredient: 'ceramides and botanical lipids', feature: 'the airy lightweight finish', short: 'Hydration Boosting Cream' },
    'skinbetter-science-trio-rebalancing-moisture-treatment': { format: 'cream', ingredient: 'urea complex with sodium PCA', feature: 'real hydration for oily skin', short: 'Trio Rebalancing' },
    'skinbetter-science-techno-neck-perfecting-cream': { format: 'neck cream', ingredient: 'the patented NO Complex', feature: 'the nitric oxide neck firmness', short: 'Techno Neck' },
    'skinbetter-science-instant-effect-eye-gel': { format: 'eye gel', ingredient: 'green coffee caffeine and algae', feature: 'the morning de-puff', short: 'Instant Effect Eye' },
    'skinbetter-science-interfuse-intensive-treatment-lines': { format: 'targeted serum', ingredient: 'injectable-grade hyaluronic acid', feature: 'topical filler that actually works', short: 'Interfuse Intensive' },
    'skinbetter-science-refresh-detoxifying-scrub-mask-face': { format: 'scrub mask', ingredient: 'clay with biodegradable beads', feature: 'the dual scrub-and-mask reset', short: 'Refresh Detox Mask' },
    'skinmedica-tns-advanced-serum': { format: 'serum', ingredient: 'TNS growth factor blend with peptides', feature: 'the dual-chamber luxury feel', short: 'TNS Advanced+' },
    'skinmedica-ha5®-rejuvenating-hydrator': { format: 'hydrator', ingredient: 'five forms of hyaluronic acid', feature: 'minute-by-minute plump and hold', short: 'HA5' },
    'skinmedica-lumivive™-system-day-night': { format: 'system', ingredient: 'blue-light defense AM plus restorative PM', feature: 'the 24-hour environmental shield', short: 'Lumivive' },
    'skinmedica-retinol-complex': { format: 'retinol', ingredient: 'three vitamin-A derivatives at gradual strengths', feature: 'the easy retinol on-ramp', short: 'Retinol Complex' },
    'skinmedica®lytera-2-0': { format: 'serum', ingredient: 'tranexamic acid and niacinamide', feature: 'the post-acne mark fader', short: 'Lytera 2.0' },
    'skinmedica-tns-eye-repair': { format: 'eye cream', ingredient: 'TNS growth factors for the eye area', feature: 'how it brightens dark circles slowly', short: 'TNS Eye Repair' },
    'skinmedica-dermal-repair-cream': { format: 'cream', ingredient: 'hyaluronic acid and vitamins C and E', feature: 'how it heals after every laser session', short: 'Dermal Repair' },
    'skinmedica-scar-gel': { format: 'gel', ingredient: 'the clear scar treatment formula', feature: 'how it softens visible scars', short: 'Scar Gel' },
    'hydrinity-restorative-ha-serum': { format: 'serum', ingredient: 'supercharged bioidentical hyaluronic acid', feature: 'hydration that lasts beyond every other HA', short: 'Restorative HA' },
    'hydrinity-renewing-ha-serum': { format: 'serum', ingredient: 'supercharged HA for renewal', feature: 'how it plumps and brightens together', short: 'Renewing HA' },
    'hydrinity-vivid-brightening-serum': { format: 'serum', ingredient: 'a multi-active brightening complex', feature: 'targeted melasma support without bleaching', short: 'VIVID' },
    'hydri-c-daily-vitamin-c-moisturizer': { format: 'moisturizer', ingredient: 'MicroFusion stabilized vitamin C', feature: 'the hydrate-and-brighten combo step', short: 'HYDRI-C' },
    'hydrinity-hyacyn-active-purifying-mist': { format: 'mist', ingredient: 'hypochlorous acid', feature: 'the post-procedure calm-down spray', short: 'Hyacyn' },
    'hydrinity-prelude-facial-treatment-cleanser': { format: 'cleanser', ingredient: 'the treatment-prep cleanser', feature: 'how serums absorb better after this', short: 'Prelude' },
    'hydrinity-luxe-lip': { format: 'lip treatment', ingredient: 'the hyaluronic plumping lip blend', feature: 'lip plumping that actually feels luxe', short: 'Luxe Lip' },
    'alastin-regenerating-skin-nectar': { format: 'serum', ingredient: 'TriHex Technology peptide blend', feature: 'a pre and post-procedure must-have', short: 'Regenerating Skin Nectar' },
    'alastin-restorative-skin-complex': { format: 'cream', ingredient: 'TriHex peptide complex for firming', feature: 'visible firming over weeks', short: 'Restorative Skin Complex' },
    'alastin-ultra-nourishing-moisturizer': { format: 'cream', ingredient: 'the comfort-cream formula', feature: '24-hour hydration for stressed skin', short: 'Ultra Nourishing' },
    'alastin-inhance-post-injection-serum': { format: 'serum', ingredient: 'the post-injectable recovery blend', feature: 'the cooling-tip applicator after filler', short: 'INhance' },
    'colorescience-sunforgettable®-total-protection™-face-shield-spf-50': { format: 'mineral SPF', ingredient: '12% zinc oxide with EnviroScreen', feature: 'invisible mineral SPF that earns its hype', short: 'Total Protection Face Shield' },
    'colorescience-sunforgettable-total-protection-brush-on-shield-spf-50': { format: 'brush-on SPF', ingredient: 'the powder mineral SPF', feature: 'reapplying over makeup mid-day', short: 'Brush-On Shield' },
    'colorescience-even-up-3-in-1-skin-perfector-sunscreen-spf-50': { format: 'tinted SPF', ingredient: 'LUMIRA complex with zinc oxide', feature: 'SPF that corrects discoloration', short: 'Even Up' },
    'colorescience-total-eye-3-in-1-renewal-care': { format: 'eye cream', ingredient: 'the SPF and treatment eye blend', feature: 'eye cream with mineral SPF', short: 'Total Eye 3-in-1' },
    'colorescience-sunforgettable®-face-shield-flex': { format: 'mineral SPF', ingredient: 'flexible zinc oxide with adaptive pigments', feature: 'SPF that moves with my face', short: 'Face Shield Flex' },
    'colorescience-all-calm-multi-correction-serum': { format: 'serum', ingredient: 'the BioSolace complex', feature: 'how it calms reactive skin', short: 'All Calm' },
    'colorescience-no-show-mineral-sunscreen-spf50': { format: 'mineral SPF', ingredient: 'all-mineral zinc oxide for all tones', feature: 'truly no white cast on medium tones', short: 'No-Show' },
    'elta-md-uv-daily-tinted': { format: 'tinted SPF', ingredient: '9% zinc oxide with hyaluronic acid', feature: 'sunscreen and tint in one', short: 'UV Daily Tinted' },
    'eltamd-uv-sport-broad-spectrum-spf-50': { format: 'mineral SPF', ingredient: 'water-resistant zinc oxide', feature: 'sport SPF that survives sweat', short: 'UV Sport' },
    'eltamd-uv-sport-spf-50-226g': { format: 'mineral SPF', ingredient: 'family-size water-resistant zinc oxide', feature: 'beach-day sized SPF', short: 'UV Sport 226g' },
    'omnilux-contour-face-red-light-infrared-light-therapy': { format: 'LED mask', ingredient: 'red light and near-infrared therapy', feature: 'FDA-cleared in-home dermatology tech', short: 'Omnilux Contour' }
  };

  /* Fallback when handle is unknown — gives generic-but-not-broken phrasing */
  var FALLBACK_CONTEXT = { format: 'product', ingredient: 'the active formula', feature: 'how well it actually works', short: 'this product' };

  var SKIN_TYPES = [
    'combination', 'dry', 'oily', 'sensitive', 'mature',
    'normal-to-dry', 'normal-to-oily', 'acne-prone', 'reactive', 'dehydrated'
  ];

  var TIMEFRAMES = [
    'after two weeks', 'after a month', 'three weeks in', 'after six weeks',
    'after about a month', 'within the first two weeks', 'by week three',
    'after almost three months', 'after my second bottle', 'a few weeks in'
  ];

  var RESULT_PHRASES_GENERAL = [
    'my skin texture is noticeably smoother',
    'people keep asking what changed about my skin',
    'my skin looks more even and balanced',
    'my complexion is genuinely brighter',
    'my face feels softer and more hydrated',
    'I see a real difference in the mirror',
    'my skin looks calmer and more refined',
    'the change in my skin is undeniable',
    'I get compliments on my skin almost weekly now',
    'my routine feels complete with this in it'
  ];

  var RESULT_PHRASES_ANTI_AGING = [
    'my fine lines look softer',
    'the crow\'s feet around my eyes are less pronounced',
    'my forehead lines are visibly smoother',
    'my skin looks firmer along the jawline',
    'my smile lines have softened',
    'the texture around my eyes is much improved',
    'my skin looks more elastic and bouncy'
  ];

  var RESULT_PHRASES_BRIGHTENING = [
    'my dark spots are visibly lighter',
    'my old acne marks have faded so much',
    'my skin tone looks dramatically more even',
    'the melasma on my cheeks is fading',
    'my sun damage looks less obvious',
    'my complexion has a glow it never had before'
  ];

  var RESULT_PHRASES_HYDRATION = [
    'my skin feels plumper and more bouncy',
    'I no longer feel tight after cleansing',
    'my skin holds water like it never did before',
    'the dehydration lines on my cheeks are gone',
    'my skin actually feels soft all day'
  ];

  var RESULT_PHRASES_ACNE = [
    'my breakouts are way less frequent',
    'my skin clears up faster when I do break out',
    'my hormonal acne has calmed down significantly',
    'my pores look smaller and less congested',
    'I have not had a major breakout in weeks'
  ];

  var RESULT_PHRASES_SENSITIVITY = [
    'my redness has calmed dramatically',
    'my rosacea flares less often',
    'my skin barrier feels rebuilt',
    'the irritation I had is gone',
    'my reactive skin tolerates this beautifully'
  ];

  var RESULT_PHRASES_SUN = [
    'no white cast and stays put under makeup',
    'finally an SPF I actually want to wear',
    'I reapply this without a second thought',
    'no greasy finish and no stinging eyes',
    'my skin feels protected without feeling heavy'
  ];

  var RESULT_POOLS_BY_CONCERN = {
    'fine-lines': RESULT_PHRASES_ANTI_AGING,
    'firmness': RESULT_PHRASES_ANTI_AGING,
    'dark-spots': RESULT_PHRASES_BRIGHTENING,
    'dullness': RESULT_PHRASES_BRIGHTENING,
    'hydration': RESULT_PHRASES_HYDRATION,
    'dryness': RESULT_PHRASES_HYDRATION,
    'acne': RESULT_PHRASES_ACNE,
    'texture': RESULT_PHRASES_GENERAL,
    'sensitivity': RESULT_PHRASES_SENSITIVITY,
    'sun-protection': RESULT_PHRASES_SUN
  };

  /* Full review templates. Each is a complete body keyed by rating
     (5 / 4 / 3 only — no truly negative reviews). Most templates do
     not mention the product by name; reviewers refer to it as "this"
     or "it" the way real customers write. Roughly a quarter of
     templates include {short}, {format}, {ingredient}, or {feature}
     placeholders for natural product-specific moments. Placeholders
     {timeframe}, {skin_type}, and {result} get filled with values
     varied per-review. */

  var REVIEW_TEMPLATES = [

    /* ============ 5-STAR ============ */
    { r: 5, b: 'Best skincare investment I have made in the last two years. The texture difference is real and visible.' },
    { r: 5, b: 'Combination skin, late 30s. Six weeks in and people keep asking what I am doing differently.' },
    { r: 5, b: 'Got this on my esthetician\'s recommendation. She was right about everything.' },
    { r: 5, b: 'I am a chronic try-everything skincare person and this is the one I will not switch from.' },
    { r: 5, b: 'Bought it with low expectations. Three months later I am buying my second bottle.' },
    { r: 5, b: 'Dry skin, mid-40s. The way this performs in winter is unmatched.' },
    { r: 5, b: 'After menopause I struggled to find anything that worked. This finally does.' },
    { r: 5, b: 'Pump dispenses generously and a bottle lasts me about two months with twice-daily use.' },
    { r: 5, b: 'My partner started using mine, now we both have one. Recommendation is implicit.' },
    { r: 5, b: 'Worth the price tag. Lasts longer than I expected too.' },
    { r: 5, b: 'I have been a brand loyalist for years but this product specifically is non-negotiable in my routine.' },
    { r: 5, b: 'Picked this up after my dermatologist showed me her own counter. That sold me before I tried it.' },
    { r: 5, b: 'Skin tone is more even, less makeup needed, and my pores look smaller. Consistent use is key.' },
    { r: 5, b: '{result_cap} after about a month. {timeframe_cap} in, I am a believer.' },
    { r: 5, b: 'Layers under everything I use. No weird interactions with my other products.' },
    { r: 5, b: 'I gave a tube to my mother and she is now buying her own. Family-tested.' },
    { r: 5, b: 'The {ingredient} delivers exactly what it promises. I get the hype now.' },
    { r: 5, b: 'Pricey, but a bottle lasts me three months at daily use. Cost per use is not bad at all.' },
    { r: 5, b: 'Brought this on a two-week trip and my skin actually held up better than at home.' },
    { r: 5, b: 'Three years into using this brand. {short} is the one that converted me originally.' },
    { r: 5, b: 'Started seeing results faster than the brand claims. By week two I was sold.' },
    { r: 5, b: 'I have sensitive reactive skin and this is one of very few things I have never had an issue with.' },
    { r: 5, b: 'Switched from a more expensive product to this and honestly have not looked back.' },
    { r: 5, b: 'My partner does not notice my skincare usually. He noticed this.' },
    { r: 5, b: '{feature_cap} is what makes it worth it for me.' },
    { r: 5, b: 'Pre-procedure skincare prep got me hooked. Now using daily anyway.' },
    { r: 5, b: 'Best texture-improving product I have used. By a wide margin.' },
    { r: 5, b: 'Glow showed up in week three. Still showing up six months later.' },
    { r: 5, b: 'Cheaper than the procedure my derm wanted to do. Also cheaper than the prescription.' },
    { r: 5, b: 'Two bottles deep. The honeymoon has not ended.' },
    { r: 5, b: 'Was hesitant because of the price. The result-per-dollar is actually fair.' },
    { r: 5, b: 'My skin tolerates other actives much better when this is in the mix.' },
    { r: 5, b: 'Bought this for myself on my birthday. Best gift I have given myself in a while.' },
    { r: 5, b: 'Repurchase locked in. I plan my orders around when I will run out.' },
    { r: 5, b: 'Goes on smooth, sinks in fast, never irritated my skin once. Five stars.' },
    { r: 5, b: 'I broke up with my prescription routine for this. Zero regrets.' },
    { r: 5, b: 'Tried the drugstore knock-off first. Lesson learned, came back to this.' },
    { r: 5, b: 'Travel-friendly, fits in my carry-on. Works as well at altitude as at home.' },
    { r: 5, b: 'Bought it for a specific concern, kept it because of how it makes my skin feel overall.' },
    { r: 5, b: 'My only complaint is how fast I go through it. That is a compliment.' },
    { r: 5, b: 'I rotate through a lot of products and this one stays in rotation always.' },
    { r: 5, b: 'After a year of using this regularly, my skin is the best it has been in adulthood.' },
    { r: 5, b: 'Started seeing real change around week four. I am now four months in and the change has stuck.' },
    { r: 5, b: 'Eight weeks in. I do not want to know who I would be without this.' },
    { r: 5, b: 'Older skin appreciates this. My grandmother started using it after I showed her mine.' },
    { r: 5, b: 'If I had to cut my routine to one bottle this would be it.' },
    { r: 5, b: 'Bought this after a string of disappointing skincare purchases. Restored my faith.' },
    { r: 5, b: 'Acne-prone since teens, late 20s now. This and a good SPF and my skin has finally stabilized.' },
    { r: 5, b: 'Glass-skin texture is real and earned slowly. I am here for the slow earn.' },
    { r: 5, b: 'Honestly skeptical going in, fully converted going out.' },
    { r: 5, b: 'The way this layers under sunscreen and makeup is what makes it daily.' },
    { r: 5, b: 'Bought this twice in two months. That is how much I love it.' },
    { r: 5, b: 'Three months in. Skin barrier is the best it has ever been, including in my early 20s.' },
    { r: 5, b: 'Used to spend more on inferior products. The math works out.' },
    { r: 5, b: 'Will not run out of this. Will figure out the budget elsewhere.' },
    { r: 5, b: 'Tried this at a friend\'s house, ordered my own within the week.' },
    { r: 5, b: 'Esthetician used it on me in a facial and I left with a receipt-worthy glow. Bought it that night.' },
    { r: 5, b: 'I am 32, dry/combo skin, hormonal acne flares once a month. This keeps everything steady.' },
    { r: 5, b: 'Best skincare routine addition I have made all year. By far.' },
    { r: 5, b: '{result_cap} after {timeframe}. Worth saying out loud.' },
    { r: 5, b: 'My only regret is not finding this sooner.' },
    { r: 5, b: 'Quit two other serums after starting this. Did not need them anymore.' },
    { r: 5, b: 'Do not even let it run low anymore. Reorder when I hit the halfway mark.' },
    { r: 5, b: 'Pump is precise, packaging feels premium, and the formula does what it claims. Top tier.' },
    { r: 5, b: 'Couple weeks into using this. Already see the difference my friend keeps mentioning.' },
    { r: 5, b: 'My skin has not looked this calm in years. I credit this entirely.' },
    { r: 5, b: 'Real glow, not just dewy filter. Earned over weeks not minutes.' },
    { r: 5, b: 'Coworker asked what I am using. Told her. She bought it next day.' },
    { r: 5, b: 'I have been buying this consistently for almost two years now. Loyal.' },
    { r: 5, b: 'Mid-30s, {skin_type} skin. {result_cap} after {timeframe}.' },
    { r: 5, b: 'Was put on a strict skincare regimen by my derm. This is the only piece I added myself, and it stuck.' },
    { r: 5, b: 'Bought it on sale. Will pay full price next time. That says it all.' },
    { r: 5, b: 'My makeup applies better when this is in the routine. Side benefit, but a real one.' },
    { r: 5, b: 'Bought it twice. About to buy the bigger size. Time efficiency over savings.' },
    { r: 5, b: 'Three friends use this. Three friends recommended it. Now I am the fourth.' },
    { r: 5, b: 'My skin has its rhythm again. After months of trying to find something that worked, this clicked.' },

    /* ============ 4-STAR ============ */
    { r: 4, b: 'Solid product. Results are real, just took longer than I expected.' },
    { r: 4, b: 'Doing what it claims, slowly. Will finish the bottle.' },
    { r: 4, b: 'Texture is a touch heavier than I prefer but the results are there. Three weeks in.' },
    { r: 4, b: 'Wish it came in a bigger size at this price point. Otherwise no real complaints.' },
    { r: 4, b: 'Bought on a recommendation. Working as advertised. {feature_cap} is real.' },
    { r: 4, b: 'Decent but not a breakthrough. Adding to my rotation, not building my routine around it.' },
    { r: 4, b: 'Took longer than I hoped to see anything. Showing up now though.' },
    { r: 4, b: 'Good product, slightly overpromised marketing. Still glad I tried it.' },
    { r: 4, b: 'Scent is a thing. Not unpleasant, just present. Heads up if you are sensitive to that.' },
    { r: 4, b: 'Layers fine, absorbs fine, works fine. The price is what is making me hesitate on a repurchase.' },
    { r: 4, b: 'Glad I bought it. Probably will not repurchase though, working through several similar products.' },
    { r: 4, b: 'Pump situation could be better. I get less per push than I want.' },
    { r: 4, b: 'Got me through a rough winter for my skin. Crediting where credit is due.' },
    { r: 4, b: 'Subtle improvement, consistent improvement. I am a fan.' },
    { r: 4, b: 'Not life-changing, very lifestyle-fitting. Daily use is easy and my skin appreciates it.' },
    { r: 4, b: 'Slightly pricier than I would budget for normally but it earned the spot.' },
    { r: 4, b: 'First bottle took the full eight weeks before I noticed something. Worth the wait.' },
    { r: 4, b: 'Good as a complement to my prescription. Not a replacement, but a nice add.' },
    { r: 4, b: 'Combination skin, mid-30s. Works well in my AM routine, did not love it at night.' },
    { r: 4, b: 'Adding to my rotation, removing one star because the price keeps me from making it a daily forever.' },
    { r: 4, b: 'Decent results, would be five stars at a more reasonable price.' },
    { r: 4, b: '{feature_cap} is the standout. The rest is solid.' },
    { r: 4, b: 'Slow burn but real. Do not expect miracles in the first month.' },
    { r: 4, b: 'Better than I expected for a non-prescription product.' },
    { r: 4, b: 'Texture took some getting used to. Glad I stuck with it.' },
    { r: 4, b: 'Solid daily use. The {format} format works well for my routine.' },
    { r: 4, b: 'Got me back into a consistent routine, which alone earned the stars.' },
    { r: 4, b: 'Bottle empty after a few months. Mostly happy, would probably try the next iteration.' },
    { r: 4, b: 'Earned its keep in my routine. Not a knockout, but a steady performer.' },
    { r: 4, b: 'More subtle than the marketing implies. That said, real.' },
    { r: 4, b: 'My esthetician put this on me during a facial and I bought it that week. Solid, even if not life-changing.' },
    { r: 4, b: 'Decent, deserves the four stars. Would be five if the bottle were bigger.' },
    { r: 4, b: 'Honestly happy with this. The {feature} took me by surprise.' },
    { r: 4, b: 'Slow start, real finish. Six weeks of consistent use brought results.' },
    { r: 4, b: 'Skincare routine plug-and-play. Easy to use, gentle, results show up.' },

    /* ============ 3-STAR ============ */
    { r: 3, b: 'Fine. Subtle results. Would not say it changed my skin.' },
    { r: 3, b: 'Reasonable. Not sure if I would repurchase at this price.' },
    { r: 3, b: 'Hard to say if it is this or my whole routine improving. End of the bottle will tell.' },
    { r: 3, b: 'Middle of the road for me. Maybe better suited for someone whose skin needs more help than mine.' },
    { r: 3, b: 'Okay. Not bad. Not blown away.' },
    { r: 3, b: 'I expected a bit more given the hype but it is a decent addition to a routine.' },
    { r: 3, b: 'Slow to show anything. Six weeks in, results are mild.' },
    { r: 3, b: 'Average. The price-to-results ratio just is not there for me.' },
    { r: 3, b: 'Lukewarm. Probably better in a routine than I gave it.' },
    { r: 3, b: 'Working slowly. I think my issue might be deeper than skincare can solve.' },
    { r: 3, b: 'Not bad, not great. Would I buy it again? Maybe not.' },
    { r: 3, b: 'Solid for what it is, but I am not sure it is worth the spot in my routine.' },
    { r: 3, b: 'Subtle. Maybe too subtle. I will see this through the bottle.' },
    { r: 3, b: 'Decent but I think my expectations were calibrated wrong.' },
    { r: 3, b: 'It is fine. Skincare is so personal, this might be brilliant for someone else.' }
  ];

  /* Pre-split by rating for fast lookup */
  var REVIEWS_BY_RATING = { 5: [], 4: [], 3: [] };
  for (var ri = 0; ri < REVIEW_TEMPLATES.length; ri++) {
    var rt = REVIEW_TEMPLATES[ri];
    if (REVIEWS_BY_RATING[rt.r]) REVIEWS_BY_RATING[rt.r].push(rt.b);
  }

  /* Specific phrasings tied to common concerns */

  var SKIN_TYPE_MENTIONS = {
    'fine-lines': ['mature', 'combination', 'dry', 'normal-to-dry'],
    'firmness': ['mature', 'combination', 'dry', 'normal-to-dry'],
    'dark-spots': ['combination', 'normal-to-oily', 'dry', 'normal-to-dry'],
    'dullness': ['combination', 'dry', 'mature', 'dehydrated'],
    'hydration': ['dry', 'dehydrated', 'combination', 'sensitive'],
    'dryness': ['dry', 'dehydrated', 'sensitive', 'mature'],
    'acne': ['oily', 'acne-prone', 'combination', 'normal-to-oily'],
    'texture': ['combination', 'normal-to-oily', 'oily', 'normal-to-dry'],
    'sensitivity': ['sensitive', 'reactive', 'dry', 'dehydrated'],
    'sun-protection': ['sensitive', 'combination', 'oily', 'normal']
  };

  /* ---------- Review generation ---------- */

  function pickSkinType(concerns, rng) {
    for (var i = 0; i < concerns.length; i++) {
      var pool = SKIN_TYPE_MENTIONS[concerns[i]];
      if (pool && pool.length) return pick(pool, rng);
    }
    return pick(SKIN_TYPES, rng);
  }

  function pickResultPhrase(concerns, rng) {
    for (var i = 0; i < concerns.length; i++) {
      var pool = RESULT_POOLS_BY_CONCERN[concerns[i]];
      if (pool && pool.length) return pick(pool, rng);
    }
    return pick(RESULT_PHRASES_GENERAL, rng);
  }

  function distributeRatings(target, count, rng) {
    /* Generate ratings (3-5 only — no truly negative reviews) whose
       average is roughly target. The template pool has no 1 or 2
       star content, so distribution stays in the positive/neutral
       range. */
    var ratings = [];
    var t = parseFloat(target) || 4.5;
    var pct5, pct4, pct3;
    if (t >= 4.8)      { pct5 = 0.82; pct4 = 0.16; pct3 = 0.02; }
    else if (t >= 4.7) { pct5 = 0.75; pct4 = 0.22; pct3 = 0.03; }
    else if (t >= 4.5) { pct5 = 0.62; pct4 = 0.32; pct3 = 0.06; }
    else if (t >= 4.3) { pct5 = 0.50; pct4 = 0.40; pct3 = 0.10; }
    else               { pct5 = 0.42; pct4 = 0.42; pct3 = 0.16; }

    for (var i = 0; i < count; i++) {
      var r = rng();
      if (r < pct5) ratings.push(5);
      else if (r < pct5 + pct4) ratings.push(4);
      else ratings.push(3);
    }
    /* Shuffle so highest-rated aren't all first */
    for (var j = ratings.length - 1; j > 0; j--) {
      var k = Math.floor(rng() * (j + 1));
      var tmp = ratings[j]; ratings[j] = ratings[k]; ratings[k] = tmp;
    }
    return ratings;
  }

  function generateDate(rng) {
    /* Last 18 months, more recent dates more common */
    var daysAgo = Math.floor(Math.pow(rng(), 1.5) * 540);
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
  }

  function formatDate(d) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : str; }

  function fillPlaceholders(str, ctx, rng) {
    var skinType = ctx.skin_type || pickSkinType(ctx.concerns, rng);
    var timeframe = pick(TIMEFRAMES, rng);
    var resultPhrase = pickResultPhrase(ctx.concerns, rng);

    return str
      .replace(/\{short\}/g, ctx.product.short)
      .replace(/\{format\}/g, ctx.product.format)
      .replace(/\{ingredient\}/g, ctx.product.ingredient)
      .replace(/\{feature\}/g, ctx.product.feature)
      .replace(/\{feature_cap\}/g, cap(ctx.product.feature))
      .replace(/\{skin_type\}/g, skinType)
      .replace(/\{timeframe\}/g, timeframe)
      .replace(/\{timeframe_cap\}/g, cap(timeframe))
      .replace(/\{result\}/g, resultPhrase)
      .replace(/\{result_cap\}/g, cap(resultPhrase));
  }

  function buildBody(rating, ctx, rng) {
    var pool = REVIEWS_BY_RATING[rating] || REVIEWS_BY_RATING[5];
    var template = pick(pool, rng);
    return fillPlaceholders(template, ctx, rng);
  }

  function generateReviews(opts) {
    var handle = opts.handle || 'unknown';
    var count = opts.count || 50;
    var targetRating = parseFloat(opts.rating) || 4.5;

    var seed = hashString(handle);
    var rng = mulberry32(seed);
    var reviews = [];

    /* Prefer hand-written reviews from the content file when available.
       Each entry already has its own rating and body; we just decorate
       with a name, date, and verified-buyer flag. */
    var handwritten = (typeof window !== 'undefined' && window.LUX_PRODUCT_REVIEWS)
      ? window.LUX_PRODUCT_REVIEWS[handle]
      : null;

    if (handwritten && handwritten.length) {
      for (var i = 0; i < handwritten.length; i++) {
        var entry = handwritten[i];
        var name = pick(FIRST_NAMES, rng) + ' ' + pick(LAST_INITIALS, rng);
        var verified = rng() < 0.82;
        var date = generateDate(rng);
        reviews.push({
          id: i,
          name: name,
          rating: entry.r,
          date: date,
          dateFormatted: formatDate(date),
          verified: verified,
          body: entry.b
        });
      }
      return reviews;
    }

    /* Fallback: template generation for products without hand-written
       content. Kept for graceful degradation. */
    var concerns = (opts.concerns || '').split(/\s+/).filter(Boolean);
    var brand = opts.brand || '';
    var product = PRODUCT_CONTEXT[handle] || FALLBACK_CONTEXT;
    var ratings = distributeRatings(targetRating, count, rng);
    var ctx = { concerns: concerns, brand: brand, product: product };
    for (var j = 0; j < count; j++) {
      var nm = pick(FIRST_NAMES, rng) + ' ' + pick(LAST_INITIALS, rng);
      var ver = rng() < 0.82;
      var dt = generateDate(rng);
      var body = buildBody(ratings[j], ctx, rng);
      reviews.push({
        id: j,
        name: nm,
        rating: ratings[j],
        date: dt,
        dateFormatted: formatDate(dt),
        verified: ver,
        body: body
      });
    }
    return reviews;
  }

  /* ---------- Render ---------- */

  function renderStars(rating) {
    var filled = Math.round(rating);
    var html = '';
    for (var i = 0; i < 5; i++) {
      html += '<span class="lux-review__star' + (i < filled ? ' lux-review__star--filled' : '') + '" aria-hidden="true">★</span>';
    }
    return html;
  }

  function calcBreakdown(reviews) {
    var counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(function (r) { counts[r.rating]++; });
    return counts;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderReview(r) {
    return '' +
      '<article class="lux-review">' +
        '<header class="lux-review__head">' +
          '<div class="lux-review__stars" aria-label="' + r.rating + ' out of 5 stars">' + renderStars(r.rating) + '</div>' +
          '<time class="lux-review__date" datetime="' + r.date.toISOString() + '">' + r.dateFormatted + '</time>' +
        '</header>' +
        '<p class="lux-review__body">' + escapeHtml(r.body) + '</p>' +
        '<footer class="lux-review__foot">' +
          '<span class="lux-review__author">' + escapeHtml(r.name) + '</span>' +
          (r.verified ? '<span class="lux-review__verified">Verified Buyer</span>' : '') +
        '</footer>' +
      '</article>';
  }

  function renderBreakdown(breakdown, total) {
    var rows = [];
    for (var s = 5; s >= 1; s--) {
      var c = breakdown[s] || 0;
      var pct = total > 0 ? Math.round((c / total) * 100) : 0;
      rows.push('' +
        '<div class="lux-breakdown__row">' +
          '<span class="lux-breakdown__label">' + s + ' stars</span>' +
          '<div class="lux-breakdown__bar"><span class="lux-breakdown__fill" style="width:' + pct + '%"></span></div>' +
          '<span class="lux-breakdown__count">' + c + '</span>' +
        '</div>');
    }
    return rows.join('');
  }

  /* ---------- Init ---------- */

  function init() {
    var root = document.querySelector('[data-product-reviews]');
    if (!root) return;

    var handle = root.dataset.handle || '';
    var rating = root.dataset.rating || '4.5';
    var totalCount = parseInt(root.dataset.count || '0', 10);
    var concerns = root.dataset.concerns || '';
    var brand = root.dataset.brand || '';

    /* Generate the FULL set — review count matches the aggregate.
       Pagination handles render performance. Hard cap at 1000 to
       keep memory predictable in case an aggregate is ever set
       impossibly high. */
    var generateCount = Math.min(totalCount || 50, 1000);
    var reviews = generateReviews({
      handle: handle,
      count: generateCount,
      rating: rating,
      concerns: concerns,
      brand: brand
    });

    var breakdown = calcBreakdown(reviews);

    /* Render aggregate header */
    var aggregateEl = root.querySelector('[data-reviews-aggregate]');
    if (aggregateEl) {
      aggregateEl.innerHTML = '' +
        '<div class="lux-reviews__rating">' +
          '<div class="lux-reviews__rating-number">' + rating + '</div>' +
          '<div class="lux-reviews__rating-meta">' +
            '<div class="lux-reviews__rating-stars" aria-hidden="true">' + renderStars(parseFloat(rating)) + '</div>' +
            '<div class="lux-reviews__rating-count">Based on ' + totalCount + ' reviews</div>' +
          '</div>' +
        '</div>' +
        '<div class="lux-breakdown">' + renderBreakdown(breakdown, reviews.length) + '</div>';
    }

    /* Render review list with pagination */
    var listEl = root.querySelector('[data-reviews-list]');
    var loadMoreBtn = root.querySelector('[data-reviews-load-more]');
    var sortEl = root.querySelector('[data-reviews-sort]');
    var pageSize = 20;
    var currentlyShown = pageSize;
    var currentSort = 'recent';

    function getSorted() {
      var copy = reviews.slice();
      if (currentSort === 'recent') {
        copy.sort(function (a, b) { return b.date - a.date; });
      } else if (currentSort === 'highest') {
        copy.sort(function (a, b) { return b.rating - a.rating || b.date - a.date; });
      } else if (currentSort === 'lowest') {
        copy.sort(function (a, b) { return a.rating - b.rating || b.date - a.date; });
      }
      return copy;
    }

    function renderList() {
      var sorted = getSorted();
      var slice = sorted.slice(0, currentlyShown);
      listEl.innerHTML = slice.map(renderReview).join('');
      if (loadMoreBtn) {
        if (currentlyShown >= sorted.length) {
          loadMoreBtn.style.display = 'none';
        } else {
          loadMoreBtn.style.display = '';
          loadMoreBtn.textContent = 'Show More Reviews (' + (sorted.length - currentlyShown) + ' remaining)';
        }
      }
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        currentlyShown += pageSize;
        renderList();
      });
    }
    if (sortEl) {
      sortEl.addEventListener('change', function (e) {
        currentSort = e.target.value;
        currentlyShown = pageSize;
        renderList();
      });
    }

    renderList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

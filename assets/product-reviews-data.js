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

  /* Openers, middles, and closers reference {format}, {ingredient},
     {feature}, and {short} placeholders. These get filled with the
     product-specific values from PRODUCT_CONTEXT at render time. */

  var OPENERS_5 = [
    '{short} is a holy grail.',
    'Worth every dollar for {feature}.',
    'I cannot live without {short} anymore.',
    'Best {format} I have bought in years.',
    '{short} genuinely changed my routine.',
    'Five stars for {feature} alone.',
    '{short} is the real deal.',
    '{short} is my forever {format}.',
    'I keep coming back to {short}.',
    '{short} is a permanent fixture now.',
    'Absolutely worth the splurge on {short}.',
    'I tell everyone about {short}.',
    'My esthetician was right about {short}.',
    'Could not recommend {short} more highly.',
    'I am obsessed with {short}.',
    '{feature} sold me from day one.',
    'The hype on {short} is fully earned.'
  ];

  var OPENERS_4 = [
    'Really impressed with {short}.',
    '{short} is a solid {format}.',
    'Strong results from {short}, with one caveat.',
    'Mostly great experience with {short}.',
    '{short} is above expectations.',
    '{short} is a good buy.',
    'Happy I picked up {short}.',
    'Glad I tried {short}.',
    'Quality {format} at this price point.',
    'No complaints worth dropping a star for {short}.'
  ];

  var OPENERS_3 = [
    '{short} is decent but not life changing.',
    '{short} is fine.',
    'I expected a little more from {short}.',
    'Mixed feelings on {short}.',
    '{short} works, but slowly.',
    'Okay {format}.',
    'The jury is still out on {short}.',
    '{short} is not bad, not amazing.'
  ];

  var OPENERS_2 = [
    'Wanted to love {short}.',
    '{short} did not work for my skin.',
    'Underwhelmed by {short}.',
    'I will not be repurchasing {short}.'
  ];

  var MIDDLES_POSITIVE = [
    'I have {skin_type} skin and {short} works beautifully.',
    'My esthetician recommended {short} and now I see why.',
    'I was skeptical at the price but {short} earned its place in my routine.',
    '{short} layers under my SPF without pilling.',
    'I tried cheaper alternatives for years and there is no comparison to {short}.',
    'My dermatologist actually told me to switch to {short}.',
    'The texture of {short} is luxurious and absorbs fast.',
    'I went through my first bottle of {short} quickly because I was using it daily.',
    'A little of {short} goes a long way.',
    'The packaging is sleek and the {format} dispenses cleanly.',
    'No fragrance, no irritation from {short}, just results.',
    'I bought a second bottle within a month.',
    'My partner started using mine, so now we both have {short} in rotation.',
    'My skin tolerates active ingredients better when {short} is part of my routine.',
    'I noticed the difference within the first week of using {short}.',
    'It fits seamlessly into my morning routine.',
    'I save {short} for the night and wake up to softer skin.',
    'What sold me was {feature}.',
    'The {ingredient} in {short} is no joke.',
    'I love that {short} delivers without being precious about it.',
    'I came in skeptical of {feature} but the results changed my mind.',
    '{short} pairs perfectly with my other actives.'
  ];

  var MIDDLES_BALANCED = [
    'I have {skin_type} skin and {short} works most of the time.',
    'The texture of {short} is nice but the scent took getting used to.',
    'Results from {short} are subtle but consistent.',
    '{short} is more of a slow burn than an instant fix.',
    'I think I expected dramatic overnight changes which is not realistic.',
    '{short} does what it says, just slower than I hoped.',
    'I will probably finish the bottle of {short} and reassess.',
    'Not life changing but not regret-worthy either.',
    '{feature} is real but the results plateau after a while.'
  ];

  var MIDDLES_NEGATIVE = [
    '{short} broke me out within a week.',
    'My skin felt tight every time I used {short}.',
    'I did not see any improvement in two months with {short}.',
    'The texture of {short} was sticky and never absorbed properly.',
    '{short} pilled under everything I layered on top.',
    'Maybe my skin type was just wrong for {short}.'
  ];

  var CLOSERS_POSITIVE = [
    'Already ordered another bottle of {short}.',
    'Will absolutely repurchase {short}.',
    'Worth every cent.',
    'I am a {short} customer for life.',
    'Five stars without hesitation.',
    'Recommending {short} to everyone in my life.',
    'My skin is grateful for {short}.',
    'No notes on {short}.',
    '{short} is a keeper.',
    'I should have started using {short} years ago.',
    'Truly a worthy splurge.',
    'Buying {short} on autoship.',
    'Worth the wait between bottles.',
    '{short} is my new daily essential.'
  ];

  var CLOSERS_NEUTRAL = [
    'Will see how the second bottle of {short} goes.',
    'Worth trying {short} if you are curious.',
    'Decent if you are easing into {format} use.',
    'I will reassess in a month.',
    'Not my holy grail but not bad.'
  ];

  var CLOSERS_NEGATIVE = [
    'Returning what is left of {short}.',
    'Back to my old favorite.',
    'Just not for me.',
    'I might try a different {format} next.'
  ];

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
    /* Generate a count of ratings (1-5) whose average is roughly target. */
    var ratings = [];
    var t = parseFloat(target) || 4.5;
    /* Distribution: heavily weight 4 and 5 based on target */
    var pct5, pct4, pct3, pct2, pct1;
    if (t >= 4.7)      { pct5 = 0.72; pct4 = 0.20; pct3 = 0.05; pct2 = 0.02; pct1 = 0.01; }
    else if (t >= 4.5) { pct5 = 0.60; pct4 = 0.28; pct3 = 0.07; pct2 = 0.03; pct1 = 0.02; }
    else if (t >= 4.3) { pct5 = 0.50; pct4 = 0.32; pct3 = 0.10; pct2 = 0.05; pct1 = 0.03; }
    else               { pct5 = 0.40; pct4 = 0.35; pct3 = 0.15; pct2 = 0.06; pct1 = 0.04; }

    for (var i = 0; i < count; i++) {
      var r = rng();
      if (r < pct5) ratings.push(5);
      else if (r < pct5 + pct4) ratings.push(4);
      else if (r < pct5 + pct4 + pct3) ratings.push(3);
      else if (r < pct5 + pct4 + pct3 + pct2) ratings.push(2);
      else ratings.push(1);
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

  function fillPlaceholders(str, ctx) {
    return str
      .replace(/\{short\}/g, ctx.product.short)
      .replace(/\{format\}/g, ctx.product.format)
      .replace(/\{ingredient\}/g, ctx.product.ingredient)
      .replace(/\{feature\}/g, ctx.product.feature)
      .replace(/\{skin_type\}/g, ctx.skin_type || 'normal');
  }

  function buildBody(rating, ctx, rng) {
    var opener, middle, closer;
    if (rating === 5) opener = pick(OPENERS_5, rng);
    else if (rating === 4) opener = pick(OPENERS_4, rng);
    else if (rating === 3) opener = pick(OPENERS_3, rng);
    else opener = pick(OPENERS_2, rng);

    var skinType = pickSkinType(ctx.concerns, rng);
    var resultPhrase = pickResultPhrase(ctx.concerns, rng);
    var timeframe = pick(TIMEFRAMES, rng);

    if (rating >= 4) {
      middle = pick(MIDDLES_POSITIVE, rng);
      closer = pick(CLOSERS_POSITIVE, rng);
    } else if (rating === 3) {
      middle = pick(MIDDLES_BALANCED, rng);
      closer = pick(CLOSERS_NEUTRAL, rng);
    } else {
      middle = pick(MIDDLES_NEGATIVE, rng);
      closer = pick(CLOSERS_NEGATIVE, rng);
    }

    /* Fill product specifics in opener / middle / closer */
    var fillCtx = { product: ctx.product, skin_type: skinType };
    opener = fillPlaceholders(opener, fillCtx);
    middle = fillPlaceholders(middle, fillCtx);
    closer = fillPlaceholders(closer, fillCtx);

    /* Results-and-timeframe sentence for positive ratings */
    var resultSentence = '';
    if (rating >= 4 && rng() < 0.7) {
      resultSentence = ' ' + timeframe.charAt(0).toUpperCase() + timeframe.slice(1) +
                       ', ' + resultPhrase + '.';
    } else if (rating === 3 && rng() < 0.4) {
      resultSentence = ' ' + timeframe.charAt(0).toUpperCase() + timeframe.slice(1) +
                       ', ' + resultPhrase + '.';
    }

    /* Occasional ingredient call-out for hero-tier reviews */
    var ingredientMention = '';
    if (rating === 5 && rng() < 0.22) {
      ingredientMention = ' The ' + ctx.product.ingredient + ' really is the difference.';
    }

    /* Occasional brand mention */
    var brandMention = '';
    if (rating === 5 && rng() < 0.18 && ctx.brand) {
      brandMention = ' ' + ctx.brand + ' nailed this one.';
    }

    return opener + ' ' + middle + resultSentence + ingredientMention + brandMention + ' ' + closer;
  }

  function generateReviews(opts) {
    var handle = opts.handle || 'unknown';
    var count = opts.count || 50;
    var targetRating = parseFloat(opts.rating) || 4.5;
    var concerns = (opts.concerns || '').split(/\s+/).filter(Boolean);
    var brand = opts.brand || '';
    var product = PRODUCT_CONTEXT[handle] || FALLBACK_CONTEXT;

    var seed = hashString(handle);
    var rng = mulberry32(seed);

    var ratings = distributeRatings(targetRating, count, rng);
    var ctx = { concerns: concerns, brand: brand, product: product };

    var reviews = [];
    for (var i = 0; i < count; i++) {
      var name = pick(FIRST_NAMES, rng) + ' ' + pick(LAST_INITIALS, rng);
      var verified = rng() < 0.82;
      var date = generateDate(rng);
      var body = buildBody(ratings[i], ctx, rng);
      reviews.push({
        id: i,
        name: name,
        rating: ratings[i],
        date: date,
        dateFormatted: formatDate(date),
        verified: verified,
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

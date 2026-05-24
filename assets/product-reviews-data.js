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

  var OPENERS_5 = [
    'Holy grail.',
    'Worth every dollar.',
    'I cannot live without this anymore.',
    'Best skincare purchase I have made in years.',
    'Genuinely changed my routine.',
    'Five stars and then some.',
    'This is the real deal.',
    'My new forever product.',
    'I keep coming back to this one.',
    'A staple in my cabinet now.',
    'Absolutely worth the splurge.',
    'I tell everyone about this.',
    'My esthetician was right about this.',
    'Could not recommend more highly.',
    'I am officially obsessed.'
  ];

  var OPENERS_4 = [
    'Really impressed overall.',
    'Solid product.',
    'Strong results, with one caveat.',
    'Mostly great.',
    'Above expectations.',
    'Good buy.',
    'Happy with this purchase.',
    'Glad I tried it.',
    'Quality product at this price point.',
    'No complaints worth dropping a star for.'
  ];

  var OPENERS_3 = [
    'Decent but not life changing.',
    'It is fine.',
    'I expected a little more.',
    'Mixed feelings.',
    'Works, but slowly.',
    'Okay product.',
    'Jury is still out.',
    'Not bad, not amazing.'
  ];

  var OPENERS_2 = [
    'Wanted to love this.',
    'Did not work for my skin.',
    'Underwhelmed.',
    'Will not be repurchasing.'
  ];

  var MIDDLES_POSITIVE = [
    'I have {skin_type} skin and it works beautifully.',
    'My esthetician recommended it and now I see why.',
    'I was skeptical at the price but it earned the spot in my routine.',
    'It layers under my SPF without pilling.',
    'I tried the cheaper alternative for years and there is no comparison.',
    'My dermatologist actually told me to switch to this.',
    'The texture is luxurious and absorbs fast.',
    'I went through my first bottle quickly because I was using it daily.',
    'A little goes a long way.',
    'Packaging is sleek and the pump dispenses cleanly.',
    'No fragrance, no irritation, just results.',
    'I bought a second bottle within a month.',
    'My partner started using mine, so now we both have one.',
    'My skin tolerates active ingredients better when I use this.',
    'I noticed the difference within the first week.',
    'It fits seamlessly into my morning routine.',
    'I save it for the night and wake up to softer skin.'
  ];

  var MIDDLES_BALANCED = [
    'I have {skin_type} skin and it works most of the time.',
    'The texture is nice but the scent took some getting used to.',
    'Results are subtle but consistent.',
    'It is more of a slow burn than an instant fix.',
    'I think I expected dramatic overnight changes which is not realistic.',
    'It does what it says, just slower than I hoped.',
    'I will probably finish the bottle and reassess.',
    'Not life changing but not regret-worthy either.'
  ];

  var MIDDLES_NEGATIVE = [
    'It broke me out within a week.',
    'My skin felt tight every time I used it.',
    'I did not see any improvement in two months.',
    'The texture was sticky and never absorbed properly.',
    'It pilled under everything I layered on top.',
    'Maybe my skin type was just wrong for this one.'
  ];

  var CLOSERS_POSITIVE = [
    'Already ordered another.',
    'Will absolutely repurchase.',
    'Worth every cent.',
    'I am a customer for life.',
    'Five stars without hesitation.',
    'Recommending to everyone in my life.',
    'My skin is grateful.',
    'No notes.',
    'A keeper.',
    'I should have started using this years ago.',
    'Truly a worthy splurge.',
    'Buying this on autoship.',
    'Worth the wait between bottles.',
    'My new daily essential.'
  ];

  var CLOSERS_NEUTRAL = [
    'Will see how the second bottle goes.',
    'Worth trying if you are curious.',
    'Decent if you are easing into active skincare.',
    'I will reassess in a month.',
    'Not my holy grail but not bad.'
  ];

  var CLOSERS_NEGATIVE = [
    'Returning what is left.',
    'Back to my old favorite.',
    'Just not for me.',
    'I might try a different brand next.'
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
    middle = middle.replace('{skin_type}', skinType);

    /* Many reviews include a results-and-timeframe sentence for positive ratings */
    var resultSentence = '';
    if (rating >= 4 && rng() < 0.7) {
      resultSentence = ' ' + timeframe.charAt(0).toUpperCase() + timeframe.slice(1) +
                       ', ' + resultPhrase + '.';
    } else if (rating === 3 && rng() < 0.4) {
      resultSentence = ' ' + timeframe.charAt(0).toUpperCase() + timeframe.slice(1) +
                       ', ' + resultPhrase + '.';
    }

    /* Random brand mention for hero-tier reviews */
    var brandMention = '';
    if (rating === 5 && rng() < 0.3 && ctx.brand) {
      brandMention = ' ' + ctx.brand + ' nailed this one.';
    }

    return opener + ' ' + middle + resultSentence + brandMention + ' ' + closer;
  }

  function generateReviews(opts) {
    var handle = opts.handle || 'unknown';
    var count = opts.count || 50;
    var targetRating = parseFloat(opts.rating) || 4.5;
    var concerns = (opts.concerns || '').split(/\s+/).filter(Boolean);
    var brand = opts.brand || '';

    var seed = hashString(handle);
    var rng = mulberry32(seed);

    var ratings = distributeRatings(targetRating, count, rng);
    var ctx = { concerns: concerns, brand: brand };

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

    /* Generate displayCount reviews (the count attribute shows the
       full claimed total like 724, but we only render a sample). */
    var displayCount = parseInt(root.dataset.displayCount || '50', 10);
    var reviews = generateReviews({
      handle: handle,
      count: displayCount,
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
    var pageSize = 10;
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

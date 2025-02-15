import '../scss/reset.scss';
import '../scss/base.scss';
import '../scss/globals.scss';
import '../scss/products.scss';
import '../scss/cart.scss';

import { preloadImages } from './utils';
import Products from './products';

import Slider from './slider';

import Draggable from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'



gsap.registerPlugin(Draggable, InertiaPlugin);

window.addEventListener('load', async () => {
 
  new Slider();
  
  const fetchCollectionsAndProducts = async () => {
    const endpoint = `https://ri1ysg-yt.myshopify.com/api/2023-07/graphql.json`;
    const storefrontAccessToken = "5a1b261e3850235223c65a48cb1b3be3"; // Replace with your token
  
    const query = `
{
  collections(first: 5) {
    edges {
      node {
        id
        title
        products(first: 10) {
          edges {
            node {
              id
              title
              priceRange {
                minVariantPrice {
                  amount
                }
              }
              images(first: 1) {
                edges {
                  node {
                    src
                  }
                }
              }
              availableForSale
            }
          }
        }
        metafield(namespace: "custom", key: "banner") {
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
}
`;

  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({ query }),
      });
  
      const data = await response.json();
      if (response.ok) {
        populateCollections(data.data.collections.edges);
        new Products();
      } else {
        console.error("Error fetching data:", data.errors);
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
    }
  };
  
  // Function to populate collections and products
  const populateCollections = (collections) => {
    const contentWrapper = document.querySelector('.content')
  
    collections.forEach((collection) => {
      const { title, products, metafield } = collection.node;
  
      // Extract banner image URL
    const bannerImageSrc = metafield?.reference?.image?.url || "./images/cover.png";
        console.log(bannerImageSrc)
  
      // Add a title for the collection, wrapped in <div class="heading">
      const heading = document.createElement("div");
      heading.classList.add("heading");
  
      const collectionTitle = document.createElement("h2");
      collectionTitle.textContent = title;
      heading.appendChild(collectionTitle);
      contentWrapper.appendChild(heading);
  
      // Create a wrapper div for the product list
      const productsWrapper = document.createElement("div");
      productsWrapper.classList.add("products");

      
      // Create a product list for the collection
      const productList = document.createElement("ul");
      productList.classList.add("products-list");
      productList.classList.add("products__list");
  
      products.edges.forEach((product) => {
        const { id, title, priceRange, images, availableForSale } = product.node;
  
        // Create list item for each product
        const productItem = document.createElement("li");
        productItem.classList.add("products__item");
        productItem.setAttribute("data-id", id);
        productItem.setAttribute("data-price", priceRange.minVariantPrice.amount);
        productItem.setAttribute("data-name", title);
        productItem.setAttribute("data-cover", images.edges[0]?.node.src);
  
        // Create product image section
        const productImages = document.createElement("div");
        productImages.classList.add("products__images");
        const mainImage = document.createElement("img");
        mainImage.classList.add("products__main-image");
        mainImage.setAttribute("src", images.edges[0]?.node.src || "./images/default.jpg");
        mainImage.setAttribute("alt", title);
  
        const gallery = document.createElement("div");
        gallery.classList.add("products__gallery");
        const galleryImage = document.createElement("img");
        galleryImage.classList.add("products__gallery-item");
        galleryImage.setAttribute("src", images.edges[0]?.node.src || "./images/default.jpg");
        galleryImage.setAttribute("alt", `${title} gallery`);
  
        gallery.appendChild(galleryImage);
        productImages.appendChild(mainImage);
        productImages.appendChild(gallery);
  
        // Create bottom navigation with add to cart button and stock status
        const navBottom = document.createElement("nav");
        navBottom.classList.add("nav-bottom");
  
        const soldOutLabel = document.createElement("span");
        soldOutLabel.classList.add("available");
        soldOutLabel.textContent = availableForSale ? "" : "Sold Out";
  
        const addToCartButton = document.createElement("button");
        addToCartButton.type = "button";
        addToCartButton.classList.add("products__cta", "button");
        addToCartButton.textContent = "Add to cart";
  
        navBottom.appendChild(soldOutLabel);
        navBottom.appendChild(addToCartButton);
  
        // Append all elements to the product item
        productItem.appendChild(productImages);
        productItem.appendChild(navBottom);
  
        // Add the product item to the product list
        productList.appendChild(productItem);
        
      });
  
      // Wrap the product list in the .products div
      productsWrapper.appendChild(productList);
  
      // Append the .products div to the collection container
      contentWrapper.appendChild(productsWrapper);
  
    const customSection = document.createElement("div");
    customSection.classList.add("custom-section");
    contentWrapper.appendChild(productsWrapper);

    // Create and append the .banner-marquee div **after each** .products div
    const bannerMarquee = document.createElement("div");
    bannerMarquee.classList.add("banner-marquee");
    bannerMarquee.innerHTML = `
        <div class="text-marquee">
            <div class="text-single">
                <span class="text js-text">vingtdeuxxxii</span>
                <span class="text js-text">عشريني وعشرون</span>
                <span class="text js-text">vingtdeuxxxii</span>
                <span class="text js-text">iskay chunka</span>
                <span class="text js-text">кокло кок</span>
                <span class="text js-text">스물두시.2020年</span>
            </div>
        </div>
        <div class="imgWrapper">
            <img src="${bannerImageSrc}" alt="">
        </div>
        <div class="text-marquee">
            <div class="text-single">
                <span class="text js-text">vingtdeuxxxii</span>
                <span class="text js-text">عشريني وعشرون</span>
                <span class="text js-text">vingtdeuxxxii</span>
                <span class="text js-text">iskay chunka</span>
                <span class="text js-text">кокло кок</span>
                <span class="text js-text">스물두시.2020年</span>
            </div>
        </div>
    `;

    // Append the banner marquee **after** each .products div
    contentWrapper.appendChild(bannerMarquee);

    let loops = gsap.utils.toArray('.text-single').map((line, i) => {
      const links = line.querySelectorAll(".js-text");
      return horizontalLoop(links, {
        repeat: -1, 
        speed: 1.5 + i * 0.5,
        reversed: false,
        paddingRight: parseFloat(gsap.getProperty(links[0], "marginRight", "px"))
      });
    });
    });
  };
  
  // Call the function to fetch and display collections and products
  fetchCollectionsAndProducts();
  
  // 
  

  const images = [...document.querySelectorAll('img')];

  await preloadImages(images).then(() => {
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 1200 )
  })
  
  

  let currentScroll = 0;
  let scrollDirection = 1;

  window.addEventListener("scroll", () => {
  let direction = (window.pageYOffset > currentScroll) ? 1 : -1;
  if (direction !== scrollDirection) {
    console.log("change", direction);
    loops.forEach(tl => {
      gsap.to(tl, {timeScale: direction, overwrite: true});
    });
    scrollDirection = direction;
  }
  currentScroll = window.pageYOffset;
  });


  /*
  This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.

  Features:
  - Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
  - When each item animates to the left or right enough, it will loop back to the other side
  - Optionally pass in a config object with values like "speed" (default: 1, which travels at roughly 100 pixels per second), paused (boolean),  repeat, reversed, and paddingRight.
  - The returned timeline will have the following methods added to it:
  - next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
  - previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
  - toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
  - current() - returns the current index (if an animation is in-progress, it reflects the final index)
  - times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
  */
  function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      xPercents = [],
      curIndex = 0,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
      totalWidth, curX, distanceToStart, distanceToLoop, item, i;
    gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
      xPercent: (i, el) => {
        let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
        xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
        return xPercents[i];
      }
    });
    gsap.set(items, {x: 0});
    totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0);
    for (i = 0; i < length; i++) {
      item = items[i];
      curX = xPercents[i] / 100 * widths[i];
      distanceToStart = item.offsetLeft + curX - startX;
      distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
      tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
      .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
      .add("label" + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
        vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      vars.overwrite = true;
      return tl.tweenTo(time, vars);
    }
    tl.next = vars => toIndex(curIndex+1, vars);
    tl.previous = vars => toIndex(curIndex-1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.times = times;
  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }
    return tl;
  }


  // navigation

  const navTrigger = document.querySelector('.navTrigger');
  const navContainer = document.querySelector('.navigation');

  navTrigger.addEventListener('click', () => {
    navContainer.classList.toggle('is-open')
  })

  Draggable.create(navContainer, {
    bounds: "main",
    inertia: true,
    throwProps: true, // Enables momentum-based movement
    edgeResistance: 0.8, // Controls resistance when hitting bounds
    // onDragStart: function () {
    //   gsap.to(this.target, { scale: 1.05, duration: 0.2, ease: "power2.out" }); // Small scale-up effect
    // },
    // onDragEnd: function () {
    //   gsap.to(this.target, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" }); // Smooth return
    // }
  });

  // Gravity
  (this || self || window)
.Two = function(e) {
        var p;
        p = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this;
        var t = Object.prototype.toString
            , B = {
                _indexAmount: 0
                , natural: {
                    slice: Array.prototype.slice
                    , indexOf: Array.prototype.indexOf
                    , keys: Object.keys
                    , bind: Function.prototype.bind
                    , create: Object.create
                }
                , identity: function(e) {
                    return e
                }
                , isArguments: function(e) {
                    return "[object Arguments]" === t.call(e)
                }
                , isFunction: function(e) {
                    return "[object Function]" === t.call(e)
                }
                , isString: function(e) {
                    return "[object String]" === t.call(e)
                }
                , isNumber: function(e) {
                    return "[object Number]" === t.call(e)
                }
                , isDate: function(e) {
                    return "[object Date]" === t.call(e)
                }
                , isRegExp: function(e) {
                    return "[object RegExp]" === t.call(e)
                }
                , isError: function(e) {
                    return "[object Error]" === t.call(e)
                }
                , isFinite: function(e) {
                    return isFinite(e) && !isNaN(parseFloat(e))
                }
                , isNaN: function(e) {
                    return B.isNumber(e) && e !== +e
                }
                , isBoolean: function(e) {
                    return !0 === e || !1 === e || "[object Boolean]" === t.call(e)
                }
                , isNull: function(e) {
                    return null === e
                }
                , isUndefined: function(e) {
                    return void 0 === e
                }
                , isEmpty: function(e) {
                    return null == e || (g && (B.isArray(e) || B.isString(e) || B.isArguments(e)) ? 0 === e.length : 0 === B.keys(e)
                        .length)
                }
                , isElement: function(e) {
                    return !(!e || 1 !== e.nodeType)
                }
                , isArray: Array.isArray || function(e) {
                    return "[object Array]" === t.call(e)
                }
                , isObject: function(e) {
                    var t = typeof e;
                    return "function" === t || "object" === t && !!e
                }
                , toArray: function(e) {
                    return e ? B.isArray(e) ? o.call(e) : g(e) ? B.map(e, B.identity) : B.values(e) : []
                }
                , range: function(e, t, i) {
                    null == t && (t = e || 0, e = 0), i = i || 1;
                    for (var r = Math.max(Math.ceil((t - e) / i), 0), n = Array(r), s = 0; s < r; s++, e += i) n[s] = e;
                    return n
                }
                , indexOf: function(e, t) {
                    if (B.natural.indexOf) return B.natural.indexOf.call(e, t);
                    for (var i = 0; i < e.length; i++)
                        if (e[i] === t) return i;
                    return -1
                }
                , has: function(e, t) {
                    return null != e && hasOwnProperty.call(e, t)
                }
                , bind: function(e, t) {
                    var i = B.natural.bind;
                    if (i && e.bind === i) return i.apply(e, o.call(arguments, 1));
                    var r = o.call(arguments, 2);
                    return function() {
                        e.apply(t, r)
                    }
                }
                , extend: function(e) {
                    for (var t = o.call(arguments, 1), i = 0; i < t.length; i++) {
                        var r = t[i];
                        for (var n in r) e[n] = r[n]
                    }
                    return e
                }
                , defaults: function(e) {
                    for (var t = o.call(arguments, 1), i = 0; i < t.length; i++) {
                        var r = t[i];
                        for (var n in r) void 0 === e[n] && (e[n] = r[n])
                    }
                    return e
                }
                , keys: function(e) {
                    if (!B.isObject(e)) return [];
                    if (B.natural.keys) return B.natural.keys(e);
                    var t = [];
                    for (var i in e) B.has(e, i) && t.push(i);
                    return t
                }
                , values: function(e) {
                    for (var t = B.keys(e), i = [], r = 0; r < t.length; r++) {
                        var n = t[r];
                        i.push(e[n])
                    }
                    return i
                }
                , each: function(e, t, i) {
                    for (var r = i || this, n = !g(e) && B.keys(e), s = (n || e)
                            .length, o = 0; o < s; o++) {
                        var a = n ? n[o] : o;
                        t.call(r, e[a], a, e)
                    }
                    return e
                }
                , map: function(e, t, i) {
                    for (var r = i || this, n = !g(e) && B.keys(e), s = (n || e)
                            .length, o = [], a = 0; a < s; a++) {
                        var l = n ? n[a] : a;
                        o[a] = t.call(r, e[l], l, e)
                    }
                    return o
                }
                , once: function(e) {
                    var t = !1;
                    return function() {
                        return t ? e : (t = !0, e.apply(this, arguments))
                    }
                }
                , after: function(e, t) {
                    return function() {
                        for (; --e < 1;) return t.apply(this, arguments)
                    }
                }
                , uniqueId: function(e) {
                    var t = ++B._indexAmount + "";
                    return e ? e + t : t
                }
            }
            , l = Math.sin
            , c = Math.cos
            , v = (Math.acos, Math.atan2, Math.sqrt)
            , w = (Math.round, Math.abs)
            , h = Math.PI
            , d = h / 2
            , F = Math.pow
            , u = Math.min
            , f = Math.max
            , i = 0
            , o = B.natural.slice
            , s = p.performance && p.performance.now ? p.performance : Date
            , r = Math.pow(2, 53) - 1
            , g = function(e) {
                var t, i = null == (t = e) ? void 0 : t.length;
                return "number" == typeof i && 0 <= i && i <= r
            }
            , a = {
                temp: p.document ? p.document.createElement("div") : {}
                , hasEventListeners: B.isFunction(p.addEventListener)
                , bind: function(e, t, i, r) {
                    return this.hasEventListeners ? e.addEventListener(t, i, !!r) : e.attachEvent("on" + t, i), a
                }
                , unbind: function(e, t, i, r) {
                    return a.hasEventListeners ? e.removeEventListeners(t, i, !!r) : e.detachEvent("on" + t, i), a
                }
                , getRequestAnimationFrame: function() {
                    var e, s = 0
                        , t = ["ms", "moz", "webkit", "o"]
                        , i = p.requestAnimationFrame;
                    if (!i) {
                        for (var r = 0; r < t.length; r++) i = p[t[r] + "RequestAnimationFrame"] || i, e = p[t[r] + "CancelAnimationFrame"] || p[t[r] + "CancelRequestAnimationFrame"] || e;
                        i = i || function(e, t) {
                            var i = (new Date)
                                .getTime()
                                , r = Math.max(0, 16 - (i - s))
                                , n = p.setTimeout(function() {
                                    e(i + r)
                                }, r);
                            return s = i + r, n
                        }
                    }
                    return i.init = B.once(k), i
                }
            }
            , O = p.Two = function(e) {
                var t = B.defaults(e || {}, {
                    fullscreen: !1
                    , width: 640
                    , height: 480
                    , type: O.Types.svg
                    , autostart: !1
                });
                if (B.each(t, function(e, t) {
                        /fullscreen/i.test(t) || /autostart/i.test(t) || (this[t] = e)
                    }, this), B.isElement(t.domElement)) {
                    var i = t.domElement.tagName.toLowerCase();
                    /^(CanvasRenderer-canvas|WebGLRenderer-canvas|SVGRenderer-svg)$/.test(this.type + "-" + i) || (this.type = O.Types[i])
                }
                if (this.renderer = new O[this.type](this), O.Utils.setPlaying.call(this, t.autostart), this.frameCount = 0, t.fullscreen) {
                    var r = B.bind(S, this);
                    B.extend(document.body.style, {
                        overflow: "hidden"
                        , margin: 0
                        , padding: 0
                        , top: 0
                        , left: 0
                        , right: 0
                        , bottom: 0
                        , position: "fixed"
                    }), B.extend(this.renderer.domElement.style, {
                        display: "block"
                        , top: 0
                        , left: 0
                        , right: 0
                        , bottom: 0
                        , position: "fixed"
                    }), a.bind(p, "resize", r), r()
                } else B.isElement(t.domElement) || (this.renderer.setSize(t.width, t.height, this.ratio), this.width = t.width, this.height = t.height);
                this.renderer.bind(O.Events.resize, B.bind(C, this)), this.scene = this.renderer.scene, O.Instances.push(this), t.autostart && A.init()
            };
        B.extend(O, {
            root: p
            , nextFrameID: null
            , Array: p.Float32Array || Array
            , Types: {
                webgl: "WebGLRenderer"
                , svg: "SVGRenderer"
                , canvas: "CanvasRenderer"
            }
            , Version: "v0.7.0-beta.4"
            , PublishDate: "2019-01-29T09:17:29+01:00"
            , Identifier: "two-"
            , Events: {
                play: "play"
                , pause: "pause"
                , update: "update"
                , render: "render"
                , resize: "resize"
                , change: "change"
                , remove: "remove"
                , insert: "insert"
                , order: "order"
                , load: "load"
            }
            , Commands: {
                move: "M"
                , line: "L"
                , curve: "C"
                , arc: "A"
                , close: "Z"
            }
            , Resolution: 12
            , Instances: []
            , noConflict: function() {
                return p.Two = e, O
            }
            , uniqueId: function() {
                var e = i;
                return i++, e
            }
            , Utils: B.extend(B, {
                performance: s
                , defineProperty: function(e) {
                    var t = "_" + e
                        , i = "_flag" + e.charAt(0)
                        .toUpperCase() + e.slice(1);
                    Object.defineProperty(this, e, {
                        enumerable: !0
                        , get: function() {
                            return this[t]
                        }
                        , set: function(e) {
                            this[t] = e, this[i] = !0
                        }
                    })
                }
                , Image: null
                , isHeadless: !1
                , shim: function(e, t) {
                    return O.CanvasRenderer.Utils.shim(e), B.isUndefined(t) || (O.Utils.Image = t), O.Utils.isHeadless = !0, e
                }
                , release: function(e) {
                    if (B.isObject(e)) return B.isFunction(e.unbind) && e.unbind(), e.vertices && (B.isFunction(e.vertices.unbind) && e.vertices.unbind(), B.each(e.vertices, function(e) {
                        B.isFunction(e.unbind) && e.unbind()
                    })), e.children && B.each(e.children, function(e) {
                        O.Utils.release(e)
                    }), e
                }
                , xhr: function(e, t) {
                    var i = new XMLHttpRequest;
                    return i.open("GET", e), i.onreadystatechange = function() {
                        4 === i.readyState && 200 === i.status && t(i.responseText)
                    }, i.send(), i
                }
                , Curve: {
                    CollinearityEpsilon: F(10, -30)
                    , RecursionLimit: 16
                    , CuspLimit: 0
                    , Tolerance: {
                        distance: .25
                        , angle: 0
                        , epsilon: Number.EPSILON
                    }
                    , abscissas: [[.5773502691896257], [0, .7745966692414834], [.33998104358485626, .8611363115940526], [0, .5384693101056831, .906179845938664], [.2386191860831969, .6612093864662645, .932469514203152], [0, .4058451513773972, .7415311855993945, .9491079123427585], [.1834346424956498, .525532409916329, .7966664774136267, .9602898564975363], [0, .3242534234038089, .6133714327005904, .8360311073266358, .9681602395076261], [.14887433898163122, .4333953941292472, .6794095682990244, .8650633666889845, .9739065285171717], [0, .26954315595234496, .5190961292068118, .7301520055740494, .8870625997680953, .978228658146057], [.1252334085114689, .3678314989981802, .5873179542866175, .7699026741943047, .9041172563704749, .9815606342467192], [0, .2304583159551348, .44849275103644687, .6423493394403402, .8015780907333099, .9175983992229779, .9841830547185881], [.10805494870734367, .31911236892788974, .5152486363581541, .6872929048116855, .827201315069765, .9284348836635735, .9862838086968123], [0, .20119409399743451, .3941513470775634, .5709721726085388, .7244177313601701, .8482065834104272, .937273392400706, .9879925180204854], [.09501250983763744, .2816035507792589, .45801677765722737, .6178762444026438, .755404408355003, .8656312023878318, .9445750230732326, .9894009349916499]]
                    , weights: [[1], [.8888888888888888, .5555555555555556], [.6521451548625461, .34785484513745385], [.5688888888888889, .47862867049936647, .23692688505618908], [.46791393457269104, .3607615730481386, .17132449237917036], [.4179591836734694, .3818300505051189, .27970539148927664, .1294849661688697], [.362683783378362, .31370664587788727, .22238103445337448, .10122853629037626], [.3302393550012598, .31234707704000286, .26061069640293544, .1806481606948574, .08127438836157441], [.29552422471475287, .26926671930999635, .21908636251598204, .1494513491505806, .06667134430868814], [.2729250867779006, .26280454451024665, .23319376459199048, .18629021092773426, .1255803694649046, .05566856711617366], [.24914704581340277, .2334925365383548, .20316742672306592, .16007832854334622, .10693932599531843, .04717533638651183], [.2325515532308739, .22628318026289723, .2078160475368885, .17814598076194574, .13887351021978725, .09212149983772845, .04048400476531588], [.2152638534631578, .2051984637212956, .18553839747793782, .15720316715819355, .12151857068790319, .08015808715976021, .03511946033175186], [.2025782419255613, .19843148532711158, .1861610000155622, .16626920581699392, .13957067792615432, .10715922046717194, .07036604748810812, .03075324199611727], [.1894506104550685, .18260341504492358, .16915651939500254, .14959598881657674, .12462897125553388, .09515851168249279, .062253523938647894, .027152459411754096]]
                }
                , devicePixelRatio: p.devicePixelRatio || 1
                , getBackingStoreRatio: function(e) {
                    return e.webkitBackingStorePixelRatio || e.mozBackingStorePixelRatio || e.msBackingStorePixelRatio || e.oBackingStorePixelRatio || e.backingStorePixelRatio || 1
                }
                , getRatio: function(e) {
                    return O.Utils.devicePixelRatio / _(e)
                }
                , setPlaying: function(e) {
                    return this.playing = !!e, this
                }
                , getComputedMatrix: function(e, t) {
                    t = t && t.identity() || new O.Matrix;
                    for (var i = e, r = []; i && i._matrix;) r.push(i._matrix), i = i.parent;
                    r.reverse();
                    for (var n = 0; n < r.length; n++) {
                        var s = r[n].elements;
                        t.multiply(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9])
                    }
                    return t
                }
                , deltaTransformPoint: function(e, t, i) {
                    var r = t * e.a + i * e.c + 0
                        , n = t * e.b + i * e.d + 0;
                    return new O.Vector(r, n)
                }
                , decomposeMatrix: function(e) {
                    var t = O.Utils.deltaTransformPoint(e, 0, 1)
                        , i = O.Utils.deltaTransformPoint(e, 1, 0)
                        , r = 180 / Math.PI * Math.atan2(t.y, t.x) - 90
                        , n = 180 / Math.PI * Math.atan2(i.y, i.x);
                    return {
                        translateX: e.e
                        , translateY: e.f
                        , scaleX: Math.sqrt(e.a * e.a + e.b * e.b)
                        , scaleY: Math.sqrt(e.c * e.c + e.d * e.d)
                        , skewX: r
                        , skewY: n
                        , rotation: r
                    }
                }
                , extractCSSText: function(e, t) {
                    var i, r, n, s;
                    t || (t = {}), i = e.split(";");
                    for (var o = 0; o < i.length; o++) n = (r = i[o].split(":"))[0], s = r[1], B.isUndefined(n) || B.isUndefined(s) || (t[n] = s.replace(/\s/, ""));
                    return t
                }
                , getSvgStyles: function(e) {
                    for (var t = {}, i = 0; i < e.style.length; i++) {
                        var r = e.style[i];
                        t[r] = e.style[r]
                    }
                    return t
                }
                , applySvgViewBox: function(e, t) {
                    var i = t.split(/\s/)
                        , r = parseFloat(i[0])
                        , n = parseFloat(i[1])
                        , s = parseFloat(i[2])
                        , o = parseFloat(i[3])
                        , a = Math.min(this.width / s, this.height / o);
                    return e.translation.x -= r * a, e.translation.y -= n * a, e.scale = a, e
                }
                , applySvgAttributes: function(e, t, i) {
                    var r, n, s, o, a = {}
                        , l = {}
                        , c = {};
                    if (p.getComputedStyle) {
                        var h = p.getComputedStyle(e);
                        for (r = h.length; r--;) s = h[n = h[r]], B.isUndefined(s) || (a[n] = s)
                    }
                    for (r = 0; r < e.attributes.length; r++) o = e.attributes[r], /style/i.test(o.nodeName) ? O.Utils.extractCSSText(o.value, c) : l[o.nodeName] = o.value;
                    for (n in B.isUndefined(a.opacity) || (a["stroke-opacity"] = a.opacity, a["fill-opacity"] = a.opacity, delete a.opacity), i && B.defaults(a, i), B.extend(a, l, c), a.visible = !(B.isUndefined(a.display) && /none/i.test(a.display)) || B.isUndefined(a.visibility) && /hidden/i.test(a.visibility), a) switch (s = a[n], n) {
                        case "transform":
                            if (/none/i.test(s)) break;
                            var d = e.transform && e.transform.baseVal && 0 < e.transform.baseVal.length ? e.transform.baseVal[0].matrix : e.getCTM ? e.getCTM() : null;
                            if (B.isNull(d)) break;
                            var u = O.Utils.decomposeMatrix(d);
                            t.translation.set(u.translateX, u.translateY), t.rotation = u.rotation, t.scale = new O.Vector(u.scaleX, u.scaleY);
                            var f = parseFloat((a.x + "")
                                    .replace("px"))
                                , g = parseFloat((a.y + "")
                                    .replace("px"));
                            f && (t.translation.x = f), g && (t.translation.y = g);
                            break;
                        case "viewBox":
                            O.Utils.applySvgViewBox.call(this, t, s);
                            break;
                        case "visible":
                            t.visible = s;
                            break;
                        case "stroke-linecap":
                            t.cap = s;
                            break;
                        case "stroke-linejoin":
                            t.join = s;
                            break;
                        case "stroke-miterlimit":
                            t.miter = s;
                            break;
                        case "stroke-width":
                            t.linewidth = parseFloat(s);
                            break;
                        case "opacity":
                        case "stroke-opacity":
                        case "fill-opacity":
                            t instanceof O.Group || (t.opacity = parseFloat(s));
                            break;
                        case "fill":
                        case "stroke":
                            /url\(\#.*\)/i.test(s) ? t[n] = this.getById(s.replace(/url\(\#(.*)\)/i, "$1")) : t[n] = /none/i.test(s) ? "transparent" : s;
                            break;
                        case "id":
                            t.id = s;
                            break;
                        case "class":
                        case "className":
                            t.classList = s.split(" ")
                    }
                    return a
                }
                , read: {
                    svg: function(e) {
                        var t = O.Utils.read.g.call(this, e);
                        e.getAttribute("viewBox");
                        return t
                    }
                    , g: function(e) {
                        var t, i = new O.Group;
                        t = O.Utils.getSvgStyles.call(this, e);
                        for (var r = 0, n = e.childNodes.length; r < n; r++) {
                            var s = e.childNodes[r]
                                , o = s.nodeName;
                            if (!o) return;
                            var a = o.replace(/svg\:/gi, "")
                                .toLowerCase();
                            if (a in O.Utils.read) {
                                var l = O.Utils.read[a].call(i, s, t);
                                i.add(l)
                            }
                        }
                        return i
                    }
                    , polygon: function(e, t) {
                        var i = e.getAttribute("points")
                            , r = [];
                        i.replace(/(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g, function(e, t, i) {
                            r.push(new O.Anchor(parseFloat(t), parseFloat(i)))
                        });
                        var n = new O.Path(r, !0)
                            .noStroke();
                        return n.fill = "black", O.Utils.applySvgAttributes.call(this, e, n, t), n
                    }
                    , polyline: function(e, t) {
                        var i = O.Utils.read.polygon.call(this, e, t);
                        return i.closed = !1, i
                    }
                    , path: function(e, t) {
                        var A, k, i = e.getAttribute("d")
                            , M = new O.Anchor
                            , P = !1
                            , R = !1
                            , m = i.match(/[a-df-z][^a-df-z]*/gi)
                            , E = m.length - 1;
                        B.each(m.slice(0), function(e, t) {
                            var i, r, n, s, o, a, l, c, h, d = e[0]
                                , u = d.toLowerCase()
                                , f = e.slice(1)
                                .trim()
                                .split(/[\s,]+|(?=\s?[+\-])/)
                                , g = []
                                , p = !1;
                            for (o = 0; o < f.length; o++)
                                if ((i = f[o])
                                    .indexOf(".") !== i.lastIndexOf(".")) {
                                    for (n = (r = i.split("."))[0] + "." + r[1], f.splice(o, 1, n), s = 2; s < r.length; s++) f.splice(o + s - 1, 0, "0." + r[s]);
                                    p = !0
                                }
                            switch (p && (e = d + f.join(",")), t <= 0 && (m = []), u) {
                                case "h":
                                case "v":
                                    1 < f.length && (h = 1);
                                    break;
                                case "m":
                                case "l":
                                case "t":
                                    2 < f.length && (h = 2);
                                    break;
                                case "s":
                                case "q":
                                    4 < f.length && (h = 4);
                                    break;
                                case "c":
                                    6 < f.length && (h = 6);
                                    break;
                                case "a":
                                    7 < f.length && (h = 7)
                            }
                            if (h) {
                                for (o = 0, l = f.length, c = 0; o < l; o += h) {
                                    if (a = d, 0 < c) switch (d) {
                                        case "m":
                                            a = "l";
                                            break;
                                        case "M":
                                            a = "L"
                                    }
                                    g.push(a + f.slice(o, o + h)
                                        .join(" ")), c++
                                }
                                m = Array.prototype.concat.apply(m, g)
                            } else m.push(e)
                        });
                        var T = [];
                        if (B.each(m, function(e, t) {
                                var i, r, n, s, o, a, l, c, h, d, u, f, g = e[0]
                                    , p = g.toLowerCase();
                                switch (k = (k = (k = e.slice(1)
                                            .trim())
                                        .replace(/(-?\d+(?:\.\d*)?)[eE]([+\-]?\d+)/g, function(e, t, i) {
                                            return parseFloat(t) * F(10, i)
                                        }))
                                    .split(/[\s,]+|(?=\s?[+\-])/), R = g === p, p) {
                                    case "z":
                                        if (E <= t) P = !0;
                                        else {
                                            r = M.x, n = M.y, i = new O.Anchor(r, n, void 0, void 0, void 0, void 0, O.Commands.close);
                                            for (t = T.length - 1; 0 <= t; t--) {
                                                var m = T[t];
                                                if (/m/i.test(m.command)) {
                                                    M = m;
                                                    break
                                                }
                                            }
                                        }
                                        break;
                                    case "m":
                                    case "l":
                                        A = void 0, r = parseFloat(k[0]), n = parseFloat(k[1]), i = new O.Anchor(r, n, void 0, void 0, void 0, void 0, /m/i.test(p) ? O.Commands.move : O.Commands.line), R && i.addSelf(M), M = i;
                                        break;
                                    case "h":
                                    case "v":
                                        var v = /h/i.test(p) ? "x" : "y"
                                            , y = /x/i.test(v) ? "y" : "x";
                                        (i = new O.Anchor(void 0, void 0, void 0, void 0, void 0, void 0, O.Commands.line))[v] = parseFloat(k[0]), i[y] = M[y], R && (i[v] += M[v]), M = i;
                                        break;
                                    case "c":
                                    case "s":
                                        s = M.x, o = M.y, A || (A = new O.Vector), u = /c/i.test(p) ? (a = parseFloat(k[0]), l = parseFloat(k[1]), c = parseFloat(k[2]), h = parseFloat(k[3]), d = parseFloat(k[4]), parseFloat(k[5])) : (a = (f = I(M, A, R))
                                                .x, l = f.y, c = parseFloat(k[0]), h = parseFloat(k[1]), d = parseFloat(k[2]), parseFloat(k[3])), R && (a += s, l += o, c += s, h += o, d += s, u += o), B.isObject(M.controls) || O.Anchor.AppendCurveProperties(M), M.controls.right.set(a - M.x, l - M.y), i = new O.Anchor(d, u, c - d, h - u, void 0, void 0, O.Commands.curve), A = (M = i)
                                            .controls.left;
                                        break;
                                    case "t":
                                    case "q":
                                        s = M.x, o = M.y, A || (A = new O.Vector), l = A.isZero() ? (a = s, o) : (a = A.x, A.y), u = /q/i.test(p) ? (c = parseFloat(k[0]), h = parseFloat(k[1]), d = parseFloat(k[2]), parseFloat(k[3])) : (c = (f = I(M, A, R))
                                                .x, h = f.y, d = parseFloat(k[0]), parseFloat(k[1])), R && (a += s, l += o, c += s, h += o, d += s, u += o), B.isObject(M.controls) || O.Anchor.AppendCurveProperties(M), M.controls.right.set(a - M.x, l - M.y), i = new O.Anchor(d, u, c - d, h - u, void 0, void 0, O.Commands.curve), A = (M = i)
                                            .controls.left;
                                        break;
                                    case "a":
                                        s = M.x, o = M.y;
                                        var _ = parseFloat(k[0])
                                            , x = parseFloat(k[1])
                                            , b = parseFloat(k[2])
                                            , w = parseFloat(k[3])
                                            , S = parseFloat(k[4]);
                                        d = parseFloat(k[5]), u = parseFloat(k[6]), R && (d += s, u += o);
                                        var C = new O.Anchor(d, u);
                                        C.command = O.Commands.arc, C.rx = _, C.ry = x, C.xAxisRotation = b, C.largeArcFlag = w, C.sweepFlag = S, M = i = C, A = void 0
                                }
                                i && (B.isArray(i) ? T = T.concat(i) : T.push(i))
                            }), !(T.length <= 1)) {
                            (i = new O.Path(T, P, void 0, !0)
                                .noStroke())
                            .fill = "black";
                            var r = i.getBoundingClientRect(!0);
                            return r.centroid = {
                                x: r.left + r.width / 2
                                , y: r.top + r.height / 2
                            }, B.each(i.vertices, function(e) {
                                e.subSelf(r.centroid)
                            }), i.translation.addSelf(r.centroid), O.Utils.applySvgAttributes.call(this, e, i, t), i
                        }
                    }
                    , circle: function(e, t) {
                        var i = parseFloat(e.getAttribute("cx"))
                            , r = parseFloat(e.getAttribute("cy"))
                            , n = parseFloat(e.getAttribute("r"))
                            , s = new O.Circle(i, r, n)
                            .noStroke();
                        return s.fill = "black", O.Utils.applySvgAttributes.call(this, e, s, t), s
                    }
                    , ellipse: function(e, t) {
                        var i = parseFloat(e.getAttribute("cx"))
                            , r = parseFloat(e.getAttribute("cy"))
                            , n = parseFloat(e.getAttribute("rx"))
                            , s = parseFloat(e.getAttribute("ry"))
                            , o = new O.Ellipse(i, r, n, s)
                            .noStroke();
                        return o.fill = "black", O.Utils.applySvgAttributes.call(this, e, o, t), o
                    }
                    , rect: function(e, t) {
                        var i = parseFloat(e.getAttribute("rx"))
                            , r = parseFloat(e.getAttribute("ry"));
                        if (!B.isNaN(i) || !B.isNaN(r)) return O.Utils.read["rounded-rect"](e);
                        var n = parseFloat(e.getAttribute("x")) || 0
                            , s = parseFloat(e.getAttribute("y")) || 0
                            , o = parseFloat(e.getAttribute("width"))
                            , a = parseFloat(e.getAttribute("height"))
                            , l = o / 2
                            , c = a / 2
                            , h = new O.Rectangle(n + l, s + c, o, a)
                            .noStroke();
                        return h.fill = "black", O.Utils.applySvgAttributes.call(this, e, h, t), h
                    }
                    , "rounded-rect": function(e, t) {
                        var i = parseFloat(e.getAttribute("x")) || 0
                            , r = parseFloat(e.getAttribute("y")) || 0
                            , n = parseFloat(e.getAttribute("rx")) || 0
                            , s = parseFloat(e.getAttribute("ry")) || 0
                            , o = parseFloat(e.getAttribute("width"))
                            , a = parseFloat(e.getAttribute("height"))
                            , l = o / 2
                            , c = a / 2
                            , h = new O.Vector(n, s)
                            , d = new O.RoundedRectangle(i + l, r + c, o, a, h)
                            .noStroke();
                        return d.fill = "black", O.Utils.applySvgAttributes.call(this, e, d, t), d
                    }
                    , line: function(e, t) {
                        var i = parseFloat(e.getAttribute("x1"))
                            , r = parseFloat(e.getAttribute("y1"))
                            , n = parseFloat(e.getAttribute("x2"))
                            , s = parseFloat(e.getAttribute("y2"))
                            , o = new O.Line(i, r, n, s)
                            .noFill();
                        return O.Utils.applySvgAttributes.call(this, e, o, t), o
                    }
                    , lineargradient: function(e, t) {
                        for (var i = parseFloat(e.getAttribute("x1")), r = parseFloat(e.getAttribute("y1")), n = parseFloat(e.getAttribute("x2")), s = parseFloat(e.getAttribute("y2")), o = (n + i) / 2, a = (s + r) / 2, l = [], c = 0; c < e.children.length; c++) {
                            var h, d = e.children[c]
                                , u = parseFloat(d.getAttribute("offset"))
                                , f = d.getAttribute("stop-color")
                                , g = d.getAttribute("stop-opacity")
                                , p = d.getAttribute("style");
                            if (B.isNull(f)) f = (h = !!p && p.match(/stop\-color\:\s?([\#a-fA-F0-9]*)/)) && 1 < h.length ? h[1] : void 0;
                            if (B.isNull(g)) g = (h = !!p && p.match(/stop\-opacity\:\s?([0-9\.\-]*)/)) && 1 < h.length ? parseFloat(h[1]) : 1;
                            l.push(new O.Gradient.Stop(u, f, g))
                        }
                        var m = new O.LinearGradient(i - o, r - a, n - o, s - a, l);
                        return O.Utils.applySvgAttributes.call(this, e, m, t), m
                    }
                    , radialgradient: function(e, t) {
                        var i = parseFloat(e.getAttribute("cx")) || 0
                            , r = parseFloat(e.getAttribute("cy")) || 0
                            , n = parseFloat(e.getAttribute("r"))
                            , s = parseFloat(e.getAttribute("fx"))
                            , o = parseFloat(e.getAttribute("fy"));
                        B.isNaN(s) && (s = i), B.isNaN(o) && (o = r);
                        for (var a = w(i + s) / 2, l = w(r + o) / 2, c = [], h = 0; h < e.children.length; h++) {
                            var d, u = e.children[h]
                                , f = parseFloat(u.getAttribute("offset"))
                                , g = u.getAttribute("stop-color")
                                , p = u.getAttribute("stop-opacity")
                                , m = u.getAttribute("style");
                            if (B.isNull(g)) g = (d = !!m && m.match(/stop\-color\:\s?([\#a-fA-F0-9]*)/)) && 1 < d.length ? d[1] : void 0;
                            if (B.isNull(p)) p = (d = !!m && m.match(/stop\-opacity\:\s?([0-9\.\-]*)/)) && 1 < d.length ? parseFloat(d[1]) : 1;
                            c.push(new O.Gradient.Stop(f, g, p))
                        }
                        var v = new O.RadialGradient(i - a, r - l, n, c, s - a, o - l);
                        return O.Utils.applySvgAttributes.call(this, e, v, t), v
                    }
                }
                , subdivide: function(e, t, i, r, n, s, o, a, l) {
                    var c = (l = l || O.Utils.Curve.RecursionLimit) + 1;
                    if (w(e - o) < .001 && w(t - a) < .001) return [new O.Anchor(o, a)];
                    for (var h = [], d = 0; d < c; d++) {
                        var u = d / c
                            , f = x(u, e, i, n, o)
                            , g = x(u, t, r, s, a);
                        h.push(new O.Anchor(f, g))
                    }
                    return h
                }
                , getComponentOnCubicBezier: function(e, t, i, r, n) {
                    var s = 1 - e;
                    return s * s * s * t + 3 * s * s * e * i + 3 * s * e * e * r + e * e * e * n
                }
                , getCurveLength: function(e, t, i, r, n, s, o, a, l) {
                    if (e === i && t === r && n === o && s === a) {
                        var c = o - e
                            , h = a - t;
                        return v(c * c + h * h)
                    }
                    var d = 9 * (i - n) + 3 * (o - e)
                        , u = 6 * (e + n) - 12 * i
                        , f = 3 * (i - e)
                        , g = 9 * (r - s) + 3 * (a - t)
                        , p = 6 * (t + s) - 12 * r
                        , m = 3 * (r - t);
                    return b(function(e) {
                        var t = (d * e + u) * e + f
                            , i = (g * e + p) * e + m;
                        return v(t * t + i * i)
                    }, 0, 1, l || O.Utils.Curve.RecursionLimit)
                }
                , getCurveBoundingBox: function(e, t, i, r, n, s, o, a) {
                    for (var l, c, h, d, u, f, g, p, m = [], v = [[], []], y = 0; y < 2; ++y)
                        if (h = 0 == y ? (c = 6 * e - 12 * i + 6 * n, l = -3 * e + 9 * i - 9 * n + 3 * o, 3 * i - 3 * e) : (c = 6 * t - 12 * r + 6 * s, l = -3 * t + 9 * r - 9 * s + 3 * a, 3 * r - 3 * t), w(l) < 1e-12) {
                            if (w(c) < 1e-12) continue;
                            0 < (d = -h / c) && d < 1 && m.push(d)
                        } else g = c * c - 4 * h * l, p = Math.sqrt(g), g < 0 || (0 < (u = (-c + p) / (2 * l)) && u < 1 && m.push(u), 0 < (f = (-c - p) / (2 * l)) && f < 1 && m.push(f));
                    for (var _, x = m.length, b = x; x--;) _ = 1 - (d = m[x]), v[0][x] = _ * _ * _ * e + 3 * _ * _ * d * i + 3 * _ * d * d * n + d * d * d * o, v[1][x] = _ * _ * _ * t + 3 * _ * _ * d * r + 3 * _ * d * d * s + d * d * d * a;
                    return v[0][b] = e, v[1][b] = t, v[0][b + 1] = o, v[1][b + 1] = a, v[0].length = v[1].length = b + 2, {
                        min: {
                            x: Math.min.apply(0, v[0])
                            , y: Math.min.apply(0, v[1])
                        }
                        , max: {
                            x: Math.max.apply(0, v[0])
                            , y: Math.max.apply(0, v[1])
                        }
                    }
                }
                , integrate: function(e, t, i, r) {
                    for (var n = O.Utils.Curve.abscissas[r - 2], s = O.Utils.Curve.weights[r - 2], o = .5 * (i - t), a = o + t, l = 0, c = r + 1 >> 1, h = 1 & r ? s[l++] * e(a) : 0; l < c;) {
                        var d = o * n[l];
                        h += s[l++] * (e(a + d) + e(a - d))
                    }
                    return o * h
                }
                , getCurveFromPoints: function(e, t) {
                    for (var i = e.length, r = i - 1, n = 0; n < i; n++) {
                        var s = e[n];
                        B.isObject(s.controls) || O.Anchor.AppendCurveProperties(s);
                        var o = t ? y(n - 1, i) : f(n - 1, 0)
                            , a = t ? y(n + 1, i) : u(n + 1, r)
                            , l = e[o]
                            , c = s
                            , h = e[a];
                        m(l, c, h), c.command = 0 === n ? O.Commands.move : O.Commands.curve
                    }
                }
                , getControlPoints: function(e, t, i) {
                    var r = O.Vector.angleBetween(e, t)
                        , n = O.Vector.angleBetween(i, t)
                        , s = O.Vector.distanceBetween(e, t)
                        , o = O.Vector.distanceBetween(i, t)
                        , a = (r + n) / 2;
                    return s < 1e-4 || o < 1e-4 ? B.isBoolean(t.relative) && !t.relative && (t.controls.left.copy(t), t.controls.right.copy(t)) : (s *= .33, o *= .33, n < r ? a += d : a -= d, t.controls.left.x = c(a) * s, t.controls.left.y = l(a) * s, a -= h, t.controls.right.x = c(a) * o, t.controls.right.y = l(a) * o, B.isBoolean(t.relative) && !t.relative && (t.controls.left.x += t.x, t.controls.left.y += t.y, t.controls.right.x += t.x, t.controls.right.y += t.y)), t
                }
                , getReflection: function(e, t, i) {
                    return new O.Vector(2 * e.x - (t.x + e.x) - (i ? e.x : 0), 2 * e.y - (t.y + e.y) - (i ? e.y : 0))
                }
                , getAnchorsFromArcData: function(e, t, o, a, l, c, h) {
                    (new O.Matrix)
                    .translate(e.x, e.y)
                        .rotate(t);
                    var d = O.Resolution;
                    return B.map(B.range(d), function(e) {
                        var t = (e + 1) / d;
                        h && (t = 1 - t);
                        var i = t * c + l
                            , r = o * Math.cos(i)
                            , n = a * Math.sin(i)
                            , s = new O.Anchor(r, n);
                        return O.Anchor.AppendCurveProperties(s), s.command = O.Commands.line, s
                    })
                }
                , lerp: function(e, t, i) {
                    return i * (t - e) + e
                }
                , toFixed: function(e) {
                    return Math.floor(1e3 * e) / 1e3
                }
                , mod: function(e, t) {
                    for (; e < 0;) e += t;
                    return e % t
                }
                , Collection: function() {
                    Array.call(this), 1 < arguments.length ? Array.prototype.push.apply(this, arguments) : arguments[0] && Array.isArray(arguments[0]) && Array.prototype.push.apply(this, arguments[0])
                }
                , Error: function(e) {
                    this.name = "two.js", this.message = e
                }
                , Events: {
                    on: function(e, t) {
                        return this._events || (this._events = {}), (this._events[e] || (this._events[e] = []))
                            .push(t), this
                    }
                    , off: function(e, t) {
                        if (!this._events) return this;
                        if (!e && !t) return this._events = {}, this;
                        for (var i = e ? [e] : B.keys(this._events), r = 0, n = i.length; r < n; r++) {
                            e = i[r];
                            var s = this._events[e];
                            if (s) {
                                var o = [];
                                if (t)
                                    for (var a = 0, l = s.length; a < l; a++) {
                                        var c = s[a];
                                        c = c.handler ? c.handler : c, t && t !== c && o.push(c)
                                    }
                                this._events[e] = o
                            }
                        }
                        return this
                    }
                    , trigger: function(e) {
                        if (!this._events) return this;
                        var t = o.call(arguments, 1)
                            , i = this._events[e];
                        return i && n(this, i, t), this
                    }
                    , listen: function(e, t, i) {
                        if (e) {
                            e
                            , t
                            , i
                            , e.on(t, ev)
                        }
                        return this
                    }
                    , ignore: function(e, t, i) {
                        return e.off(t, i), this
                    }
                }
            })
        }), O.Utils.Events.bind = O.Utils.Events.on, O.Utils.Events.unbind = O.Utils.Events.off;
        var n = function(t, i, r) {
            var e;
            switch (r.length) {
                case 0:
                    e = function(e) {
                        i[e].call(t, r[0])
                    };
                    break;
                case 1:
                    e = function(e) {
                        i[e].call(t, r[0], r[1])
                    };
                    break;
                case 2:
                    e = function(e) {
                        i[e].call(t, r[0], r[1], r[2])
                    };
                    break;
                case 3:
                    e = function(e) {
                        i[e].call(t, r[0], r[1], r[2], r[3])
                    };
                    break;
                default:
                    e = function(e) {
                        i[e].apply(t, r)
                    }
            }
            for (var n = 0; n < i.length; n++) e(n)
        };
        O.Utils.Error.prototype = new Error, O.Utils.Error.prototype.constructor = O.Utils.Error, O.Utils.Collection.prototype = new Array, O.Utils.Collection.prototype.constructor = O.Utils.Collection, B.extend(O.Utils.Collection.prototype, O.Utils.Events, {
            pop: function() {
                var e = Array.prototype.pop.apply(this, arguments);
                return this.trigger(O.Events.remove, [e]), e
            }
            , shift: function() {
                var e = Array.prototype.shift.apply(this, arguments);
                return this.trigger(O.Events.remove, [e]), e
            }
            , push: function() {
                var e = Array.prototype.push.apply(this, arguments);
                return this.trigger(O.Events.insert, arguments), e
            }
            , unshift: function() {
                var e = Array.prototype.unshift.apply(this, arguments);
                return this.trigger(O.Events.insert, arguments), e
            }
            , splice: function() {
                var e, t = Array.prototype.splice.apply(this, arguments);
                return this.trigger(O.Events.remove, t), 2 < arguments.length && (e = this.slice(arguments[0], arguments[0] + arguments.length - 2), this.trigger(O.Events.insert, e), this.trigger(O.Events.order)), t
            }
            , sort: function() {
                return Array.prototype.sort.apply(this, arguments), this.trigger(O.Events.order), this
            }
            , reverse: function() {
                return Array.prototype.reverse.apply(this, arguments), this.trigger(O.Events.order), this
            }
        });
        O.Utils.getAnchorsFromArcData;
        var m = O.Utils.getControlPoints
            , y = (O.Utils.getCurveFromPoints, O.Utils.solveSegmentIntersection, O.Utils.decoupleShapes, O.Utils.mod)
            , _ = O.Utils.getBackingStoreRatio
            , x = O.Utils.getComponentOnCubicBezier
            , b = (O.Utils.getCurveLength, O.Utils.integrate)
            , I = O.Utils.getReflection;

        function S() {
            var e = document.body.getBoundingClientRect()
                , t = this.width = e.width
                , i = this.height = e.height;
            this.renderer.setSize(t, i, this.ratio)
        }

        function C(e, t) {
            this.width = e, this.height = t, this.trigger(O.Events.resize, e, t)
        }
        B.extend(O.prototype, O.Utils.Events, {
            constructor: O
            , appendTo: function(e) {
                return e.appendChild(this.renderer.domElement), this
            }
            , play: function() {
                return O.Utils.setPlaying.call(this, !0), A.init(), this.trigger(O.Events.play)
            }
            , pause: function() {
                return this.playing = !1, this.trigger(O.Events.pause)
            }
            , update: function() {
                var e = !!this._lastFrame
                    , t = s.now();
                e && (this.timeDelta = parseFloat((t - this._lastFrame)
                    .toFixed(3))), this._lastFrame = t;
                var i = this.width
                    , r = this.height
                    , n = this.renderer;
                return i === n.width && r === n.height || n.setSize(i, r, this.ratio), this.trigger(O.Events.update, this.frameCount, this.timeDelta), this.render()
            }
            , render: function() {
                return this.renderer.render(), this.trigger(O.Events.render, this.frameCount++)
            }
            , add: function(e) {
                var t = e;
                return t instanceof Array || (t = B.toArray(arguments)), this.scene.add(t), this
            }
            , remove: function(e) {
                var t = e;
                return t instanceof Array || (t = B.toArray(arguments)), this.scene.remove(t), this
            }
            , clear: function() {
                return this.scene.remove(this.scene.children), this
            }
            , makeLine: function(e, t, i, r) {
                var n = new O.Line(e, t, i, r);
                return this.scene.add(n), n
            }
            , makeRectangle: function(e, t, i, r) {
                var n = new O.Rectangle(e, t, i, r);
                return this.scene.add(n), n
            }
            , makeRoundedRectangle: function(e, t, i, r, n) {
                var s = new O.RoundedRectangle(e, t, i, r, n);
                return this.scene.add(s), s
            }
            , makeCircle: function(e, t, i) {
                var r = new O.Circle(e, t, i);
                return this.scene.add(r), r
            }
            , makeEllipse: function(e, t, i, r) {
                var n = new O.Ellipse(e, t, i, r);
                return this.scene.add(n), n
            }
            , makeStar: function(e, t, i, r, n) {
                var s = new O.Star(e, t, i, r, n);
                return this.scene.add(s), s
            }
            , makeCurve: function(e) {
                var t = arguments.length
                    , i = e;
                if (!B.isArray(e)) {
                    i = [];
                    for (var r = 0; r < t; r += 2) {
                        var n = arguments[r];
                        if (!B.isNumber(n)) break;
                        var s = arguments[r + 1];
                        i.push(new O.Anchor(n, s))
                    }
                }
                var o = arguments[t - 1]
                    , a = new O.Path(i, !(B.isBoolean(o) ? o : void 0), !0)
                    , l = a.getBoundingClientRect();
                return a.center()
                    .translation.set(l.left + l.width / 2, l.top + l.height / 2), this.scene.add(a), a
            }
            , makePolygon: function(e, t, i, r) {
                var n = new O.Polygon(e, t, i, r);
                return this.scene.add(n), n
            }
            , makeArcSegment: function(e, t, i, r, n, s, o) {
                var a = new O.ArcSegment(e, t, i, r, n, s, o);
                return this.scene.add(a), a
            }
            , makePath: function(e) {
                var t = arguments.length
                    , i = e;
                if (!B.isArray(e)) {
                    i = [];
                    for (var r = 0; r < t; r += 2) {
                        var n = arguments[r];
                        if (!B.isNumber(n)) break;
                        var s = arguments[r + 1];
                        i.push(new O.Anchor(n, s))
                    }
                }
                var o = arguments[t - 1]
                    , a = new O.Path(i, !(B.isBoolean(o) ? o : void 0))
                    , l = a.getBoundingClientRect();
                return a.center()
                    .translation.set(l.left + l.width / 2, l.top + l.height / 2), this.scene.add(a), a
            }
            , makeText: function(e, t, i, r) {
                var n = new O.Text(e, t, i, r);
                return this.add(n), n
            }
            , makeLinearGradient: function(e, t, i, r) {
                var n = o.call(arguments, 4)
                    , s = new O.LinearGradient(e, t, i, r, n);
                return this.add(s), s
            }
            , makeRadialGradient: function(e, t, i) {
                var r = o.call(arguments, 3)
                    , n = new O.RadialGradient(e, t, i, r);
                return this.add(n), n
            }
            , makeSprite: function(e, t, i, r, n, s, o) {
                var a = new O.Sprite(e, t, i, r, n, s);
                return o && a.play(), this.add(a), a
            }
            , makeImageSequence: function(e, t, i, r, n) {
                var s = new O.ImageSequence(e, t, i, r);
                return n && s.play(), this.add(s), s
            }
            , makeTexture: function(e, t) {
                return new O.Texture(e, t)
            }
            , makeGroup: function(e) {
                var t = e;
                t instanceof Array || (t = B.toArray(arguments));
                var i = new O.Group;
                return this.scene.add(i), i.add(t), i
            }
            , interpret: function(e, t, i) {
                var r = e.tagName.toLowerCase();
                i = void 0 === i || i;
                if (!(r in O.Utils.read)) return null;
                var n = O.Utils.read[r].call(this, e);
                return i && this.add(t && n instanceof O.Group ? n.children : n), n
            }
            , load: function(e, i) {
                var r, n, s, o = new O.Group
                    , t = B.bind(function(e) {
                        for (a.temp.innerHTML = e, n = 0; n < a.temp.children.length; n++)
                            if (r = a.temp.children[n], /svg/i.test(r.nodeName))
                                for (s = 0; s < r.children.length; s++) o.add(this.interpret(r.children[s]));
                            else o.add(this.interpret(r));
                        if (B.isFunction(i)) {
                            var t = a.temp.children.length <= 1 ? a.temp.children[0] : a.temp.children;
                            i(o, t)
                        }
                    }, this);
                return /.*\.svg$/gi.test(e) ? O.Utils.xhr(e, t) : t(e), o
            }
        });
        var A = a.getRequestAnimationFrame();

        function k() {
            for (var e = 0; e < O.Instances.length; e++) {
                var t = O.Instances[e];
                t.playing && t.update()
            }
            O.nextFrameID = A(k)
        }
        return "undefined" != typeof module && module.exports ? module.exports = O : "function" == typeof define && define.amd && define("two", [], function() {
            return O
        }), O
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(e) {
        var t = e.Utils
            , i = e.Registry = function() {
                this.map = {}
            };
        t.extend(i.prototype, {
            constructor: i
            , add: function(e, t) {
                return this.map[e] = t, this
            }
            , remove: function(e) {
                return delete this.map[e], this
            }
            , get: function(e) {
                return this.map[e]
            }
            , contains: function(e) {
                return e in this.map
            }
        })
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(i) {
        var r = i.Utils
            , n = i.Vector = function(e, t) {
                this.x = e || 0, this.y = t || 0
            };
        r.extend(n, {
            zero: new i.Vector
            , add: function(e, t) {
                return new n(e.x + t.x, e.y + t.y)
            }
            , sub: function(e, t) {
                return new n(e.x - t.x, e.y - t.y)
            }
            , subtract: function(e, t) {
                return n.sub(e, t)
            }
            , ratioBetween: function(e, t) {
                return (e.x * t.x + e.y * t.y) / (e.length() * t.length())
            }
            , angleBetween: function(e, t) {
                var i, r;
                return r = 4 <= arguments.length ? (i = e - arguments[2], t - arguments[3]) : (i = e.x - t.x, e.y - t.y), Math.atan2(r, i)
            }
            , distanceBetween: function(e, t) {
                return Math.sqrt(n.distanceBetweenSquared(e, t))
            }
            , distanceBetweenSquared: function(e, t) {
                var i = e.x - t.x
                    , r = e.y - t.y;
                return i * i + r * r
            }
            , MakeObservable: function(e) {
                e.bind = e.on = function() {
                    return this._bound || (this._x = this.x, this._y = this.y, Object.defineProperty(this, "x", s), Object.defineProperty(this, "y", o), r.extend(this, t), this._bound = !0), i.Utils.Events.bind.apply(this, arguments), this
                }
            }
        }), r.extend(n.prototype, i.Utils.Events, {
            constructor: n
            , set: function(e, t) {
                return this.x = e, this.y = t, this
            }
            , copy: function(e) {
                return this.x = e.x, this.y = e.y, this
            }
            , clear: function() {
                return this.x = 0, this.y = 0, this
            }
            , clone: function() {
                return new n(this.x, this.y)
            }
            , add: function(e, t) {
                return arguments.length <= 0 || (arguments.length <= 1 ? r.isNumber(e) ? (this.x += e, this.y += e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this.x += e.x, this.y += e.y) : (this.x += e, this.y += t)), this
            }
            , addSelf: function(e) {
                return this.add.apply(this, arguments)
            }
            , sub: function(e, t) {
                return arguments.length <= 0 || (arguments.length <= 1 ? r.isNumber(e) ? (this.x -= e, this.y -= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this.x -= e.x, this.y -= e.y) : (this.x -= e, this.y -= t)), this
            }
            , subtract: function() {
                return this.sub.apply(this, arguments)
            }
            , subSelf: function(e) {
                return this.sub.apply(this, arguments)
            }
            , subtractSelf: function(e) {
                return this.sub.apply(this, arguments)
            }
            , multiply: function(e, t) {
                return arguments.length <= 0 || (arguments.length <= 1 ? r.isNumber(e) ? (this.x *= e, this.y *= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this.x *= e.x, this.y *= e.y) : (this.x *= e, this.y *= t)), this
            }
            , multiplySelf: function(e) {
                return this.multiply.apply(this, arguments)
            }
            , multiplyScalar: function(e) {
                return this.multiply(e)
            }
            , divide: function(e, t) {
                return arguments.length <= 0 || (arguments.length <= 1 ? r.isNumber(e) ? (this.x /= e, this.y /= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this.x /= e.x, this.y /= e.y) : (this.x /= e, this.y /= t), r.isNaN(this.x) && (this.x = 0), r.isNaN(this.y) && (this.y = 0)), this
            }
            , divideSelf: function(e) {
                return this.divide.apply(this, arguments)
            }
            , divideScalar: function(e) {
                return this.divide(e)
            }
            , negate: function() {
                return this.multiply(-1)
            }
            , dot: function(e) {
                return this.x * e.x + this.y * e.y
            }
            , length: function() {
                return Math.sqrt(this.lengthSquared())
            }
            , lengthSquared: function() {
                return this.x * this.x + this.y * this.y
            }
            , normalize: function() {
                return this.divideScalar(this.length())
            }
            , distanceTo: function(e) {
                return Math.sqrt(this.distanceToSquared(e))
            }
            , distanceToSquared: function(e) {
                var t = this.x - e.x
                    , i = this.y - e.y;
                return t * t + i * i
            }
            , setLength: function(e) {
                return this.normalize()
                    .multiplyScalar(e)
            }
            , equals: function(e, t) {
                return t = void 0 === t ? 1e-4 : t, this.distanceTo(e) < t
            }
            , lerp: function(e, t) {
                var i = (e.x - this.x) * t + this.x
                    , r = (e.y - this.y) * t + this.y;
                return this.set(i, r)
            }
            , isZero: function(e) {
                return e = void 0 === e ? 1e-4 : e, this.length() < e
            }
            , toString: function() {
                return this.x + ", " + this.y
            }
            , toObject: function() {
                return {
                    x: this.x
                    , y: this.y
                }
            }
            , rotate: function(e) {
                var t = Math.cos(e)
                    , i = Math.sin(e);
                return this.x = this.x * t - this.y * i, this.y = this.x * i + this.y * t, this
            }
        });
        var t = {
                constructor: n
                , set: function(e, t) {
                    return this._x = e, this._y = t, this.trigger(i.Events.change)
                }
                , copy: function(e) {
                    return this._x = e.x, this._y = e.y, this.trigger(i.Events.change)
                }
                , clear: function() {
                    return this._x = 0, this._y = 0, this.trigger(i.Events.change)
                }
                , clone: function() {
                    return new n(this._x, this._y)
                }
                , add: function(e, t) {
                    return arguments.length <= 0 ? this : (arguments.length <= 1 ? r.isNumber(e) ? (this._x += e, this._y += e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this._x += e.x, this._y += e.y) : (this._x += e, this._y += t), this.trigger(i.Events.change))
                }
                , sub: function(e, t) {
                    return arguments.length <= 0 ? this : (arguments.length <= 1 ? r.isNumber(e) ? (this._x -= e, this._y -= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this._x -= e.x, this._y -= e.y) : (this._x -= e, this._y -= t), this.trigger(i.Events.change))
                }
                , multiply: function(e, t) {
                    return arguments.length <= 0 ? this : (arguments.length <= 1 ? r.isNumber(e) ? (this._x *= e, this._y *= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this._x *= e.x, this._y *= e.y) : (this._x *= e, this._y *= t), this.trigger(i.Events.change))
                }
                , divide: function(e, t) {
                    return arguments.length <= 0 ? this : (arguments.length <= 1 ? r.isNumber(e) ? (this._x /= e, this._y /= e) : e && r.isNumber(e.x) && r.isNumber(e.y) && (this._x /= e.x, this._y /= e.y) : (this._x /= e, this._y /= t), r.isNaN(this._x) && (this._x = 0), r.isNaN(this._y) && (this._y = 0), this.trigger(i.Events.change))
                }
                , dot: function(e) {
                    return this._x * e.x + this._y * e.y
                }
                , lengthSquared: function() {
                    return this._x * this._x + this._y * this._y
                }
                , distanceToSquared: function(e) {
                    var t = this._x - e.x
                        , i = this._y - e.y;
                    return t * t + i * i
                }
                , lerp: function(e, t) {
                    var i = (e.x - this._x) * t + this._x
                        , r = (e.y - this._y) * t + this._y;
                    return this.set(i, r)
                }
                , toString: function() {
                    return this._x + ", " + this._y
                }
                , toObject: function() {
                    return {
                        x: this._x
                        , y: this._y
                    }
                }
                , rotate: function(e) {
                    var t = Math.cos(e)
                        , i = Math.sin(e);
                    return this._x = this._x * t - this._y * i, this._y = this._x * i + this._y * t, this
                }
            }
            , s = {
                enumerable: !0
                , get: function() {
                    return this._x
                }
                , set: function(e) {
                    this._x = e, this.trigger(i.Events.change, "x")
                }
            }
            , o = {
                enumerable: !0
                , get: function() {
                    return this._y
                }
                , set: function(e) {
                    this._y = e, this.trigger(i.Events.change, "y")
                }
            };
        n.MakeObservable(n.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(d) {
        var u = d.Commands
            , f = d.Utils
            , t = d.Anchor = function(e, t, i, r, n, s, o) {
                d.Vector.call(this, e, t), this._broadcast = f.bind(function() {
                    this.trigger(d.Events.change)
                }, this), this._command = o || u.move, this._relative = !0;
                var a = f.isNumber(i)
                    , l = f.isNumber(r)
                    , c = f.isNumber(n)
                    , h = f.isNumber(s);
                (a || l || c || h) && d.Anchor.AppendCurveProperties(this), a && (this.controls.left.x = i), l && (this.controls.left.y = r), c && (this.controls.right.x = n), h && (this.controls.right.y = s)
            };
        f.extend(d.Anchor, {
            AppendCurveProperties: function(e) {
                e.relative = !0, e.controls = {}, e.controls.left = new d.Vector(0, 0), e.controls.right = new d.Vector(0, 0)
            }
            , MakeObservable: function(e) {
                Object.defineProperty(e, "command", {
                    enumerable: !0
                    , get: function() {
                        return this._command
                    }
                    , set: function(e) {
                        return this._command = e, this._command !== u.curve || f.isObject(this.controls) || t.AppendCurveProperties(this), this.trigger(d.Events.change)
                    }
                }), Object.defineProperty(e, "relative", {
                    enumerable: !0
                    , get: function() {
                        return this._relative
                    }
                    , set: function(e) {
                        return this._relative == e ? this : (this._relative = !!e, this.trigger(d.Events.change))
                    }
                }), f.extend(e, d.Vector.prototype, i), e.bind = e.on = function() {
                    var e = this._bound;
                    d.Vector.prototype.bind.apply(this, arguments), e || f.extend(this, i)
                }
            }
        });
        var i = {
            constructor: d.Anchor
            , listen: function() {
                return f.isObject(this.controls) || d.Anchor.AppendCurveProperties(this), this.controls.left.bind(d.Events.change, this._broadcast), this.controls.right.bind(d.Events.change, this._broadcast), this
            }
            , ignore: function() {
                return this.controls.left.unbind(d.Events.change, this._broadcast), this.controls.right.unbind(d.Events.change, this._broadcast), this
            }
            , copy: function(e) {
                return this.x = e.x, this.y = e.y, f.isString(e.command) && (this.command = e.command), f.isObject(e.controls) && (f.isObject(this.controls) || d.Anchor.AppendCurveProperties(this), this.controls.left.copy(e.controls.left), this.controls.right.copy(e.controls.right)), f.isBoolean(e.relative) && (this.relative = e.relative), this.command === d.Commands.arc && (this.rx = e.rx, this.ry = e.ry, this.xAxisRotation = e.xAxisRotation, this.largeArcFlag = e.largeArcFlag, this.sweepFlag = e.sweepFlag), this
            }
            , clone: function() {
                var e = this.controls
                    , t = new d.Anchor(this.x, this.y, e && e.left.x, e && e.left.y, e && e.right.x, e && e.right.y, this.command);
                return t.relative = this._relative, t
            }
            , toObject: function() {
                var e = {
                    x: this.x
                    , y: this.y
                };
                return this._command && (e.command = this._command), this._relative && (e.relative = this._relative), this.controls && (e.controls = {
                    left: this.controls.left.toObject()
                    , right: this.controls.right.toObject()
                }), e
            }
            , toString: function() {
                return this.controls ? [this._x, this._y, this.controls.left.x, this.controls.left.y, this.controls.right.x, this.controls.right.y, this._command, this._relative ? 1 : 0].join(", ") : [this._x, this._y].join(", ")
            }
        };
        d.Anchor.MakeObservable(d.Anchor.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(T) {
        var r = Math.cos
            , n = Math.sin
            , i = Math.tan
            , a = T.Utils
            , f = a.toFixed
            , t = []
            , e = T.Matrix = function(e, t, i, r, n, s) {
                this.elements = new T.Array(9);
                var o = e;
                a.isArray(o) || (o = a.toArray(arguments)), this.identity(), 0 < o.length && this.set(o)
            };
        a.extend(e, {
            Identity: [1, 0, 0, 0, 1, 0, 0, 0, 1]
            , Multiply: function(e, t, i) {
                if (t.length <= 3) {
                    var r = e
                        , n = t[0] || 0
                        , s = t[1] || 0
                        , o = t[2] || 0;
                    return {
                        x: r[0] * n + r[1] * s + r[2] * o
                        , y: r[3] * n + r[4] * s + r[5] * o
                        , z: r[6] * n + r[7] * s + r[8] * o
                    }
                }
                var a = e[0]
                    , l = e[1]
                    , c = e[2]
                    , h = e[3]
                    , d = e[4]
                    , u = e[5]
                    , f = e[6]
                    , g = e[7]
                    , p = e[8]
                    , m = t[0]
                    , v = t[1]
                    , y = t[2]
                    , _ = t[3]
                    , x = t[4]
                    , b = t[5]
                    , w = t[6]
                    , S = t[7]
                    , C = t[8];
                return (i = i || new T.Array(9))[0] = a * m + l * _ + c * w, i[1] = a * v + l * x + c * S, i[2] = a * y + l * b + c * C, i[3] = h * m + d * _ + u * w, i[4] = h * v + d * x + u * S, i[5] = h * y + d * b + u * C, i[6] = f * m + g * _ + p * w, i[7] = f * v + g * x + p * S, i[8] = f * y + g * b + p * C, i
            }
        }), a.extend(e.prototype, T.Utils.Events, {
            constructor: e
            , manual: !1
            , set: function(e) {
                var t = e;
                return 1 < arguments.length && (t = a.toArray(arguments)), this.elements[0] = t[0], this.elements[1] = t[1], this.elements[2] = t[2], this.elements[3] = t[3], this.elements[4] = t[4], this.elements[5] = t[5], this.elements[6] = t[6], this.elements[7] = t[7], this.elements[8] = t[8], this.trigger(T.Events.change)
            }
            , identity: function() {
                return this.elements[0] = e.Identity[0], this.elements[1] = e.Identity[1], this.elements[2] = e.Identity[2], this.elements[3] = e.Identity[3], this.elements[4] = e.Identity[4], this.elements[5] = e.Identity[5], this.elements[6] = e.Identity[6], this.elements[7] = e.Identity[7], this.elements[8] = e.Identity[8], this.trigger(T.Events.change)
            }
            , multiply: function(e, t, i, r, n, s, o, a, l) {
                var c = arguments
                    , h = c.length;
                if (h <= 1) return this.elements[0] *= e, this.elements[1] *= e, this.elements[2] *= e, this.elements[3] *= e, this.elements[4] *= e, this.elements[5] *= e, this.elements[6] *= e, this.elements[7] *= e, this.elements[8] *= e, this.trigger(T.Events.change);
                if (h <= 3) return e = e || 0, t = t || 0, i = i || 0, {
                    x: (n = this.elements)[0] * e + n[1] * t + n[2] * i
                    , y: n[3] * e + n[4] * t + n[5] * i
                    , z: n[6] * e + n[7] * t + n[8] * i
                };
                var d = this.elements
                    , u = c
                    , f = d[0]
                    , g = d[1]
                    , p = d[2]
                    , m = d[3]
                    , v = d[4]
                    , y = d[5]
                    , _ = d[6]
                    , x = d[7]
                    , b = d[8]
                    , w = u[0]
                    , S = u[1]
                    , C = u[2]
                    , A = u[3]
                    , k = u[4]
                    , M = u[5]
                    , P = u[6]
                    , R = u[7]
                    , E = u[8];
                return this.elements[0] = f * w + g * A + p * P, this.elements[1] = f * S + g * k + p * R, this.elements[2] = f * C + g * M + p * E, this.elements[3] = m * w + v * A + y * P, this.elements[4] = m * S + v * k + y * R, this.elements[5] = m * C + v * M + y * E, this.elements[6] = _ * w + x * A + b * P, this.elements[7] = _ * S + x * k + b * R, this.elements[8] = _ * C + x * M + b * E, this.trigger(T.Events.change)
            }
            , inverse: function(e) {
                var t = this.elements;
                e = e || new T.Matrix;
                var i = t[0]
                    , r = t[1]
                    , n = t[2]
                    , s = t[3]
                    , o = t[4]
                    , a = t[5]
                    , l = t[6]
                    , c = t[7]
                    , h = t[8]
                    , d = h * o - a * c
                    , u = -h * s + a * l
                    , f = c * s - o * l
                    , g = i * d + r * u + n * f;
                return g ? (g = 1 / g, e.elements[0] = d * g, e.elements[1] = (-h * r + n * c) * g, e.elements[2] = (a * r - n * o) * g, e.elements[3] = u * g, e.elements[4] = (h * i - n * l) * g, e.elements[5] = (-a * i + n * s) * g, e.elements[6] = f * g, e.elements[7] = (-c * i + r * l) * g, e.elements[8] = (o * i - r * s) * g, e) : null
            }
            , scale: function(e, t) {
                return arguments.length <= 1 && (t = e), this.multiply(e, 0, 0, 0, t, 0, 0, 0, 1)
            }
            , rotate: function(e) {
                var t = r(e)
                    , i = n(e);
                return this.multiply(t, -i, 0, i, t, 0, 0, 0, 1)
            }
            , translate: function(e, t) {
                return this.multiply(1, 0, e, 0, 1, t, 0, 0, 1)
            }
            , skewX: function(e) {
                var t = i(e);
                return this.multiply(1, t, 0, 0, 1, 0, 0, 0, 1)
            }
            , skewY: function(e) {
                var t = i(e);
                return this.multiply(1, 0, 0, t, 1, 0, 0, 0, 1)
            }
            , toString: function(e) {
                return t.length = 0, this.toArray(e, t), t.join(" ")
            }
            , toArray: function(e, t) {
                var i = this.elements
                    , r = !!t
                    , n = f(i[0])
                    , s = f(i[1])
                    , o = f(i[2])
                    , a = f(i[3])
                    , l = f(i[4])
                    , c = f(i[5]);
                if (e) {
                    var h = f(i[6])
                        , d = f(i[7])
                        , u = f(i[8]);
                    return r ? (t[0] = n, t[1] = a, t[2] = h, t[3] = s, t[4] = l, t[5] = d, t[6] = o, t[7] = c, void(t[8] = u)) : [n, a, h, s, l, d, o, c, u]
                }
                return r ? (t[0] = n, t[1] = a, t[2] = s, t[3] = l, t[4] = o, void(t[5] = c)) : [n, a, s, l, o, c]
            }
            , clone: function() {
                var e, t, i, r, n, s, o, a, l;
                e = this.elements[0], t = this.elements[1], i = this.elements[2], r = this.elements[3], n = this.elements[4], s = this.elements[5], o = this.elements[6], a = this.elements[7], l = this.elements[8];
                var c = new T.Matrix(e, t, i, r, n, s, o, a, l);
                return c.manual = this.manual, c
            }
        })
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(P) {
        var R = P.Utils.mod
            , E = P.Utils.toFixed
            , s = P.Utils
            , a = {
                version: 1.1
                , ns: "http://www.w3.org/2000/svg"
                , xlink: "http://www.w3.org/1999/xlink"
                , alignments: {
                    left: "start"
                    , center: "middle"
                    , right: "end"
                }
                , createElement: function(e, t) {
                    var i = e
                        , r = document.createElementNS(a.ns, i);
                    return "svg" === i && (t = s.defaults(t || {}, {
                        version: a.version
                    })), s.isEmpty(t) || a.setAttributes(r, t), r
                }
                , setAttributes: function(e, t) {
                    for (var i = Object.keys(t), r = 0; r < i.length; r++) /href/.test(i[r]) ? e.setAttributeNS(a.xlink, i[r], t[i[r]]) : e.setAttribute(i[r], t[i[r]]);
                    return this
                }
                , removeAttributes: function(e, t) {
                    for (var i in t) e.removeAttribute(i);
                    return this
                }
                , toString: function(e, t) {
                    for (var i, r = e.length, n = r - 1, s = "", o = 0; o < r; o++) {
                        var a, l, c, h, d, u, f, g, p, m, v, y, _, x, b = e[o]
                            , w = t ? R(o - 1, r) : Math.max(o - 1, 0)
                            , S = t ? R(o + 1, r) : Math.min(o + 1, n)
                            , C = e[w]
                            , A = e[S]
                            , k = E(b.x)
                            , M = E(b.y);
                        switch (b.command) {
                            case P.Commands.close:
                                a = P.Commands.close;
                                break;
                            case P.Commands.arc:
                                m = b.rx, v = b.ry, y = b.xAxisRotation, _ = b.largeArcFlag, x = b.sweepFlag, a = P.Commands.arc + " " + m + " " + v + " " + y + " " + _ + " " + x + " " + k + " " + M;
                                break;
                            case P.Commands.curve:
                                u = C.controls && C.controls.right || P.Vector.zero, f = b.controls && b.controls.left || P.Vector.zero, c = C.relative ? (l = E(u.x + C.x), E(u.y + C.y)) : (l = E(u.x), E(u.y)), d = b.relative ? (h = E(f.x + b.x), E(f.y + b.y)) : (h = E(f.x), E(f.y)), a = (0 === o ? P.Commands.move : P.Commands.curve) + " " + l + " " + c + " " + h + " " + d + " " + k + " " + M;
                                break;
                            case P.Commands.move:
                                i = b, a = P.Commands.move + " " + k + " " + M;
                                break;
                            default:
                                a = b.command + " " + k + " " + M
                        }
                        n <= o && t && (b.command === P.Commands.curve && (A = i, g = b.controls && b.controls.right || b, p = A.controls && A.controls.left || A, c = b.relative ? (l = E(g.x + b.x), E(g.y + b.y)) : (l = E(g.x), E(g.y)), d = A.relative ? (h = E(p.x + A.x), E(p.y + A.y)) : (h = E(p.x), E(p.y)), a += " C " + l + " " + c + " " + h + " " + d + " " + (k = E(A.x)) + " " + (M = E(A.y))), b.command !== P.Commands.close && (a += " Z")), s += a + " "
                    }
                    return s
                }
                , getClip: function(e) {
                    var t = e._renderer.clip;
                    if (!t) {
                        for (var i = e; i.parent;) i = i.parent;
                        t = e._renderer.clip = a.createElement("clipPath"), i.defs.appendChild(t)
                    }
                    return t
                }
                , group: {
                    appendChild: function(e) {
                        var t = e._renderer.elem;
                        if (t) {
                            var i = t.nodeName;
                            !i || /(radial|linear)gradient/i.test(i) || e._clip || this.elem.appendChild(t)
                        }
                    }
                    , removeChild: function(e) {
                        var t = e._renderer.elem;
                        t && t.parentNode == this.elem && (t.nodeName && (e._clip || this.elem.removeChild(t)))
                    }
                    , orderChild: function(e) {
                        this.elem.appendChild(e._renderer.elem)
                    }
                    , renderChild: function(e) {
                        a[e._renderer.type].render.call(e, this)
                    }
                    , render: function(e) {
                        if (this._update(), 0 === this._opacity && !this._flagOpacity) return this;
                        this._renderer.elem || (this._renderer.elem = a.createElement("g", {
                            id: this.id
                        }), e.appendChild(this._renderer.elem));
                        var t = this._matrix.manual || this._flagMatrix
                            , i = {
                                domElement: e
                                , elem: this._renderer.elem
                            };
                        t && this._renderer.elem.setAttribute("transform", "matrix(" + this._matrix.toString() + ")");
                        for (var r = 0; r < this.children.length; r++) {
                            var n = this.children[r];
                            a[n._renderer.type].render.call(n, e)
                        }
                        return this._flagOpacity && this._renderer.elem.setAttribute("opacity", this._opacity), this._flagClassName && this._renderer.elem.setAttribute("class", this._className), this._flagAdditions && this.additions.forEach(a.group.appendChild, i), this._flagSubtractions && this.subtractions.forEach(a.group.removeChild, i), this._flagOrder && this.children.forEach(a.group.orderChild, i), this._flagMask && (this._mask ? this._renderer.elem.setAttribute("clip-path", "url(#" + this._mask.id + ")") : this._renderer.elem.removeAttribute("clip-path")), this.flagReset()
                    }
                }
                , path: {
                    render: function(e) {
                        if (this._update(), 0 === this._opacity && !this._flagOpacity) return this;
                        var t = {};
                        if ((this._matrix.manual || this._flagMatrix) && (t.transform = "matrix(" + this._matrix.toString() + ")"), this._flagVertices) {
                            var i = a.toString(this._renderer.vertices, this._closed);
                            t.d = i
                        }
                        if (this._fill && this._fill._renderer && (this._fill._update(), a[this._fill._renderer.type].render.call(this._fill, e, !0)), this._flagFill && (t.fill = this._fill && this._fill.id ? "url(#" + this._fill.id + ")" : this._fill), this._stroke && this._stroke._renderer && (this._stroke._update(), a[this._stroke._renderer.type].render.call(this._stroke, e, !0)), this._flagStroke && (t.stroke = this._stroke && this._stroke.id ? "url(#" + this._stroke.id + ")" : this._stroke), this._flagLinewidth && (t["stroke-width"] = this._linewidth), this._flagOpacity && (t["stroke-opacity"] = this._opacity, t["fill-opacity"] = this._opacity), this._flagClassName && (t.class = this._className), this._flagVisible && (t.visibility = this._visible ? "visible" : "hidden"), this._flagCap && (t["stroke-linecap"] = this._cap), this._flagJoin && (t["stroke-linejoin"] = this._join), this._flagMiter && (t["stroke-miterlimit"] = this._miter), this.dashes && 0 < this.dashes.length && (t["stroke-dasharray"] = this.dashes.join(" ")), this._renderer.elem ? a.setAttributes(this._renderer.elem, t) : (t.id = this.id, this._renderer.elem = a.createElement("path", t), e.appendChild(this._renderer.elem)), this._flagClip) {
                            var r = a.getClip(this)
                                , n = this._renderer.elem;
                            this._clip ? (n.removeAttribute("id"), r.setAttribute("id", this.id), r.appendChild(n)) : (r.removeAttribute("id"), n.setAttribute("id", this.id), this.parent._renderer.elem.appendChild(n))
                        }
                        return this.flagReset()
                    }
                }
                , text: {
                    render: function(e) {
                        this._update();
                        var t = {};
                        if ((this._matrix.manual || this._flagMatrix) && (t.transform = "matrix(" + this._matrix.toString() + ")"), this._flagFamily && (t["font-family"] = this._family), this._flagSize && (t["font-size"] = this._size), this._flagLeading && (t["line-height"] = this._leading), this._flagAlignment && (t["text-anchor"] = a.alignments[this._alignment] || this._alignment), this._flagBaseline && (t["alignment-baseline"] = t["dominant-baseline"] = this._baseline), this._flagStyle && (t["font-style"] = this._style), this._flagWeight && (t["font-weight"] = this._weight), this._flagDecoration && (t["text-decoration"] = this._decoration), this._fill && this._fill._renderer && (this._fill._update(), a[this._fill._renderer.type].render.call(this._fill, e, !0)), this._flagFill && (t.fill = this._fill && this._fill.id ? "url(#" + this._fill.id + ")" : this._fill), this._stroke && this._stroke._renderer && (this._stroke._update(), a[this._stroke._renderer.type].render.call(this._stroke, e, !0)), this._flagStroke && (t.stroke = this._stroke && this._stroke.id ? "url(#" + this._stroke.id + ")" : this._stroke), this._flagLinewidth && (t["stroke-width"] = this._linewidth), this._flagOpacity && (t.opacity = this._opacity), this._flagClassName && (t.class = this._className), this._flagVisible && (t.visibility = this._visible ? "visible" : "hidden"), this.dashes && 0 < this.dashes.length && (t["stroke-dasharray"] = this.dashes.join(" ")), this._renderer.elem ? a.setAttributes(this._renderer.elem, t) : (t.id = this.id, this._renderer.elem = a.createElement("text", t), e.defs.appendChild(this._renderer.elem)), this._flagClip) {
                            var i = a.getClip(this)
                                , r = this._renderer.elem;
                            this._clip ? (r.removeAttribute("id"), i.setAttribute("id", this.id), i.appendChild(r)) : (i.removeAttribute("id"), r.setAttribute("id", this.id), this.parent._renderer.elem.appendChild(r))
                        }
                        return this._flagValue && (this._renderer.elem.textContent = this._value), this.flagReset()
                    }
                }
                , "linear-gradient": {
                    render: function(e, t) {
                        t || this._update();
                        var i = {};
                        if (this._flagEndPoints && (i.x1 = this.left._x, i.y1 = this.left._y, i.x2 = this.right._x, i.y2 = this.right._y), this._flagSpread && (i.spreadMethod = this._spread), this._renderer.elem ? a.setAttributes(this._renderer.elem, i) : (i.id = this.id, i.gradientUnits = "userSpaceOnUse", this._renderer.elem = a.createElement("linearGradient", i), e.defs.appendChild(this._renderer.elem)), this._flagStops) {
                            var r = this._renderer.elem.childNodes.length !== this.stops.length;
                            r && (this._renderer.elem.childNodes.length = 0);
                            for (var n = 0; n < this.stops.length; n++) {
                                var s = this.stops[n]
                                    , o = {};
                                s._flagOffset && (o.offset = 100 * s._offset + "%"), s._flagColor && (o["stop-color"] = s._color), s._flagOpacity && (o["stop-opacity"] = s._opacity), s._renderer.elem ? a.setAttributes(s._renderer.elem, o) : s._renderer.elem = a.createElement("stop", o), r && this._renderer.elem.appendChild(s._renderer.elem), s.flagReset()
                            }
                        }
                        return this.flagReset()
                    }
                }
                , "radial-gradient": {
                    render: function(e, t) {
                        t || this._update();
                        var i = {};
                        if (this._flagCenter && (i.cx = this.center._x, i.cy = this.center._y), this._flagFocal && (i.fx = this.focal._x, i.fy = this.focal._y), this._flagRadius && (i.r = this._radius), this._flagSpread && (i.spreadMethod = this._spread), this._renderer.elem ? a.setAttributes(this._renderer.elem, i) : (i.id = this.id, i.gradientUnits = "userSpaceOnUse", this._renderer.elem = a.createElement("radialGradient", i), e.defs.appendChild(this._renderer.elem)), this._flagStops) {
                            var r = this._renderer.elem.childNodes.length !== this.stops.length;
                            r && (this._renderer.elem.childNodes.length = 0);
                            for (var n = 0; n < this.stops.length; n++) {
                                var s = this.stops[n]
                                    , o = {};
                                s._flagOffset && (o.offset = 100 * s._offset + "%"), s._flagColor && (o["stop-color"] = s._color), s._flagOpacity && (o["stop-opacity"] = s._opacity), s._renderer.elem ? a.setAttributes(s._renderer.elem, o) : s._renderer.elem = a.createElement("stop", o), r && this._renderer.elem.appendChild(s._renderer.elem), s.flagReset()
                            }
                        }
                        return this.flagReset()
                    }
                }
                , texture: {
                    render: function(e, t) {
                        t || this._update();
                        var i = {}
                            , r = {
                                x: 0
                                , y: 0
                            }
                            , n = this.image;
                        if (this._flagLoaded && this.loaded) switch (n.nodeName.toLowerCase()) {
                            case "canvas":
                                r.href = r["xlink:href"] = n.toDataURL("image/png");
                                break;
                            case "img":
                            case "image":
                                r.href = r["xlink:href"] = this.src
                        }
                        if ((this._flagOffset || this._flagLoaded || this._flagScale) && (i.x = this._offset.x, i.y = this._offset.y, n && (i.x -= n.width / 2, i.y -= n.height / 2, this._scale instanceof P.Vector ? (i.x *= this._scale.x, i.y *= this._scale.y) : (i.x *= this._scale, i.y *= this._scale)), 0 < i.x && (i.x *= -1), 0 < i.y && (i.y *= -1)), (this._flagScale || this._flagLoaded || this._flagRepeat) && (i.width = 0, i.height = 0, n)) {
                            switch (r.width = i.width = n.width, r.height = i.height = n.height, this._repeat) {
                                case "no-repeat":
                                    i.width += 1, i.height += 1
                            }
                            this._scale instanceof P.Vector ? (i.width *= this._scale.x, i.height *= this._scale.y) : (i.width *= this._scale, i.height *= this._scale)
                        }
                        return (this._flagScale || this._flagLoaded) && (this._renderer.image ? s.isEmpty(r) || a.setAttributes(this._renderer.image, r) : this._renderer.image = a.createElement("image", r)), this._renderer.elem ? s.isEmpty(i) || a.setAttributes(this._renderer.elem, i) : (i.id = this.id, i.patternUnits = "userSpaceOnUse", this._renderer.elem = a.createElement("pattern", i), e.defs.appendChild(this._renderer.elem)), this._renderer.elem && this._renderer.image && !this._renderer.appended && (this._renderer.elem.appendChild(this._renderer.image), this._renderer.appended = !0), this.flagReset()
                    }
                }
            }
            , e = P[P.Types.svg] = function(e) {
                this.domElement = e.domElement || a.createElement("svg"), this.scene = new P.Group, (this.scene.parent = this)
                    .defs = a.createElement("defs"), this.domElement.appendChild(this.defs), this.domElement.defs = this.defs, this.domElement.style.overflow = "hidden"
            };
        s.extend(e, {
            Utils: a
        }), s.extend(e.prototype, P.Utils.Events, {
            constructor: e
            , setSize: function(e, t) {
                return this.width = e, this.height = t, a.setAttributes(this.domElement, {
                    width: e
                    , height: t
                }), this.trigger(P.Events.resize, e, t)
            }
            , render: function() {
                return a.group.render.call(this.scene, this.domElement), this
            }
        })
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(W) {
        var z = W.Utils.mod
            , H = W.Utils.toFixed
            , r = W.Utils.getRatio
            , X = W.Utils
            , Y = []
            , M = 2 * Math.PI
            , K = Math.max
            , a = Math.min
            , P = Math.abs
            , R = Math.sin
            , E = Math.cos
            , l = Math.acos
            , T = Math.sqrt
            , Q = function(e) {
                return 1 == e[0] && 0 == e[3] && 0 == e[1] && 1 == e[4] && 0 == e[2] && 0 == e[5]
            }
            , Z = {
                isHidden: /(none|transparent)/i
                , alignments: {
                    left: "start"
                    , middle: "center"
                    , right: "end"
                }
                , shim: function(e, t) {
                    return e.tagName = e.nodeName = t || "canvas", e.nodeType = 1, e.getAttribute = function(e) {
                        return this[e]
                    }, e.setAttribute = function(e, t) {
                        return this[e] = t, this
                    }, e
                }
                , group: {
                    renderChild: function(e) {
                        Z[e._renderer.type].render.call(e, this.ctx, !0, this.clip)
                    }
                    , render: function(e) {
                        this._update();
                        var t = this._matrix.elements
                            , i = this.parent;
                        this._renderer.opacity = this._opacity * (i && i._renderer ? i._renderer.opacity : 1);
                        var r = Q(t)
                            , n = this._mask;
                        if (this._renderer.context || (this._renderer.context = {}), this._renderer.context.ctx = e, r || (e.save(), e.transform(t[0], t[3], t[1], t[4], t[2], t[5])), n && Z[n._renderer.type].render.call(n, e, !0), 0 < this.opacity && 0 !== this.scale)
                            for (var s = 0; s < this.children.length; s++) {
                                var o = this.children[s];
                                Z[o._renderer.type].render.call(o, e)
                            }
                        return r || e.restore(), this.flagReset()
                    }
                }
                , path: {
                    render: function(e, t, i) {
                        var r, n, s, o, a, l, c, h, d, u, f, g, p, m, v, y, _, x, b, w, S, C, A, k, M, P, R, E, T, B, F, O, I;
                        if (this._update(), r = this._matrix.elements, n = this._stroke, s = this._linewidth, o = this._fill, a = this._opacity * this.parent._renderer.opacity, l = this._visible, c = this._cap, h = this._join, d = this._miter, u = this._closed, p = (g = (f = this._renderer.vertices)
                                .length) - 1, F = Q(r), I = this.dashes, B = this._clip, !t && (!l || B)) return this;
                        F || (e.save(), e.transform(r[0], r[3], r[1], r[4], r[2], r[5])), o && (X.isString(o) ? e.fillStyle = o : (Z[o._renderer.type].render.call(o, e), e.fillStyle = o._renderer.effect)), n && (X.isString(n) ? e.strokeStyle = n : (Z[n._renderer.type].render.call(n, e), e.strokeStyle = n._renderer.effect)), s && (e.lineWidth = s), d && (e.miterLimit = d), h && (e.lineJoin = h), c && (e.lineCap = c), X.isNumber(a) && (e.globalAlpha = a), I && 0 < I.length && e.setLineDash(I), e.beginPath();
                        for (var U = 0; U < f.length; U++) switch (_ = f[U], E = H(_.x), T = H(_.y), _.command) {
                            case W.Commands.close:
                                e.closePath();
                                break;
                            case W.Commands.arc:
                                var L = _.rx
                                    , V = _.ry
                                    , N = _.xAxisRotation
                                    , j = _.largeArcFlag
                                    , G = _.sweepFlag;
                                y = f[v = u ? z(U - 1, g) : K(U - 1, 0)];
                                var q = H(y.x)
                                    , D = H(y.y);
                                Z.renderSvgArcCommand(e, q, D, L, V, j, G, N, E, T);
                                break;
                            case W.Commands.curve:
                                v = u ? z(U - 1, g) : Math.max(U - 1, 0), m = u ? z(U + 1, g) : Math.min(U + 1, p), y = f[v], x = f[m], k = y.controls && y.controls.right || W.Vector.zero, M = _.controls && _.controls.left || W.Vector.zero, A = y._relative ? (C = k.x + H(y.x), k.y + H(y.y)) : (C = H(k.x), H(k.y)), S = _._relative ? (w = M.x + H(_.x), M.y + H(_.y)) : (w = H(M.x), H(M.y)), e.bezierCurveTo(C, A, w, S, E, T), p <= U && u && (x = b, P = _.controls && _.controls.right || W.Vector.zero, R = x.controls && x.controls.left || W.Vector.zero, A = _._relative ? (C = P.x + H(_.x), P.y + H(_.y)) : (C = H(P.x), H(P.y)), S = x._relative ? (w = R.x + H(x.x), R.y + H(x.y)) : (w = H(R.x), H(R.y)), E = H(x.x), T = H(x.y), e.bezierCurveTo(C, A, w, S, E, T));
                                break;
                            case W.Commands.line:
                                e.lineTo(E, T);
                                break;
                            case W.Commands.move:
                                b = _, e.moveTo(E, T)
                        }
                        return u && e.closePath(), B || i || (Z.isHidden.test(o) || ((O = o._renderer && o._renderer.offset) && (e.save(), e.translate(-o._renderer.offset.x, -o._renderer.offset.y), e.scale(o._renderer.scale.x, o._renderer.scale.y)), e.fill(), O && e.restore()), Z.isHidden.test(n) || ((O = n._renderer && n._renderer.offset) && (e.save(), e.translate(-n._renderer.offset.x, -n._renderer.offset.y), e.scale(n._renderer.scale.x, n._renderer.scale.y), e.lineWidth = s / n._renderer.scale.x), e.stroke(), O && e.restore())), F || e.restore(), B && !i && e.clip(), I && 0 < I.length && e.setLineDash(Y), this.flagReset()
                    }
                }
                , text: {
                    render: function(e, t, i) {
                        this._update();
                        var r, n, s, o, a, l, c, h = this._matrix.elements
                            , d = this._stroke
                            , u = this._linewidth
                            , f = this._fill
                            , g = this._opacity * this.parent._renderer.opacity
                            , p = this._visible
                            , m = Q(h)
                            , v = f._renderer && f._renderer.offset && d._renderer && d._renderer.offset
                            , y = this.dashes
                            , _ = this._clip;
                        return t || p && !_ ? (m || (e.save(), e.transform(h[0], h[3], h[1], h[4], h[2], h[5])), v || (e.font = [this._style, this._weight, this._size + "px/" + this._leading + "px", this._family].join(" ")), e.textAlign = Z.alignments[this._alignment] || this._alignment, e.textBaseline = this._baseline, f && (X.isString(f) ? e.fillStyle = f : (Z[f._renderer.type].render.call(f, e), e.fillStyle = f._renderer.effect)), d && (X.isString(d) ? e.strokeStyle = d : (Z[d._renderer.type].render.call(d, e), e.strokeStyle = d._renderer.effect)), u && (e.lineWidth = u), X.isNumber(g) && (e.globalAlpha = g), y && 0 < y.length && e.setLineDash(y), _ || i || (Z.isHidden.test(f) || (f._renderer && f._renderer.offset ? (l = H(f._renderer.scale.x), c = H(f._renderer.scale.y), e.save(), e.translate(-H(f._renderer.offset.x), -H(f._renderer.offset.y)), e.scale(l, c), r = this._size / f._renderer.scale.y, n = this._leading / f._renderer.scale.y, e.font = [this._style, this._weight, H(r) + "px/", H(n) + "px", this._family].join(" "), s = f._renderer.offset.x / f._renderer.scale.x, o = f._renderer.offset.y / f._renderer.scale.y, e.fillText(this.value, H(s), H(o)), e.restore()) : e.fillText(this.value, 0, 0)), Z.isHidden.test(d) || (d._renderer && d._renderer.offset ? (l = H(d._renderer.scale.x), c = H(d._renderer.scale.y), e.save(), e.translate(-H(d._renderer.offset.x), -H(d._renderer.offset.y)), e.scale(l, c), r = this._size / d._renderer.scale.y, n = this._leading / d._renderer.scale.y, e.font = [this._style, this._weight, H(r) + "px/", H(n) + "px", this._family].join(" "), s = d._renderer.offset.x / d._renderer.scale.x, o = d._renderer.offset.y / d._renderer.scale.y, a = u / d._renderer.scale.x, e.lineWidth = H(a), e.strokeText(this.value, H(s), H(o)), e.restore()) : e.strokeText(this.value, 0, 0))), m || e.restore(), _ && !i && e.clip(), y && 0 < y.length && e.setLineDash(Y), this.flagReset()) : this
                    }
                }
                , "linear-gradient": {
                    render: function(e) {
                        if (this._update(), !this._renderer.effect || this._flagEndPoints || this._flagStops) {
                            this._renderer.effect = e.createLinearGradient(this.left._x, this.left._y, this.right._x, this.right._y);
                            for (var t = 0; t < this.stops.length; t++) {
                                var i = this.stops[t];
                                this._renderer.effect.addColorStop(i._offset, i._color)
                            }
                        }
                        return this.flagReset()
                    }
                }
                , "radial-gradient": {
                    render: function(e) {
                        if (this._update(), !this._renderer.effect || this._flagCenter || this._flagFocal || this._flagRadius || this._flagStops) {
                            this._renderer.effect = e.createRadialGradient(this.center._x, this.center._y, 0, this.focal._x, this.focal._y, this._radius);
                            for (var t = 0; t < this.stops.length; t++) {
                                var i = this.stops[t];
                                this._renderer.effect.addColorStop(i._offset, i._color)
                            }
                        }
                        return this.flagReset()
                    }
                }
                , texture: {
                    render: function(e) {
                        this._update();
                        var t = this.image;
                        return (!this._renderer.effect || (this._flagLoaded || this._flagImage || this._flagVideo || this._flagRepeat) && this.loaded) && (this._renderer.effect = e.createPattern(this.image, this._repeat)), (this._flagOffset || this._flagLoaded || this._flagScale) && (this._renderer.offset instanceof W.Vector || (this._renderer.offset = new W.Vector), this._renderer.offset.x = -this._offset.x, this._renderer.offset.y = -this._offset.y, t && (this._renderer.offset.x += t.width / 2, this._renderer.offset.y += t.height / 2, this._scale instanceof W.Vector ? (this._renderer.offset.x *= this._scale.x, this._renderer.offset.y *= this._scale.y) : (this._renderer.offset.x *= this._scale, this._renderer.offset.y *= this._scale))), (this._flagScale || this._flagLoaded) && (this._renderer.scale instanceof W.Vector || (this._renderer.scale = new W.Vector), this._scale instanceof W.Vector ? this._renderer.scale.copy(this._scale) : this._renderer.scale.set(this._scale, this._scale)), this.flagReset()
                    }
                }
                , renderSvgArcCommand: function(e, t, i, r, n, s, o, a, l, c) {
                    a = a * Math.PI / 180, r = P(r), n = P(n);
                    var h = (t - l) / 2
                        , d = (i - c) / 2
                        , u = E(a) * h + R(a) * d
                        , f = -R(a) * h + E(a) * d
                        , g = r * r
                        , p = n * n
                        , m = u * u
                        , v = f * f
                        , y = m / g + v / p;
                    if (1 < y) {
                        var _ = T(y);
                        g = (r *= _) * r, p = (n *= _) * n
                    }
                    var x = g * v + p * m
                        , b = T(K(0, (g * p - x) / x));
                    s === o && (b = -b);
                    var w = b * r * f / n
                        , S = -b * n * u / r
                        , C = E(a) * w - R(a) * S + (t + l) / 2
                        , A = R(a) * w + E(a) * S + (i + c) / 2
                        , k = B(1, 0, (u - w) / r, (f - S) / n);
                    ! function(e, t, i, r, n, s, o, a, l) {
                        var c = W.Utils.Curve.Tolerance.epsilon
                            , h = o - s
                            , d = Math.abs(h) < c;
                        (h = z(h, M)) < c && (h = d ? 0 : M);
                        !0 !== a || d || (h === M ? h = -M : h -= M);
                        for (var u = 0; u < W.Resolution; u++) {
                            var f = u / (W.Resolution - 1)
                                , g = s + f * h
                                , p = t + r * Math.cos(g)
                                , m = i + n * Math.sin(g);
                            if (0 !== l) {
                                var v = Math.cos(l)
                                    , y = Math.sin(l)
                                    , _ = p - t
                                    , x = m - i;
                                p = _ * v - x * y + t, m = _ * y + x * v + i
                            }
                            e.lineTo(p, m)
                        }
                    }(e, C, A, r, n, k, k + B((u - w) / r, (f - S) / n, (-u - w) / r, (-f - S) / n) % M, 0 === o, a)
                }
            }
            , e = W[W.Types.canvas] = function(e) {
                var t = !1 !== e.smoothing;
                this.domElement = e.domElement || document.createElement("canvas"), this.ctx = this.domElement.getContext("2d"), this.overdraw = e.overdraw || !1, X.isUndefined(this.ctx.imageSmoothingEnabled) || (this.ctx.imageSmoothingEnabled = t), this.scene = new W.Group, this.scene.parent = this
            };

        function B(e, t, i, r) {
            var n = e * i + t * r
                , s = T(e * e + t * t) * T(i * i + r * r)
                , o = l(K(-1, a(1, n / s)));
            return e * r - t * i < 0 && (o = -o), o
        }
        X.extend(e, {
            Utils: Z
        }), X.extend(e.prototype, W.Utils.Events, {
            constructor: e
            , setSize: function(e, t, i) {
                return this.width = e, this.height = t, this.ratio = X.isUndefined(i) ? r(this.ctx) : i, this.domElement.width = e * this.ratio, this.domElement.height = t * this.ratio, this.domElement.style && X.extend(this.domElement.style, {
                    width: e + "px"
                    , height: t + "px"
                }), this.trigger(W.Events.resize, e, t, i)
            }
            , render: function() {
                var e = 1 === this.ratio;
                return e || (this.ctx.save(), this.ctx.scale(this.ratio, this.ratio)), this.overdraw || this.ctx.clearRect(0, 0, this.width, this.height), Z.group.render.call(this.scene, this.ctx), e || this.ctx.restore(), this
            }
        })
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(W) {
        var e = W.root
            , a = W.Matrix.Multiply
            , z = W.Utils.mod
            , s = [1, 0, 0, 0, 1, 0, 0, 0, 1]
            , l = new W.Array(9)
            , n = W.Utils.getRatio
            , H = (W.Utils.getComputedMatrix, W.Utils.toFixed)
            , X = W[W.Types.canvas].Utils
            , Y = W.Utils
            , K = {
                isHidden: /(none|transparent)/i
                , canvas: e.document ? e.document.createElement("canvas") : {
                    getContext: Y.identity
                }
                , alignments: {
                    left: "start"
                    , middle: "center"
                    , right: "end"
                }
                , matrix: new W.Matrix
                , uv: new W.Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
                , group: {
                    removeChild: function(e, t) {
                        if (e.children)
                            for (var i = 0; i < e.children.length; i++) K.group.removeChild(e.children[i], t);
                        else t.deleteTexture(e._renderer.texture), delete e._renderer.texture
                    }
                    , renderChild: function(e) {
                        K[e._renderer.type].render.call(e, this.gl, this.program)
                    }
                    , render: function(e, t) {
                        this._update();
                        var i = this.parent
                            , r = i._matrix && i._matrix.manual || i._flagMatrix
                            , n = this._matrix.manual || this._flagMatrix;
                        if ((r || n) && (this._renderer.matrix || (this._renderer.matrix = new W.Array(9)), this._matrix.toArray(!0, l), a(l, i._renderer.matrix, this._renderer.matrix), this._renderer.scale = this._scale * i._renderer.scale, r && (this._flagMatrix = !0)), this._mask && (e.enable(e.STENCIL_TEST), e.stencilFunc(e.ALWAYS, 1, 1), e.colorMask(!1, !1, !1, !0), e.stencilOp(e.KEEP, e.KEEP, e.INCR), K[this._mask._renderer.type].render.call(this._mask, e, t, this), e.colorMask(!0, !0, !0, !0), e.stencilFunc(e.NOTEQUAL, 0, 1), e.stencilOp(e.KEEP, e.KEEP, e.KEEP)), this._flagOpacity = i._flagOpacity || this._flagOpacity, this._renderer.opacity = this._opacity * (i && i._renderer ? i._renderer.opacity : 1), this._flagSubtractions)
                            for (var s = 0; s < this.subtractions.length; s++) K.group.removeChild(this.subtractions[s], e);
                        for (s = 0; s < this.children.length; s++) {
                            var o = this.children[s];
                            K[o._renderer.type].render.call(o, e, t)
                        }
                        return this.children.forEach(K.group.renderChild, {
                            gl: e
                            , program: t
                        }), this._mask && (e.colorMask(!1, !1, !1, !1), e.stencilOp(e.KEEP, e.KEEP, e.DECR), K[this._mask._renderer.type].render.call(this._mask, e, t, this), e.colorMask(!0, !0, !0, !0), e.stencilFunc(e.NOTEQUAL, 0, 1), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.disable(e.STENCIL_TEST)), this.flagReset()
                    }
                }
                , path: {
                    updateCanvas: function(e) {
                        var t, i, r, n, s, o, a, l, c, h, d, u, f, g, p, m = e._renderer.vertices
                            , v = this.canvas
                            , y = this.ctx
                            , _ = e._renderer.scale
                            , x = e._stroke
                            , b = e._linewidth
                            , w = e._fill
                            , S = e._renderer.opacity || e._opacity
                            , C = e._cap
                            , A = e._join
                            , k = e._miter
                            , M = e._closed
                            , P = e.dashes
                            , R = m.length
                            , E = R - 1;
                        v.width = Math.max(Math.ceil(e._renderer.rect.width * _), 1), v.height = Math.max(Math.ceil(e._renderer.rect.height * _), 1);
                        var T, B = e._renderer.rect.centroid
                            , F = B.x
                            , O = B.y;
                        y.clearRect(0, 0, v.width, v.height), w && (Y.isString(w) ? y.fillStyle = w : (K[w._renderer.type].render.call(w, y, e), y.fillStyle = w._renderer.effect)), x && (Y.isString(x) ? y.strokeStyle = x : (K[x._renderer.type].render.call(x, y, e), y.strokeStyle = x._renderer.effect)), b && (y.lineWidth = b), k && (y.miterLimit = k), A && (y.lineJoin = A), C && (y.lineCap = C), Y.isNumber(S) && (y.globalAlpha = S), P && 0 < P.length && y.setLineDash(P), y.save(), y.scale(_, _), y.translate(F, O), y.beginPath();
                        for (var I = 0; I < m.length; I++) {
                            var U = m[I];
                            switch (f = H(U.x), g = H(U.y), U.command) {
                                case W.Commands.close:
                                    y.closePath();
                                    break;
                                case W.Commands.arc:
                                    var L = U.rx
                                        , V = U.ry
                                        , N = U.xAxisRotation
                                        , j = U.largeArcFlag
                                        , G = U.sweepFlag;
                                    r = m[i = M ? z(I - 1, R) : max(I - 1, 0)];
                                    var q = H(r.x)
                                        , D = H(r.y);
                                    X.renderSvgArcCommand(y, q, D, L, V, j, G, N, f, g);
                                    break;
                                case W.Commands.curve:
                                    i = M ? z(I - 1, R) : Math.max(I - 1, 0), t = M ? z(I + 1, R) : Math.min(I + 1, E), r = m[i], n = m[t], c = r.controls && r.controls.right || W.Vector.zero, h = U.controls && U.controls.left || W.Vector.zero, l = r._relative ? (a = H(c.x + r.x), H(c.y + r.y)) : (a = H(c.x), H(c.y)), o = U._relative ? (s = H(h.x + U.x), H(h.y + U.y)) : (s = H(h.x), H(h.y)), y.bezierCurveTo(a, l, s, o, f, g), E <= I && M && (n = T, d = U.controls && U.controls.right || W.Vector.zero, u = n.controls && n.controls.left || W.Vector.zero, l = U._relative ? (a = H(d.x + U.x), H(d.y + U.y)) : (a = H(d.x), H(d.y)), o = n._relative ? (s = H(u.x + n.x), H(u.y + n.y)) : (s = H(u.x), H(u.y)), f = H(n.x), g = H(n.y), y.bezierCurveTo(a, l, s, o, f, g));
                                    break;
                                case W.Commands.line:
                                    y.lineTo(f, g);
                                    break;
                                case W.Commands.move:
                                    T = U, y.moveTo(f, g)
                            }
                        }
                        M && y.closePath(), K.isHidden.test(w) || ((p = w._renderer && w._renderer.offset) && (y.save(), y.translate(-w._renderer.offset.x, -w._renderer.offset.y), y.scale(w._renderer.scale.x, w._renderer.scale.y)), y.fill(), p && y.restore()), K.isHidden.test(x) || ((p = x._renderer && x._renderer.offset) && (y.save(), y.translate(-x._renderer.offset.x, -x._renderer.offset.y), y.scale(x._renderer.scale.x, x._renderer.scale.y), y.lineWidth = b / x._renderer.scale.x), y.stroke(), p && y.restore()), y.restore()
                    }
                    , getBoundingClientRect: function(e, t, i) {
                        var r, n, h = 1 / 0
                            , d = -1 / 0
                            , u = 1 / 0
                            , f = -1 / 0;
                        e.forEach(function(e) {
                            var t, i, r, n, s, o, a = e.x
                                , l = e.y
                                , c = e.controls;
                            u = Math.min(l, u), h = Math.min(a, h), d = Math.max(a, d), f = Math.max(l, f), e.controls && (s = c.left, o = c.right, s && o && (t = e._relative ? s.x + a : s.x, i = e._relative ? s.y + l : s.y, r = e._relative ? o.x + a : o.x, n = e._relative ? o.y + l : o.y, t && i && r && n && (u = Math.min(i, n, u), h = Math.min(t, r, h), d = Math.max(t, r, d), f = Math.max(i, n, f))))
                        }), Y.isNumber(t) && (u -= t, h -= t, d += t, f += t), r = d - h, n = f - u, i.top = u, i.left = h, i.right = d, i.bottom = f, i.width = r, i.height = n, i.centroid || (i.centroid = {}), i.centroid.x = -h, i.centroid.y = -u
                    }
                    , render: function(e, t, i) {
                        if (!this._visible || !this._opacity) return this;
                        this._update();
                        var r = this.parent
                            , n = r._matrix.manual || r._flagMatrix
                            , s = this._matrix.manual || this._flagMatrix
                            , o = this._flagVertices || this._flagFill || this._fill instanceof W.LinearGradient && (this._fill._flagSpread || this._fill._flagStops || this._fill._flagEndPoints) || this._fill instanceof W.RadialGradient && (this._fill._flagSpread || this._fill._flagStops || this._fill._flagRadius || this._fill._flagCenter || this._fill._flagFocal) || this._fill instanceof W.Texture && (this._fill._flagLoaded && this._fill.loaded || this._fill._flagImage || this._fill._flagVideo || this._fill._flagRepeat || this._fill._flagOffset || this._fill._flagScale) || this._stroke instanceof W.LinearGradient && (this._stroke._flagSpread || this._stroke._flagStops || this._stroke._flagEndPoints) || this._stroke instanceof W.RadialGradient && (this._stroke._flagSpread || this._stroke._flagStops || this._stroke._flagRadius || this._stroke._flagCenter || this._stroke._flagFocal) || this._stroke instanceof W.Texture && (this._stroke._flagLoaded && this._stroke.loaded || this._stroke._flagImage || this._stroke._flagVideo || this._stroke._flagRepeat || this._stroke._flagOffset || this._fill._flagScale) || this._flagStroke || this._flagLinewidth || this._flagOpacity || r._flagOpacity || this._flagVisible || this._flagCap || this._flagJoin || this._flagMiter || this._flagScale || this.dashes && 0 < this.dashes.length || !this._renderer.texture;
                        return (n || s) && (this._renderer.matrix || (this._renderer.matrix = new W.Array(9)), this._matrix.toArray(!0, l), a(l, r._renderer.matrix, this._renderer.matrix), this._renderer.scale = this._scale * r._renderer.scale), o ? (this._renderer.rect || (this._renderer.rect = {}), this._renderer.triangles || (this._renderer.triangles = new W.Array(12)), this._renderer.opacity = this._opacity * r._renderer.opacity, K.path.getBoundingClientRect(this._renderer.vertices, this._linewidth, this._renderer.rect), K.getTriangles(this._renderer.rect, this._renderer.triangles), K.updateBuffer.call(K, e, this, t), K.updateTexture.call(K, e, this)) : (Y.isString(this._fill) || this._fill._update(), Y.isString(this._stroke) || this._stroke._update()), !this._clip || i ? (e.bindBuffer(e.ARRAY_BUFFER, this._renderer.textureCoordsBuffer), e.vertexAttribPointer(t.textureCoords, 2, e.FLOAT, !1, 0, 0), e.bindTexture(e.TEXTURE_2D, this._renderer.texture), e.uniformMatrix3fv(t.matrix, !1, this._renderer.matrix), e.bindBuffer(e.ARRAY_BUFFER, this._renderer.buffer), e.vertexAttribPointer(t.position, 2, e.FLOAT, !1, 0, 0), e.drawArrays(e.TRIANGLES, 0, 6), this.flagReset()) : void 0
                    }
                }
                , text: {
                    updateCanvas: function(e) {
                        var t = this.canvas
                            , i = this.ctx
                            , r = e._renderer.scale
                            , n = e._stroke
                            , s = e._linewidth * r
                            , o = e._fill
                            , a = e._renderer.opacity || e._opacity
                            , l = e.dashes;
                        t.width = Math.max(Math.ceil(e._renderer.rect.width * r), 1), t.height = Math.max(Math.ceil(e._renderer.rect.height * r), 1);
                        var c, h, d, u, f, g, p, m = e._renderer.rect.centroid
                            , v = m.x
                            , y = m.y
                            , _ = o._renderer && o._renderer.offset && n._renderer && n._renderer.offset;
                        i.clearRect(0, 0, t.width, t.height), _ || (i.font = [e._style, e._weight, e._size + "px/" + e._leading + "px", e._family].join(" ")), i.textAlign = "center", i.textBaseline = "middle", o && (Y.isString(o) ? i.fillStyle = o : (K[o._renderer.type].render.call(o, i, e), i.fillStyle = o._renderer.effect)), n && (Y.isString(n) ? i.strokeStyle = n : (K[n._renderer.type].render.call(n, i, e), i.strokeStyle = n._renderer.effect)), s && (i.lineWidth = s), Y.isNumber(a) && (i.globalAlpha = a), l && 0 < l.length && i.setLineDash(l), i.save(), i.scale(r, r), i.translate(v, y), K.isHidden.test(o) || (o._renderer && o._renderer.offset ? (g = H(o._renderer.scale.x), p = H(o._renderer.scale.y), i.save(), i.translate(-H(o._renderer.offset.x), -H(o._renderer.offset.y)), i.scale(g, p), c = e._size / o._renderer.scale.y, h = e._leading / o._renderer.scale.y, i.font = [e._style, e._weight, H(c) + "px/", H(h) + "px", e._family].join(" "), d = o._renderer.offset.x / o._renderer.scale.x, u = o._renderer.offset.y / o._renderer.scale.y, i.fillText(e.value, H(d), H(u)), i.restore()) : i.fillText(e.value, 0, 0)), K.isHidden.test(n) || (n._renderer && n._renderer.offset ? (g = H(n._renderer.scale.x), p = H(n._renderer.scale.y), i.save(), i.translate(-H(n._renderer.offset.x), -H(n._renderer.offset.y)), i.scale(g, p), c = e._size / n._renderer.scale.y, h = e._leading / n._renderer.scale.y, i.font = [e._style, e._weight, H(c) + "px/", H(h) + "px", e._family].join(" "), d = n._renderer.offset.x / n._renderer.scale.x, u = n._renderer.offset.y / n._renderer.scale.y, f = s / n._renderer.scale.x, i.lineWidth = H(f), i.strokeText(e.value, H(d), H(u)), i.restore()) : i.strokeText(e.value, 0, 0)), i.restore()
                    }
                    , getBoundingClientRect: function(e, t) {
                        var i = K.ctx;
                        i.font = [e._style, e._weight, e._size + "px/" + e._leading + "px", e._family].join(" "), i.textAlign = "center", i.textBaseline = e._baseline;
                        var r = 1.25 * i.measureText(e._value)
                            .width
                            , n = 1.25 * Math.max(e._size, e._leading);
                        this._linewidth && !K.isHidden.test(this._stroke) && (r += 2 * this._linewidth, n += 2 * this._linewidth);
                        var s = r / 2
                            , o = n / 2;
                        switch (K.alignments[e._alignment] || e._alignment) {
                            case K.alignments.left:
                                t.left = 0, t.right = r;
                                break;
                            case K.alignments.right:
                                t.left = -r, t.right = 0;
                                break;
                            default:
                                t.left = -s, t.right = s
                        }
                        switch (e._baseline) {
                            case "bottom":
                                t.top = -n, t.bottom = 0;
                                break;
                            case "top":
                                t.top = 0, t.bottom = n;
                                break;
                            default:
                                t.top = -o, t.bottom = o
                        }
                        t.width = r, t.height = n, t.centroid || (t.centroid = {}), t.centroid.x = s, t.centroid.y = o
                    }
                    , render: function(e, t, i) {
                        if (!this._visible || !this._opacity) return this;
                        this._update();
                        var r = this.parent
                            , n = r._matrix.manual || r._flagMatrix
                            , s = this._matrix.manual || this._flagMatrix
                            , o = this._flagVertices || this._flagFill || this._fill instanceof W.LinearGradient && (this._fill._flagSpread || this._fill._flagStops || this._fill._flagEndPoints) || this._fill instanceof W.RadialGradient && (this._fill._flagSpread || this._fill._flagStops || this._fill._flagRadius || this._fill._flagCenter || this._fill._flagFocal) || this._fill instanceof W.Texture && (this._fill._flagLoaded && this._fill.loaded || this._fill._flagImage || this._fill._flagVideo || this._fill._flagRepeat || this._fill._flagOffset || this._fill._flagScale) || this._stroke instanceof W.LinearGradient && (this._stroke._flagSpread || this._stroke._flagStops || this._stroke._flagEndPoints) || this._stroke instanceof W.RadialGradient && (this._stroke._flagSpread || this._stroke._flagStops || this._stroke._flagRadius || this._stroke._flagCenter || this._stroke._flagFocal) || this._stroke instanceof W.Texture && (this._stroke._flagLoaded && this._stroke.loaded || this._stroke._flagImage || this._stroke._flagVideo || this._stroke._flagRepeat || this._stroke._flagOffset || this._fill._flagScale) || this._flagStroke || this._flagLinewidth || this._flagOpacity || r._flagOpacity || this._flagVisible || this._flagScale || this._flagValue || this._flagFamily || this._flagSize || this._flagLeading || this._flagAlignment || this._flagBaseline || this._flagStyle || this._flagWeight || this._flagDecoration || this.dashes && 0 < this.dashes.length || !this._renderer.texture;
                        return (n || s) && (this._renderer.matrix || (this._renderer.matrix = new W.Array(9)), this._matrix.toArray(!0, l), a(l, r._renderer.matrix, this._renderer.matrix), this._renderer.scale = this._scale * r._renderer.scale), o ? (this._renderer.rect || (this._renderer.rect = {}), this._renderer.triangles || (this._renderer.triangles = new W.Array(12)), this._renderer.opacity = this._opacity * r._renderer.opacity, K.text.getBoundingClientRect(this, this._renderer.rect), K.getTriangles(this._renderer.rect, this._renderer.triangles), K.updateBuffer.call(K, e, this, t), K.updateTexture.call(K, e, this)) : (Y.isString(this._fill) || this._fill._update(), Y.isString(this._stroke) || this._stroke._update()), !this._clip || i ? (e.bindBuffer(e.ARRAY_BUFFER, this._renderer.textureCoordsBuffer), e.vertexAttribPointer(t.textureCoords, 2, e.FLOAT, !1, 0, 0), e.bindTexture(e.TEXTURE_2D, this._renderer.texture), e.uniformMatrix3fv(t.matrix, !1, this._renderer.matrix), e.bindBuffer(e.ARRAY_BUFFER, this._renderer.buffer), e.vertexAttribPointer(t.position, 2, e.FLOAT, !1, 0, 0), e.drawArrays(e.TRIANGLES, 0, 6), this.flagReset()) : void 0
                    }
                }
                , "linear-gradient": {
                    render: function(e, t) {
                        if (e.canvas.getContext("2d")) {
                            if (this._update(), !this._renderer.effect || this._flagEndPoints || this._flagStops) {
                                this._renderer.effect = e.createLinearGradient(this.left._x, this.left._y, this.right._x, this.right._y);
                                for (var i = 0; i < this.stops.length; i++) {
                                    var r = this.stops[i];
                                    this._renderer.effect.addColorStop(r._offset, r._color)
                                }
                            }
                            return this.flagReset()
                        }
                    }
                }
                , "radial-gradient": {
                    render: function(e, t) {
                        if (e.canvas.getContext("2d")) {
                            if (this._update(), !this._renderer.effect || this._flagCenter || this._flagFocal || this._flagRadius || this._flagStops) {
                                this._renderer.effect = e.createRadialGradient(this.center._x, this.center._y, 0, this.focal._x, this.focal._y, this._radius);
                                for (var i = 0; i < this.stops.length; i++) {
                                    var r = this.stops[i];
                                    this._renderer.effect.addColorStop(r._offset, r._color)
                                }
                            }
                            return this.flagReset()
                        }
                    }
                }
                , texture: {
                    render: function(e, t) {
                        if (e.canvas.getContext("2d")) {
                            this._update();
                            var i = this.image;
                            if ((this._flagLoaded || this._flagImage || this._flagVideo || this._flagRepeat) && this.loaded) this._renderer.effect = e.createPattern(i, this._repeat);
                            else if (!this._renderer.effect) return this.flagReset();
                            return (this._flagOffset || this._flagLoaded || this._flagScale) && (this._renderer.offset instanceof W.Vector || (this._renderer.offset = new W.Vector), this._renderer.offset.x = -this._offset.x, this._renderer.offset.y = -this._offset.y, i && (this._renderer.offset.x += i.width / 2, this._renderer.offset.y += i.height / 2, this._scale instanceof W.Vector ? (this._renderer.offset.x *= this._scale.x, this._renderer.offset.y *= this._scale.y) : (this._renderer.offset.x *= this._scale, this._renderer.offset.y *= this._scale))), (this._flagScale || this._flagLoaded) && (this._renderer.scale instanceof W.Vector || (this._renderer.scale = new W.Vector), this._scale instanceof W.Vector ? this._renderer.scale.copy(this._scale) : this._renderer.scale.set(this._scale, this._scale)), this.flagReset()
                        }
                    }
                }
                , getTriangles: function(e, t) {
                    var i = e.top
                        , r = e.left
                        , n = e.right
                        , s = e.bottom;
                    t[0] = r, t[1] = i, t[2] = n, t[3] = i, t[4] = r, t[5] = s, t[6] = r, t[7] = s, t[8] = n, t[9] = i, t[10] = n, t[11] = s
                }
                , updateTexture: function(e, t) {
                    this[t._renderer.type].updateCanvas.call(K, t), t._renderer.texture && e.deleteTexture(t._renderer.texture), e.bindBuffer(e.ARRAY_BUFFER, t._renderer.textureCoordsBuffer), t._renderer.texture = e.createTexture(), e.bindTexture(e.TEXTURE_2D, t._renderer.texture), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), this.canvas.width <= 0 || this.canvas.height <= 0 || e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, this.canvas)
                }
                , updateBuffer: function(e, t, i) {
                    Y.isObject(t._renderer.buffer) && e.deleteBuffer(t._renderer.buffer), t._renderer.buffer = e.createBuffer(), e.bindBuffer(e.ARRAY_BUFFER, t._renderer.buffer), e.enableVertexAttribArray(i.position), e.bufferData(e.ARRAY_BUFFER, t._renderer.triangles, e.STATIC_DRAW), Y.isObject(t._renderer.textureCoordsBuffer) && e.deleteBuffer(t._renderer.textureCoordsBuffer), t._renderer.textureCoordsBuffer = e.createBuffer(), e.bindBuffer(e.ARRAY_BUFFER, t._renderer.textureCoordsBuffer), e.enableVertexAttribArray(i.textureCoords), e.bufferData(e.ARRAY_BUFFER, this.uv, e.STATIC_DRAW)
                }
                , program: {
                    create: function(t, e) {
                        var i, r;
                        if (i = t.createProgram(), Y.each(e, function(e) {
                                t.attachShader(i, e)
                            }), t.linkProgram(i), !t.getProgramParameter(i, t.LINK_STATUS)) throw r = t.getProgramInfoLog(i), t.deleteProgram(i), new W.Utils.Error("unable to link program: " + r);
                        return i
                    }
                }
                , shaders: {
                    create: function(e, t, i) {
                        var r, n;
                        if (r = e.createShader(e[i]), e.shaderSource(r, t), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) throw n = e.getShaderInfoLog(r), e.deleteShader(r), new W.Utils.Error("unable to compile shader " + r + ": " + n);
                        return r
                    }
                    , types: {
                        vertex: "VERTEX_SHADER"
                        , fragment: "FRAGMENT_SHADER"
                    }
                    , vertex: ["attribute vec2 a_position;", "attribute vec2 a_textureCoords;", "", "uniform mat3 u_matrix;", "uniform vec2 u_resolution;", "", "varying vec2 v_textureCoords;", "", "void main() {", "   vec2 projected = (u_matrix * vec3(a_position, 1.0)).xy;", "   vec2 normal = projected / u_resolution;", "   vec2 clipspace = (normal * 2.0) - 1.0;", "", "   gl_Position = vec4(clipspace * vec2(1.0, -1.0), 0.0, 1.0);", "   v_textureCoords = a_textureCoords;", "}"].join("\n")
                    , fragment: ["precision mediump float;", "", "uniform sampler2D u_image;", "varying vec2 v_textureCoords;", "", "void main() {", "  gl_FragColor = texture2D(u_image, v_textureCoords);", "}"].join("\n")
                }
                , TextureRegistry: new W.Registry
            };
        K.ctx = K.canvas.getContext("2d");
        var t = W[W.Types.webgl] = function(e) {
            var t, i, r, n;
            if (this.domElement = e.domElement || document.createElement("canvas"), Y.isUndefined(e.offscreenElement) || (K.canvas = e.offscreenElement, K.ctx = K.canvas.getContext("2d")), this.scene = new W.Group, (this.scene.parent = this)
                ._renderer = {
                    matrix: new W.Array(s)
                    , scale: 1
                    , opacity: 1
                }, this._flagMatrix = !0, t = Y.defaults(e || {}, {
                    antialias: !1
                    , alpha: !0
                    , premultipliedAlpha: !0
                    , stencil: !0
                    , preserveDrawingBuffer: !0
                    , overdraw: !1
                }), this.overdraw = t.overdraw, i = this.ctx = this.domElement.getContext("webgl", t) || this.domElement.getContext("experimental-webgl", t), !this.ctx) throw new W.Utils.Error("unable to create a webgl context. Try using another renderer.");
            r = K.shaders.create(i, K.shaders.vertex, K.shaders.types.vertex), n = K.shaders.create(i, K.shaders.fragment, K.shaders.types.fragment), this.program = K.program.create(i, [r, n]), i.useProgram(this.program), this.program.position = i.getAttribLocation(this.program, "a_position"), this.program.matrix = i.getUniformLocation(this.program, "u_matrix"), this.program.textureCoords = i.getAttribLocation(this.program, "a_textureCoords"), i.disable(i.DEPTH_TEST), i.enable(i.BLEND), i.blendEquationSeparate(i.FUNC_ADD, i.FUNC_ADD), i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA)
        };
        Y.extend(t, {
            Utils: K
        }), Y.extend(t.prototype, W.Utils.Events, {
            constructor: t
            , setSize: function(e, t, i) {
                this.width = e, this.height = t, this.ratio = Y.isUndefined(i) ? n(this.ctx) : i, this.domElement.width = e * this.ratio, this.domElement.height = t * this.ratio, Y.isObject(this.domElement.style) && Y.extend(this.domElement.style, {
                    width: e + "px"
                    , height: t + "px"
                }), e *= this.ratio, t *= this.ratio, this._renderer.matrix[0] = this._renderer.matrix[4] = this._renderer.scale = this.ratio, this._flagMatrix = !0, this.ctx.viewport(0, 0, e, t);
                var r = this.ctx.getUniformLocation(this.program, "u_resolution");
                return this.ctx.uniform2f(r, e, t), this.trigger(W.Events.resize, e, t, i)
            }
            , render: function() {
                var e = this.ctx;
                return this.overdraw || e.clear(e.COLOR_BUFFER_BIT | e.DEPTH_BUFFER_BIT), K.group.render.call(this.scene, e, this.program), this._flagMatrix = !1, this
            }
        })
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(i) {
        var e = i.Utils
            , r = i.Shape = function() {
                this._renderer = {}, this._renderer.flagMatrix = e.bind(r.FlagMatrix, this), this.isShape = !0, this.id = i.Identifier + i.uniqueId(), this.classList = [], this._matrix = new i.Matrix, this.translation = new i.Vector, this.rotation = 0, this.scale = 1
            };
        e.extend(r, {
            FlagMatrix: function() {
                this._flagMatrix = !0
            }
            , MakeObservable: function(e) {
                var t = {
                    enumerable: !1
                    , get: function() {
                        return this._translation
                    }
                    , set: function(e) {
                        this._translation && this._translation.unbind(i.Events.change, this._renderer.flagMatrix), this._translation = e, this._translation.bind(i.Events.change, this._renderer.flagMatrix), r.FlagMatrix.call(this)
                    }
                };
                Object.defineProperty(e, "translation", t), Object.defineProperty(e, "position", t), Object.defineProperty(e, "rotation", {
                    enumerable: !0
                    , get: function() {
                        return this._rotation
                    }
                    , set: function(e) {
                        this._rotation = e, this._flagMatrix = !0
                    }
                }), Object.defineProperty(e, "scale", {
                    enumerable: !0
                    , get: function() {
                        return this._scale
                    }
                    , set: function(e) {
                        this._scale instanceof i.Vector && this._scale.unbind(i.Events.change, this._renderer.flagMatrix), this._scale = e, this._scale instanceof i.Vector && this._scale.bind(i.Events.change, this._renderer.flagMatrix), this._flagMatrix = !0, this._flagScale = !0
                    }
                })
            }
        }), e.extend(r.prototype, i.Utils.Events, {
            _flagMatrix: !0
            , _flagScale: !1
            , _translation: null
            , _rotation: 0
            , _scale: 1
            , constructor: r
            , addTo: function(e) {
                return e.add(this), this
            }
            , clone: function(e) {
                var t = new r;
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, e && e.add(t), t._update()
            }
            , _update: function(e) {
                return !this._matrix.manual && this._flagMatrix && (this._matrix.identity()
                    .translate(this.translation.x, this.translation.y), this._scale instanceof i.Vector ? this._matrix.scale(this._scale.x, this._scale.y) : this._matrix.scale(this._scale), this._matrix.rotate(this.rotation)), e && this.parent && this.parent._update && this.parent._update(), this
            }
            , flagReset: function() {
                return this._flagMatrix = this._flagScale = !1, this
            }
        }), r.MakeObservable(r.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(I) {
        var g = Math.min
            , p = Math.max
            , m = (Math.round, Math.ceil)
            , y = Math.floor
            , _ = I.Utils.getComputedMatrix
            , i = {}
            , U = I.Utils;
        U.each(I.Commands, function(e, t) {
            i[t] = new RegExp(e)
        });
        var n = I.Path = function(e, t, i, r) {
            I.Shape.call(this), this._renderer.type = "path", this._renderer.flagVertices = U.bind(n.FlagVertices, this), this._renderer.bindVertices = U.bind(n.BindVertices, this), this._renderer.unbindVertices = U.bind(n.UnbindVertices, this), this._renderer.flagFill = U.bind(n.FlagFill, this), this._renderer.flagStroke = U.bind(n.FlagStroke, this), this._renderer.vertices = [], this._renderer.collection = [], this._closed = !!t, this._curved = !!i, this.beginning = 0, this.ending = 1, this.fill = "#fff", this.stroke = "white", this.linewidth = 1, this.opacity = 1, this.className = "", this.visible = !0, this.cap = "butt", this.join = "miter", this.miter = 4, this.vertices = e, this.automatic = !r, this.dashes = []
        };

        function x(e, t) {
            if (0 === t || 1 === t) return !0;
            for (var i = e._length * t, r = 0, n = 0; n < e._lengths.length; n++) {
                var s = e._lengths[n];
                if (i <= r) return 0 <= i - r;
                r += s
            }
            return !1
        }

        function b(e, t) {
            var i = e._length;
            if (t <= 0) return 0;
            if (i <= t) return e._lengths.length - 1;
            for (var r = 0, n = 0; r < e._lengths.length; r++) {
                if (n + e._lengths[r] >= t) return t -= n, Math.max(r - 1, 0) + t / e._lengths[r];
                n += e._lengths[r]
            }
            return -1
        }

        function o(e, t, i) {
            var r, n, s, o, a, l, c, h, d = t.controls && t.controls.right
                , u = e.controls && e.controls.left;
            return r = t.x, a = t.y, n = (d || t)
                .x, l = (d || t)
                .y, s = (u || e)
                .x, c = (u || e)
                .y, o = e.x, h = e.y, d && t._relative && (n += t.x, l += t.y), u && e._relative && (s += e.x, c += e.y), I.Utils.getCurveLength(r, a, n, l, s, c, o, h, i)
        }

        function l(e, t, i) {
            var r, n, s, o, a, l, c, h, d = t.controls && t.controls.right
                , u = e.controls && e.controls.left;
            return r = t.x, a = t.y, n = (d || t)
                .x, l = (d || t)
                .y, s = (u || e)
                .x, c = (u || e)
                .y, o = e.x, h = e.y, d && t._relative && (n += t.x, l += t.y), u && e._relative && (s += e.x, c += e.y), I.Utils.subdivide(r, a, n, l, s, c, o, h, i)
        }
        U.extend(n, {
            Properties: ["fill", "stroke", "linewidth", "opacity", "className", "visible", "cap", "join", "miter", "closed", "curved", "automatic", "beginning", "ending"]
            , Utils: {
                getCurveLength: o
            }
            , FlagVertices: function() {
                this._flagVertices = !0, this._flagLength = !0, this.parent && (this.parent._flagLength = !0)
            }
            , BindVertices: function(e) {
                for (var t = e.length; t--;) e[t].bind(I.Events.change, this._renderer.flagVertices);
                this._renderer.flagVertices()
            }
            , UnbindVertices: function(e) {
                for (var t = e.length; t--;) e[t].unbind(I.Events.change, this._renderer.flagVertices);
                this._renderer.flagVertices()
            }
            , FlagFill: function() {
                this._flagFill = !0
            }
            , FlagStroke: function() {
                this._flagStroke = !0
            }
            , MakeObservable: function(e) {
                I.Shape.MakeObservable(e), U.each(n.Properties.slice(2, 9), I.Utils.defineProperty, e), Object.defineProperty(e, "fill", {
                    enumerable: !0
                    , get: function() {
                        return this._fill
                    }
                    , set: function(e) {
                        (this._fill instanceof I.Gradient || this._fill instanceof I.LinearGradient || this._fill instanceof I.RadialGradient || this._fill instanceof I.Texture) && this._fill.unbind(I.Events.change, this._renderer.flagFill), this._fill = e, this._flagFill = !0, (this._fill instanceof I.Gradient || this._fill instanceof I.LinearGradient || this._fill instanceof I.RadialGradient || this._fill instanceof I.Texture) && this._fill.bind(I.Events.change, this._renderer.flagFill)
                    }
                }), Object.defineProperty(e, "stroke", {
                    enumerable: !0
                    , get: function() {
                        return this._stroke
                    }
                    , set: function(e) {
                        (this._stroke instanceof I.Gradient || this._stroke instanceof I.LinearGradient || this._stroke instanceof I.RadialGradient || this._stroke instanceof I.Texture) && this._stroke.unbind(I.Events.change, this._renderer.flagStroke), this._stroke = e, this._flagStroke = !0, (this._stroke instanceof I.Gradient || this._stroke instanceof I.LinearGradient || this._stroke instanceof I.RadialGradient || this._stroke instanceof I.Texture) && this._stroke.bind(I.Events.change, this._renderer.flagStroke)
                    }
                }), Object.defineProperty(e, "length", {
                    get: function() {
                        return this._flagLength && this._updateLength(), this._length
                    }
                }), Object.defineProperty(e, "closed", {
                    enumerable: !0
                    , get: function() {
                        return this._closed
                    }
                    , set: function(e) {
                        this._closed = !!e, this._flagVertices = !0
                    }
                }), Object.defineProperty(e, "curved", {
                    enumerable: !0
                    , get: function() {
                        return this._curved
                    }
                    , set: function(e) {
                        this._curved = !!e, this._flagVertices = !0
                    }
                }), Object.defineProperty(e, "automatic", {
                    enumerable: !0
                    , get: function() {
                        return this._automatic
                    }
                    , set: function(e) {
                        if (e !== this._automatic) {
                            this._automatic = !!e;
                            var t = this._automatic ? "ignore" : "listen";
                            U.each(this.vertices, function(e) {
                                e[t]()
                            })
                        }
                    }
                }), Object.defineProperty(e, "beginning", {
                    enumerable: !0
                    , get: function() {
                        return this._beginning
                    }
                    , set: function(e) {
                        this._beginning = e, this._flagVertices = !0
                    }
                }), Object.defineProperty(e, "ending", {
                    enumerable: !0
                    , get: function() {
                        return this._ending
                    }
                    , set: function(e) {
                        this._ending = e, this._flagVertices = !0
                    }
                }), Object.defineProperty(e, "vertices", {
                    enumerable: !0
                    , get: function() {
                        return this._collection
                    }
                    , set: function(e) {
                        this._renderer.flagVertices;
                        var t = this._renderer.bindVertices
                            , i = this._renderer.unbindVertices;
                        this._collection && this._collection.unbind(I.Events.insert, t)
                            .unbind(I.Events.remove, i), e instanceof I.Utils.Collection ? this._collection = e : this._collection = new I.Utils.Collection(e || []), this._collection.bind(I.Events.insert, t)
                            .bind(I.Events.remove, i), t(this._collection)
                    }
                }), Object.defineProperty(e, "clip", {
                    enumerable: !0
                    , get: function() {
                        return this._clip
                    }
                    , set: function(e) {
                        this._clip = e, this._flagClip = !0
                    }
                })
            }
        }), U.extend(n.prototype, I.Shape.prototype, {
            _flagVertices: !0
            , _flagLength: !0
            , _flagFill: !0
            , _flagStroke: !0
            , _flagLinewidth: !0
            , _flagOpacity: !0
            , _flagVisible: !0
            , _flagClassName: !0
            , _flagCap: !0
            , _flagJoin: !0
            , _flagMiter: !0
            , _flagClip: !1
            , _length: 0
            , _fill: "#fff"
            , _stroke: "white"
            , _linewidth: 1
            , _opacity: 1
            , _className: ""
            , _visible: !0
            , _cap: "round"
            , _join: "round"
            , _miter: 4
            , _closed: !0
            , _curved: !1
            , _automatic: !0
            , _beginning: 0
            , _ending: 1
            , _clip: !1
            , constructor: n
            , clone: function(e) {
                var t = new n;
                t.vertices = this.vertices;
                for (var i = 0; i < n.Properties.length; i++) {
                    var r = n.Properties[i];
                    t[r] = this[r]
                }
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, e && e.add(t), t._update()
            }
            , toObject: function() {
                var t = {
                    vertices: U.map(this.vertices, function(e) {
                        return e.toObject()
                    })
                };
                return U.each(I.Shape.Properties, function(e) {
                    t[e] = this[e]
                }, this), t.translation = this.translation.toObject(), t.rotation = this.rotation, t.scale = this.scale instanceof I.Vector ? this.scale.toObject() : this.scale, t
            }
            , noFill: function() {
                return this.fill = "transparent", this
            }
            , noStroke: function() {
                return this.stroke = "transparent", this
            }
            , corner: function() {
                var t = this.getBoundingClientRect(!0);
                return t.centroid = {
                    x: t.left + t.width / 2
                    , y: t.top + t.height / 2
                }, U.each(this.vertices, function(e) {
                    e.addSelf(t.centroid)
                }), this
            }
            , center: function() {
                var t = this.getBoundingClientRect(!0);
                return t.centroid = {
                    x: t.left + t.width / 2
                    , y: t.top + t.height / 2
                }, U.each(this.vertices, function(e) {
                    e.subSelf(t.centroid)
                }), this
            }
            , remove: function() {
                return this.parent && this.parent.remove(this), this
            }
            , getBoundingClientRect: function(e) {
                var t, i, r, n, s, o, a, l, c = 1 / 0
                    , h = -1 / 0
                    , d = 1 / 0
                    , u = -1 / 0;
                if (this._update(!0), t = e ? this._matrix : _(this), i = this.linewidth / 2, (r = this._renderer.vertices.length) <= 0) return v = t.multiply(0, 0, 1), {
                    top: v.y
                    , left: v.x
                    , right: v.x
                    , bottom: v.y
                    , width: 0
                    , height: 0
                };
                for (n = 1; n < r; n++)
                    if (l = this._renderer.vertices[n], (s = this._renderer.vertices[n - 1])
                        .controls && l.controls) {
                        o = s.relative ? t.multiply(s.controls.right.x + s.x, s.controls.right.y + s.y, 1) : t.multiply(s.controls.right.x, s.controls.right.y, 1), s = t.multiply(s.x, s.y, 1), a = l.relative ? t.multiply(l.controls.left.x + l.x, l.controls.left.y + l.y, 1) : t.multiply(l.controls.left.x, l.controls.left.y, 1), l = t.multiply(l.x, l.y, 1);
                        var f = I.Utils.getCurveBoundingBox(s.x, s.y, o.x, o.y, a.x, a.y, l.x, l.y);
                        d = g(f.min.y - i, d), c = g(f.min.x - i, c), h = p(f.max.x + i, h), u = p(f.max.y + i, u)
                    } else n <= 1 && (s = t.multiply(s.x, s.y, 1), d = g(s.y - i, d), c = g(s.x - i, c), h = p(s.x + i, h), u = p(s.y + i, u)), l = t.multiply(l.x, l.y, 1), d = g(l.y - i, d), c = g(l.x - i, c), h = p(l.x + i, h), u = p(l.y + i, u);
                return {
                    top: d
                    , left: c
                    , right: h
                    , bottom: u
                    , width: h - c
                    , height: u - d
                }
            }
            , getPointAt: function(e, t) {
                for (var i, r, n, s, o, a, l, c, h, d, u, f, g, p, m, v = this.length * Math.min(Math.max(e, 0), 1), y = this.vertices.length, _ = y - 1, x = null, b = null, w = 0, S = this._lengths.length, C = 0; w < S; w++) {
                    if (C + this._lengths[w] >= v) {
                        this._closed ? (i = I.Utils.mod(w, y), r = I.Utils.mod(w - 1, y), 0 === w && (i = r, r = w)) : (i = w, r = Math.min(Math.max(w - 1, 0), _)), x = this.vertices[i], b = this.vertices[r], v -= C, e = 0 !== this._lengths[w] ? v / this._lengths[w] : 0;
                        break
                    }
                    C += this._lengths[w]
                }
                if (U.isNull(x) || U.isNull(b)) return null;
                if (!x) return b;
                if (!b) return x;
                m = b.controls && b.controls.right, p = x.controls && x.controls.left, o = b.x, d = b.y, a = (m || b)
                    .x, u = (m || b)
                    .y, l = (p || x)
                    .x, f = (p || x)
                    .y, c = x.x, g = x.y, m && b.relative && (a += b.x, u += b.y), p && x.relative && (l += x.x, f += x.y), s = I.Utils.getComponentOnCubicBezier(e, o, a, l, c), h = I.Utils.getComponentOnCubicBezier(e, d, u, f, g);
                var A = I.Utils.lerp(o, a, e)
                    , k = I.Utils.lerp(d, u, e)
                    , M = I.Utils.lerp(a, l, e)
                    , P = I.Utils.lerp(u, f, e)
                    , R = I.Utils.lerp(l, c, e)
                    , E = I.Utils.lerp(f, g, e)
                    , T = I.Utils.lerp(A, M, e)
                    , B = I.Utils.lerp(k, P, e)
                    , F = I.Utils.lerp(M, R, e)
                    , O = I.Utils.lerp(P, E, e);
                return U.isObject(t) ? (t.x = s, t.y = h, U.isObject(t.controls) || I.Anchor.AppendCurveProperties(t), t.controls.left.x = T, t.controls.left.y = B, t.controls.right.x = F, t.controls.right.y = O, U.isBoolean(t.relative) && !t.relative || (t.controls.left.x -= s, t.controls.left.y -= h, t.controls.right.x -= s, t.controls.right.y -= h), t.t = e, t) : ((n = new I.Anchor(s, h, T - s, B - h, F - s, O - h, this._curved ? I.Commands.curve : I.Commands.line))
                    .t = e, n)
            }
            , plot: function() {
                if (this.curved) return I.Utils.getCurveFromPoints(this._collection, this.closed), this;
                for (var e = 0; e < this._collection.length; e++) this._collection[e].command = 0 === e ? I.Commands.move : I.Commands.line;
                return this
            }
            , subdivide: function(r) {
                this._update();
                var n = this.vertices.length - 1
                    , s = this.vertices[n]
                    , o = this._closed || this.vertices[n]._command === I.Commands.close
                    , a = [];
                return U.each(this.vertices, function(e, t) {
                    if (t <= 0 && !o) s = e;
                    else {
                        if (e.command === I.Commands.move) return a.push(new I.Anchor(s.x, s.y)), 0 < t && (a[a.length - 1].command = I.Commands.line), void(s = e);
                        var i = l(e, s, r);
                        a = a.concat(i), U.each(i, function(e, t) {
                            t <= 0 && s.command === I.Commands.move ? e.command = I.Commands.move : e.command = I.Commands.line
                        }), n <= t && (this._closed && this._automatic ? (i = l(s = e, s, r), a = a.concat(i), U.each(i, function(e, t) {
                            t <= 0 && s.command === I.Commands.move ? e.command = I.Commands.move : e.command = I.Commands.line
                        })) : o && a.push(new I.Anchor(e.x, e.y)), a[a.length - 1].command = o ? I.Commands.close : I.Commands.line), s = e
                    }
                }, this), this._automatic = !1, this._curved = !1, this.vertices = a, this
            }
            , _updateLength: function(i, e) {
                e || this._update();
                var t = this.vertices.length
                    , r = t - 1
                    , n = this.vertices[r]
                    , s = 0;
                return U.isUndefined(this._lengths) && (this._lengths = []), U.each(this.vertices, function(e, t) {
                    if (t <= 0 || e.command === I.Commands.move) return n = e, void(this._lengths[t] = 0);
                    this._lengths[t] = o(e, n, i), this._lengths[t] = I.Utils.toFixed(this._lengths[t]), s += this._lengths[t], n = e
                }, this), this._length = s, this._flagLength = !1, this
            }
            , _update: function() {
                if (this._flagVertices) {
                    this._automatic && this.plot(), this._flagLength && this._updateLength(void 0, !0);
                    for (var e, t, i, r, n, s = this._collection.length, o = this._closed, a = Math.min(this._beginning, this._ending), l = Math.max(this._beginning, this._ending), c = b(this, a * this._length), h = b(this, l * this._length), d = m(c), u = y(h), f = this._renderer.vertices.length = 0; f < s; f++) this._renderer.collection.length <= f && this._renderer.collection.push(new I.Anchor), u < f && !t ? ((n = this._renderer.collection[f])
                        .copy(this._collection[f]), this.getPointAt(l, n), n.command = this._renderer.collection[f].command, this._renderer.vertices.push(n), t = n, (i = this._collection[f - 1]) && i.controls && (n.controls.right.clear(), this._renderer.collection[f - 1].controls.right.clear()
                            .lerp(i.controls.right, n.t))) : d <= f && f <= u && (n = this._renderer.collection[f].copy(this._collection[f]), this._renderer.vertices.push(n), f === u && x(this, l) ? (t = n, !o && t.controls && t.controls.right.clear()) : f === d && x(this, a) && ((e = n)
                        .command = I.Commands.move, !o && e.controls && e.controls.left.clear()));
                    0 < d && !e && (f = d - 1, (n = this._renderer.collection[f])
                        .copy(this._collection[f]), this.getPointAt(a, n), n.command = I.Commands.move, this._renderer.vertices.unshift(n), e = n, (r = this._collection[f + 1]) && r.controls && (n.controls.left.clear(), this._renderer.collection[f + 1].controls.left.copy(r.controls.left)
                            .lerp(I.Vector.zero, n.t)))
                }
                return I.Shape.prototype._update.apply(this, arguments), this
            }
            , flagReset: function() {
                return this._flagVertices = this._flagFill = this._flagStroke = this._flagLinewidth = this._flagOpacity = this._flagVisible = this._flagCap = this._flagJoin = this._flagMiter = this._flagClassName = this._flagClip = !1, I.Shape.prototype.flagReset.call(this), this
            }
        }), n.MakeObservable(n.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(n) {
        var s = n.Path
            , e = n.Utils
            , t = n.Line = function(e, t, i, r) {
                s.call(this, [new n.Anchor(e, t), new n.Anchor(i, r)]), this.vertices[0].command = n.Commands.move, this.vertices[1].command = n.Commands.line, this.automatic = !1
            };
        e.extend(t.prototype, s.prototype), t.prototype.constructor = t, s.MakeObservable(t.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(n) {
        var s = n.Path
            , i = n.Utils
            , r = n.Rectangle = function(e, t, i, r) {
                s.call(this, [new n.Anchor, new n.Anchor, new n.Anchor, new n.Anchor], !0, !1, !0), this.width = i, this.height = r, this.origin = new n.Vector, this.translation.set(e, t), this._update()
            };
        i.extend(r, {
            Properties: ["width", "height"]
            , MakeObservable: function(e) {
                s.MakeObservable(e), i.each(r.Properties, n.Utils.defineProperty, e), Object.defineProperty(e, "origin", {
                    enumerable: !0
                    , get: function() {
                        return this._origin
                    }
                    , set: function(e) {
                        this._origin && this._origin.unbind(n.Events.change, this._renderer.flagVertices), this._origin = e, this._origin.bind(n.Events.change, this._renderer.flagVertices), this._renderer.flagVertices()
                    }
                })
            }
        }), i.extend(r.prototype, s.prototype, {
            _width: 0
            , _height: 0
            , _flagWidth: 0
            , _flagHeight: 0
            , _origin: null
            , constructor: r
            , _update: function() {
                if (this._flagWidth || this._flagHeight) {
                    var e = this._width / 2
                        , t = this._height / 2;
                    this.vertices[0].set(-e, -t)
                        .add(this._origin)
                        .command = n.Commands.move, this.vertices[1].set(e, -t)
                        .add(this._origin)
                        .command = n.Commands.line, this.vertices[2].set(e, t)
                        .add(this._origin)
                        .command = n.Commands.line, this.vertices[3].set(-e, t)
                        .add(this._origin)
                        .command = n.Commands.line, this.vertices[4] && (this.vertices[4].set(-e, -t)
                            .add(this._origin)
                            .command = n.Commands.line)
                }
                return s.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagWidth = this._flagHeight = !1, s.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = new r(0, 0, this.width, this.height);
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, i.each(n.Path.Properties, function(e) {
                    t[e] = this[e]
                }, this), e && e.add(t), t
            }
        }), r.MakeObservable(r.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(d) {
        var u = d.Path
            , f = 2 * Math.PI
            , g = Math.PI / 2
            , p = Math.cos
            , m = Math.sin
            , a = d.Utils
            , v = 4 / 3 * Math.tan(Math.PI / 8)
            , s = d.Ellipse = function(e, t, i, r, n) {
                a.isNumber(r) || (r = i);
                var s = n || 5
                    , o = a.map(a.range(s), function(e) {
                        return new d.Anchor
                    }, this);
                u.call(this, o, !0, !0, !0), this.width = 2 * i, this.height = 2 * r, this._update(), this.translation.set(e, t)
            };
        a.extend(s, {
            Properties: ["width", "height"]
            , MakeObservable: function(e) {
                u.MakeObservable(e), a.each(s.Properties, d.Utils.defineProperty, e)
            }
        }), a.extend(s.prototype, u.prototype, {
            _width: 0
            , _height: 0
            , _flagWidth: !1
            , _flagHeight: !1
            , constructor: s
            , _update: function() {
                if (this._flagWidth || this._flagHeight)
                    for (var e = 0, t = this.vertices.length, i = t - 1; e < t; e++) {
                        var r = e / i * f
                            , n = this._width / 2
                            , s = this._height / 2
                            , o = (p(r), m(r), n * p(r))
                            , a = s * m(r)
                            , l = 0 === e ? 0 : n * v * p(r - g)
                            , c = 0 === e ? 0 : s * v * m(r - g)
                            , h = (n = e === i ? 0 : n * v * p(r + g), s = e === i ? 0 : s * v * m(r + g), this.vertices[e]);
                        h.command = 0 === e ? d.Commands.move : d.Commands.curve, h.set(o, a), h.controls.left.set(l, c), h.controls.right.set(n, s)
                    }
                return u.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagWidth = this._flagHeight = !1, u.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = this.width / 2
                    , i = this.height / 2
                    , r = this.vertices.length
                    , n = new s(0, 0, t, i, r);
                return n.translation.copy(this.translation), n.rotation = this.rotation, n.scale = this.scale, a.each(d.Path.Properties, function(e) {
                    n[e] = this[e]
                }, this), e && e.add(n), n
            }
        }), s.MakeObservable(s.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(f) {
        var g = f.Path
            , p = 2 * Math.PI
            , m = Math.PI / 2
            , v = Math.cos
            , y = Math.sin
            , o = f.Utils
            , _ = 4 / 3 * Math.tan(Math.PI / 8)
            , i = f.Circle = function(e, t, i, r) {
                var n = r || 5
                    , s = o.map(o.range(n), function(e) {
                        return new f.Anchor
                    }, this);
                g.call(this, s, !0, !0, !0), this.radius = i, this._update(), this.translation.set(e, t)
            };
        o.extend(i, {
            Properties: ["radius"]
            , MakeObservable: function(e) {
                g.MakeObservable(e), o.each(i.Properties, f.Utils.defineProperty, e)
            }
        }), o.extend(i.prototype, g.prototype, {
            _radius: 0
            , _flagRadius: !1
            , constructor: i
            , _update: function() {
                if (this._flagRadius)
                    for (var e = 0, t = this.vertices.length, i = t - 1; e < t; e++) {
                        var r = e / i * p
                            , n = this._radius
                            , s = (v(r), y(r), n * _)
                            , o = n * v(r)
                            , a = n * y(r)
                            , l = 0 === e ? 0 : s * v(r - m)
                            , c = 0 === e ? 0 : s * y(r - m)
                            , h = e === i ? 0 : s * v(r + m)
                            , d = e === i ? 0 : s * y(r + m)
                            , u = this.vertices[e];
                        u.command = 0 === e ? f.Commands.move : f.Commands.curve, u.set(o, a), u.controls.left.set(l, c), u.controls.right.set(h, d)
                    }
                return g.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagRadius = !1, g.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = new i(0, 0, this.radius, this.vertices.length);
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, o.each(f.Path.Properties, function(e) {
                    t[e] = this[e]
                }, this), e && e.add(t), t
            }
        }), i.MakeObservable(i.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(a) {
        var l = a.Path
            , c = 2 * Math.PI
            , h = Math.cos
            , d = Math.sin
            , i = a.Utils
            , r = a.Polygon = function(e, t, i, r) {
                r = Math.max(r || 0, 3), l.call(this), this.closed = !0, this.automatic = !1, this.width = 2 * i, this.height = 2 * i, this.sides = r, this._update(), this.translation.set(e, t)
            };
        i.extend(r, {
            Properties: ["width", "height", "sides"]
            , MakeObservable: function(e) {
                l.MakeObservable(e), i.each(r.Properties, a.Utils.defineProperty, e)
            }
        }), i.extend(r.prototype, l.prototype, {
            _width: 0
            , _height: 0
            , _sides: 0
            , _flagWidth: !1
            , _flagHeight: !1
            , _flagSides: !1
            , constructor: r
            , _update: function() {
                if (this._flagWidth || this._flagHeight || this._flagSides) {
                    var e = this._sides
                        , t = e + 1
                        , i = this.vertices.length;
                    e < i && (this.vertices.splice(e - 1, i - e), i = e);
                    for (var r = 0; r < t; r++) {
                        var n = c * ((r + .5) / e) + Math.PI / 2
                            , s = this._width * h(n) / 2
                            , o = this._height * d(n) / 2;
                        i <= r ? this.vertices.push(new a.Anchor(s, o)) : this.vertices[r].set(s, o), this.vertices[r].command = 0 === r ? a.Commands.move : a.Commands.line
                    }
                }
                return l.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagWidth = this._flagHeight = this._flagSides = !1, l.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = new r(0, 0, this.radius, this.sides);
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, i.each(a.Path.Properties, function(e) {
                    t[e] = this[e]
                }, this), e && e.add(t), t
            }
        }), r.MakeObservable(r.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(_) {
        var x = _.Path
            , b = (Math.PI, 2 * Math.PI)
            , w = Math.PI / 2
            , c = (Math.cos, Math.sin, Math.abs, _.Utils)
            , a = _.ArcSegment = function(e, t, i, r, n, s, o) {
                var a = o || 3 * _.Resolution
                    , l = c.map(c.range(a), function() {
                        return new _.Anchor
                    });
                x.call(this, l, !0, !1, !0), this.innerRadius = i, this.outerRadius = r, this.startAngle = n, this.endAngle = s, this._update(), this.translation.set(e, t)
            };

        function S(e, t) {
            for (; e < 0;) e += t;
            return e % t
        }
        c.extend(a, {
            Properties: ["startAngle", "endAngle", "innerRadius", "outerRadius"]
            , MakeObservable: function(e) {
                x.MakeObservable(e), c.each(a.Properties, _.Utils.defineProperty, e)
            }
        }), c.extend(a.prototype, x.prototype, {
            _flagStartAngle: !1
            , _flagEndAngle: !1
            , _flagInnerRadius: !1
            , _flagOuterRadius: !1
            , _startAngle: 0
            , _endAngle: b
            , _innerRadius: 0
            , _outerRadius: 0
            , constructor: a
            , _update: function() {
                if (this._flagStartAngle || this._flagEndAngle || this._flagInnerRadius || this._flagOuterRadius) {
                    var e, t = this._startAngle
                        , i = this._endAngle
                        , r = this._innerRadius
                        , n = this._outerRadius
                        , s = S(t, b) === S(i, b)
                        , o = 0 < r
                        , a = this.vertices
                        , l = o ? a.length / 2 : a.length
                        , c = 0;
                    s ? l-- : o || (l -= 2);
                    for (var h = 0, d = l - 1; h < l; h++) {
                        var u = h / d
                            , f = a[c]
                            , g = u * (i - t) + t
                            , p = (i - t) / l
                            , m = n * Math.cos(g)
                            , v = n * Math.sin(g);
                        switch (h) {
                            case 0:
                                e = _.Commands.move;
                                break;
                            default:
                                e = _.Commands.curve
                        }
                        if (f.command = e, f.x = m, f.y = v, f.controls.left.clear(), f.controls.right.clear(), f.command === _.Commands.curve) {
                            var y = n * p / Math.PI;
                            f.controls.left.x = y * Math.cos(g - w), f.controls.left.y = y * Math.sin(g - w), f.controls.right.x = y * Math.cos(g + w), f.controls.right.y = y * Math.sin(g + w), 1 === h && f.controls.left.multiplyScalar(2), h === d && f.controls.right.multiplyScalar(2)
                        }
                        c++
                    }
                    if (o) {
                        for (s ? (a[c].command = _.Commands.close, c++) : d = --l - 1, h = 0; h < l; h++) u = h / d, f = a[c], g = (1 - u) * (i - t) + t, p = (i - t) / l, m = r * Math.cos(g), v = r * Math.sin(g), e = _.Commands.curve, h <= 0 && (e = s ? _.Commands.move : _.Commands.line), f.command = e, f.x = m, f.y = v, f.controls.left.clear(), f.controls.right.clear(), f.command === _.Commands.curve && (y = r * p / Math.PI, f.controls.left.x = y * Math.cos(g + w), f.controls.left.y = y * Math.sin(g + w), f.controls.right.x = y * Math.cos(g - w), f.controls.right.y = y * Math.sin(g - w), 1 === h && f.controls.left.multiplyScalar(2), h === d && f.controls.right.multiplyScalar(2)), c++;
                        a[c].copy(a[0]), a[c].command = _.Commands.line
                    } else s || (a[c].command = _.Commands.line, a[c].x = 0, a[c].y = 0, a[++c].copy(a[0]), a[c].command = _.Commands.line)
                }
                return x.prototype._update.call(this), this
            }
            , flagReset: function() {
                return x.prototype.flagReset.call(this), this._flagStartAngle = this._flagEndAngle = this._flagInnerRadius = this._flagOuterRadius = !1, this
            }
            , clone: function(e) {
                var t = this.innerRadius
                    , i = this.outerradius
                    , r = this.startAngle
                    , n = this.endAngle
                    , s = this.vertices.length
                    , o = new a(0, 0, t, i, r, n, s);
                return o.translation.copy(this.translation), o.rotation = this.rotation, o.scale = this.scale, c.each(_.Path.Properties, function(e) {
                    o[e] = this[e]
                }, this), e && e.add(o), o
            }
        }), a.MakeObservable(a.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(l) {
        var c = l.Path
            , h = 2 * Math.PI
            , d = Math.cos
            , u = Math.sin
            , s = l.Utils
            , o = l.Star = function(e, t, i, r, n) {
                arguments.length <= 3 && (i = (r = i) / 2), (!s.isNumber(n) || n <= 0) && (n = 5);
                c.call(this), this.closed = !0, this.automatic = !1, this.innerRadius = i, this.outerRadius = r, this.sides = n, this._update(), this.translation.set(e, t)
            };
        s.extend(o, {
            Properties: ["innerRadius", "outerRadius", "sides"]
            , MakeObservable: function(e) {
                c.MakeObservable(e), s.each(o.Properties, l.Utils.defineProperty, e)
            }
        }), s.extend(o.prototype, c.prototype, {
            _innerRadius: 0
            , _outerRadius: 0
            , _sides: 0
            , _flagInnerRadius: !1
            , _flagOuterRadius: !1
            , _flagSides: !1
            , constructor: o
            , _update: function() {
                if (this._flagInnerRadius || this._flagOuterRadius || this._flagSides) {
                    var e = 2 * this._sides
                        , t = e + 1
                        , i = this.vertices.length;
                    e < i && (this.vertices.splice(e - 1, i - e), i = e);
                    for (var r = 0; r < t; r++) {
                        var n = h * ((r + .5) / e)
                            , s = (r % 2 ? this._outerRadius : this._innerRadius) / 2
                            , o = s * d(n)
                            , a = s * u(n);
                        i <= r ? this.vertices.push(new l.Anchor(o, a)) : this.vertices[r].set(o, a), this.vertices[r].command = 0 === r ? l.Commands.move : l.Commands.line
                    }
                }
                return c.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagInnerRadius = this._flagOuterRadius = this._flagSides = !1, c.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = this.innerRadius
                    , i = this.outerRadius
                    , r = this.sides
                    , n = new o(0, 0, t, i, r);
                return n.translation.copy(this.translation), n.rotation = this.rotation, n.scale = this.scale, s.each(l.Path.Properties, function(e) {
                    n[e] = this[e]
                }, this), e && e.add(n), n
            }
        }), o.MakeObservable(o.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(a) {
        var l = a.Path
            , o = a.Utils
            , c = a.RoundedRectangle = function(e, t, i, r, n) {
                o.isUndefined(n) && (n = Math.floor(Math.min(i, r) / 12));
                var s = o.map(o.range(10), function(e) {
                    return new a.Anchor(0, 0, 0, 0, 0, 0, 0 === e ? a.Commands.move : a.Commands.curve)
                });
                l.call(this, s), this.closed = !0, this.automatic = !1, this._renderer.flagRadius = o.bind(c.FlagRadius, this), this.width = i, this.height = r, this.radius = n, this._update(), this.translation.set(e, t)
            };
        o.extend(c, {
            Properties: ["width", "height"]
            , FlagRadius: function() {
                this._flagRadius = !0
            }
            , MakeObservable: function(e) {
                l.MakeObservable(e), o.each(c.Properties, a.Utils.defineProperty, e), Object.defineProperty(e, "radius", {
                    enumerable: !0
                    , get: function() {
                        return this._radius
                    }
                    , set: function(e) {
                        this._radius instanceof a.Vector && this._radius.unbind(a.Events.change, this._renderer.flagRadius), this._radius = e, this._radius instanceof a.Vector && this._radius.bind(a.Events.change, this._renderer.flagRadius), this._flagRadius = !0
                    }
                })
            }
        }), o.extend(c.prototype, l.prototype, {
            _width: 0
            , _height: 0
            , _radius: 0
            , _flagWidth: !1
            , _flagHeight: !1
            , _flagRadius: !1
            , constructor: c
            , _update: function() {
                if (this._flagWidth || this._flagHeight || this._flagRadius) {
                    var e, t, i, r = this._width
                        , n = this._height;
                    t = this._radius instanceof a.Vector ? (e = this._radius.x, this._radius.y) : (e = this._radius, this._radius);
                    var s = r / 2
                        , o = n / 2;
                    (i = this.vertices[0])
                    .x = -(s - e), i.y = -o, (i = this.vertices[1])
                        .x = s - e, i.y = -o, i.controls.left.clear(), i.controls.right.x = e, i.controls.right.y = 0, (i = this.vertices[2])
                        .x = s, i.y = -(o - t), i.controls.right.clear(), i.controls.left.clear(), (i = this.vertices[3])
                        .x = s, i.y = o - t, i.controls.left.clear(), i.controls.right.x = 0, i.controls.right.y = t, (i = this.vertices[4])
                        .x = s - e, i.y = o, i.controls.right.clear(), i.controls.left.clear(), (i = this.vertices[5])
                        .x = -(s - e), i.y = o, i.controls.left.clear(), i.controls.right.x = -e, i.controls.right.y = 0, (i = this.vertices[6])
                        .x = -s, i.y = o - t, i.controls.left.clear(), i.controls.right.clear(), (i = this.vertices[7])
                        .x = -s, i.y = -(o - t), i.controls.left.clear(), i.controls.right.x = 0, i.controls.right.y = -t, (i = this.vertices[8])
                        .x = -(s - e), i.y = -o, i.controls.left.clear(), i.controls.right.clear(), (i = this.vertices[9])
                        .copy(this.vertices[8])
                }
                return l.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagWidth = this._flagHeight = this._flagRadius = !1, l.prototype.flagReset.call(this), this
            }
            , clone: function(e) {
                var t = this.width
                    , i = this.height
                    , r = this.radius
                    , n = new c(0, 0, t, i, r);
                return n.translation.copy(this.translation), n.rotation = this.rotation, n.scale = this.scale, o.each(a.Path.Properties, function(e) {
                    n[e] = this[e]
                }, this), e && e.add(n), n
            }
        }), c.MakeObservable(c.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(n) {
        var e = n.root
            , c = n.Utils.getComputedMatrix
            , s = n.Utils
            , h = ((e.document ? e.document.createElement("canvas") : (console.warn("Two.js: Unable to create canvas for Two.Text measurements."), {
                    getContext: s.identity
                }))
                .getContext("2d"), n.Text = function(e, t, i, r) {
                    if (n.Shape.call(this), this._renderer.type = "text", this._renderer.flagFill = s.bind(n.Text.FlagFill, this), this._renderer.flagStroke = s.bind(n.Text.FlagStroke, this), this.value = e, s.isNumber(t) && (this.translation.x = t), s.isNumber(i) && (this.translation.y = i), this.dashes = [], !s.isObject(r)) return this;
                    s.each(n.Text.Properties, function(e) {
                        e in r && (this[e] = r[e])
                    }, this)
                });
        s.extend(n.Text, {
            Ratio: .6
            , Properties: ["value", "family", "size", "leading", "alignment", "linewidth", "style", "className", "weight", "decoration", "baseline", "opacity", "visible", "fill", "stroke"]
            , FlagFill: function() {
                this._flagFill = !0
            }
            , FlagStroke: function() {
                this._flagStroke = !0
            }
            , MakeObservable: function(e) {
                n.Shape.MakeObservable(e), s.each(n.Text.Properties.slice(0, 13), n.Utils.defineProperty, e), Object.defineProperty(e, "fill", {
                    enumerable: !0
                    , get: function() {
                        return this._fill
                    }
                    , set: function(e) {
                        (this._fill instanceof n.Gradient || this._fill instanceof n.LinearGradient || this._fill instanceof n.RadialGradient || this._fill instanceof n.Texture) && this._fill.unbind(n.Events.change, this._renderer.flagFill), this._fill = e, this._flagFill = !0, (this._fill instanceof n.Gradient || this._fill instanceof n.LinearGradient || this._fill instanceof n.RadialGradient || this._fill instanceof n.Texture) && this._fill.bind(n.Events.change, this._renderer.flagFill)
                    }
                }), Object.defineProperty(e, "stroke", {
                    enumerable: !0
                    , get: function() {
                        return this._stroke
                    }
                    , set: function(e) {
                        (this._stroke instanceof n.Gradient || this._stroke instanceof n.LinearGradient || this._stroke instanceof n.RadialGradient || this._stroke instanceof n.Texture) && this._stroke.unbind(n.Events.change, this._renderer.flagStroke), this._stroke = e, this._flagStroke = !0, (this._stroke instanceof n.Gradient || this._stroke instanceof n.LinearGradient || this._stroke instanceof n.RadialGradient || this._stroke instanceof n.Texture) && this._stroke.bind(n.Events.change, this._renderer.flagStroke)
                    }
                }), Object.defineProperty(e, "clip", {
                    enumerable: !0
                    , get: function() {
                        return this._clip
                    }
                    , set: function(e) {
                        this._clip = e, this._flagClip = !0
                    }
                })
            }
        }), s.extend(n.Text.prototype, n.Shape.prototype, {
            _flagValue: !0
            , _flagFamily: !0
            , _flagSize: !0
            , _flagLeading: !0
            , _flagAlignment: !0
            , _flagBaseline: !0
            , _flagStyle: !0
            , _flagWeight: !0
            , _flagDecoration: !0
            , _flagFill: !0
            , _flagStroke: !0
            , _flagLinewidth: !0
            , _flagOpacity: !0
            , _flagClassName: !0
            , _flagVisible: !0
            , _flagClip: !1
            , _value: ""
            , _family: "sans-serif"
            , _size: 13
            , _leading: 17
            , _alignment: "center"
            , _baseline: "middle"
            , _style: "normal"
            , _weight: 500
            , _decoration: "none"
            , _fill: "white"
            , _stroke: "transparent"
            , _linewidth: 1
            , _opacity: 1
            , _className: ""
            , _visible: !0
            , _clip: !1
            , constructor: n.Text
            , remove: function() {
                return this.parent && this.parent.remove(this), this
            }
            , clone: function(e) {
                var t = new n.Text(this.value);
                return t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, s.each(n.Text.Properties, function(e) {
                    t[e] = this[e]
                }, this), e && e.add(t), t._update()
            }
            , toObject: function() {
                var t = {
                    translation: this.translation.toObject()
                    , rotation: this.rotation
                    , scale: this.scale
                };
                return s.each(n.Text.Properties, function(e) {
                    t[e] = this[e]
                }, this), t
            }
            , noStroke: function() {
                return this.stroke = "transparent", this
            }
            , noFill: function() {
                return this.fill = "transparent", this
            }
            , getBoundingClientRect: function(e) {
                var t, i, r, n, s, o;
                this._update(!0), t = e ? this._matrix : c(this);
                var a = this.leading
                    , l = this.value.length * this.size * h.Ratio;
                switch (this.alignment) {
                    case "left":
                        r = 0, n = l;
                        break;
                    case "right":
                        r = -l, n = 0;
                        break;
                    default:
                        r = -l / 2, n = l / 2
                }
                switch (this.baseline) {
                    case "top":
                        s = 0, o = a;
                        break;
                    case "bottom":
                        s = -a, o = 0;
                        break;
                    default:
                        s = -a / 2, o = a / 2
                }
                return {
                    top: s = (i = t.multiply(r, s, 1))
                        .y
                    , left: r = i.x
                    , right: n = (i = t.multiply(n, o, 1))
                        .x
                    , bottom: o = i.y
                    , width: n - r
                    , height: o - s
                }
            }
            , flagReset: function() {
                return this._flagValue = this._flagFamily = this._flagSize = this._flagLeading = this._flagAlignment = this._flagFill = this._flagStroke = this._flagLinewidth = this._flagOpacity = this._flagVisible = this._flagClip = this._flagDecoration = this._flagClassName = this._flagBaseline = !1, n.Shape.prototype.flagReset.call(this), this
            }
        }), n.Text.MakeObservable(n.Text.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(r) {
        var n = r.Utils
            , s = r.Stop = function(e, t, i) {
                this._renderer = {}, this._renderer.type = "stop", this.offset = n.isNumber(e) ? e : s.Index <= 0 ? 0 : 1, this.opacity = n.isNumber(i) ? i : 1, this.color = n.isString(t) ? t : s.Index <= 0 ? "#fff" : "white", s.Index = (s.Index + 1) % 2
            };
        n.extend(s, {
            Index: 0
            , Properties: ["offset", "opacity", "color"]
            , MakeObservable: function(e) {
                n.each(s.Properties, function(e) {
                    var t = "_" + e
                        , i = "_flag" + e.charAt(0)
                        .toUpperCase() + e.slice(1);
                    Object.defineProperty(this, e, {
                        enumerable: !0
                        , get: function() {
                            return this[t]
                        }
                        , set: function(e) {
                            this[t] = e, this[i] = !0, this.parent && (this.parent._flagStops = !0)
                        }
                    })
                }, e)
            }
        }), n.extend(s.prototype, r.Utils.Events, {
            constructor: s
            , clone: function() {
                var t = new s;
                return n.each(s.Properties, function(e) {
                    t[e] = this[e]
                }, this), t
            }
            , toObject: function() {
                var t = {};
                return n.each(s.Properties, function(e) {
                    t[e] = this[e]
                }, this), t
            }
            , flagReset: function() {
                return this._flagOffset = this._flagColor = this._flagOpacity = !1, this
            }
        }), s.MakeObservable(s.prototype), s.prototype.constructor = s;
        var o = r.Gradient = function(e) {
            this._renderer = {}, this._renderer.type = "gradient", this.id = r.Identifier + r.uniqueId(), this.classList = [], this._renderer.flagStops = n.bind(o.FlagStops, this), this._renderer.bindStops = n.bind(o.BindStops, this), this._renderer.unbindStops = n.bind(o.UnbindStops, this), this.spread = "pad", this.stops = e
        };
        n.extend(o, {
            Stop: s
            , Properties: ["spread"]
            , MakeObservable: function(e) {
                n.each(o.Properties, r.Utils.defineProperty, e), Object.defineProperty(e, "stops", {
                    enumerable: !0
                    , get: function() {
                        return this._stops
                    }
                    , set: function(e) {
                        this._renderer.flagStops;
                        var t = this._renderer.bindStops
                            , i = this._renderer.unbindStops;
                        this._stops && this._stops.unbind(r.Events.insert, t)
                            .unbind(r.Events.remove, i), this._stops = new r.Utils.Collection((e || [])
                                .slice(0)), this._stops.bind(r.Events.insert, t)
                            .bind(r.Events.remove, i), t(this._stops)
                    }
                })
            }
            , FlagStops: function() {
                this._flagStops = !0
            }
            , BindStops: function(e) {
                for (var t = e.length; t--;) e[t].bind(r.Events.change, this._renderer.flagStops), e[t].parent = this;
                this._renderer.flagStops()
            }
            , UnbindStops: function(e) {
                for (var t = e.length; t--;) e[t].unbind(r.Events.change, this._renderer.flagStops), delete e[t].parent;
                this._renderer.flagStops()
            }
        }), n.extend(o.prototype, r.Utils.Events, {
            _flagStops: !1
            , _flagSpread: !1
            , clone: function(e) {
                var t = n.map(this.stops, function(e) {
                        return e.clone()
                    })
                    , i = new o(t);
                return n.each(r.Gradient.Properties, function(e) {
                    i[e] = this[e]
                }, this), e && e.add(i), i
            }
            , toObject: function() {
                var t = {
                    stops: n.map(this.stops, function(e) {
                        return e.toObject()
                    })
                };
                return n.each(o.Properties, function(e) {
                    t[e] = this[e]
                }, this), t
            }
            , _update: function() {
                return (this._flagSpread || this._flagStops) && this.trigger(r.Events.change), this
            }
            , flagReset: function() {
                return this._flagSpread = this._flagStops = !1, this
            }
        }), o.MakeObservable(o.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(o) {
        var a = o.Utils
            , l = o.LinearGradient = function(e, t, i, r, n) {
                o.Gradient.call(this, n), this._renderer.type = "linear-gradient";
                var s = a.bind(l.FlagEndPoints, this);
                this.left = (new o.Vector)
                    .bind(o.Events.change, s), this.right = (new o.Vector)
                    .bind(o.Events.change, s), a.isNumber(e) && (this.left.x = e), a.isNumber(t) && (this.left.y = t), a.isNumber(i) && (this.right.x = i), a.isNumber(r) && (this.right.y = r)
            };
        a.extend(l, {
            Stop: o.Gradient.Stop
            , MakeObservable: function(e) {
                o.Gradient.MakeObservable(e)
            }
            , FlagEndPoints: function() {
                this._flagEndPoints = !0
            }
        }), a.extend(l.prototype, o.Gradient.prototype, {
            _flagEndPoints: !1
            , constructor: l
            , clone: function(e) {
                var t = a.map(this.stops, function(e) {
                        return e.clone()
                    })
                    , i = new l(this.left._x, this.left._y, this.right._x, this.right._y, t);
                return a.each(o.Gradient.Properties, function(e) {
                    i[e] = this[e]
                }, this), e && e.add(i), i
            }
            , toObject: function() {
                var e = o.Gradient.prototype.toObject.call(this);
                return e.left = this.left.toObject(), e.right = this.right.toObject(), e
            }
            , _update: function() {
                return (this._flagEndPoints || this._flagSpread || this._flagStops) && this.trigger(o.Events.change), this
            }
            , flagReset: function() {
                return this._flagEndPoints = !1, o.Gradient.prototype.flagReset.call(this), this
            }
        }), l.MakeObservable(l.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(o) {
        var a = o.Utils
            , r = o.RadialGradient = function(e, t, i, r, n, s) {
                o.Gradient.call(this, r), this._renderer.type = "radial-gradient", this.center = (new o.Vector)
                    .bind(o.Events.change, a.bind(function() {
                        this._flagCenter = !0
                    }, this)), this.radius = a.isNumber(i) ? i : 20, this.focal = (new o.Vector)
                    .bind(o.Events.change, a.bind(function() {
                        this._flagFocal = !0
                    }, this)), a.isNumber(e) && (this.center.x = e), a.isNumber(t) && (this.center.y = t), this.focal.copy(this.center), a.isNumber(n) && (this.focal.x = n), a.isNumber(s) && (this.focal.y = s)
            };
        a.extend(r, {
            Stop: o.Gradient.Stop
            , Properties: ["radius"]
            , MakeObservable: function(e) {
                o.Gradient.MakeObservable(e), a.each(r.Properties, o.Utils.defineProperty, e)
            }
        }), a.extend(r.prototype, o.Gradient.prototype, {
            _flagRadius: !1
            , _flagCenter: !1
            , _flagFocal: !1
            , constructor: r
            , clone: function(e) {
                var t = a.map(this.stops, function(e) {
                        return e.clone()
                    })
                    , i = new r(this.center._x, this.center._y, this._radius, t, this.focal._x, this.focal._y);
                return a.each(o.Gradient.Properties.concat(r.Properties), function(e) {
                    i[e] = this[e]
                }, this), e && e.add(i), i
            }
            , toObject: function() {
                var t = o.Gradient.prototype.toObject.call(this);
                return a.each(r.Properties, function(e) {
                    t[e] = this[e]
                }, this), t.center = this.center.toObject(), t.focal = this.focal.toObject(), t
            }
            , _update: function() {
                return (this._flagRadius || this._flatCenter || this._flagFocal || this._flagSpread || this._flagStops) && this.trigger(o.Events.change), this
            }
            , flagReset: function() {
                return this._flagRadius = this._flagCenter = this._flagFocal = !1, o.Gradient.prototype.flagReset.call(this), this
            }
        }), r.MakeObservable(r.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(s) {
        var t, r = s.root
            , o = s.Utils
            , n = {
                video: /\.(mp4|webm|ogg)$/i
                , image: /\.(jpe?g|png|gif|tiff)$/i
                , effect: /texture|gradient/i
            };
        r.document && (t = document.createElement("a"));
        var a = s.Texture = function(e, t) {
            if (this._renderer = {}, this._renderer.type = "texture", this._renderer.flagOffset = o.bind(a.FlagOffset, this), this._renderer.flagScale = o.bind(a.FlagScale, this), this.id = s.Identifier + s.uniqueId(), this.classList = [], this.offset = new s.Vector, o.isFunction(t)) {
                var i = o.bind(function() {
                    this.unbind(s.Events.load, i), o.isFunction(t) && t()
                }, this);
                this.bind(s.Events.load, i)
            }
            o.isString(e) ? this.src = e : o.isElement(e) && (this.image = e), this._update()
        };
        o.extend(a, {
            Properties: ["src", "loaded", "repeat"]
            , RegularExpressions: n
            , ImageRegistry: new s.Registry
            , getAbsoluteURL: function(e) {
                return t ? (t.href = e, t.href) : e
            }
            , loadHeadlessBuffer: new Function("texture", "loaded", ['var fs = require("fs");', "var buffer = fs.readFileSync(texture.src);", "texture.image.src = buffer;", "loaded();"].join("\n"))
            , getImage: function(e) {
                var t, i = a.getAbsoluteURL(e);
                return a.ImageRegistry.contains(i) ? a.ImageRegistry.get(i) : (s.Utils.Image ? (t = new s.Utils.Image, s.CanvasRenderer.Utils.shim(t, "img")) : r.document ? t = n.video.test(i) ? document.createElement("video") : document.createElement("img") : console.warn("Two.js: no prototypical image defined for Two.Texture"), t.crossOrigin = "anonymous", t)
            }
            , Register: {
                canvas: function(e, t) {
                    e._src = "#" + e.id, a.ImageRegistry.add(e.src, e.image), o.isFunction(t) && t()
                }
                , img: function(t, i) {
                    var r = function(e) {
                            o.isFunction(t.image.removeEventListener) && (t.image.removeEventListener("load", r, !1), t.image.removeEventListener("error", n, !1)), o.isFunction(i) && i()
                        }
                        , n = function(e) {
                            throw o.isFunction(t.image.removeEventListener) && (t.image.removeEventListener("load", r, !1), t.image.removeEventListener("error", n, !1)), new s.Utils.Error("unable to load " + t.src)
                        };
                    o.isNumber(t.image.width) && 0 < t.image.width && o.isNumber(t.image.height) && 0 < t.image.height ? r() : o.isFunction(t.image.addEventListener) && (t.image.addEventListener("load", r, !1), t.image.addEventListener("error", n, !1)), t._src = a.getAbsoluteURL(t._src), t.image && t.image.getAttribute("two-src") || (t.image.setAttribute("two-src", t.src), a.ImageRegistry.add(t.src, t.image), s.Utils.isHeadless ? a.loadHeadlessBuffer(t, r) : t.image.src = t.src)
                }
                , video: function(t, i) {
                    var r = function(e) {
                            t.image.removeEventListener("canplaythrough", r, !1), t.image.removeEventListener("error", n, !1), t.image.width = t.image.videoWidth, t.image.height = t.image.videoHeight, t.image.play(), o.isFunction(i) && i()
                        }
                        , n = function(e) {
                            throw t.image.removeEventListener("canplaythrough", r, !1), t.image.removeEventListener("error", n, !1), new s.Utils.Error("unable to load " + t.src)
                        };
                    if (t._src = a.getAbsoluteURL(t._src), t.image.addEventListener("canplaythrough", r, !1), t.image.addEventListener("error", n, !1), !t.image || !t.image.getAttribute("two-src")) {
                        if (s.Utils.isHeadless) throw new s.Utils.Error("video textures are not implemented in headless environments.");
                        t.image.setAttribute("two-src", t.src), a.ImageRegistry.add(t.src, t.image), t.image.src = t.src, t.image.loop = !0, t.image.load()
                    }
                }
            }
            , load: function(e, t) {
                e.src;
                var i = e.image
                    , r = i && i.nodeName.toLowerCase();
                e._flagImage && (/canvas/i.test(r) ? a.Register.canvas(e, t) : (e._src = i.getAttribute("two-src") || i.src, a.Register[r](e, t))), e._flagSrc && (i || (e.image = a.getImage(e.src)), r = e.image.nodeName.toLowerCase(), a.Register[r](e, t))
            }
            , FlagOffset: function() {
                this._flagOffset = !0
            }
            , FlagScale: function() {
                this._flagScale = !0
            }
            , MakeObservable: function(e) {
                o.each(a.Properties, s.Utils.defineProperty, e), Object.defineProperty(e, "image", {
                    enumerable: !0
                    , get: function() {
                        return this._image
                    }
                    , set: function(e) {
                        var t;
                        switch (e && e.nodeName.toLowerCase()) {
                            case "canvas":
                                t = "#" + e.id;
                                break;
                            default:
                                t = e.src
                        }
                        a.ImageRegistry.contains(t) ? this._image = a.ImageRegistry.get(e.src) : this._image = e, this._flagImage = !0
                    }
                }), Object.defineProperty(e, "offset", {
                    enumerable: !0
                    , get: function() {
                        return this._offset
                    }
                    , set: function(e) {
                        this._offset && this._offset.unbind(s.Events.change, this._renderer.flagOffset), this._offset = e, this._offset.bind(s.Events.change, this._renderer.flagOffset), this._flagOffset = !0
                    }
                }), Object.defineProperty(e, "scale", {
                    enumerable: !0
                    , get: function() {
                        return this._scale
                    }
                    , set: function(e) {
                        this._scale instanceof s.Vector && this._scale.unbind(s.Events.change, this._renderer.flagScale), this._scale = e, this._scale instanceof s.Vector && this._scale.bind(s.Events.change, this._renderer.flagScale), this._flagScale = !0
                    }
                })
            }
        }), o.extend(a.prototype, s.Utils.Events, s.Shape.prototype, {
            _flagSrc: !1
            , _flagImage: !1
            , _flagVideo: !1
            , _flagLoaded: !1
            , _flagRepeat: !1
            , _flagOffset: !1
            , _flagScale: !1
            , _src: ""
            , _image: null
            , _loaded: !1
            , _repeat: "no-repeat"
            , _scale: 1
            , _offset: null
            , constructor: a
            , clone: function() {
                return new a(this.src)
            }
            , toObject: function() {
                return {
                    src: this.src
                    , image: this.image
                }
            }
            , _update: function() {
                return (this._flagSrc || this._flagImage) && (this.trigger(s.Events.change), (this._flagSrc || this._flagImage) && (this.loaded = !1, a.load(this, o.bind(function() {
                    this.loaded = !0, this.trigger(s.Events.change)
                        .trigger(s.Events.load)
                }, this)))), this._image && 4 <= this._image.readyState && (this._flagVideo = !0), this
            }
            , flagReset: function() {
                return this._flagSrc = this._flagImage = this._flagLoaded = this._flagVideo = this._flagScale = this._flagOffset = !1, this
            }
        }), a.MakeObservable(a.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(o) {
        var g = o.Utils
            , a = o.Path
            , p = o.Rectangle
            , i = o.Sprite = function(e, t, i, r, n, s) {
                a.call(this, [new o.Anchor, new o.Anchor, new o.Anchor, new o.Anchor], !0), this.noStroke(), this.noFill(), e instanceof o.Texture ? this.texture = e : g.isString(e) && (this.texture = new o.Texture(e)), this.origin = new o.Vector, this._update(), this.translation.set(t || 0, i || 0), g.isNumber(r) && (this.columns = r), g.isNumber(n) && (this.rows = n), g.isNumber(s) && (this.frameRate = s)
            };
        g.extend(i, {
            Properties: ["texture", "columns", "rows", "frameRate", "index"]
            , MakeObservable: function(e) {
                p.MakeObservable(e), g.each(i.Properties, o.Utils.defineProperty, e)
            }
        }), g.extend(i.prototype, p.prototype, {
            _flagTexture: !1
            , _flagColumns: !1
            , _flagRows: !1
            , _flagFrameRate: !1
            , flagIndex: !1
            , _amount: 1
            , _duration: 0
            , _startTime: 0
            , _playing: !1
            , _firstFrame: 0
            , _lastFrame: 0
            , _loop: !0
            , _texture: null
            , _columns: 1
            , _rows: 1
            , _frameRate: 0
            , _index: 0
            , _origin: null
            , constructor: i
            , play: function(e, t, i) {
                return this._playing = !0, this._firstFrame = 0, this._lastFrame = this.amount - 1, this._startTime = g.performance.now(), g.isNumber(e) && (this._firstFrame = e), g.isNumber(t) && (this._lastFrame = t), g.isFunction(i) ? this._onLastFrame = i : delete this._onLastFrame, this._index !== this._firstFrame && (this._startTime -= 1e3 * Math.abs(this._index - this._firstFrame) / this._frameRate), this
            }
            , pause: function() {
                return this._playing = !1, this
            }
            , stop: function() {
                return this._playing = !1, this._index = 0, this
            }
            , clone: function(e) {
                var t = new i(this.texture, this.translation.x, this.translation.y, this.columns, this.rows, this.frameRate);
                return this.playing && (t.play(this._firstFrame, this._lastFrame), t._loop = this._loop), e && e.add(t), t
            }
            , _update: function() {
                var e, t, i, r, n, s, o, a, l, c = this._texture
                    , h = this._columns
                    , d = this._rows;
                if ((this._flagColumns || this._flagRows) && (this._amount = this._columns * this._rows), this._flagFrameRate && (this._duration = 1e3 * this._amount / this._frameRate), this._flagTexture && (this.fill = this._texture), this._texture.loaded) {
                    e = (o = c.image.width) / h, t = (a = c.image.height) / d, r = this._amount, this.width !== e && (this.width = e), this.height !== t && (this.height = t), this._playing && 0 < this._frameRate && (g.isNaN(this._lastFrame) && (this._lastFrame = r - 1), i = g.performance.now() - this._startTime, n = 1e3 * ((l = this._lastFrame + 1) - this._firstFrame) / this._frameRate, this._loop ? i %= n : i = Math.min(i, n), s = g.lerp(this._firstFrame, l, i / n), (s = Math.floor(s)) !== this._index && (this._index = s) >= this._lastFrame - 1 && this._onLastFrame && this._onLastFrame());
                    var u = -e * (this._index % h) + (o - e) / 2
                        , f = -t * Math.floor(this._index / h) + (a - t) / 2;
                    u !== c.offset.x && (c.offset.x = u), f !== c.offset.y && (c.offset.y = f)
                }
                return p.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagTexture = this._flagColumns = this._flagRows = this._flagFrameRate = !1, p.prototype.flagReset.call(this), this
            }
        }), i.MakeObservable(i.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(c) {
        var h = c.Utils
            , n = c.Path
            , d = c.Rectangle
            , s = c.ImageSequence = function(e, t, i, r) {
                n.call(this, [new c.Anchor, new c.Anchor, new c.Anchor, new c.Anchor], !0), this._renderer.flagTextures = h.bind(s.FlagTextures, this), this._renderer.bindTextures = h.bind(s.BindTextures, this), this._renderer.unbindTextures = h.bind(s.UnbindTextures, this), this.noStroke(), this.noFill(), this.textures = h.map(e, s.GenerateTexture, this), this.origin = new c.Vector, this._update(), this.translation.set(t || 0, i || 0), h.isNumber(r) ? this.frameRate = r : this.frameRate = s.DefaultFrameRate
            };
        h.extend(s, {
            Properties: ["frameRate", "index"]
            , DefaultFrameRate: 30
            , FlagTextures: function() {
                this._flagTextures = !0
            }
            , BindTextures: function(e) {
                for (var t = e.length; t--;) e[t].bind(c.Events.change, this._renderer.flagTextures);
                this._renderer.flagTextures()
            }
            , UnbindTextures: function(e) {
                for (var t = e.length; t--;) e[t].unbind(c.Events.change, this._renderer.flagTextures);
                this._renderer.flagTextures()
            }
            , MakeObservable: function(e) {
                d.MakeObservable(e), h.each(s.Properties, c.Utils.defineProperty, e), Object.defineProperty(e, "textures", {
                    enumerable: !0
                    , get: function() {
                        return this._textures
                    }
                    , set: function(e) {
                        this._renderer.flagTextures;
                        var t = this._renderer.bindTextures
                            , i = this._renderer.unbindTextures;
                        this._textures && this._textures.unbind(c.Events.insert, t)
                            .unbind(c.Events.remove, i), this._textures = new c.Utils.Collection((e || [])
                                .slice(0)), this._textures.bind(c.Events.insert, t)
                            .bind(c.Events.remove, i), t(this._textures)
                    }
                })
            }
            , GenerateTexture: function(e) {
                return e instanceof c.Texture ? e : h.isString(e) ? new c.Texture(e) : void 0
            }
        }), h.extend(s.prototype, d.prototype, {
            _flagTextures: !1
            , _flagFrameRate: !1
            , _flagIndex: !1
            , _amount: 1
            , _duration: 0
            , _index: 0
            , _startTime: 0
            , _playing: !1
            , _firstFrame: 0
            , _lastFrame: 0
            , _loop: !0
            , _textures: null
            , _frameRate: 0
            , _origin: null
            , constructor: s
            , play: function(e, t, i) {
                return this._playing = !0, this._firstFrame = 0, this._lastFrame = this.amount - 1, this._startTime = h.performance.now(), h.isNumber(e) && (this._firstFrame = e), h.isNumber(t) && (this._lastFrame = t), h.isFunction(i) ? this._onLastFrame = i : delete this._onLastFrame, this._index !== this._firstFrame && (this._startTime -= 1e3 * Math.abs(this._index - this._firstFrame) / this._frameRate), this
            }
            , pause: function() {
                return this._playing = !1, this
            }
            , stop: function() {
                return this._playing = !1, this._index = 0, this
            }
            , clone: function(e) {
                var t = new s(this.textures, this.translation.x, this.translation.y, this.frameRate);
                return t._loop = this._loop, this._playing && t.play(), e && e.add(t), t
            }
            , _update: function() {
                var e, t, i, r, n, s, o, a, l = this._textures;
                return this._flagTextures && (this._amount = l.length), this._flagFrameRate && (this._duration = 1e3 * this._amount / this._frameRate), this._playing && 0 < this._frameRate ? (r = this._amount, h.isNaN(this._lastFrame) && (this._lastFrame = r - 1), i = h.performance.now() - this._startTime, n = 1e3 * ((a = this._lastFrame + 1) - this._firstFrame) / this._frameRate, this._loop ? i %= n : i = Math.min(i, n), o = h.lerp(this._firstFrame, a, i / n), (o = Math.floor(o)) !== this._index && (this._index = o, (s = l[this._index])
                    .loaded && (e = s.image.width, t = s.image.height, this.width !== e && (this.width = e), this.height !== t && (this.height = t), this.fill = s, o >= this._lastFrame - 1 && this._onLastFrame && this._onLastFrame()))) : !this._flagIndex && this.fill instanceof c.Texture || ((s = l[this._index])
                    .loaded && (e = s.image.width, t = s.image.height, this.width !== e && (this.width = e), this.height !== t && (this.height = t)), this.fill = s), d.prototype._update.call(this), this
            }
            , flagReset: function() {
                return this._flagTextures = this._flagFrameRate = !1, d.prototype.flagReset.call(this), this
            }
        }), s.MakeObservable(s.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(c) {
        var h = Math.min
            , d = Math.max
            , u = c.Utils
            , n = function() {
                c.Utils.Collection.apply(this, arguments), Object.defineProperty(this, "_events", {
                    value: {}
                    , enumerable: !1
                }), this.ids = {}, this.on(c.Events.insert, this.attach), this.on(c.Events.remove, this.detach), n.prototype.attach.apply(this, arguments)
            };
        n.prototype = new c.Utils.Collection, u.extend(n.prototype, {
            constructor: n
            , attach: function(e) {
                for (var t = 0; t < e.length; t++) this.ids[e[t].id] = e[t];
                return this
            }
            , detach: function(e) {
                for (var t = 0; t < e.length; t++) delete this.ids[e[t].id];
                return this
            }
        });
        var s = c.Group = function(e) {
            c.Shape.call(this, !0), this._renderer.type = "group", this.additions = [], this.subtractions = [], this.children = u.isArray(e) ? e : arguments
        };

        function i(e, t) {
            var i, r = e.parent;
            return r === t ? (this.additions.push(e), void(this._flagAdditions = !0)) : (r && r.children.ids[e.id] && (i = u.indexOf(r.children, e), r.children.splice(i, 1), 0 <= (i = u.indexOf(r.additions, e)) ? r.additions.splice(i, 1) : (r.subtractions.push(e), r._flagSubtractions = !0)), t ? (e.parent = t, this.additions.push(e), void(this._flagAdditions = !0)) : (0 <= (i = u.indexOf(this.additions, e)) ? this.additions.splice(i, 1) : (this.subtractions.push(e), this._flagSubtractions = !0), void delete e.parent))
        }
        u.extend(s, {
            Children: n
            , InsertChildren: function(e) {
                for (var t = 0; t < e.length; t++) i.call(this, e[t], this)
            }
            , RemoveChildren: function(e) {
                for (var t = 0; t < e.length; t++) i.call(this, e[t])
            }
            , OrderChildren: function(e) {
                this._flagOrder = !0
            }
            , Properties: ["fill", "stroke", "linewidth", "visible", "cap", "join", "miter"]
            , MakeObservable: function(e) {
                var t = c.Group.Properties;
                Object.defineProperty(e, "opacity", {
                    enumerable: !0
                    , get: function() {
                        return this._opacity
                    }
                    , set: function(e) {
                        this._flagOpacity = this._opacity !== e, this._opacity = e
                    }
                }), Object.defineProperty(e, "className", {
                    enumerable: !0
                    , get: function() {
                        return this._className
                    }
                    , set: function(e) {
                        this._flagClassName = this._className !== e, this._className = e
                    }
                }), Object.defineProperty(e, "beginning", {
                    enumerable: !0
                    , get: function() {
                        return this._beginning
                    }
                    , set: function(e) {
                        this._flagBeginning = this._beginning !== e, this._beginning = e
                    }
                }), Object.defineProperty(e, "ending", {
                    enumerable: !0
                    , get: function() {
                        return this._ending
                    }
                    , set: function(e) {
                        this._flagEnding = this._ending !== e, this._ending = e
                    }
                }), Object.defineProperty(e, "length", {
                    enumerable: !0
                    , get: function() {
                        if (this._flagLength || this._length <= 0)
                            for (var e = this._length = 0; e < this.children.length; e++) {
                                var t = this.children[e];
                                this._length += t.length
                            }
                        return this._length
                    }
                }), c.Shape.MakeObservable(e), s.MakeGetterSetters(e, t), Object.defineProperty(e, "children", {
                    enumerable: !0
                    , get: function() {
                        return this._children
                    }
                    , set: function(e) {
                        var t = u.bind(s.InsertChildren, this)
                            , i = u.bind(s.RemoveChildren, this)
                            , r = u.bind(s.OrderChildren, this);
                        this._children && this._children.unbind(), this._children = new n(e), this._children.bind(c.Events.insert, t), this._children.bind(c.Events.remove, i), this._children.bind(c.Events.order, r)
                    }
                }), Object.defineProperty(e, "mask", {
                    enumerable: !0
                    , get: function() {
                        return this._mask
                    }
                    , set: function(e) {
                        this._mask = e, this._flagMask = !0, e.clip || (e.clip = !0)
                    }
                })
            }
            , MakeGetterSetters: function(t, e) {
                u.isArray(e) || (e = [e]), u.each(e, function(e) {
                    s.MakeGetterSetter(t, e)
                })
            }
            , MakeGetterSetter: function(e, i) {
                var r = "_" + i;
                Object.defineProperty(e, i, {
                    enumerable: !0
                    , get: function() {
                        return this[r]
                    }
                    , set: function(t) {
                        this[r] = t, u.each(this.children, function(e) {
                            e[i] = t
                        })
                    }
                })
            }
        }), u.extend(s.prototype, c.Shape.prototype, {
            _flagAdditions: !1
            , _flagSubtractions: !1
            , _flagOrder: !1
            , _flagOpacity: !0
            , _flagClassName: !1
            , _flagBeginning: !1
            , _flagEnding: !1
            , _flagLength: !1
            , _flagMask: !1
            , _fill: "#fff"
            , _stroke: "white"
            , _linewidth: 1
            , _opacity: 1
            , _className: ""
            , _visible: !0
            , _cap: "round"
            , _join: "round"
            , _miter: 4
            , _closed: !0
            , _curved: !1
            , _automatic: !0
            , _beginning: 0
            , _ending: 1
            , _length: 0
            , _mask: null
            , constructor: s
            , clone: function(e) {
                var t = new s
                    , i = u.map(this.children, function(e) {
                        return e.clone()
                    });
                return t.add(i), t.opacity = this.opacity, this.mask && (t.mask = this.mask), t.translation.copy(this.translation), t.rotation = this.rotation, t.scale = this.scale, t.className = this.className, e && e.add(t), t._update()
            }
            , toObject: function() {
                var i = {
                    children: []
                    , translation: this.translation.toObject()
                    , rotation: this.rotation
                    , scale: this.scale instanceof c.Vector ? this.scale.toObject() : this.scale
                    , opacity: this.opacity
                    , className: this.className
                    , mask: this.mask ? this.mask.toObject() : null
                };
                return u.each(this.children, function(e, t) {
                    i.children[t] = e.toObject()
                }, this), i
            }
            , corner: function() {
                var e = this.getBoundingClientRect(!0)
                    , t = {
                        x: e.left
                        , y: e.top
                    };
                return this.children.forEach(function(e) {
                    e.translation.sub(t)
                }), this
            }
            , center: function() {
                var t = this.getBoundingClientRect(!0);
                return t.centroid = {
                    x: t.left + t.width / 2
                    , y: t.top + t.height / 2
                }, this.children.forEach(function(e) {
                    e.isShape && e.translation.sub(t.centroid)
                }), this
            }
            , getById: function(e) {
                var n = function(e, t) {
                    if (e.id === t) return e;
                    if (e.children)
                        for (var i = e.children.length; i--;) {
                            var r = n(e.children[i], t);
                            if (r) return r
                        }
                };
                return n(this, e) || null
            }
            , getByClassName: function(e) {
                var i = []
                    , r = function(e, t) {
                        return -1 != e.classList.indexOf(t) ? i.push(e) : e.children && e.children.forEach(function(e) {
                            r(e, t)
                        }), i
                    };
                return r(this, e)
            }
            , getByType: function(e) {
                var r = []
                    , n = function(e, t) {
                        for (var i in e.children) e.children[i] instanceof t ? r.push(e.children[i]) : e.children[i] instanceof c.Group && n(e.children[i], t);
                        return r
                    };
                return n(this, e)
            }
            , add: function(e) {
                e = e instanceof Array ? e.slice() : u.toArray(arguments);
                for (var t = 0; t < e.length; t++) e[t] && e[t].id && this.children.push(e[t]);
                return this
            }
            , remove: function(e) {
                var t = arguments.length
                    , i = this.parent;
                if (t <= 0 && i) return i.remove(this), this;
                e = e instanceof Array ? e.slice() : u.toArray(arguments);
                for (var r = 0; r < e.length; r++) e[r] && this.children.ids[e[r].id] && this.children.splice(u.indexOf(this.children, e[r]), 1);
                return this
            }
            , getBoundingClientRect: function(e) {
                var t;
                this._update(!0);
                for (var i = 1 / 0, r = -1 / 0, n = 1 / 0, s = -1 / 0, o = c.Texture.RegularExpressions.effect, a = 0; a < this.children.length; a++) {
                    var l = this.children[a];
                    l.visible && !o.test(l._renderer.type) && (t = l.getBoundingClientRect(e), u.isNumber(t.top) && u.isNumber(t.left) && u.isNumber(t.right) && u.isNumber(t.bottom) && (n = h(t.top, n), i = h(t.left, i), r = d(t.right, r), s = d(t.bottom, s)))
                }
                return {
                    top: n
                    , left: i
                    , right: r
                    , bottom: s
                    , width: r - i
                    , height: s - n
                }
            }
            , noFill: function() {
                return this.children.forEach(function(e) {
                    e.noFill()
                }), this
            }
            , noStroke: function() {
                return this.children.forEach(function(e) {
                    e.noStroke()
                }), this
            }
            , subdivide: function() {
                var t = arguments;
                return this.children.forEach(function(e) {
                    e.subdivide.apply(e, t)
                }), this
            }
            , _update: function() {
                if (this._flagBeginning || this._flagEnding)
                    for (var e = Math.min(this._beginning, this._ending), t = Math.max(this._beginning, this._ending), i = this.length, r = 0, n = e * i, s = t * i, o = 0; o < this.children.length; o++) {
                        var a = this.children[o]
                            , l = a.length;
                        a.ending = r + l < n ? a.beginning = 1 : s < r ? a.beginning = 0 : r < n && n < r + l ? (a.beginning = (n - r) / l, 1) : r < s && s < r + l ? (a.beginning = 0, (s - r) / l) : (a.beginning = 0, 1), r += l
                    }
                return c.Shape.prototype._update.apply(this, arguments)
            }
            , flagReset: function() {
                return this._flagAdditions && (this.additions.length = 0, this._flagAdditions = !1), this._flagSubtractions && (this.subtractions.length = 0, this._flagSubtractions = !1), this._flagOrder = this._flagMask = this._flagOpacity = this._flagClassName, this._flagBeginning = this._flagEnding = !1, c.Shape.prototype.flagReset.call(this), this
            }
        }), s.MakeObservable(s.prototype)
    }(("undefined" != typeof global ? global : this || self || window)
        .Two)
    , function(e) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
        else if ("function" == typeof define && define.amd) define([], e);
        else {
            ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this)
            .Matter = e()
        }
    }(function() {
        return function s(o, a, l) {
            function c(t, e) {
                if (!a[t]) {
                    if (!o[t]) {
                        var i = "function" == typeof require && require;
                        if (!e && i) return i(t, !0);
                        if (h) return h(t, !0);
                        var r = new Error("Cannot find module '" + t + "'");
                        throw r.code = "MODULE_NOT_FOUND", r
                    }
                    var n = a[t] = {
                        exports: {}
                    };
                    o[t][0].call(n.exports, function(e) {
                        return c(o[t][1][e] || e)
                    }, n, n.exports, s, o, a, l)
                }
                return a[t].exports
            }
            for (var h = "function" == typeof require && require, e = 0; e < l.length; e++) c(l[e]);
            return c
        }({
            1: [function(e, t, i) {
                var c = {};
                t.exports = c;
                var h = e("../geometry/Vertices")
                    , d = e("../geometry/Vector")
                    , n = e("../core/Sleeping")
                    , s = (e("../render/Render"), e("../core/Common"))
                    , u = e("../geometry/Bounds")
                    , f = e("../geometry/Axes");
                ! function() {
                    c._inertiaScale = 4, c._nextCollidingGroupId = 1, c._nextNonCollidingGroupId = -1, c._nextCategory = 1, c.create = function(e) {
                        var t = {
                                id: s.nextId()
                                , type: "body"
                                , label: "Body"
                                , parts: []
                                , plugin: {}
                                , angle: 0
                                , vertices: h.fromPath("L 0 0 L 40 0 L 40 40 L 0 40")
                                , position: {
                                    x: 0
                                    , y: 0
                                }
                                , force: {
                                    x: 0
                                    , y: 0
                                }
                                , torque: 0
                                , positionImpulse: {
                                    x: 0
                                    , y: 0
                                }
                                , constraintImpulse: {
                                    x: 0
                                    , y: 0
                                    , angle: 0
                                }
                                , totalContacts: 0
                                , speed: 0
                                , angularSpeed: 0
                                , velocity: {
                                    x: 0
                                    , y: 0
                                }
                                , angularVelocity: 0
                                , isSensor: !1
                                , isStatic: !1
                                , isSleeping: !1
                                , motion: 0
                                , sleepThreshold: 60
                                , density: .001
                                , restitution: 0
                                , friction: .1
                                , frictionStatic: .5
                                , frictionAir: .01
                                , collisionFilter: {
                                    category: 1
                                    , mask: 4294967295
                                    , group: 0
                                }
                                , slop: .05
                                , timeScale: 1
                                , render: {
                                    visible: !0
                                    , opacity: 1
                                    , sprite: {
                                        xScale: 1
                                        , yScale: 1
                                        , xOffset: 0
                                        , yOffset: 0
                                    }
                                    , lineWidth: 0
                                }
                            }
                            , i = s.extend(t, e);
                        return r(i, e), i
                    }, c.nextGroup = function(e) {
                        return e ? c._nextNonCollidingGroupId-- : c._nextCollidingGroupId++
                    }, c.nextCategory = function() {
                        return c._nextCategory = c._nextCategory << 1, c._nextCategory
                    };
                    var r = function(e, t) {
                        t = t || {}, c.set(e, {
                            bounds: e.bounds || u.create(e.vertices)
                            , positionPrev: e.positionPrev || d.clone(e.position)
                            , anglePrev: e.anglePrev || e.angle
                            , vertices: e.vertices
                            , parts: e.parts || [e]
                            , isStatic: e.isStatic
                            , isSleeping: e.isSleeping
                            , parent: e.parent || e
                        }), h.rotate(e.vertices, e.angle, e.position), f.rotate(e.axes, e.angle), u.update(e.bounds, e.vertices, e.velocity), c.set(e, {
                            axes: t.axes || e.axes
                            , area: t.area || e.area
                            , mass: t.mass || e.mass
                            , inertia: t.inertia || e.inertia
                        });
                        var i = e.isStatic ? "#2e2b44" : s.choose(["#006BA6", "#0496FF", "#FFBC42", "#D81159", "#8F2D56"]);
                        e.render.fillStyle = e.render.fillStyle || i, e.render.strokeStyle = e.render.strokeStyle || "white", e.render.sprite.xOffset += -(e.bounds.min.x - e.position.x) / (e.bounds.max.x - e.bounds.min.x), e.render.sprite.yOffset += -(e.bounds.min.y - e.position.y) / (e.bounds.max.y - e.bounds.min.y)
                    };
                    c.set = function(e, t, i) {
                        var r;
                        for (r in "string" == typeof t && (r = t, (t = {})[r] = i), t)
                            if (i = t[r], t.hasOwnProperty(r)) switch (r) {
                                case "isStatic":
                                    c.setStatic(e, i);
                                    break;
                                case "isSleeping":
                                    n.set(e, i);
                                    break;
                                case "mass":
                                    c.setMass(e, i);
                                    break;
                                case "density":
                                    c.setDensity(e, i);
                                    break;
                                case "inertia":
                                    c.setInertia(e, i);
                                    break;
                                case "vertices":
                                    c.setVertices(e, i);
                                    break;
                                case "position":
                                    c.setPosition(e, i);
                                    break;
                                case "angle":
                                    c.setAngle(e, i);
                                    break;
                                case "velocity":
                                    c.setVelocity(e, i);
                                    break;
                                case "angularVelocity":
                                    c.setAngularVelocity(e, i);
                                    break;
                                case "parts":
                                    c.setParts(e, i);
                                    break;
                                default:
                                    e[r] = i
                            }
                    }, c.setStatic = function(e, t) {
                        for (var i = 0; i < e.parts.length; i++) {
                            var r = e.parts[i];
                            (r.isStatic = t) ? (r._original = {
                                restitution: r.restitution
                                , friction: r.friction
                                , mass: r.mass
                                , inertia: r.inertia
                                , density: r.density
                                , inverseMass: r.inverseMass
                                , inverseInertia: r.inverseInertia
                            }, r.restitution = 0, r.friction = 1, r.mass = r.inertia = r.density = 1 / 0, r.inverseMass = r.inverseInertia = 0, r.positionPrev.x = r.position.x, r.positionPrev.y = r.position.y, r.anglePrev = r.angle, r.angularVelocity = 0, r.speed = 0, r.angularSpeed = 0, r.motion = 0) : r._original && (r.restitution = r._original.restitution, r.friction = r._original.friction, r.mass = r._original.mass, r.inertia = r._original.inertia, r.density = r._original.density, r.inverseMass = r._original.inverseMass, r.inverseInertia = r._original.inverseInertia, delete r._original)
                        }
                    }, c.setMass = function(e, t) {
                        var i = e.inertia / (e.mass / 6);
                        e.inertia = i * (t / 6), e.inverseInertia = 1 / e.inertia, e.mass = t, e.inverseMass = 1 / e.mass, e.density = e.mass / e.area
                    }, c.setDensity = function(e, t) {
                        c.setMass(e, t * e.area), e.density = t
                    }, c.setInertia = function(e, t) {
                        e.inertia = t, e.inverseInertia = 1 / e.inertia
                    }, c.setVertices = function(e, t) {
                        t[0].body === e ? e.vertices = t : e.vertices = h.create(t, e), e.axes = f.fromVertices(e.vertices), e.area = h.area(e.vertices), c.setMass(e, e.density * e.area);
                        var i = h.centre(e.vertices);
                        h.translate(e.vertices, i, -1), c.setInertia(e, c._inertiaScale * h.inertia(e.vertices, e.mass)), h.translate(e.vertices, e.position), u.update(e.bounds, e.vertices, e.velocity)
                    }, c.setParts = function(e, t, i) {
                        var r;
                        for (t = t.slice(0), e.parts.length = 0, e.parts.push(e), e.parent = e, r = 0; r < t.length; r++) {
                            var n = t[r];
                            n !== e && (n.parent = e)
                                .parts.push(n)
                        }
                        if (1 !== e.parts.length) {
                            if (i = void 0 === i || i) {
                                var s = [];
                                for (r = 0; r < t.length; r++) s = s.concat(t[r].vertices);
                                h.clockwiseSort(s);
                                var o = h.hull(s)
                                    , a = h.centre(o);
                                c.setVertices(e, o), h.translate(e.vertices, a)
                            }
                            var l = c._totalProperties(e);
                            e.area = l.area, (e.parent = e)
                                .position.x = l.centre.x, e.position.y = l.centre.y, e.positionPrev.x = l.centre.x, e.positionPrev.y = l.centre.y, c.setMass(e, l.mass), c.setInertia(e, l.inertia), c.setPosition(e, l.centre)
                        }
                    }, c.setPosition = function(e, t) {
                        var i = d.sub(t, e.position);
                        e.positionPrev.x += i.x, e.positionPrev.y += i.y;
                        for (var r = 0; r < e.parts.length; r++) {
                            var n = e.parts[r];
                            n.position.x += i.x, n.position.y += i.y, h.translate(n.vertices, i), u.update(n.bounds, n.vertices, e.velocity)
                        }
                    }, c.setAngle = function(e, t) {
                        var i = t - e.angle;
                        e.anglePrev += i;
                        for (var r = 0; r < e.parts.length; r++) {
                            var n = e.parts[r];
                            n.angle += i, h.rotate(n.vertices, i, e.position), f.rotate(n.axes, i), u.update(n.bounds, n.vertices, e.velocity), 0 < r && d.rotateAbout(n.position, i, e.position, n.position)
                        }
                    }, c.setVelocity = function(e, t) {
                        e.positionPrev.x = e.position.x - t.x, e.positionPrev.y = e.position.y - t.y, e.velocity.x = t.x, e.velocity.y = t.y, e.speed = d.magnitude(e.velocity)
                    }, c.setAngularVelocity = function(e, t) {
                        e.anglePrev = e.angle - t, e.angularVelocity = t, e.angularSpeed = Math.abs(e.angularVelocity)
                    }, c.translate = function(e, t) {
                        c.setPosition(e, d.add(e.position, t))
                    }, c.rotate = function(e, t, i) {
                        if (i) {
                            var r = Math.cos(t)
                                , n = Math.sin(t)
                                , s = e.position.x - i.x
                                , o = e.position.y - i.y;
                            c.setPosition(e, {
                                x: i.x + (s * r - o * n)
                                , y: i.y + (s * n + o * r)
                            }), c.setAngle(e, e.angle + t)
                        } else c.setAngle(e, e.angle + t)
                    }, c.scale = function(e, t, i, r) {
                        var n = 0
                            , s = 0;
                        r = r || e.position;
                        for (var o = 0; o < e.parts.length; o++) {
                            var a = e.parts[o];
                            h.scale(a.vertices, t, i, r), a.axes = f.fromVertices(a.vertices), a.area = h.area(a.vertices), c.setMass(a, e.density * a.area), h.translate(a.vertices, {
                                x: -a.position.x
                                , y: -a.position.y
                            }), c.setInertia(a, c._inertiaScale * h.inertia(a.vertices, a.mass)), h.translate(a.vertices, {
                                x: a.position.x
                                , y: a.position.y
                            }), 0 < o && (n += a.area, s += a.inertia), a.position.x = r.x + (a.position.x - r.x) * t, a.position.y = r.y + (a.position.y - r.y) * i, u.update(a.bounds, a.vertices, e.velocity)
                        }
                        1 < e.parts.length && (e.area = n, e.isStatic || (c.setMass(e, e.density * n), c.setInertia(e, s))), e.circleRadius && (t === i ? e.circleRadius *= t : e.circleRadius = null)
                    }, c.update = function(e, t, i, r) {
                        var n = Math.pow(t * i * e.timeScale, 2)
                            , s = 1 - e.frictionAir * i * e.timeScale
                            , o = e.position.x - e.positionPrev.x
                            , a = e.position.y - e.positionPrev.y;
                        e.velocity.x = o * s * r + e.force.x / e.mass * n, e.velocity.y = a * s * r + e.force.y / e.mass * n, e.positionPrev.x = e.position.x, e.positionPrev.y = e.position.y, e.position.x += e.velocity.x, e.position.y += e.velocity.y, e.angularVelocity = (e.angle - e.anglePrev) * s * r + e.torque / e.inertia * n, e.anglePrev = e.angle, e.angle += e.angularVelocity, e.speed = d.magnitude(e.velocity), e.angularSpeed = Math.abs(e.angularVelocity);
                        for (var l = 0; l < e.parts.length; l++) {
                            var c = e.parts[l];
                            h.translate(c.vertices, e.velocity), 0 < l && (c.position.x += e.velocity.x, c.position.y += e.velocity.y), 0 !== e.angularVelocity && (h.rotate(c.vertices, e.angularVelocity, e.position), f.rotate(c.axes, e.angularVelocity), 0 < l && d.rotateAbout(c.position, e.angularVelocity, e.position, c.position)), u.update(c.bounds, c.vertices, e.velocity)
                        }
                    }, c.applyForce = function(e, t, i) {
                        e.force.x += i.x, e.force.y += i.y;
                        var r = t.x - e.position.x
                            , n = t.y - e.position.y;
                        e.torque += r * i.y - n * i.x
                    }, c._totalProperties = function(e) {
                        for (var t = {
                                mass: 0
                                , area: 0
                                , inertia: 0
                                , centre: {
                                    x: 0
                                    , y: 0
                                }
                            }, i = 1 === e.parts.length ? 0 : 1; i < e.parts.length; i++) {
                            var r = e.parts[i]
                                , n = r.mass !== 1 / 0 ? r.mass : 1;
                            t.mass += n, t.area += r.area, t.inertia += r.inertia, t.centre = d.add(t.centre, d.mult(r.position, n))
                        }
                        return t.centre = d.div(t.centre, t.mass), t
                    }
                }()
            }, {
                "../core/Common": 14
                , "../core/Sleeping": 22
                , "../geometry/Axes": 25
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
                , "../render/Render": 31
            }]
            , 2: [function(e, t, i) {
                var d = {};
                t.exports = d;
                var o = e("../core/Events")
                    , s = e("../core/Common")
                    , a = e("../geometry/Bounds")
                    , u = e("./Body");
                d.create = function(e) {
                    return s.extend({
                        id: s.nextId()
                        , type: "composite"
                        , parent: null
                        , isModified: !1
                        , bodies: []
                        , constraints: []
                        , composites: []
                        , label: "Composite"
                        , plugin: {}
                    }, e)
                }, d.setModified = function(e, t, i, r) {
                    if (e.isModified = t, i && e.parent && d.setModified(e.parent, t, i, r), r)
                        for (var n = 0; n < e.composites.length; n++) {
                            var s = e.composites[n];
                            d.setModified(s, t, i, r)
                        }
                }, d.add = function(e, t) {
                    var i = [].concat(t);
                    o.trigger(e, "beforeAdd", {
                        object: t
                    });
                    for (var r = 0; r < i.length; r++) {
                        var n = i[r];
                        switch (n.type) {
                            case "body":
                                if (n.parent !== n) {
                                    s.warn("Composite.add: skipped adding a compound body part (you must add its parent instead)");
                                    break
                                }
                                d.addBody(e, n);
                                break;
                            case "constraint":
                                d.addConstraint(e, n);
                                break;
                            case "composite":
                                d.addComposite(e, n);
                                break;
                            case "mouseConstraint":
                                d.addConstraint(e, n.constraint)
                        }
                    }
                    return o.trigger(e, "afterAdd", {
                        object: t
                    }), e
                }, d.remove = function(e, t, i) {
                    var r = [].concat(t);
                    o.trigger(e, "beforeRemove", {
                        object: t
                    });
                    for (var n = 0; n < r.length; n++) {
                        var s = r[n];
                        switch (s.type) {
                            case "body":
                                d.removeBody(e, s, i);
                                break;
                            case "constraint":
                                d.removeConstraint(e, s, i);
                                break;
                            case "composite":
                                d.removeComposite(e, s, i);
                                break;
                            case "mouseConstraint":
                                d.removeConstraint(e, s.constraint)
                        }
                    }
                    return o.trigger(e, "afterRemove", {
                        object: t
                    }), e
                }, d.addComposite = function(e, t) {
                    return e.composites.push(t), t.parent = e, d.setModified(e, !0, !0, !1), e
                }, d.removeComposite = function(e, t, i) {
                    var r = s.indexOf(e.composites, t);
                    if (-1 !== r && (d.removeCompositeAt(e, r), d.setModified(e, !0, !0, !1)), i)
                        for (var n = 0; n < e.composites.length; n++) d.removeComposite(e.composites[n], t, !0);
                    return e
                }, d.removeCompositeAt = function(e, t) {
                    return e.composites.splice(t, 1), d.setModified(e, !0, !0, !1), e
                }, d.addBody = function(e, t) {
                    return e.bodies.push(t), d.setModified(e, !0, !0, !1), e
                }, d.removeBody = function(e, t, i) {
                    var r = s.indexOf(e.bodies, t);
                    if (-1 !== r && (d.removeBodyAt(e, r), d.setModified(e, !0, !0, !1)), i)
                        for (var n = 0; n < e.composites.length; n++) d.removeBody(e.composites[n], t, !0);
                    return e
                }, d.removeBodyAt = function(e, t) {
                    return e.bodies.splice(t, 1), d.setModified(e, !0, !0, !1), e
                }, d.addConstraint = function(e, t) {
                    return e.constraints.push(t), d.setModified(e, !0, !0, !1), e
                }, d.removeConstraint = function(e, t, i) {
                    var r = s.indexOf(e.constraints, t);
                    if (-1 !== r && d.removeConstraintAt(e, r), i)
                        for (var n = 0; n < e.composites.length; n++) d.removeConstraint(e.composites[n], t, !0);
                    return e
                }, d.removeConstraintAt = function(e, t) {
                    return e.constraints.splice(t, 1), d.setModified(e, !0, !0, !1), e
                }, d.clear = function(e, t, i) {
                    if (i)
                        for (var r = 0; r < e.composites.length; r++) d.clear(e.composites[r], t, !0);
                    return t ? e.bodies = e.bodies.filter(function(e) {
                        return e.isStatic
                    }) : e.bodies.length = 0, e.constraints.length = 0, e.composites.length = 0, d.setModified(e, !0, !0, !1), e
                }, d.allBodies = function(e) {
                    for (var t = [].concat(e.bodies), i = 0; i < e.composites.length; i++) t = t.concat(d.allBodies(e.composites[i]));
                    return t
                }, d.allConstraints = function(e) {
                    for (var t = [].concat(e.constraints), i = 0; i < e.composites.length; i++) t = t.concat(d.allConstraints(e.composites[i]));
                    return t
                }, d.allComposites = function(e) {
                    for (var t = [].concat(e.composites), i = 0; i < e.composites.length; i++) t = t.concat(d.allComposites(e.composites[i]));
                    return t
                }, d.get = function(e, t, i) {
                    var r, n;
                    switch (i) {
                        case "body":
                            r = d.allBodies(e);
                            break;
                        case "constraint":
                            r = d.allConstraints(e);
                            break;
                        case "composite":
                            r = d.allComposites(e)
                                .concat(e)
                    }
                    return r ? 0 === (n = r.filter(function(e) {
                            return e.id.toString() === t.toString()
                        }))
                        .length ? null : n[0] : null
                }, d.move = function(e, t, i) {
                    return d.remove(e, t), d.add(i, t), e
                }, d.rebase = function(e) {
                    for (var t = d.allBodies(e)
                            .concat(d.allConstraints(e))
                            .concat(d.allComposites(e)), i = 0; i < t.length; i++) t[i].id = s.nextId();
                    return d.setModified(e, !0, !0, !1), e
                }, d.translate = function(e, t, i) {
                    for (var r = i ? d.allBodies(e) : e.bodies, n = 0; n < r.length; n++) u.translate(r[n], t);
                    return d.setModified(e, !0, !0, !1), e
                }, d.rotate = function(e, t, i, r) {
                    for (var n = Math.cos(t), s = Math.sin(t), o = r ? d.allBodies(e) : e.bodies, a = 0; a < o.length; a++) {
                        var l = o[a]
                            , c = l.position.x - i.x
                            , h = l.position.y - i.y;
                        u.setPosition(l, {
                            x: i.x + (c * n - h * s)
                            , y: i.y + (c * s + h * n)
                        }), u.rotate(l, t)
                    }
                    return d.setModified(e, !0, !0, !1), e
                }, d.scale = function(e, t, i, r, n) {
                    for (var s = n ? d.allBodies(e) : e.bodies, o = 0; o < s.length; o++) {
                        var a = s[o]
                            , l = a.position.x - r.x
                            , c = a.position.y - r.y;
                        u.setPosition(a, {
                            x: r.x + l * t
                            , y: r.y + c * i
                        }), u.scale(a, t, i)
                    }
                    return d.setModified(e, !0, !0, !1), e
                }, d.bounds = function(e) {
                    for (var t = d.allBodies(e), i = [], r = 0; r < t.length; r += 1) {
                        var n = t[r];
                        i.push(n.bounds.min, n.bounds.max)
                    }
                    return a.create(i)
                }
            }, {
                "../core/Common": 14
                , "../core/Events": 16
                , "../geometry/Bounds": 26
                , "./Body": 1
            }]
            , 3: [function(e, t, i) {
                var r = {};
                t.exports = r;
                var n = e("./Composite")
                    , s = (e("../constraint/Constraint"), e("../core/Common"));
                r.create = function(e) {
                    var t = n.create()
                        , i = {
                            label: "World"
                            , gravity: {
                                x: 0
                                , y: 1
                                , scale: .001
                            }
                            , bounds: {
                                min: {
                                    x: -1 / 0
                                    , y: -1 / 0
                                }
                                , max: {
                                    x: 1 / 0
                                    , y: 1 / 0
                                }
                            }
                        };
                    return s.extend(t, i, e)
                }
            }, {
                "../constraint/Constraint": 12
                , "../core/Common": 14
                , "./Composite": 2
            }]
            , 4: [function(e, t, i) {
                var r = {};
                (t.exports = r)
                .create = function(e) {
                    return {
                        id: r.id(e)
                        , vertex: e
                        , normalImpulse: 0
                        , tangentImpulse: 0
                    }
                }, r.id = function(e) {
                    return e.body.id + "_" + e.index
                }
            }, {}]
            , 5: [function(e, t, i) {
                var g = {};
                t.exports = g;
                var p = e("./SAT")
                    , m = e("./Pair")
                    , v = e("../geometry/Bounds");
                g.collisions = function(e, t) {
                    for (var i = [], r = t.pairs.table, n = 0; n < e.length; n++) {
                        var s = e[n][0]
                            , o = e[n][1];
                        if ((!s.isStatic && !s.isSleeping || !o.isStatic && !o.isSleeping) && g.canCollide(s.collisionFilter, o.collisionFilter) && v.overlaps(s.bounds, o.bounds))
                            for (var a = 1 < s.parts.length ? 1 : 0; a < s.parts.length; a++)
                                for (var l = s.parts[a], c = 1 < o.parts.length ? 1 : 0; c < o.parts.length; c++) {
                                    var h = o.parts[c];
                                    if (l === s && h === o || v.overlaps(l.bounds, h.bounds)) {
                                        var d, u = r[m.id(l, h)];
                                        d = u && u.isActive ? u.collision : null;
                                        var f = p.collides(l, h, d);
                                        f.collided && i.push(f)
                                    }
                                }
                    }
                    return i
                }, g.canCollide = function(e, t) {
                    return e.group === t.group && 0 !== e.group ? 0 < e.group : 0 != (e.mask & t.category) && 0 != (t.mask & e.category)
                }
            }, {
                "../geometry/Bounds": 26
                , "./Pair": 7
                , "./SAT": 11
            }]
            , 6: [function(e, t, i) {
                var v = {};
                t.exports = v;
                var a = e("./Pair")
                    , r = e("./Detector")
                    , l = e("../core/Common");
                v.create = function(e) {
                    var t = {
                        controller: v
                        , detector: r.collisions
                        , buckets: {}
                        , pairs: {}
                        , pairsList: []
                        , bucketWidth: 48
                        , bucketHeight: 48
                    };
                    return l.extend(t, e)
                }, v.update = function(e, t, i, r) {
                    var n, s, o, a, l, c = i.world
                        , h = e.buckets
                        , d = !1;
                    for (n = 0; n < t.length; n++) {
                        var u = t[n];
                        if ((!u.isSleeping || r) && !(u.bounds.max.x < c.bounds.min.x || u.bounds.min.x > c.bounds.max.x || u.bounds.max.y < c.bounds.min.y || u.bounds.min.y > c.bounds.max.y)) {
                            var f = v._getRegion(e, u);
                            if (!u.region || f.id !== u.region.id || r) {
                                u.region && !r || (u.region = f);
                                var g = v._regionUnion(f, u.region);
                                for (s = g.startCol; s <= g.endCol; s++)
                                    for (o = g.startRow; o <= g.endRow; o++) {
                                        a = h[l = v._getBucketId(s, o)];
                                        var p = s >= f.startCol && s <= f.endCol && o >= f.startRow && o <= f.endRow
                                            , m = s >= u.region.startCol && s <= u.region.endCol && o >= u.region.startRow && o <= u.region.endRow;
                                        !p && m && m && a && v._bucketRemoveBody(e, a, u), (u.region === f || p && !m || r) && (a || (a = v._createBucket(h, l)), v._bucketAddBody(e, a, u))
                                    }
                                u.region = f, d = !0
                            }
                        }
                    }
                    d && (e.pairsList = v._createActivePairsList(e))
                }, v.clear = function(e) {
                    e.buckets = {}, e.pairs = {}, e.pairsList = []
                }, v._regionUnion = function(e, t) {
                    var i = Math.min(e.startCol, t.startCol)
                        , r = Math.max(e.endCol, t.endCol)
                        , n = Math.min(e.startRow, t.startRow)
                        , s = Math.max(e.endRow, t.endRow);
                    return v._createRegion(i, r, n, s)
                }, v._getRegion = function(e, t) {
                    var i = t.bounds
                        , r = Math.floor(i.min.x / e.bucketWidth)
                        , n = Math.floor(i.max.x / e.bucketWidth)
                        , s = Math.floor(i.min.y / e.bucketHeight)
                        , o = Math.floor(i.max.y / e.bucketHeight);
                    return v._createRegion(r, n, s, o)
                }, v._createRegion = function(e, t, i, r) {
                    return {
                        id: e + "," + t + "," + i + "," + r
                        , startCol: e
                        , endCol: t
                        , startRow: i
                        , endRow: r
                    }
                }, v._getBucketId = function(e, t) {
                    return "C" + e + "R" + t
                }, v._createBucket = function(e, t) {
                    return e[t] = []
                }, v._bucketAddBody = function(e, t, i) {
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r];
                        if (!(i.id === n.id || i.isStatic && n.isStatic)) {
                            var s = a.id(i, n)
                                , o = e.pairs[s];
                            o ? o[2] += 1 : e.pairs[s] = [i, n, 1]
                        }
                    }
                    t.push(i)
                }, v._bucketRemoveBody = function(e, t, i) {
                    t.splice(l.indexOf(t, i), 1);
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r]
                            , s = a.id(i, n)
                            , o = e.pairs[s];
                        o && (o[2] -= 1)
                    }
                }, v._createActivePairsList = function(e) {
                    var t, i, r = [];
                    t = l.keys(e.pairs);
                    for (var n = 0; n < t.length; n++) 0 < (i = e.pairs[t[n]])[2] ? r.push(i) : delete e.pairs[t[n]];
                    return r
                }
            }, {
                "../core/Common": 14
                , "./Detector": 5
                , "./Pair": 7
            }]
            , 7: [function(e, t, i) {
                var u = {};
                t.exports = u;
                var f = e("./Contact");
                u.create = function(e, t) {
                    var i = e.bodyA
                        , r = e.bodyB
                        , n = e.parentA
                        , s = e.parentB
                        , o = {
                            id: u.id(i, r)
                            , bodyA: i
                            , bodyB: r
                            , contacts: {}
                            , activeContacts: []
                            , separation: 0
                            , isActive: !0
                            , isSensor: i.isSensor || r.isSensor
                            , timeCreated: t
                            , timeUpdated: t
                            , inverseMass: n.inverseMass + s.inverseMass
                            , friction: Math.min(n.friction, s.friction)
                            , frictionStatic: Math.max(n.frictionStatic, s.frictionStatic)
                            , restitution: Math.max(n.restitution, s.restitution)
                            , slop: Math.max(n.slop, s.slop)
                        };
                    return u.update(o, e, t), o
                }, u.update = function(e, t, i) {
                    var r = e.contacts
                        , n = t.supports
                        , s = e.activeContacts
                        , o = t.parentA
                        , a = t.parentB;
                    if (e.collision = t, e.inverseMass = o.inverseMass + a.inverseMass, e.friction = Math.min(o.friction, a.friction), e.frictionStatic = Math.max(o.frictionStatic, a.frictionStatic), e.restitution = Math.max(o.restitution, a.restitution), e.slop = Math.max(o.slop, a.slop), s.length = 0, t.collided) {
                        for (var l = 0; l < n.length; l++) {
                            var c = n[l]
                                , h = f.id(c)
                                , d = r[h];
                            d ? s.push(d) : s.push(r[h] = f.create(c))
                        }
                        e.separation = t.depth, u.setActive(e, !0, i)
                    } else !0 === e.isActive && u.setActive(e, !1, i)
                }, u.setActive = function(e, t, i) {
                    t ? (e.isActive = !0, e.timeUpdated = i) : (e.isActive = !1, e.activeContacts.length = 0)
                }, u.id = function(e, t) {
                    return e.id < t.id ? "A" + e.id + "B" + t.id : "A" + t.id + "B" + e.id
                }
            }, {
                "./Contact": 4
            }]
            , 8: [function(e, t, i) {
                var c = {};
                t.exports = c;
                var f = e("./Pair")
                    , g = e("../core/Common");
                c._pairMaxIdleLife = 1e3, c.create = function(e) {
                    return g.extend({
                        table: {}
                        , list: []
                        , collisionStart: []
                        , collisionActive: []
                        , collisionEnd: []
                    }, e)
                }, c.update = function(e, t, i) {
                    var r, n, s, o, a = e.list
                        , l = e.table
                        , c = e.collisionStart
                        , h = e.collisionEnd
                        , d = e.collisionActive
                        , u = [];
                    for (c.length = 0, h.length = 0, o = d.length = 0; o < t.length; o++)(r = t[o])
                        .collided && (n = f.id(r.bodyA, r.bodyB), u.push(n), (s = l[n]) ? (s.isActive ? d.push(s) : c.push(s), f.update(s, r, i)) : (s = f.create(r, i), l[n] = s, c.push(s), a.push(s)));
                    for (o = 0; o < a.length; o++)(s = a[o])
                        .isActive && -1 === g.indexOf(u, s.id) && (f.setActive(s, !1, i), h.push(s))
                }, c.removeOld = function(e, t) {
                    var i, r, n, s, o = e.list
                        , a = e.table
                        , l = [];
                    for (s = 0; s < o.length; s++)(r = (i = o[s])
                            .collision)
                        .bodyA.isSleeping || r.bodyB.isSleeping ? i.timeUpdated = t : t - i.timeUpdated > c._pairMaxIdleLife && l.push(s);
                    for (s = 0; s < l.length; s++) delete a[(i = o[n = l[s] - s])
                        .id], o.splice(n, 1)
                }, c.clear = function(e) {
                    return e.table = {}, e.list.length = 0, e.collisionStart.length = 0, e.collisionActive.length = 0, e.collisionEnd.length = 0, e
                }
            }, {
                "../core/Common": 14
                , "./Pair": 7
            }]
            , 9: [function(e, t, i) {
                var u = {};
                t.exports = u;
                var f = e("../geometry/Vector")
                    , l = e("./SAT")
                    , c = e("../geometry/Bounds")
                    , g = e("../factory/Bodies")
                    , a = e("../geometry/Vertices");
                u.collides = function(e, t) {
                    for (var i = [], r = 0; r < t.length; r++) {
                        var n = t[r];
                        if (c.overlaps(n.bounds, e.bounds))
                            for (var s = 1 === n.parts.length ? 0 : 1; s < n.parts.length; s++) {
                                var o = n.parts[s];
                                if (c.overlaps(o.bounds, e.bounds)) {
                                    var a = l.collides(o, e);
                                    if (a.collided) {
                                        i.push(a);
                                        break
                                    }
                                }
                            }
                    }
                    return i
                }, u.ray = function(e, t, i, r) {
                    r = r || 1e-100;
                    for (var n = f.angle(t, i), s = f.magnitude(f.sub(t, i)), o = .5 * (i.x + t.x), a = .5 * (i.y + t.y), l = g.rectangle(o, a, s, r, {
                            angle: n
                        }), c = u.collides(l, e), h = 0; h < c.length; h += 1) {
                        var d = c[h];
                        d.body = d.bodyB = d.bodyA
                    }
                    return c
                }, u.region = function(e, t, i) {
                    for (var r = [], n = 0; n < e.length; n++) {
                        var s = e[n]
                            , o = c.overlaps(s.bounds, t);
                        (o && !i || !o && i) && r.push(s)
                    }
                    return r
                }, u.point = function(e, t) {
                    for (var i = [], r = 0; r < e.length; r++) {
                        var n = e[r];
                        if (c.contains(n.bounds, t))
                            for (var s = 1 === n.parts.length ? 0 : 1; s < n.parts.length; s++) {
                                var o = n.parts[s];
                                if (c.contains(o.bounds, t) && a.contains(o.vertices, t)) {
                                    i.push(n);
                                    break
                                }
                            }
                    }
                    return i
                }
            }, {
                "../factory/Bodies": 23
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
                , "./SAT": 11
            }]
            , 10: [function(e, t, i) {
                var N = {};
                t.exports = N;
                var s = e("../geometry/Vertices")
                    , j = e("../geometry/Vector")
                    , G = e("../core/Common")
                    , o = e("../geometry/Bounds");
                N._restingThresh = 4, N._restingThreshTangent = 6, N._positionDampen = .9, N._positionWarming = .8, N._frictionNormalMultiplier = 5, N.preSolvePosition = function(e) {
                    var t, i, r;
                    for (t = 0; t < e.length; t++)(i = e[t])
                        .isActive && (r = i.activeContacts.length, i.collision.parentA.totalContacts += r, i.collision.parentB.totalContacts += r)
                }, N.solvePosition = function(e, t) {
                    var i, r, n, s, o, a, l, c, h, d = j._temp[0]
                        , u = j._temp[1]
                        , f = j._temp[2]
                        , g = j._temp[3];
                    for (i = 0; i < e.length; i++)(r = e[i])
                        .isActive && !r.isSensor && (s = (n = r.collision)
                            .parentA, o = n.parentB, a = n.normal, l = j.sub(j.add(o.positionImpulse, o.position, d), j.add(s.positionImpulse, j.sub(o.position, n.penetration, u), f), g), r.separation = j.dot(a, l));
                    for (i = 0; i < e.length; i++)(r = e[i])
                        .isActive && !r.isSensor && (s = (n = r.collision)
                            .parentA, o = n.parentB, a = n.normal, h = (r.separation - r.slop) * t, (s.isStatic || o.isStatic) && (h *= 2), s.isStatic || s.isSleeping || (c = N._positionDampen / s.totalContacts, s.positionImpulse.x += a.x * h * c, s.positionImpulse.y += a.y * h * c), o.isStatic || o.isSleeping || (c = N._positionDampen / o.totalContacts, o.positionImpulse.x -= a.x * h * c, o.positionImpulse.y -= a.y * h * c))
                }, N.postSolvePosition = function(e) {
                    for (var t = 0; t < e.length; t++) {
                        var i = e[t];
                        if ((i.totalContacts = 0) !== i.positionImpulse.x || 0 !== i.positionImpulse.y) {
                            for (var r = 0; r < i.parts.length; r++) {
                                var n = i.parts[r];
                                s.translate(n.vertices, i.positionImpulse), o.update(n.bounds, n.vertices, i.velocity), n.position.x += i.positionImpulse.x, n.position.y += i.positionImpulse.y
                            }
                            i.positionPrev.x += i.positionImpulse.x, i.positionPrev.y += i.positionImpulse.y, j.dot(i.positionImpulse, i.velocity) < 0 ? (i.positionImpulse.x = 0, i.positionImpulse.y = 0) : (i.positionImpulse.x *= N._positionWarming, i.positionImpulse.y *= N._positionWarming)
                        }
                    }
                }, N.preSolveVelocity = function(e) {
                    var t, i, r, n, s, o, a, l, c, h, d, u, f, g, p = j._temp[0]
                        , m = j._temp[1];
                    for (t = 0; t < e.length; t++)
                        if ((r = e[t])
                            .isActive && !r.isSensor)
                            for (n = r.activeContacts, o = (s = r.collision)
                                .parentA, a = s.parentB, l = s.normal, c = s.tangent, i = 0; i < n.length; i++) d = (h = n[i])
                                .vertex, u = h.normalImpulse, f = h.tangentImpulse, 0 === u && 0 === f || (p.x = l.x * u + c.x * f, p.y = l.y * u + c.y * f, o.isStatic || o.isSleeping || (g = j.sub(d, o.position, m), o.positionPrev.x += p.x * o.inverseMass, o.positionPrev.y += p.y * o.inverseMass, o.anglePrev += j.cross(g, p) * o.inverseInertia), a.isStatic || a.isSleeping || (g = j.sub(d, a.position, m), a.positionPrev.x -= p.x * a.inverseMass, a.positionPrev.y -= p.y * a.inverseMass, a.anglePrev -= j.cross(g, p) * a.inverseInertia))
                }, N.solveVelocity = function(e, t) {
                    for (var i = t * t, r = j._temp[0], n = j._temp[1], s = j._temp[2], o = j._temp[3], a = j._temp[4], l = j._temp[5], c = 0; c < e.length; c++) {
                        var h = e[c];
                        if (h.isActive && !h.isSensor) {
                            var d = h.collision
                                , u = d.parentA
                                , f = d.parentB
                                , g = d.normal
                                , p = d.tangent
                                , m = h.activeContacts
                                , v = 1 / m.length;
                            u.velocity.x = u.position.x - u.positionPrev.x, u.velocity.y = u.position.y - u.positionPrev.y, f.velocity.x = f.position.x - f.positionPrev.x, f.velocity.y = f.position.y - f.positionPrev.y, u.angularVelocity = u.angle - u.anglePrev, f.angularVelocity = f.angle - f.anglePrev;
                            for (var y = 0; y < m.length; y++) {
                                var _ = m[y]
                                    , x = _.vertex
                                    , b = j.sub(x, u.position, n)
                                    , w = j.sub(x, f.position, s)
                                    , S = j.add(u.velocity, j.mult(j.perp(b), u.angularVelocity), o)
                                    , C = j.add(f.velocity, j.mult(j.perp(w), f.angularVelocity), a)
                                    , A = j.sub(S, C, l)
                                    , k = j.dot(g, A)
                                    , M = j.dot(p, A)
                                    , P = Math.abs(M)
                                    , R = G.sign(M)
                                    , E = (1 + h.restitution) * k
                                    , T = G.clamp(h.separation + k, 0, 1) * N._frictionNormalMultiplier
                                    , B = M
                                    , F = 1 / 0;
                                P > h.friction * h.frictionStatic * T * i && (F = P, B = G.clamp(h.friction * R * i, -F, F));
                                var O = j.cross(b, g)
                                    , I = j.cross(w, g)
                                    , U = v / (u.inverseMass + f.inverseMass + u.inverseInertia * O * O + f.inverseInertia * I * I);
                                if (E *= U, B *= U, k < 0 && k * k > N._restingThresh * i) _.normalImpulse = 0;
                                else {
                                    var L = _.normalImpulse;
                                    _.normalImpulse = Math.min(_.normalImpulse + E, 0), E = _.normalImpulse - L
                                }
                                if (M * M > N._restingThreshTangent * i) _.tangentImpulse = 0;
                                else {
                                    var V = _.tangentImpulse;
                                    _.tangentImpulse = G.clamp(_.tangentImpulse + B, -F, F), B = _.tangentImpulse - V
                                }
                                r.x = g.x * E + p.x * B, r.y = g.y * E + p.y * B, u.isStatic || u.isSleeping || (u.positionPrev.x += r.x * u.inverseMass, u.positionPrev.y += r.y * u.inverseMass, u.anglePrev += j.cross(b, r) * u.inverseInertia), f.isStatic || f.isSleeping || (f.positionPrev.x -= r.x * f.inverseMass, f.positionPrev.y -= r.y * f.inverseMass, f.anglePrev -= j.cross(w, r) * f.inverseInertia)
                            }
                        }
                    }
                }
            }, {
                "../core/Common": 14
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
            }]
            , 11: [function(e, t, i) {
                var v = {};
                t.exports = v;
                var y = e("../geometry/Vertices")
                    , _ = e("../geometry/Vector");
                v.collides = function(e, t, i) {
                    var r, n, s, o, a = !1;
                    if (i) {
                        var l = e.parent
                            , c = t.parent
                            , h = l.speed * l.speed + l.angularSpeed * l.angularSpeed + c.speed * c.speed + c.angularSpeed * c.angularSpeed;
                        a = i && i.collided && h < .2, o = i
                    } else o = {
                        collided: !1
                        , bodyA: e
                        , bodyB: t
                    };
                    if (i && a) {
                        var d = o.axisBody
                            , u = d === e ? t : e
                            , f = [d.axes[i.axisNumber]];
                        if (s = v._overlapAxes(d.vertices, u.vertices, f), o.reused = !0, s.overlap <= 0) return o.collided = !1, o
                    } else {
                        if ((r = v._overlapAxes(e.vertices, t.vertices, e.axes))
                            .overlap <= 0) return o.collided = !1, o;
                        if ((n = v._overlapAxes(t.vertices, e.vertices, t.axes))
                            .overlap <= 0) return o.collided = !1, o;
                        r.overlap < n.overlap ? (s = r, o.axisBody = e) : (s = n, o.axisBody = t), o.axisNumber = s.axisNumber
                    }
                    o.bodyA = e.id < t.id ? e : t, o.bodyB = e.id < t.id ? t : e, o.collided = !0, o.depth = s.overlap, o.parentA = o.bodyA.parent, o.parentB = o.bodyB.parent, e = o.bodyA, t = o.bodyB, _.dot(s.axis, _.sub(t.position, e.position)) < 0 ? o.normal = {
                        x: s.axis.x
                        , y: s.axis.y
                    } : o.normal = {
                        x: -s.axis.x
                        , y: -s.axis.y
                    }, o.tangent = _.perp(o.normal), o.penetration = o.penetration || {}, o.penetration.x = o.normal.x * o.depth, o.penetration.y = o.normal.y * o.depth;
                    var g = v._findSupports(e, t, o.normal)
                        , p = [];
                    if (y.contains(e.vertices, g[0]) && p.push(g[0]), y.contains(e.vertices, g[1]) && p.push(g[1]), p.length < 2) {
                        var m = v._findSupports(t, e, _.neg(o.normal));
                        y.contains(t.vertices, m[0]) && p.push(m[0]), p.length < 2 && y.contains(t.vertices, m[1]) && p.push(m[1])
                    }
                    return p.length < 1 && (p = [g[0]]), o.supports = p, o
                }, v._overlapAxes = function(e, t, i) {
                    for (var r, n, s = _._temp[0], o = _._temp[1], a = {
                            overlap: Number.MAX_VALUE
                        }, l = 0; l < i.length; l++) {
                        if (n = i[l], v._projectToAxis(s, e, n), v._projectToAxis(o, t, n), (r = Math.min(s.max - o.min, o.max - s.min)) <= 0) return a.overlap = r, a;
                        r < a.overlap && (a.overlap = r, a.axis = n, a.axisNumber = l)
                    }
                    return a
                }, v._projectToAxis = function(e, t, i) {
                    for (var r = _.dot(t[0], i), n = r, s = 1; s < t.length; s += 1) {
                        var o = _.dot(t[s], i);
                        n < o ? n = o : o < r && (r = o)
                    }
                    e.min = r, e.max = n
                }, v._findSupports = function(e, t, i) {
                    for (var r, n, s, o, a = Number.MAX_VALUE, l = _._temp[0], c = t.vertices, h = e.position, d = 0; d < c.length; d++) n = c[d], l.x = n.x - h.x, l.y = n.y - h.y, (r = -_.dot(i, l)) < a && (a = r, s = n);
                    return n = c[0 <= s.index - 1 ? s.index - 1 : c.length - 1], l.x = n.x - h.x, l.y = n.y - h.y, a = -_.dot(i, l), o = n, n = c[(s.index + 1) % c.length], l.x = n.x - h.x, l.y = n.y - h.y, (r = -_.dot(i, l)) < a && (o = n), [s, o]
                }
            }, {
                "../geometry/Vector": 28
                , "../geometry/Vertices": 29
            }]
            , 12: [function(e, t, i) {
                var b = {};
                t.exports = b;
                var o = e("../geometry/Vertices")
                    , w = e("../geometry/Vector")
                    , a = e("../core/Sleeping")
                    , l = e("../geometry/Bounds")
                    , c = e("../geometry/Axes")
                    , h = e("../core/Common");
                b._warming = .4, b._torqueDampen = 1, b._minLength = 1e-6, b.create = function(e) {
                    var t = e;
                    t.bodyA && !t.pointA && (t.pointA = {
                        x: 0
                        , y: 0
                    }), t.bodyB && !t.pointB && (t.pointB = {
                        x: 0
                        , y: 0
                    });
                    var i = t.bodyA ? w.add(t.bodyA.position, t.pointA) : t.pointA
                        , r = t.bodyB ? w.add(t.bodyB.position, t.pointB) : t.pointB
                        , n = w.magnitude(w.sub(i, r));
                    t.length = void 0 !== t.length ? t.length : n, t.id = t.id || h.nextId(), t.label = t.label || "Constraint", t.type = "constraint", t.stiffness = t.stiffness || (0 < t.length ? 1 : .7), t.damping = t.damping || 0, t.angularStiffness = t.angularStiffness || 0, t.angleA = t.bodyA ? t.bodyA.angle : t.angleA, t.angleB = t.bodyB ? t.bodyB.angle : t.angleB, t.plugin = {};
                    var s = {
                        visible: !0
                        , lineWidth: 2
                        , strokeStyle: "#ffffff"
                        , type: "line"
                        , anchors: !0
                    };
                    return 0 === t.length && .1 < t.stiffness ? (s.type = "pin", s.anchors = !1) : t.stiffness < .9 && (s.type = "spring"), t.render = h.extend(s, t.render), t
                }, b.preSolveAll = function(e) {
                    for (var t = 0; t < e.length; t += 1) {
                        var i = e[t]
                            , r = i.constraintImpulse;
                        i.isStatic || 0 === r.x && 0 === r.y && 0 === r.angle || (i.position.x += r.x, i.position.y += r.y, i.angle += r.angle)
                    }
                }, b.solveAll = function(e, t) {
                    for (var i = 0; i < e.length; i += 1) {
                        var r = e[i]
                            , n = !r.bodyA || r.bodyA && r.bodyA.isStatic
                            , s = !r.bodyB || r.bodyB && r.bodyB.isStatic;
                        (n || s) && b.solve(e[i], t)
                    }
                    for (i = 0; i < e.length; i += 1) n = !(r = e[i])
                        .bodyA || r.bodyA && r.bodyA.isStatic, s = !r.bodyB || r.bodyB && r.bodyB.isStatic, n || s || b.solve(e[i], t)
                }, b.solve = function(e, t) {
                    var i = e.bodyA
                        , r = e.bodyB
                        , n = e.pointA
                        , s = e.pointB;
                    if (i || r) {
                        i && !i.isStatic && (w.rotate(n, i.angle - e.angleA, n), e.angleA = i.angle), r && !r.isStatic && (w.rotate(s, r.angle - e.angleB, s), e.angleB = r.angle);
                        var o = n
                            , a = s;
                        if (i && (o = w.add(i.position, n)), r && (a = w.add(r.position, s)), o && a) {
                            var l = w.sub(o, a)
                                , c = w.magnitude(l);
                            c < b._minLength && (c = b._minLength);
                            var h, d, u, f, g, p = (c - e.length) / c
                                , m = e.stiffness < 1 ? e.stiffness * t : e.stiffness
                                , v = w.mult(l, p * m)
                                , y = (i ? i.inverseMass : 0) + (r ? r.inverseMass : 0)
                                , _ = y + ((i ? i.inverseInertia : 0) + (r ? r.inverseInertia : 0));
                            if (e.damping) {
                                var x = w.create();
                                u = w.div(l, c), g = w.sub(r && w.sub(r.position, r.positionPrev) || x, i && w.sub(i.position, i.positionPrev) || x), f = w.dot(u, g)
                            }
                            i && !i.isStatic && (d = i.inverseMass / y, i.constraintImpulse.x -= v.x * d, i.constraintImpulse.y -= v.y * d, i.position.x -= v.x * d, i.position.y -= v.y * d, e.damping && (i.positionPrev.x -= e.damping * u.x * f * d, i.positionPrev.y -= e.damping * u.y * f * d), h = w.cross(n, v) / _ * b._torqueDampen * i.inverseInertia * (1 - e.angularStiffness), i.constraintImpulse.angle -= h, i.angle -= h), r && !r.isStatic && (d = r.inverseMass / y, r.constraintImpulse.x += v.x * d, r.constraintImpulse.y += v.y * d, r.position.x += v.x * d, r.position.y += v.y * d, e.damping && (r.positionPrev.x += e.damping * u.x * f * d, r.positionPrev.y += e.damping * u.y * f * d), h = w.cross(s, v) / _ * b._torqueDampen * r.inverseInertia * (1 - e.angularStiffness), r.constraintImpulse.angle += h, r.angle += h)
                        }
                    }
                }, b.postSolveAll = function(e) {
                    for (var t = 0; t < e.length; t++) {
                        var i = e[t]
                            , r = i.constraintImpulse;
                        if (!(i.isStatic || 0 === r.x && 0 === r.y && 0 === r.angle)) {
                            a.set(i, !1);
                            for (var n = 0; n < i.parts.length; n++) {
                                var s = i.parts[n];
                                o.translate(s.vertices, r), 0 < n && (s.position.x += r.x, s.position.y += r.y), 0 !== r.angle && (o.rotate(s.vertices, r.angle, i.position), c.rotate(s.axes, r.angle), 0 < n && w.rotateAbout(s.position, r.angle, i.position, s.position)), l.update(s.bounds, s.vertices, i.velocity)
                            }
                            r.angle *= b._warming, r.x *= b._warming, r.y *= b._warming
                        }
                    }
                }
            }, {
                "../core/Common": 14
                , "../core/Sleeping": 22
                , "../geometry/Axes": 25
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
            }]
            , 13: [function(e, t, i) {
                var s = {};
                t.exports = s;
                var l = e("../geometry/Vertices")
                    , c = e("../core/Sleeping")
                    , o = e("../core/Mouse")
                    , h = e("../core/Events")
                    , d = e("../collision/Detector")
                    , a = e("./Constraint")
                    , u = e("../body/Composite")
                    , f = e("../core/Common")
                    , g = e("../geometry/Bounds");
                s.create = function(t, e) {
                    var i = (t ? t.mouse : null) || (e ? e.mouse : null);
                    i || (t && t.render && t.render.canvas ? i = o.create(t.render.canvas) : e && e.element ? i = o.create(e.element) : (i = o.create(), f.warn("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected")));
                    var r = {
                            type: "mouseConstraint"
                            , mouse: i
                            , element: null
                            , body: null
                            , constraint: a.create({
                                label: "Mouse Constraint"
                                , pointA: i.position
                                , pointB: {
                                    x: 0
                                    , y: 0
                                }
                                , length: .01
                                , stiffness: .1
                                , angularStiffness: 1
                                , render: {
                                    strokeStyle: "#90EE90"
                                    , lineWidth: 3
                                }
                            })
                            , collisionFilter: {
                                category: 1
                                , mask: 4294967295
                                , group: 0
                            }
                        }
                        , n = f.extend(r, e);
                    return h.on(t, "beforeUpdate", function() {
                        var e = u.allBodies(t.world);
                        s.update(n, e), s._triggerEvents(n)
                    }), n
                }, s.update = function(e, t) {
                    var i = e.mouse
                        , r = e.constraint
                        , n = e.body;
                    if (0 === i.button) {
                        if (r.bodyB) c.set(r.bodyB, !1), r.pointA = i.position;
                        else
                            for (var s = 0; s < t.length; s++)
                                if (n = t[s], g.contains(n.bounds, i.position) && d.canCollide(n.collisionFilter, e.collisionFilter))
                                    for (var o = 1 < n.parts.length ? 1 : 0; o < n.parts.length; o++) {
                                        var a = n.parts[o];
                                        if (l.contains(a.vertices, i.position)) {
                                            r.pointA = i.position, r.bodyB = e.body = n, r.pointB = {
                                                x: i.position.x - n.position.x
                                                , y: i.position.y - n.position.y
                                            }, r.angleB = n.angle, c.set(n, !1), h.trigger(e, "startdrag", {
                                                mouse: i
                                                , body: n
                                            });
                                            break
                                        }
                                    }
                    } else r.bodyB = e.body = null, r.pointB = null, n && h.trigger(e, "enddrag", {
                        mouse: i
                        , body: n
                    })
                }, s._triggerEvents = function(e) {
                    var t = e.mouse
                        , i = t.sourceEvents;
                    i.mousemove && h.trigger(e, "mousemove", {
                        mouse: t
                    }), i.mousedown && h.trigger(e, "mousedown", {
                        mouse: t
                    }), i.mouseup && h.trigger(e, "mouseup", {
                        mouse: t
                    }), o.clearSourceEvents(t)
                }
            }, {
                "../body/Composite": 2
                , "../collision/Detector": 5
                , "../core/Common": 14
                , "../core/Events": 16
                , "../core/Mouse": 19
                , "../core/Sleeping": 22
                , "../geometry/Bounds": 26
                , "../geometry/Vertices": 29
                , "./Constraint": 12
            }]
            , 14: [function(n, e, t) {
                (function(r) {
                    var l = {};
                    e.exports = l
                        , function() {
                            l._nextId = 0, l._seed = 0, l._nowStartTime = +new Date, l.extend = function(e, t) {
                                var i, r;
                                r = "boolean" == typeof t ? (i = 2, t) : (i = 1, !0);
                                for (var n = i; n < arguments.length; n++) {
                                    var s = arguments[n];
                                    if (s)
                                        for (var o in s) r && s[o] && s[o].constructor === Object ? e[o] && e[o].constructor !== Object ? e[o] = s[o] : (e[o] = e[o] || {}, l.extend(e[o], r, s[o])) : e[o] = s[o]
                                }
                                return e
                            }, l.clone = function(e, t) {
                                return l.extend({}, t, e)
                            }, l.keys = function(e) {
                                if (Object.keys) return Object.keys(e);
                                var t = [];
                                for (var i in e) t.push(i);
                                return t
                            }, l.values = function(e) {
                                var t = [];
                                if (Object.keys) {
                                    for (var i = Object.keys(e), r = 0; r < i.length; r++) t.push(e[i[r]]);
                                    return t
                                }
                                for (var n in e) t.push(e[n]);
                                return t
                            }, l.get = function(e, t, i, r) {
                                t = t.split(".")
                                    .slice(i, r);
                                for (var n = 0; n < t.length; n += 1) e = e[t[n]];
                                return e
                            }, l.set = function(e, t, i, r, n) {
                                var s = t.split(".")
                                    .slice(r, n);
                                return l.get(e, t, 0, -1)[s[s.length - 1]] = i
                            }, l.shuffle = function(e) {
                                for (var t = e.length - 1; 0 < t; t--) {
                                    var i = Math.floor(l.random() * (t + 1))
                                        , r = e[t];
                                    e[t] = e[i], e[i] = r
                                }
                                return e
                            }, l.choose = function(e) {
                                return e[Math.floor(l.random() * e.length)]
                            }, l.isElement = function(e) {
                                return "undefined" != typeof HTMLElement ? e instanceof HTMLElement : !!(e && e.nodeType && e.nodeName)
                            }, l.isArray = function(e) {
                                return "[object Array]" === Object.prototype.toString.call(e)
                            }, l.isFunction = function(e) {
                                return "function" == typeof e
                            }, l.isPlainObject = function(e) {
                                return "object" == typeof e && e.constructor === Object
                            }, l.isString = function(e) {
                                return "[object String]" === toString.call(e)
                            }, l.clamp = function(e, t, i) {
                                return e < t ? t : i < e ? i : e
                            }, l.sign = function(e) {
                                return e < 0 ? -1 : 1
                            }, l.now = function() {
                                if (window.performance) {
                                    if (window.performance.now) return window.performance.now();
                                    if (window.performance.webkitNow) return window.performance.webkitNow()
                                }
                                return new Date - l._nowStartTime
                            }, l.random = function(e, t) {
                                return t = void 0 !== t ? t : 1, (e = void 0 !== e ? e : 0) + i() * (t - e)
                            };
                            var i = function() {
                                return l._seed = (9301 * l._seed + 49297) % 233280, l._seed / 233280
                            };
                            l.colorToNumber = function(e) {
                                return 3 == (e = e.replace("#", ""))
                                    .length && (e = e.charAt(0) + e.charAt(0) + e.charAt(1) + e.charAt(1) + e.charAt(2) + e.charAt(2)), parseInt(e, 16)
                            }, l.logLevel = 1, l.log = function() {
                                console && 0 < l.logLevel && l.logLevel <= 3 && console.log.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)))
                            }, l.info = function() {
                                console && 0 < l.logLevel && l.logLevel <= 2 && console.info.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)))
                            }, l.warn = function() {
                                console && 0 < l.logLevel && l.logLevel <= 3 && console.warn.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)))
                            }, l.nextId = function() {
                                return l._nextId++
                            }, l.indexOf = function(e, t) {
                                if (e.indexOf) return e.indexOf(t);
                                for (var i = 0; i < e.length; i++)
                                    if (e[i] === t) return i;
                                return -1
                            }, l.map = function(e, t) {
                                if (e.map) return e.map(t);
                                for (var i = [], r = 0; r < e.length; r += 1) i.push(t(e[r]));
                                return i
                            }, l.topologicalSort = function(e) {
                                var t = []
                                    , i = []
                                    , r = [];
                                for (var n in e) i[n] || r[n] || l._topologicalSort(n, i, r, e, t);
                                return t
                            }, l._topologicalSort = function(e, t, i, r, n) {
                                var s = r[e] || [];
                                i[e] = !0;
                                for (var o = 0; o < s.length; o += 1) {
                                    var a = s[o];
                                    i[a] || (t[a] || l._topologicalSort(a, t, i, r, n))
                                }
                                i[e] = !1, t[e] = !0, n.push(e)
                            }, l.chain = function() {
                                for (var s = [], e = 0; e < arguments.length; e += 1) {
                                    var t = arguments[e];
                                    t._chained ? s.push.apply(s, t._chained) : s.push(t)
                                }
                                var i = function() {
                                    for (var e, t = new Array(arguments.length), i = 0, r = arguments.length; i < r; i++) t[i] = arguments[i];
                                    for (i = 0; i < s.length; i += 1) {
                                        var n = s[i].apply(e, t);
                                        void 0 !== n && (e = n)
                                    }
                                    return e
                                };
                                return i._chained = s, i
                            }, l.chainPathBefore = function(e, t, i) {
                                return l.set(e, t, l.chain(i, l.get(e, t)))
                            }, l.chainPathAfter = function(e, t, i) {
                                return l.set(e, t, l.chain(l.get(e, t), i))
                            }, l._requireGlobal = function(e, t) {
                                return ("undefined" != typeof window ? window[e] : void 0 !== r ? r[e] : null) || n(t)
                            }
                        }()
                })
                .call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {}]
            , 15: [function(e, t, i) {
                var g = {};
                t.exports = g;
                var s = e("../body/World")
                    , p = e("./Sleeping")
                    , m = e("../collision/Resolver")
                    , o = e("../render/Render")
                    , v = e("../collision/Pairs")
                    , a = (e("./Metrics"), e("../collision/Grid"))
                    , y = e("./Events")
                    , _ = e("../body/Composite")
                    , x = e("../constraint/Constraint")
                    , l = e("./Common")
                    , c = e("../body/Body");
                g.create = function(e, t) {
                    t = (t = l.isElement(e) ? t : e) || {}, ((e = l.isElement(e) ? e : null) || t.render) && l.warn("Engine.create: engine.render is deprecated (see docs)");
                    var i = {
                            positionIterations: 6
                            , velocityIterations: 4
                            , constraintIterations: 2
                            , enableSleeping: !1
                            , events: []
                            , plugin: {}
                            , timing: {
                                timestamp: 0
                                , timeScale: 1
                            }
                            , broadphase: {
                                controller: a
                            }
                        }
                        , r = l.extend(i, t);
                    if (e || r.render) {
                        var n = {
                            element: e
                            , controller: o
                        };
                        r.render = l.extend(n, r.render)
                    }
                    return r.render && r.render.controller && (r.render = r.render.controller.create(r.render)), r.render && (r.render.engine = r), r.world = t.world || s.create(r.world), r.pairs = v.create(), r.broadphase = r.broadphase.controller.create(r.broadphase), r.metrics = r.metrics || {
                        extended: !1
                    }, r
                }, g.update = function(e, t, i) {
                    t = t || 1e3 / 60, i = i || 1;
                    var r, n = e.world
                        , s = e.timing
                        , o = e.broadphase
                        , a = [];
                    s.timestamp += t * s.timeScale;
                    var l = {
                        timestamp: s.timestamp
                    };
                    y.trigger(e, "beforeUpdate", l);
                    var c = _.allBodies(n)
                        , h = _.allConstraints(n);
                    for (e.enableSleeping && p.update(c, s.timeScale), g._bodiesApplyGravity(c, n.gravity), g._bodiesUpdate(c, t, s.timeScale, i, n.bounds), x.preSolveAll(c), r = 0; r < e.constraintIterations; r++) x.solveAll(h, s.timeScale);
                    x.postSolveAll(c), a = o.controller ? (n.isModified && o.controller.clear(o), o.controller.update(o, c, e, n.isModified), o.pairsList) : c, n.isModified && _.setModified(n, !1, !1, !0);
                    var d = o.detector(a, e)
                        , u = e.pairs
                        , f = s.timestamp;
                    for (v.update(u, d, f), v.removeOld(u, f), e.enableSleeping && p.afterCollisions(u.list, s.timeScale), 0 < u.collisionStart.length && y.trigger(e, "collisionStart", {
                            pairs: u.collisionStart
                        }), m.preSolvePosition(u.list), r = 0; r < e.positionIterations; r++) m.solvePosition(u.list, s.timeScale);
                    for (m.postSolvePosition(c), x.preSolveAll(c), r = 0; r < e.constraintIterations; r++) x.solveAll(h, s.timeScale);
                    for (x.postSolveAll(c), m.preSolveVelocity(u.list), r = 0; r < e.velocityIterations; r++) m.solveVelocity(u.list, s.timeScale);
                    return 0 < u.collisionActive.length && y.trigger(e, "collisionActive", {
                        pairs: u.collisionActive
                    }), 0 < u.collisionEnd.length && y.trigger(e, "collisionEnd", {
                        pairs: u.collisionEnd
                    }), g._bodiesClearForces(c), y.trigger(e, "afterUpdate", l), e
                }, g.merge = function(e, t) {
                    if (l.extend(e, t), t.world) {
                        e.world = t.world, g.clear(e);
                        for (var i = _.allBodies(e.world), r = 0; r < i.length; r++) {
                            var n = i[r];
                            p.set(n, !1), n.id = l.nextId()
                        }
                    }
                }, g.clear = function(e) {
                    var t = e.world;
                    v.clear(e.pairs);
                    var i = e.broadphase;
                    if (i.controller) {
                        var r = _.allBodies(t);
                        i.controller.clear(i), i.controller.update(i, r, e, !0)
                    }
                }, g._bodiesClearForces = function(e) {
                    for (var t = 0; t < e.length; t++) {
                        var i = e[t];
                        i.force.x = 0, i.force.y = 0, i.torque = 0
                    }
                }, g._bodiesApplyGravity = function(e, t) {
                    var i = void 0 !== t.scale ? t.scale : .001;
                    if ((0 !== t.x || 0 !== t.y) && 0 !== i)
                        for (var r = 0; r < e.length; r++) {
                            var n = e[r];
                            n.isStatic || n.isSleeping || (n.force.y += n.mass * t.y * i, n.force.x += n.mass * t.x * i)
                        }
                }, g._bodiesUpdate = function(e, t, i, r, n) {
                    for (var s = 0; s < e.length; s++) {
                        var o = e[s];
                        o.isStatic || o.isSleeping || c.update(o, t, i, r)
                    }
                }
            }, {
                "../body/Body": 1
                , "../body/Composite": 2
                , "../body/World": 3
                , "../collision/Grid": 6
                , "../collision/Pairs": 8
                , "../collision/Resolver": 10
                , "../constraint/Constraint": 12
                , "../render/Render": 31
                , "./Common": 14
                , "./Events": 16
                , "./Metrics": 18
                , "./Sleeping": 22
            }]
            , 16: [function(e, t, i) {
                var r = {};
                t.exports = r;
                var c = e("./Common");
                r.on = function(e, t, i) {
                    for (var r, n = t.split(" "), s = 0; s < n.length; s++) r = n[s], e.events = e.events || {}, e.events[r] = e.events[r] || [], e.events[r].push(i);
                    return i
                }, r.off = function(e, t, i) {
                    if (t) {
                        "function" == typeof t && (i = t, t = c.keys(e.events)
                            .join(" "));
                        for (var r = t.split(" "), n = 0; n < r.length; n++) {
                            var s = e.events[r[n]]
                                , o = [];
                            if (i && s)
                                for (var a = 0; a < s.length; a++) s[a] !== i && o.push(s[a]);
                            e.events[r[n]] = o
                        }
                    } else e.events = {}
                }, r.trigger = function(e, t, i) {
                    var r, n, s, o;
                    if (e.events) {
                        i || (i = {}), r = t.split(" ");
                        for (var a = 0; a < r.length; a++)
                            if (n = r[a], s = e.events[n]) {
                                (o = c.clone(i, !1))
                                .name = n, o.source = e;
                                for (var l = 0; l < s.length; l++) s[l].apply(e, [o])
                            }
                    }
                }
            }, {
                "./Common": 14
            }]
            , 17: [function(e, t, i) {
                var r = {};
                t.exports = r;
                var n = e("./Plugin")
                    , s = e("./Common");
                r.name = "matter-js", r.version = "0.14.2", r.uses = [], r.used = [], r.use = function() {
                    n.use(r, Array.prototype.slice.call(arguments))
                }, r.before = function(e, t) {
                    return e = e.replace(/^Matter./, ""), s.chainPathBefore(r, e, t)
                }, r.after = function(e, t) {
                    return e = e.replace(/^Matter./, ""), s.chainPathAfter(r, e, t)
                }
            }, {
                "./Common": 14
                , "./Plugin": 20
            }]
            , 18: [function(e, t, i) {}, {
                "../body/Composite": 2
                , "./Common": 14
            }]
            , 19: [function(e, t, i) {
                var r = {};
                t.exports = r;
                var n = e("../core/Common");
                r.create = function(e) {
                    var i = {};
                    return e || n.log("Mouse.create: element was undefined, defaulting to document.body", "warn"), i.element = e || document.body, i.absolute = {
                        x: 0
                        , y: 0
                    }, i.position = {
                        x: 0
                        , y: 0
                    }, i.mousedownPosition = {
                        x: 0
                        , y: 0
                    }, i.mouseupPosition = {
                        x: 0
                        , y: 0
                    }, i.offset = {
                        x: 0
                        , y: 0
                    }, i.scale = {
                        x: 1
                        , y: 1
                    }, i.wheelDelta = 0, i.button = -1, i.pixelRatio = i.element.getAttribute("data-pixel-ratio") || 1, i.sourceEvents = {
                        mousemove: null
                        , mousedown: null
                        , mouseup: null
                        , mousewheel: null
                    }, i.mousemove = function(e) {
                        var t = r._getRelativeMousePosition(e, i.element, i.pixelRatio);
                        e.changedTouches && (i.button = 0, e.preventDefault()), i.absolute.x = t.x, i.absolute.y = t.y, i.position.x = i.absolute.x * i.scale.x + i.offset.x, i.position.y = i.absolute.y * i.scale.y + i.offset.y, i.sourceEvents.mousemove = e
                    }, i.mousedown = function(e) {
                        var t = r._getRelativeMousePosition(e, i.element, i.pixelRatio);
                        e.changedTouches ? (i.button = 0, e.preventDefault()) : i.button = e.button, i.absolute.x = t.x, i.absolute.y = t.y, i.position.x = i.absolute.x * i.scale.x + i.offset.x, i.position.y = i.absolute.y * i.scale.y + i.offset.y, i.mousedownPosition.x = i.position.x, i.mousedownPosition.y = i.position.y, i.sourceEvents.mousedown = e
                    }, i.mouseup = function(e) {
                        var t = r._getRelativeMousePosition(e, i.element, i.pixelRatio);
                        e.changedTouches && e.preventDefault(), i.button = -1, i.absolute.x = t.x, i.absolute.y = t.y, i.position.x = i.absolute.x * i.scale.x + i.offset.x, i.position.y = i.absolute.y * i.scale.y + i.offset.y, i.mouseupPosition.x = i.position.x, i.mouseupPosition.y = i.position.y, i.sourceEvents.mouseup = e
                    }, i.mousewheel = function(e) {
                        i.wheelDelta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)), e.preventDefault()
                    }, r.setElement(i, i.element), i
                }, r.setElement = function(e, t) {
                    var i = {
                        passive: !1
                    };
                    (e.element = t)
                    .addEventListener("mousemove", e.mousemove, i), t.addEventListener("mousedown", e.mousedown, i), t.addEventListener("mouseup", e.mouseup, i), t.addEventListener("mousewheel", e.mousewheel, i), t.addEventListener("DOMMouseScroll", e.mousewheel, i), t.addEventListener("touchmove", e.mousemove, i), t.addEventListener("touchstart", e.mousedown, i), t.addEventListener("touchend", e.mouseup, i)
                }, r.clearSourceEvents = function(e) {
                    e.sourceEvents.mousemove = null, e.sourceEvents.mousedown = null, e.sourceEvents.mouseup = null, e.sourceEvents.mousewheel = null, e.wheelDelta = 0
                }, r.setOffset = function(e, t) {
                    e.offset.x = t.x, e.offset.y = t.y, e.position.x = e.absolute.x * e.scale.x + e.offset.x, e.position.y = e.absolute.y * e.scale.y + e.offset.y
                }, r.setScale = function(e, t) {
                    e.scale.x = t.x, e.scale.y = t.y, e.position.x = e.absolute.x * e.scale.x + e.offset.x, e.position.y = e.absolute.y * e.scale.y + e.offset.y
                }, r._getRelativeMousePosition = function(e, t, i) {
                    var r, n, s = t.getBoundingClientRect()
                        , o = document.documentElement || document.body.parentNode || document.body
                        , a = void 0 !== window.pageXOffset ? window.pageXOffset : o.scrollLeft
                        , l = void 0 !== window.pageYOffset ? window.pageYOffset : o.scrollTop
                        , c = e.changedTouches;
                    return n = c ? (r = c[0].pageX - s.left - a, c[0].pageY - s.top - l) : (r = e.pageX - s.left - a, e.pageY - s.top - l), {
                        x: r / (t.clientWidth / (t.width || t.clientWidth) * i)
                        , y: n / (t.clientHeight / (t.height || t.clientHeight) * i)
                    }
                }
            }, {
                "../core/Common": 14
            }]
            , 20: [function(e, t, i) {
                var a = {};
                t.exports = a;
                var l = e("./Common");
                a._registry = {}, a.register = function(e) {
                    if (a.isPlugin(e) || l.warn("Plugin.register:", a.toString(e), "does not implement all required fields."), e.name in a._registry) {
                        var t = a._registry[e.name]
                            , i = a.versionParse(e.version)
                            .number
                            , r = a.versionParse(t.version)
                            .number;
                        r < i ? (l.warn("Plugin.register:", a.toString(t), "was upgraded to", a.toString(e)), a._registry[e.name] = e) : i < r ? l.warn("Plugin.register:", a.toString(t), "can not be downgraded to", a.toString(e)) : e !== t && l.warn("Plugin.register:", a.toString(e), "is already registered to different plugin object")
                    } else a._registry[e.name] = e;
                    return e
                }, a.resolve = function(e) {
                    return a._registry[a.dependencyParse(e)
                        .name]
                }, a.toString = function(e) {
                    return "string" == typeof e ? e : (e.name || "anonymous") + "@" + (e.version || e.range || "0.0.0")
                }, a.isPlugin = function(e) {
                    return e && e.name && e.version && e.install
                }, a.isUsed = function(e, t) {
                    return -1 < e.used.indexOf(t)
                }, a.isFor = function(e, t) {
                    var i = e.for && a.dependencyParse(e.for);
                    return !e.for || t.name === i.name && a.versionSatisfies(t.version, i.range)
                }, a.use = function(e, t) {
                    if (e.uses = (e.uses || [])
                        .concat(t || []), 0 !== e.uses.length) {
                        for (var i = a.dependencies(e), r = l.topologicalSort(i), n = [], s = 0; s < r.length; s += 1)
                            if (r[s] !== e.name) {
                                var o = a.resolve(r[s]);
                                o ? a.isUsed(e, o.name) || (a.isFor(o, e) || (l.warn("Plugin.use:", a.toString(o), "is for", o.for, "but installed on", a.toString(e) + "."), o._warned = !0), o.install ? o.install(e) : (l.warn("Plugin.use:", a.toString(o), "does not specify an install function."), o._warned = !0), o._warned ? (n.push("ðŸ”¶ " + a.toString(o)), delete o._warned) : n.push("âœ… " + a.toString(o)), e.used.push(o.name)) : n.push("âŒ " + r[s])
                            }
                        0 < n.length && l.info(n.join("  "))
                    } else l.warn("Plugin.use:", a.toString(e), "does not specify any dependencies to install.")
                }, a.dependencies = function(r, e) {
                    var n = a.dependencyParse(r)
                        , t = n.name;
                    if (!(t in (e = e || {}))) {
                        r = a.resolve(r) || r, e[t] = l.map(r.uses || [], function(e) {
                            a.isPlugin(e) && a.register(e);
                            var t = a.dependencyParse(e)
                                , i = a.resolve(e);
                            return i && !a.versionSatisfies(i.version, t.range) ? (l.warn("Plugin.dependencies:", a.toString(i), "does not satisfy", a.toString(t), "used by", a.toString(n) + "."), i._warned = !0, r._warned = !0) : i || (l.warn("Plugin.dependencies:", a.toString(e), "used by", a.toString(n), "could not be resolved."), r._warned = !0), t.name
                        });
                        for (var i = 0; i < e[t].length; i += 1) a.dependencies(e[t][i], e);
                        return e
                    }
                }, a.dependencyParse = function(e) {
                    return l.isString(e) ? (/^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-]+)?))?$/.test(e) || l.warn("Plugin.dependencyParse:", e, "is not a valid dependency string."), {
                        name: e.split("@")[0]
                        , range: e.split("@")[1] || "*"
                    }) : {
                        name: e.name
                        , range: e.range || e.version
                    }
                }, a.versionParse = function(e) {
                    /^\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-]+)?$/.test(e) || l.warn("Plugin.versionParse:", e, "is not a valid version or range.");
                    var t = e.split("-");
                    e = t[0];
                    var i = isNaN(Number(e[0]))
                        , r = i ? e.substr(1) : e
                        , n = l.map(r.split("."), function(e) {
                            return Number(e)
                        });
                    return {
                        isRange: i
                        , version: r
                        , range: e
                        , operator: i ? e[0] : ""
                        , parts: n
                        , prerelease: t[1]
                        , number: 1e8 * n[0] + 1e4 * n[1] + n[2]
                    }
                }, a.versionSatisfies = function(e, t) {
                    t = t || "*";
                    var i = a.versionParse(t)
                        , r = i.parts
                        , n = a.versionParse(e)
                        , s = n.parts;
                    if (i.isRange) {
                        if ("*" === i.operator || "*" === e) return !0;
                        if ("~" === i.operator) return s[0] === r[0] && s[1] === r[1] && s[2] >= r[2];
                        if ("^" === i.operator) return 0 < r[0] ? s[0] === r[0] && n.number >= i.number : 0 < r[1] ? s[1] === r[1] && s[2] >= r[2] : s[2] === r[2]
                    }
                    return e === t || "*" === e
                }
            }, {
                "./Common": 14
            }]
            , 21: [function(e, t, i) {
                var s = {};
                t.exports = s;
                var a = e("./Events")
                    , l = e("./Engine")
                    , r = e("./Common");
                ! function() {
                    var n, t, i;
                    ("undefined" != typeof window && (n = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame, t = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame), n) || (n = function(e) {
                        i = setTimeout(function() {
                            e(r.now())
                        }, 1e3 / 60)
                    }, t = function() {
                        clearTimeout(i)
                    });
                    s.create = function(e) {
                        var t = r.extend({
                            fps: 60
                            , correction: 1
                            , deltaSampleSize: 60
                            , counterTimestamp: 0
                            , frameCounter: 0
                            , deltaHistory: []
                            , timePrev: null
                            , timeScalePrev: 1
                            , frameRequestId: null
                            , isFixed: !1
                            , enabled: !0
                        }, e);
                        return t.delta = t.delta || 1e3 / t.fps, t.deltaMin = t.deltaMin || 1e3 / t.fps, t.deltaMax = t.deltaMax || 1e3 / (.5 * t.fps), t.fps = 1e3 / t.delta, t
                    }, s.run = function(i, r) {
                        return void 0 !== i.positionIterations && (r = i, i = s.create())
                            , function e(t) {
                                i.frameRequestId = n(e), t && i.enabled && s.tick(i, r, t)
                            }(), i
                    }, s.tick = function(e, t, i) {
                        var r, n = t.timing
                            , s = 1
                            , o = {
                                timestamp: n.timestamp
                            };
                        a.trigger(e, "beforeTick", o), a.trigger(t, "beforeTick", o), e.isFixed ? r = e.delta : (r = i - e.timePrev || e.delta, e.timePrev = i, e.deltaHistory.push(r), e.deltaHistory = e.deltaHistory.slice(-e.deltaSampleSize), s = (r = (r = (r = Math.min.apply(null, e.deltaHistory)) < e.deltaMin ? e.deltaMin : r) > e.deltaMax ? e.deltaMax : r) / e.delta, e.delta = r), 0 !== e.timeScalePrev && (s *= n.timeScale / e.timeScalePrev), 0 === n.timeScale && (s = 0), e.timeScalePrev = n.timeScale, e.correction = s, e.frameCounter += 1, 1e3 <= i - e.counterTimestamp && (e.fps = e.frameCounter * ((i - e.counterTimestamp) / 1e3), e.counterTimestamp = i, e.frameCounter = 0), a.trigger(e, "tick", o), a.trigger(t, "tick", o), t.world.isModified && t.render && t.render.controller && t.render.controller.clear && t.render.controller.clear(t.render), a.trigger(e, "beforeUpdate", o), l.update(t, r, s), a.trigger(e, "afterUpdate", o), t.render && t.render.controller && (a.trigger(e, "beforeRender", o), a.trigger(t, "beforeRender", o), t.render.controller.world(t.render), a.trigger(e, "afterRender", o), a.trigger(t, "afterRender", o)), a.trigger(e, "afterTick", o), a.trigger(t, "afterTick", o)
                    }, s.stop = function(e) {
                        t(e.frameRequestId)
                    }, s.start = function(e, t) {
                        s.run(e, t)
                    }
                }()
            }, {
                "./Common": 14
                , "./Engine": 15
                , "./Events": 16
            }]
            , 22: [function(e, t, i) {
                var h = {};
                t.exports = h;
                var r = e("./Events");
                h._motionWakeThreshold = .18, h._motionSleepThreshold = .08, h._minBias = .9, h.update = function(e, t) {
                    for (var i = t * t * t, r = 0; r < e.length; r++) {
                        var n = e[r]
                            , s = n.speed * n.speed + n.angularSpeed * n.angularSpeed;
                        if (0 === n.force.x && 0 === n.force.y) {
                            var o = Math.min(n.motion, s)
                                , a = Math.max(n.motion, s);
                            n.motion = h._minBias * o + (1 - h._minBias) * a, 0 < n.sleepThreshold && n.motion < h._motionSleepThreshold * i ? (n.sleepCounter += 1, n.sleepCounter >= n.sleepThreshold && h.set(n, !0)) : 0 < n.sleepCounter && (n.sleepCounter -= 1)
                        } else h.set(n, !1)
                    }
                }, h.afterCollisions = function(e, t) {
                    for (var i = t * t * t, r = 0; r < e.length; r++) {
                        var n = e[r];
                        if (n.isActive) {
                            var s = n.collision
                                , o = s.bodyA.parent
                                , a = s.bodyB.parent;
                            if (!(o.isSleeping && a.isSleeping || o.isStatic || a.isStatic) && (o.isSleeping || a.isSleeping)) {
                                var l = o.isSleeping && !o.isStatic ? o : a
                                    , c = l === o ? a : o;
                                !l.isStatic && c.motion > h._motionWakeThreshold * i && h.set(l, !1)
                            }
                        }
                    }
                }, h.set = function(e, t) {
                    var i = e.isSleeping;
                    t ? (e.isSleeping = !0, e.sleepCounter = e.sleepThreshold, e.positionImpulse.x = 0, e.positionImpulse.y = 0, e.positionPrev.x = e.position.x, e.positionPrev.y = e.position.y, e.anglePrev = e.angle, e.speed = 0, e.angularSpeed = 0, e.motion = 0, i || r.trigger(e, "sleepStart")) : (e.isSleeping = !1, e.sleepCounter = 0, i && r.trigger(e, "sleepEnd"))
                }
            }, {
                "./Events": 16
            }]
            , 23: [function(e, t, i) {
                var g = {};
                t.exports = g;
                var A, k = e("../geometry/Vertices")
                    , M = e("../core/Common")
                    , P = e("../body/Body")
                    , R = e("../geometry/Bounds")
                    , E = e("../geometry/Vector");
                g.rectangle = function(e, t, i, r, n) {
                    n = n || {};
                    var s = {
                        label: "Rectangle Body"
                        , position: {
                            x: e
                            , y: t
                        }
                        , vertices: k.fromPath("L 0 0 L " + i + " 0 L " + i + " " + r + " L 0 " + r)
                    };
                    if (n.chamfer) {
                        var o = n.chamfer;
                        s.vertices = k.chamfer(s.vertices, o.radius, o.quality, o.qualityMin, o.qualityMax), delete n.chamfer
                    }
                    return P.create(M.extend({}, s, n))
                }, g.trapezoid = function(e, t, i, r, n, s) {
                    s = s || {};
                    var o, a = i * (n *= .5)
                        , l = a + (1 - 2 * n) * i
                        , c = l + a;
                    o = n < .5 ? "L 0 0 L " + a + " " + -r + " L " + l + " " + -r + " L " + c + " 0" : "L 0 0 L " + l + " " + -r + " L " + c + " 0";
                    var h = {
                        label: "Trapezoid Body"
                        , position: {
                            x: e
                            , y: t
                        }
                        , vertices: k.fromPath(o)
                    };
                    if (s.chamfer) {
                        var d = s.chamfer;
                        h.vertices = k.chamfer(h.vertices, d.radius, d.quality, d.qualityMin, d.qualityMax), delete s.chamfer
                    }
                    return P.create(M.extend({}, h, s))
                }, g.circle = function(e, t, i, r, n) {
                    r = r || {};
                    var s = {
                        label: "Circle Body"
                        , circleRadius: i
                    };
                    n = n || 25;
                    var o = Math.ceil(Math.max(10, Math.min(n, i)));
                    return o % 2 == 1 && (o += 1), g.polygon(e, t, o, i, M.extend({}, s, r))
                }, g.polygon = function(e, t, i, r, n) {
                    if (n = n || {}, i < 3) return g.circle(e, t, r, n);
                    for (var s = 2 * Math.PI / i, o = "", a = .5 * s, l = 0; l < i; l += 1) {
                        var c = a + l * s
                            , h = Math.cos(c) * r
                            , d = Math.sin(c) * r;
                        o += "L " + h.toFixed(3) + " " + d.toFixed(3) + " "
                    }
                    var u = {
                        label: "Polygon Body"
                        , position: {
                            x: e
                            , y: t
                        }
                        , vertices: k.fromPath(o)
                    };
                    if (n.chamfer) {
                        var f = n.chamfer;
                        u.vertices = k.chamfer(u.vertices, f.radius, f.quality, f.qualityMin, f.qualityMax), delete n.chamfer
                    }
                    return P.create(M.extend({}, u, n))
                }, g.fromVertices = function(e, t, i, r, n, s, o) {
                    var a, l, c, h, d, u, f, g, p;
                    for (A || (A = M._requireGlobal("decomp", "poly-decomp")), r = r || {}, l = [], n = void 0 !== n && n, s = void 0 !== s ? s : .01, o = void 0 !== o ? o : 10, A || M.warn("Bodies.fromVertices: poly-decomp.js required. Could not decompose vertices. Fallback to convex hull."), M.isArray(i[0]) || (i = [i]), g = 0; g < i.length; g += 1)
                        if (h = i[g], (c = k.isConvex(h)) || !A) h = c ? k.clockwiseSort(h) : k.hull(h), l.push({
                            position: {
                                x: e
                                , y: t
                            }
                            , vertices: h
                        });
                        else {
                            var m = h.map(function(e) {
                                return [e.x, e.y]
                            });
                            A.makeCCW(m), !1 !== s && A.removeCollinearPoints(m, s);
                            var v = A.quickDecomp(m);
                            for (d = 0; d < v.length; d++) {
                                var y = v[d].map(function(e) {
                                    return {
                                        x: e[0]
                                        , y: e[1]
                                    }
                                });
                                0 < o && k.area(y) < o || l.push({
                                    position: k.centre(y)
                                    , vertices: y
                                })
                            }
                        }
                    for (d = 0; d < l.length; d++) l[d] = P.create(M.extend(l[d], r));
                    if (n)
                        for (d = 0; d < l.length; d++) {
                            var _ = l[d];
                            for (u = d + 1; u < l.length; u++) {
                                var x = l[u];
                                if (R.overlaps(_.bounds, x.bounds)) {
                                    var b = _.vertices
                                        , w = x.vertices;
                                    for (f = 0; f < _.vertices.length; f++)
                                        for (p = 0; p < x.vertices.length; p++) {
                                            var S = E.magnitudeSquared(E.sub(b[(f + 1) % b.length], w[p]))
                                                , C = E.magnitudeSquared(E.sub(b[f], w[(p + 1) % w.length]));
                                            S < 5 && C < 5 && (b[f].isInternal = !0, w[p].isInternal = !0)
                                        }
                                }
                            }
                        }
                    return 1 < l.length ? (a = P.create(M.extend({
                        parts: l.slice(0)
                    }, r)), P.setPosition(a, {
                        x: e
                        , y: t
                    }), a) : l[0]
                }
            }, {
                "../body/Body": 1
                , "../core/Common": 14
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
            }]
            , 24: [function(e, t, i) {
                var f = {};
                t.exports = f;
                var y = e("../body/Composite")
                    , p = e("../constraint/Constraint")
                    , m = e("../core/Common")
                    , _ = e("../body/Body")
                    , g = e("./Bodies");
                f.stack = function(e, t, i, r, n, s, o) {
                    for (var a, l = y.create({
                            label: "Stack"
                        }), c = e, h = t, d = 0, u = 0; u < r; u++) {
                        for (var f = 0, g = 0; g < i; g++) {
                            var p = o(c, h, g, u, a, d);
                            if (p) {
                                var m = p.bounds.max.y - p.bounds.min.y
                                    , v = p.bounds.max.x - p.bounds.min.x;
                                f < m && (f = m), _.translate(p, {
                                    x: .5 * v
                                    , y: .5 * m
                                }), c = p.bounds.max.x + n, y.addBody(l, p), a = p, d += 1
                            } else c += n
                        }
                        h += f + s, c = e
                    }
                    return l
                }, f.chain = function(e, t, i, r, n, s) {
                    for (var o = e.bodies, a = 1; a < o.length; a++) {
                        var l = o[a - 1]
                            , c = o[a]
                            , h = l.bounds.max.y - l.bounds.min.y
                            , d = l.bounds.max.x - l.bounds.min.x
                            , u = c.bounds.max.y - c.bounds.min.y
                            , f = {
                                bodyA: l
                                , pointA: {
                                    x: d * t
                                    , y: h * i
                                }
                                , bodyB: c
                                , pointB: {
                                    x: (c.bounds.max.x - c.bounds.min.x) * r
                                    , y: u * n
                                }
                            }
                            , g = m.extend(f, s);
                        y.addConstraint(e, p.create(g))
                    }
                    return e.label += " Chain", e
                }, f.mesh = function(e, t, i, r, n) {
                    var s, o, a, l, c, h = e.bodies;
                    for (s = 0; s < i; s++) {
                        for (o = 1; o < t; o++) a = h[o - 1 + s * t], l = h[o + s * t], y.addConstraint(e, p.create(m.extend({
                            bodyA: a
                            , bodyB: l
                        }, n)));
                        if (0 < s)
                            for (o = 0; o < t; o++) a = h[o + (s - 1) * t], l = h[o + s * t], y.addConstraint(e, p.create(m.extend({
                                bodyA: a
                                , bodyB: l
                            }, n))), r && 0 < o && (c = h[o - 1 + (s - 1) * t], y.addConstraint(e, p.create(m.extend({
                                bodyA: c
                                , bodyB: l
                            }, n)))), r && o < t - 1 && (c = h[o + 1 + (s - 1) * t], y.addConstraint(e, p.create(m.extend({
                                bodyA: c
                                , bodyB: l
                            }, n))))
                    }
                    return e.label += " Mesh", e
                }, f.pyramid = function(l, e, c, h, d, t, u) {
                    return f.stack(l, e, c, h, d, t, function(e, t, i, r, n, s) {
                        var o = Math.min(h, Math.ceil(c / 2))
                            , a = n ? n.bounds.max.x - n.bounds.min.x : 0;
                        if (!(o < r || i < (r = o - r) || c - 1 - r < i)) return 1 === s && _.translate(n, {
                            x: (i + (c % 2 == 1 ? 1 : -1)) * a
                            , y: 0
                        }), u(l + (n ? i * a : 0) + i * d, t, i, r, n, s)
                    })
                }, f.newtonsCradle = function(e, t, i, r, n) {
                    for (var s = y.create({
                            label: "Newtons Cradle"
                        }), o = 0; o < i; o++) {
                        var a = g.circle(e + o * (1.9 * r), t + n, r, {
                                inertia: 1 / 0
                                , restitution: 1
                                , friction: 0
                                , frictionAir: 1e-4
                                , slop: 1
                            })
                            , l = p.create({
                                pointA: {
                                    x: e + o * (1.9 * r)
                                    , y: t
                                }
                                , bodyB: a
                            });
                        y.addBody(s, a), y.addConstraint(s, l)
                    }
                    return s
                }, f.car = function(e, t, i, r, n) {
                    var s = _.nextGroup(!0)
                        , o = .5 * -i + 20
                        , a = .5 * i - 20
                        , l = y.create({
                            label: "Car"
                        })
                        , c = g.rectangle(e, t, i, r, {
                            collisionFilter: {
                                group: s
                            }
                            , chamfer: {
                                radius: .5 * r
                            }
                            , density: 2e-4
                        })
                        , h = g.circle(e + o, t + 0, n, {
                            collisionFilter: {
                                group: s
                            }
                            , friction: .8
                        })
                        , d = g.circle(e + a, t + 0, n, {
                            collisionFilter: {
                                group: s
                            }
                            , friction: .8
                        })
                        , u = p.create({
                            bodyB: c
                            , pointB: {
                                x: o
                                , y: 0
                            }
                            , bodyA: h
                            , stiffness: 1
                            , length: 0
                        })
                        , f = p.create({
                            bodyB: c
                            , pointB: {
                                x: a
                                , y: 0
                            }
                            , bodyA: d
                            , stiffness: 1
                            , length: 0
                        });
                    return y.addBody(l, c), y.addBody(l, h), y.addBody(l, d), y.addConstraint(l, u), y.addConstraint(l, f), l
                }, f.softBody = function(e, t, i, r, n, s, o, a, l, c) {
                    l = m.extend({
                        inertia: 1 / 0
                    }, l), c = m.extend({
                        stiffness: .2
                        , render: {
                            type: "line"
                            , anchors: !1
                        }
                    }, c);
                    var h = f.stack(e, t, i, r, n, s, function(e, t) {
                        return g.circle(e, t, a, l)
                    });
                    return f.mesh(h, i, r, o, c), h.label = "Soft Body", h
                }
            }, {
                "../body/Body": 1
                , "../body/Composite": 2
                , "../constraint/Constraint": 12
                , "../core/Common": 14
                , "./Bodies": 23
            }]
            , 25: [function(e, t, i) {
                var r = {};
                t.exports = r;
                var o = e("../geometry/Vector")
                    , a = e("../core/Common");
                r.fromVertices = function(e) {
                    for (var t = {}, i = 0; i < e.length; i++) {
                        var r = (i + 1) % e.length
                            , n = o.normalise({
                                x: e[r].y - e[i].y
                                , y: e[i].x - e[r].x
                            })
                            , s = 0 === n.y ? 1 / 0 : n.x / n.y;
                        t[s = s.toFixed(3)
                            .toString()] = n
                    }
                    return a.values(t)
                }, r.rotate = function(e, t) {
                    if (0 !== t)
                        for (var i = Math.cos(t), r = Math.sin(t), n = 0; n < e.length; n++) {
                            var s, o = e[n];
                            s = o.x * i - o.y * r, o.y = o.x * r + o.y * i, o.x = s
                        }
                }
            }, {
                "../core/Common": 14
                , "../geometry/Vector": 28
            }]
            , 26: [function(e, t, i) {
                var r = {};
                (t.exports = r)
                .create = function(e) {
                    var t = {
                        min: {
                            x: 0
                            , y: 0
                        }
                        , max: {
                            x: 0
                            , y: 0
                        }
                    };
                    return e && r.update(t, e), t
                }, r.update = function(e, t, i) {
                    e.min.x = 1 / 0, e.max.x = -1 / 0, e.min.y = 1 / 0, e.max.y = -1 / 0;
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r];
                        n.x > e.max.x && (e.max.x = n.x), n.x < e.min.x && (e.min.x = n.x), n.y > e.max.y && (e.max.y = n.y), n.y < e.min.y && (e.min.y = n.y)
                    }
                    i && (0 < i.x ? e.max.x += i.x : e.min.x += i.x, 0 < i.y ? e.max.y += i.y : e.min.y += i.y)
                }, r.contains = function(e, t) {
                    return t.x >= e.min.x && t.x <= e.max.x && t.y >= e.min.y && t.y <= e.max.y
                }, r.overlaps = function(e, t) {
                    return e.min.x <= t.max.x && e.max.x >= t.min.x && e.max.y >= t.min.y && e.min.y <= t.max.y
                }, r.translate = function(e, t) {
                    e.min.x += t.x, e.max.x += t.x, e.min.y += t.y, e.max.y += t.y
                }, r.shift = function(e, t) {
                    var i = e.max.x - e.min.x
                        , r = e.max.y - e.min.y;
                    e.min.x = t.x, e.max.x = t.x + i, e.min.y = t.y, e.max.y = t.y + r
                }
            }, {}]
            , 27: [function(e, t, i) {
                var _ = {};
                t.exports = _;
                e("../geometry/Bounds");
                var x = e("../core/Common");
                _.pathToVertices = function(e, t) {
                    "undefined" == typeof window || "SVGPathSeg" in window || x.warn("Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.");
                    var i, r, n, s, o, a, l, c, h, d, u, f = []
                        , g = 0
                        , p = 0
                        , m = 0;
                    t = t || 15;
                    var v = function(e, t, i) {
                            var r = i % 2 == 1 && 1 < i;
                            if (!h || e != h.x || t != h.y) {
                                u = h && r ? (d = h.x, h.y) : d = 0;
                                var n = {
                                    x: d + e
                                    , y: u + t
                                };
                                !r && h || (h = n), f.push(n), p = d + e, m = u + t
                            }
                        }
                        , y = function(e) {
                            var t = e.pathSegTypeAsLetter.toUpperCase();
                            if ("Z" !== t) {
                                switch (t) {
                                    case "M":
                                    case "L":
                                    case "T":
                                    case "C":
                                    case "S":
                                    case "Q":
                                        p = e.x, m = e.y;
                                        break;
                                    case "H":
                                        p = e.x;
                                        break;
                                    case "V":
                                        m = e.y
                                }
                                v(p, m, e.pathSegType)
                            }
                        };
                    for (_._svgPathToAbsolute(e), n = e.getTotalLength(), a = [], i = 0; i < e.pathSegList.numberOfItems; i += 1) a.push(e.pathSegList.getItem(i));
                    for (l = a.concat(); g < n;) {
                        if ((o = a[e.getPathSegAtLength(g)]) != c) {
                            for (; l.length && l[0] != o;) y(l.shift());
                            c = o
                        }
                        switch (o.pathSegTypeAsLetter.toUpperCase()) {
                            case "C":
                            case "T":
                            case "S":
                            case "Q":
                            case "A":
                                s = e.getPointAtLength(g), v(s.x, s.y, 0)
                        }
                        g += t
                    }
                    for (i = 0, r = l.length; i < r; ++i) y(l[i]);
                    return f
                }, _._svgPathToAbsolute = function(e) {
                    for (var t, i, r, n, s, o, a = e.pathSegList, l = 0, c = 0, h = a.numberOfItems, d = 0; d < h; ++d) {
                        var u = a.getItem(d)
                            , f = u.pathSegTypeAsLetter;
                        if (/[MLHVCSQTA]/.test(f)) "x" in u && (l = u.x), "y" in u && (c = u.y);
                        else switch ("x1" in u && (r = l + u.x1), "x2" in u && (s = l + u.x2), "y1" in u && (n = c + u.y1), "y2" in u && (o = c + u.y2), "x" in u && (l += u.x), "y" in u && (c += u.y), f) {
                            case "m":
                                a.replaceItem(e.createSVGPathSegMovetoAbs(l, c), d);
                                break;
                            case "l":
                                a.replaceItem(e.createSVGPathSegLinetoAbs(l, c), d);
                                break;
                            case "h":
                                a.replaceItem(e.createSVGPathSegLinetoHorizontalAbs(l), d);
                                break;
                            case "v":
                                a.replaceItem(e.createSVGPathSegLinetoVerticalAbs(c), d);
                                break;
                            case "c":
                                a.replaceItem(e.createSVGPathSegCurvetoCubicAbs(l, c, r, n, s, o), d);
                                break;
                            case "s":
                                a.replaceItem(e.createSVGPathSegCurvetoCubicSmoothAbs(l, c, s, o), d);
                                break;
                            case "q":
                                a.replaceItem(e.createSVGPathSegCurvetoQuadraticAbs(l, c, r, n), d);
                                break;
                            case "t":
                                a.replaceItem(e.createSVGPathSegCurvetoQuadraticSmoothAbs(l, c), d);
                                break;
                            case "a":
                                a.replaceItem(e.createSVGPathSegArcAbs(l, c, u.r1, u.r2, u.angle, u.largeArcFlag, u.sweepFlag), d);
                                break;
                            case "z":
                            case "Z":
                                l = t, c = i
                        }
                        "M" != f && "m" != f || (t = l, i = c)
                    }
                }
            }, {
                "../core/Common": 14
                , "../geometry/Bounds": 26
            }]
            , 28: [function(e, t, i) {
                var r = {};
                (t.exports = r)
                .create = function(e, t) {
                    return {
                        x: e || 0
                        , y: t || 0
                    }
                }, r.clone = function(e) {
                    return {
                        x: e.x
                        , y: e.y
                    }
                }, r.magnitude = function(e) {
                    return Math.sqrt(e.x * e.x + e.y * e.y)
                }, r.magnitudeSquared = function(e) {
                    return e.x * e.x + e.y * e.y
                }, r.rotate = function(e, t, i) {
                    var r = Math.cos(t)
                        , n = Math.sin(t);
                    i || (i = {});
                    var s = e.x * r - e.y * n;
                    return i.y = e.x * n + e.y * r, i.x = s, i
                }, r.rotateAbout = function(e, t, i, r) {
                    var n = Math.cos(t)
                        , s = Math.sin(t);
                    r || (r = {});
                    var o = i.x + ((e.x - i.x) * n - (e.y - i.y) * s);
                    return r.y = i.y + ((e.x - i.x) * s + (e.y - i.y) * n), r.x = o, r
                }, r.normalise = function(e) {
                    var t = r.magnitude(e);
                    return 0 === t ? {
                        x: 0
                        , y: 0
                    } : {
                        x: e.x / t
                        , y: e.y / t
                    }
                }, r.dot = function(e, t) {
                    return e.x * t.x + e.y * t.y
                }, r.cross = function(e, t) {
                    return e.x * t.y - e.y * t.x
                }, r.cross3 = function(e, t, i) {
                    return (t.x - e.x) * (i.y - e.y) - (t.y - e.y) * (i.x - e.x)
                }, r.add = function(e, t, i) {
                    return i || (i = {}), i.x = e.x + t.x, i.y = e.y + t.y, i
                }, r.sub = function(e, t, i) {
                    return i || (i = {}), i.x = e.x - t.x, i.y = e.y - t.y, i
                }, r.mult = function(e, t) {
                    return {
                        x: e.x * t
                        , y: e.y * t
                    }
                }, r.div = function(e, t) {
                    return {
                        x: e.x / t
                        , y: e.y / t
                    }
                }, r.perp = function(e, t) {
                    return {
                        x: (t = !0 === t ? -1 : 1) * -e.y
                        , y: t * e.x
                    }
                }, r.neg = function(e) {
                    return {
                        x: -e.x
                        , y: -e.y
                    }
                }, r.angle = function(e, t) {
                    return Math.atan2(t.y - e.y, t.x - e.x)
                }, r._temp = [r.create(), r.create(), r.create(), r.create(), r.create(), r.create()]
            }, {}]
            , 29: [function(e, t, i) {
                var a = {};
                t.exports = a;
                var x = e("../geometry/Vector")
                    , b = e("../core/Common");
                a.create = function(e, t) {
                    for (var i = [], r = 0; r < e.length; r++) {
                        var n = e[r]
                            , s = {
                                x: n.x
                                , y: n.y
                                , index: r
                                , body: t
                                , isInternal: !1
                            };
                        i.push(s)
                    }
                    return i
                }, a.fromPath = function(e, t) {
                    var r = [];
                    return e.replace(/L?\s*([\-\d\.e]+)[\s,]*([\-\d\.e]+)*/gi, function(e, t, i) {
                        r.push({
                            x: parseFloat(t)
                            , y: parseFloat(i)
                        })
                    }), a.create(r, t)
                }, a.centre = function(e) {
                    for (var t, i, r, n = a.area(e, !0), s = {
                            x: 0
                            , y: 0
                        }, o = 0; o < e.length; o++) r = (o + 1) % e.length, t = x.cross(e[o], e[r]), i = x.mult(x.add(e[o], e[r]), t), s = x.add(s, i);
                    return x.div(s, 6 * n)
                }, a.mean = function(e) {
                    for (var t = {
                            x: 0
                            , y: 0
                        }, i = 0; i < e.length; i++) t.x += e[i].x, t.y += e[i].y;
                    return x.div(t, e.length)
                }, a.area = function(e, t) {
                    for (var i = 0, r = e.length - 1, n = 0; n < e.length; n++) i += (e[r].x - e[n].x) * (e[r].y + e[n].y), r = n;
                    return t ? i / 2 : Math.abs(i) / 2
                }, a.inertia = function(e, t) {
                    for (var i, r, n = 0, s = 0, o = e, a = 0; a < o.length; a++) r = (a + 1) % o.length, n += (i = Math.abs(x.cross(o[r], o[a]))) * (x.dot(o[r], o[r]) + x.dot(o[r], o[a]) + x.dot(o[a], o[a])), s += i;
                    return t / 6 * (n / s)
                }, a.translate = function(e, t, i) {
                    var r;
                    if (i)
                        for (r = 0; r < e.length; r++) e[r].x += t.x * i, e[r].y += t.y * i;
                    else
                        for (r = 0; r < e.length; r++) e[r].x += t.x, e[r].y += t.y;
                    return e
                }, a.rotate = function(e, t, i) {
                    if (0 !== t) {
                        for (var r = Math.cos(t), n = Math.sin(t), s = 0; s < e.length; s++) {
                            var o = e[s]
                                , a = o.x - i.x
                                , l = o.y - i.y;
                            o.x = i.x + (a * r - l * n), o.y = i.y + (a * n + l * r)
                        }
                        return e
                    }
                }, a.contains = function(e, t) {
                    for (var i = 0; i < e.length; i++) {
                        var r = e[i]
                            , n = e[(i + 1) % e.length];
                        if (0 < (t.x - r.x) * (n.y - r.y) + (t.y - r.y) * (r.x - n.x)) return !1
                    }
                    return !0
                }, a.scale = function(e, t, i, r) {
                    if (1 === t && 1 === i) return e;
                    var n, s;
                    r = r || a.centre(e);
                    for (var o = 0; o < e.length; o++) n = e[o], s = x.sub(n, r), e[o].x = r.x + s.x * t, e[o].y = r.y + s.y * i;
                    return e
                }, a.chamfer = function(e, t, i, r, n) {
                    t = "number" == typeof t ? [t] : t || [8], i = void 0 !== i ? i : -1, r = r || 2, n = n || 14;
                    for (var s = [], o = 0; o < e.length; o++) {
                        var a = e[0 <= o - 1 ? o - 1 : e.length - 1]
                            , l = e[o]
                            , c = e[(o + 1) % e.length]
                            , h = t[o < t.length ? o : t.length - 1];
                        if (0 !== h) {
                            var d = x.normalise({
                                    x: l.y - a.y
                                    , y: a.x - l.x
                                })
                                , u = x.normalise({
                                    x: c.y - l.y
                                    , y: l.x - c.x
                                })
                                , f = Math.sqrt(2 * Math.pow(h, 2))
                                , g = x.mult(b.clone(d), h)
                                , p = x.normalise(x.mult(x.add(d, u), .5))
                                , m = x.sub(l, x.mult(p, f))
                                , v = i; - 1 === i && (v = 1.75 * Math.pow(h, .32)), (v = b.clamp(v, r, n)) % 2 == 1 && (v += 1);
                            for (var y = Math.acos(x.dot(d, u)) / v, _ = 0; _ < v; _++) s.push(x.add(x.rotate(g, y * _), m))
                        } else s.push(l)
                    }
                    return s
                }, a.clockwiseSort = function(e) {
                    var i = a.mean(e);
                    return e.sort(function(e, t) {
                        return x.angle(i, e) - x.angle(i, t)
                    }), e
                }, a.isConvex = function(e) {
                    var t, i, r, n, s = 0
                        , o = e.length;
                    if (o < 3) return null;
                    for (t = 0; t < o; t++)
                        if (r = (t + 2) % o, n = (e[i = (t + 1) % o].x - e[t].x) * (e[r].y - e[i].y), (n -= (e[i].y - e[t].y) * (e[r].x - e[i].x)) < 0 ? s |= 1 : 0 < n && (s |= 2), 3 === s) return !1;
                    return 0 !== s || null
                }, a.hull = function(e) {
                    var t, i, r = []
                        , n = [];
                    for ((e = e.slice(0))
                        .sort(function(e, t) {
                            var i = e.x - t.x;
                            return 0 !== i ? i : e.y - t.y
                        }), i = 0; i < e.length; i += 1) {
                        for (t = e[i]; 2 <= n.length && x.cross3(n[n.length - 2], n[n.length - 1], t) <= 0;) n.pop();
                        n.push(t)
                    }
                    for (i = e.length - 1; 0 <= i; i -= 1) {
                        for (t = e[i]; 2 <= r.length && x.cross3(r[r.length - 2], r[r.length - 1], t) <= 0;) r.pop();
                        r.push(t)
                    }
                    return r.pop(), n.pop(), r.concat(n)
                }
            }, {
                "../core/Common": 14
                , "../geometry/Vector": 28
            }]
            , 30: [function(e, t, i) {
                var r = t.exports = e("../core/Matter");
                r.Body = e("../body/Body"), r.Composite = e("../body/Composite"), r.World = e("../body/World"), r.Contact = e("../collision/Contact"), r.Detector = e("../collision/Detector"), r.Grid = e("../collision/Grid"), r.Pairs = e("../collision/Pairs"), r.Pair = e("../collision/Pair"), r.Query = e("../collision/Query"), r.Resolver = e("../collision/Resolver"), r.SAT = e("../collision/SAT"), r.Constraint = e("../constraint/Constraint"), r.MouseConstraint = e("../constraint/MouseConstraint"), r.Common = e("../core/Common"), r.Engine = e("../core/Engine"), r.Events = e("../core/Events"), r.Mouse = e("../core/Mouse"), r.Runner = e("../core/Runner"), r.Sleeping = e("../core/Sleeping"), r.Plugin = e("../core/Plugin"), r.Bodies = e("../factory/Bodies"), r.Composites = e("../factory/Composites"), r.Axes = e("../geometry/Axes"), r.Bounds = e("../geometry/Bounds"), r.Svg = e("../geometry/Svg"), r.Vector = e("../geometry/Vector"), r.Vertices = e("../geometry/Vertices"), r.Render = e("../render/Render"), r.RenderPixi = e("../render/RenderPixi"), r.World.add = r.Composite.add, r.World.remove = r.Composite.remove, r.World.addComposite = r.Composite.addComposite, r.World.addBody = r.Composite.addBody, r.World.addConstraint = r.Composite.addConstraint, r.World.clear = r.Composite.clear, r.Engine.run = r.Runner.run
            }, {
                "../body/Body": 1
                , "../body/Composite": 2
                , "../body/World": 3
                , "../collision/Contact": 4
                , "../collision/Detector": 5
                , "../collision/Grid": 6
                , "../collision/Pair": 7
                , "../collision/Pairs": 8
                , "../collision/Query": 9
                , "../collision/Resolver": 10
                , "../collision/SAT": 11
                , "../constraint/Constraint": 12
                , "../constraint/MouseConstraint": 13
                , "../core/Common": 14
                , "../core/Engine": 15
                , "../core/Events": 16
                , "../core/Matter": 17
                , "../core/Metrics": 18
                , "../core/Mouse": 19
                , "../core/Plugin": 20
                , "../core/Runner": 21
                , "../core/Sleeping": 22
                , "../factory/Bodies": 23
                , "../factory/Composites": 24
                , "../geometry/Axes": 25
                , "../geometry/Bounds": 26
                , "../geometry/Svg": 27
                , "../geometry/Vector": 28
                , "../geometry/Vertices": 29
                , "../render/Render": 31
                , "../render/RenderPixi": 32
            }]
            , 31: [function(e, t, i) {
                var x = {};
                t.exports = x;
                var m = e("../core/Common")
                    , b = e("../body/Composite")
                    , w = e("../geometry/Bounds")
                    , S = e("../core/Events")
                    , C = e("../collision/Grid")
                    , A = e("../geometry/Vector")
                    , k = e("../core/Mouse");
                ! function() {
                    var r, t;
                    "undefined" != typeof window && (r = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
                        window.setTimeout(function() {
                            e(m.now())
                        }, 1e3 / 60)
                    }, t = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame), x.create = function(e) {
                        var t = {
                                controller: x
                                , engine: null
                                , element: null
                                , canvas: null
                                , mouse: null
                                , frameRequestId: null
                                , options: {
                                    width: 800
                                    , height: 600
                                    , pixelRatio: 1
                                    , background: "#18181d"
                                    , wireframeBackground: "#0f0f13"
                                    , hasBounds: !!e.bounds
                                    , enabled: !0
                                    , wireframes: !0
                                    , showSleeping: !0
                                    , showDebug: !1
                                    , showBroadphase: !1
                                    , showBounds: !1
                                    , showVelocity: !1
                                    , showCollisions: !1
                                    , showSeparations: !1
                                    , showAxes: !1
                                    , showPositions: !1
                                    , showAngleIndicator: !1
                                    , showIds: !1
                                    , showShadows: !1
                                    , showVertexNumbers: !1
                                    , showConvexHulls: !1
                                    , showInternalEdges: !1
                                    , showMousePosition: !1
                                }
                            }
                            , i = m.extend(t, e);
                        return i.canvas && (i.canvas.width = i.options.width || i.canvas.width, i.canvas.height = i.options.height || i.canvas.height), i.mouse = e.mouse, i.engine = e.engine, i.canvas = i.canvas || n(i.options.width, i.options.height), i.context = i.canvas.getContext("2d"), i.textures = {}, i.bounds = i.bounds || {
                            min: {
                                x: 0
                                , y: 0
                            }
                            , max: {
                                x: i.canvas.width
                                , y: i.canvas.height
                            }
                        }, 1 !== i.options.pixelRatio && x.setPixelRatio(i, i.options.pixelRatio), m.isElement(i.element) ? i.element.appendChild(i.canvas) : i.canvas.parentNode || m.log("Render.create: options.element was undefined, render.canvas was created but not appended", "warn"), i
                    }, x.run = function(i) {
                        ! function e(t) {
                            i.frameRequestId = r(e), x.world(i)
                        }()
                    }, x.stop = function(e) {
                        t(e.frameRequestId)
                    }, x.setPixelRatio = function(e, t) {
                        var i = e.options
                            , r = e.canvas;
                        "auto" === t && (t = s(r)), i.pixelRatio = t, r.setAttribute("data-pixel-ratio", t), r.width = i.width * t, r.height = i.height * t, r.style.width = i.width + "px", r.style.height = i.height + "px", e.context.scale(t, t)
                    }, x.lookAt = function(e, t, i, r) {
                        r = void 0 === r || r, t = m.isArray(t) ? t : [t], i = i || {
                            x: 0
                            , y: 0
                        };
                        for (var n = {
                                min: {
                                    x: 1 / 0
                                    , y: 1 / 0
                                }
                                , max: {
                                    x: -1 / 0
                                    , y: -1 / 0
                                }
                            }, s = 0; s < t.length; s += 1) {
                            var o = t[s]
                                , a = o.bounds ? o.bounds.min : o.min || o.position || o
                                , l = o.bounds ? o.bounds.max : o.max || o.position || o;
                            a && l && (a.x < n.min.x && (n.min.x = a.x), l.x > n.max.x && (n.max.x = l.x), a.y < n.min.y && (n.min.y = a.y), l.y > n.max.y && (n.max.y = l.y))
                        }
                        var c = n.max.x - n.min.x + 2 * i.x
                            , h = n.max.y - n.min.y + 2 * i.y
                            , d = e.canvas.height
                            , u = e.canvas.width / d
                            , f = c / h
                            , g = 1
                            , p = 1;
                        u < f ? p = f / u : g = u / f, e.options.hasBounds = !0, e.bounds.min.x = n.min.x, e.bounds.max.x = n.min.x + c * g, e.bounds.min.y = n.min.y, e.bounds.max.y = n.min.y + h * p, r && (e.bounds.min.x += .5 * c - c * g * .5, e.bounds.max.x += .5 * c - c * g * .5, e.bounds.min.y += .5 * h - h * p * .5, e.bounds.max.y += .5 * h - h * p * .5), e.bounds.min.x -= i.x, e.bounds.max.x -= i.x, e.bounds.min.y -= i.y, e.bounds.max.y -= i.y, e.mouse && (k.setScale(e.mouse, {
                            x: (e.bounds.max.x - e.bounds.min.x) / e.canvas.width
                            , y: (e.bounds.max.y - e.bounds.min.y) / e.canvas.height
                        }), k.setOffset(e.mouse, e.bounds.min))
                    }, x.startViewTransform = function(e) {
                        var t = e.bounds.max.x - e.bounds.min.x
                            , i = e.bounds.max.y - e.bounds.min.y
                            , r = t / e.options.width
                            , n = i / e.options.height;
                        e.context.scale(1 / r, 1 / n), e.context.translate(-e.bounds.min.x, -e.bounds.min.y)
                    }, x.endViewTransform = function(e) {
                        e.context.setTransform(e.options.pixelRatio, 0, 0, e.options.pixelRatio, 0, 0)
                    }, x.world = function(e) {
                        var t, i = e.engine
                            , r = i.world
                            , n = e.canvas
                            , s = e.context
                            , o = e.options
                            , a = b.allBodies(r)
                            , l = b.allConstraints(r)
                            , c = o.wireframes ? o.wireframeBackground : o.background
                            , h = []
                            , d = []
                            , u = {
                                timestamp: i.timing.timestamp
                            };
                        if (S.trigger(e, "beforeRender", u), e.currentBackground !== c && _(e, c), s.globalCompositeOperation = "source-in", s.fillStyle = "transparent", s.fillRect(0, 0, n.width, n.height), s.globalCompositeOperation = "source-over", o.hasBounds) {
                            for (t = 0; t < a.length; t++) {
                                var f = a[t];
                                w.overlaps(f.bounds, e.bounds) && h.push(f)
                            }
                            for (t = 0; t < l.length; t++) {
                                var g = l[t]
                                    , p = g.bodyA
                                    , m = g.bodyB
                                    , v = g.pointA
                                    , y = g.pointB;
                                p && (v = A.add(p.position, g.pointA)), m && (y = A.add(m.position, g.pointB)), v && y && ((w.contains(e.bounds, v) || w.contains(e.bounds, y)) && d.push(g))
                            }
                            x.startViewTransform(e), e.mouse && (k.setScale(e.mouse, {
                                x: (e.bounds.max.x - e.bounds.min.x) / e.canvas.width
                                , y: (e.bounds.max.y - e.bounds.min.y) / e.canvas.height
                            }), k.setOffset(e.mouse, e.bounds.min))
                        } else d = l, h = a;
                        !o.wireframes || i.enableSleeping && o.showSleeping ? x.bodies(e, h, s) : (o.showConvexHulls && x.bodyConvexHulls(e, h, s), x.bodyWireframes(e, h, s)), o.showBounds && x.bodyBounds(e, h, s), (o.showAxes || o.showAngleIndicator) && x.bodyAxes(e, h, s), o.showPositions && x.bodyPositions(e, h, s), o.showVelocity && x.bodyVelocity(e, h, s), o.showIds && x.bodyIds(e, h, s), o.showSeparations && x.separations(e, i.pairs.list, s), o.showCollisions && x.collisions(e, i.pairs.list, s), o.showVertexNumbers && x.vertexNumbers(e, h, s), o.showMousePosition && x.mousePosition(e, e.mouse, s), x.constraints(d, s), o.showBroadphase && i.broadphase.controller === C && x.grid(e, i.broadphase, s), o.showDebug && x.debug(e, s), o.hasBounds && x.endViewTransform(e), S.trigger(e, "afterRender", u)
                    }, x.debug = function(e, t) {
                        var i = t
                            , r = e.engine
                            , n = r.world
                            , s = r.metrics
                            , o = e.options;
                        b.allBodies(n);
                        if (500 <= r.timing.timestamp - (e.debugTimestamp || 0)) {
                            var a = "";
                            s.timing && (a += "fps: " + Math.round(s.timing.fps) + "    "), e.debugString = a, e.debugTimestamp = r.timing.timestamp
                        }
                        if (e.debugString) {
                            i.font = "12px Arial", o.wireframes ? i.fillStyle = "rgba(255,255,255,0.5)" : i.fillStyle = "rgba(0,0,0,0)";
                            for (var l = e.debugString.split("\n"), c = 0; c < l.length; c++) i.fillText(l[c], 50, 50 + 18 * c)
                        }
                    }, x.constraints = function(e, t) {
                        for (var i = t, r = 0; r < e.length; r++) {
                            var n = e[r];
                            if (n.render.visible && n.pointA && n.pointB) {
                                var s, o, a = n.bodyA
                                    , l = n.bodyB;
                                if (s = a ? A.add(a.position, n.pointA) : n.pointA, "pin" === n.render.type) i.beginPath(), i.arc(s.x, s.y, 3, 0, 2 * Math.PI), i.closePath();
                                else {
                                    if (o = l ? A.add(l.position, n.pointB) : n.pointB, i.beginPath(), i.moveTo(s.x, s.y), "spring" === n.render.type)
                                        for (var c, h = A.sub(o, s), d = A.perp(A.normalise(h)), u = Math.ceil(m.clamp(n.length / 5, 12, 20)), f = 1; f < u; f += 1) c = f % 2 == 0 ? 1 : -1, i.lineTo(s.x + h.x * (f / u) + d.x * c * 4, s.y + h.y * (f / u) + d.y * c * 4);
                                    i.lineTo(o.x, o.y)
                                }
                                n.render.lineWidth && (i.lineWidth = n.render.lineWidth, i.strokeStyle = n.render.strokeStyle, i.stroke()), n.render.anchors && (i.fillStyle = n.render.strokeStyle, i.beginPath(), i.arc(s.x, s.y, 3, 0, 2 * Math.PI), i.arc(o.x, o.y, 3, 0, 2 * Math.PI), i.closePath(), i.fill())
                            }
                        }
                    }, x.bodyShadows = function(e, t, i) {
                        for (var r = i, n = (e.engine, 0); n < t.length; n++) {
                            var s = t[n];
                            if (s.render.visible) {
                                if (s.circleRadius) r.beginPath(), r.arc(s.position.x, s.position.y, s.circleRadius, 0, 2 * Math.PI), r.closePath();
                                else {
                                    r.beginPath(), r.moveTo(s.vertices[0].x, s.vertices[0].y);
                                    for (var o = 1; o < s.vertices.length; o++) r.lineTo(s.vertices[o].x, s.vertices[o].y);
                                    r.closePath()
                                }
                                var a = s.position.x - .5 * e.options.width
                                    , l = s.position.y - .2 * e.options.height
                                    , c = Math.abs(a) + Math.abs(l);
                                r.shadowColor = "rgba(0,0,0,0.15)", r.shadowOffsetX = .05 * a, r.shadowOffsetY = .05 * l, r.shadowBlur = 1 + 12 * Math.min(1, c / 1e3), r.fill(), r.shadowColor = null, r.shadowOffsetX = null, r.shadowOffsetY = null, r.shadowBlur = null
                            }
                        }
                    }, x.bodies = function(e, t, i) {
                        var r, n, s, o, a = i
                            , l = (e.engine, e.options)
                            , c = l.showInternalEdges || !l.wireframes;
                        for (s = 0; s < t.length; s++)
                            if ((r = t[s])
                                .render.visible)
                                for (o = 1 < r.parts.length ? 1 : 0; o < r.parts.length; o++)
                                    if ((n = r.parts[o])
                                        .render.visible) {
                                        if (l.showSleeping && r.isSleeping ? a.globalAlpha = .5 * n.render.opacity : 1 !== n.render.opacity && (a.globalAlpha = n.render.opacity), n.render.sprite && n.render.sprite.texture && !l.wireframes) {
                                            var h = n.render.sprite
                                                , d = f(e, h.texture);
                                            a.translate(n.position.x, n.position.y), a.rotate(n.angle), a.drawImage(d, d.width * -h.xOffset * h.xScale, d.height * -h.yOffset * h.yScale, d.width * h.xScale, d.height * h.yScale), a.rotate(-n.angle), a.translate(-n.position.x, -n.position.y)
                                        } else {
                                            if (n.circleRadius) a.beginPath(), a.arc(n.position.x, n.position.y, n.circleRadius, 0, 2 * Math.PI);
                                            else {
                                                a.beginPath(), a.moveTo(n.vertices[0].x, n.vertices[0].y);
                                                for (var u = 1; u < n.vertices.length; u++) !n.vertices[u - 1].isInternal || c ? a.lineTo(n.vertices[u].x, n.vertices[u].y) : a.moveTo(n.vertices[u].x, n.vertices[u].y), n.vertices[u].isInternal && !c && a.moveTo(n.vertices[(u + 1) % n.vertices.length].x, n.vertices[(u + 1) % n.vertices.length].y);
                                                a.lineTo(n.vertices[0].x, n.vertices[0].y), a.closePath()
                                            }
                                            l.wireframes ? (a.lineWidth = 1, a.strokeStyle = "#bbb", a.stroke()) : (a.fillStyle = n.render.fillStyle, n.render.lineWidth && (a.lineWidth = n.render.lineWidth, a.strokeStyle = n.render.strokeStyle, a.stroke()), a.fill())
                                        }
                                        a.globalAlpha = 1
                                    }
                    }, x.bodyWireframes = function(e, t, i) {
                        var r, n, s, o, a, l = i
                            , c = e.options.showInternalEdges;
                        for (l.beginPath(), s = 0; s < t.length; s++)
                            if ((r = t[s])
                                .render.visible)
                                for (a = 1 < r.parts.length ? 1 : 0; a < r.parts.length; a++) {
                                    for (n = r.parts[a], l.moveTo(n.vertices[0].x, n.vertices[0].y), o = 1; o < n.vertices.length; o++) !n.vertices[o - 1].isInternal || c ? l.lineTo(n.vertices[o].x, n.vertices[o].y) : l.moveTo(n.vertices[o].x, n.vertices[o].y), n.vertices[o].isInternal && !c && l.moveTo(n.vertices[(o + 1) % n.vertices.length].x, n.vertices[(o + 1) % n.vertices.length].y);
                                    l.lineTo(n.vertices[0].x, n.vertices[0].y)
                                }
                            l.lineWidth = 1, l.strokeStyle = "#bbb", l.stroke()
                    }, x.bodyConvexHulls = function(e, t, i) {
                        var r, n, s, o = i;
                        for (o.beginPath(), n = 0; n < t.length; n++)
                            if ((r = t[n])
                                .render.visible && 1 !== r.parts.length) {
                                for (o.moveTo(r.vertices[0].x, r.vertices[0].y), s = 1; s < r.vertices.length; s++) o.lineTo(r.vertices[s].x, r.vertices[s].y);
                                o.lineTo(r.vertices[0].x, r.vertices[0].y)
                            }
                        o.lineWidth = 1, o.strokeStyle = "rgba(255,255,255,0.2)", o.stroke()
                    }, x.vertexNumbers = function(e, t, i) {
                        var r, n, s, o = i;
                        for (r = 0; r < t.length; r++) {
                            var a = t[r].parts;
                            for (s = 1 < a.length ? 1 : 0; s < a.length; s++) {
                                var l = a[s];
                                for (n = 0; n < l.vertices.length; n++) o.fillStyle = "rgba(255,255,255,0.2)", o.fillText(r + "_" + n, l.position.x + .8 * (l.vertices[n].x - l.position.x), l.position.y + .8 * (l.vertices[n].y - l.position.y))
                            }
                        }
                    }, x.mousePosition = function(e, t, i) {
                        var r = i;
                        r.fillStyle = "rgba(255,255,255,0.8)", r.fillText(t.position.x + "  " + t.position.y, t.position.x + 5, t.position.y - 5)
                    }, x.bodyBounds = function(e, t, i) {
                        var r = i
                            , n = (e.engine, e.options);
                        r.beginPath();
                        for (var s = 0; s < t.length; s++) {
                            if (t[s].render.visible)
                                for (var o = t[s].parts, a = 1 < o.length ? 1 : 0; a < o.length; a++) {
                                    var l = o[a];
                                    r.rect(l.bounds.min.x, l.bounds.min.y, l.bounds.max.x - l.bounds.min.x, l.bounds.max.y - l.bounds.min.y)
                                }
                        }
                        n.wireframes ? r.strokeStyle = "rgba(255,255,255,0.08)" : r.strokeStyle = "rgba(0,0,0,0.1)", r.lineWidth = 1, r.stroke()
                    }, x.bodyAxes = function(e, t, i) {
                        var r, n, s, o, a = i
                            , l = (e.engine, e.options);
                        for (a.beginPath(), n = 0; n < t.length; n++) {
                            var c = t[n]
                                , h = c.parts;
                            if (c.render.visible)
                                if (l.showAxes)
                                    for (s = 1 < h.length ? 1 : 0; s < h.length; s++)
                                        for (r = h[s], o = 0; o < r.axes.length; o++) {
                                            var d = r.axes[o];
                                            a.moveTo(r.position.x, r.position.y), a.lineTo(r.position.x + 20 * d.x, r.position.y + 20 * d.y)
                                        } else
                                            for (s = 1 < h.length ? 1 : 0; s < h.length; s++)
                                                for (r = h[s], o = 0; o < r.axes.length; o++) a.moveTo(r.position.x, r.position.y), a.lineTo((r.vertices[0].x + r.vertices[r.vertices.length - 1].x) / 2, (r.vertices[0].y + r.vertices[r.vertices.length - 1].y) / 2)
                        }
                        l.wireframes ? (a.strokeStyle = "indianred", a.lineWidth = 1) : (a.strokeStyle = "rgba(255, 255, 255, 0.4)", a.globalCompositeOperation = "overlay", a.lineWidth = 2), a.stroke(), a.globalCompositeOperation = "source-over"
                    }, x.bodyPositions = function(e, t, i) {
                        var r, n, s, o, a = i
                            , l = (e.engine, e.options);
                        for (a.beginPath(), s = 0; s < t.length; s++)
                            if ((r = t[s])
                                .render.visible)
                                for (o = 0; o < r.parts.length; o++) n = r.parts[o], a.arc(n.position.x, n.position.y, 3, 0, 2 * Math.PI, !1), a.closePath();
                        for (l.wireframes ? a.fillStyle = "indianred" : a.fillStyle = "rgba(0,0,0,0)", a.fill(), a.beginPath(), s = 0; s < t.length; s++)(r = t[s])
                            .render.visible && (a.arc(r.positionPrev.x, r.positionPrev.y, 2, 0, 2 * Math.PI, !1), a.closePath());
                        a.fillStyle = "rgba(255,165,0,0.8)", a.fill()
                    }, x.bodyVelocity = function(e, t, i) {
                        var r = i;
                        r.beginPath();
                        for (var n = 0; n < t.length; n++) {
                            var s = t[n];
                            s.render.visible && (r.moveTo(s.position.x, s.position.y), r.lineTo(s.position.x + 2 * (s.position.x - s.positionPrev.x), s.position.y + 2 * (s.position.y - s.positionPrev.y)))
                        }
                        r.lineWidth = 3, r.strokeStyle = "cornflowerblue", r.stroke()
                    }, x.bodyIds = function(e, t, i) {
                        var r, n, s = i;
                        for (r = 0; r < t.length; r++)
                            if (t[r].render.visible) {
                                var o = t[r].parts;
                                for (n = 1 < o.length ? 1 : 0; n < o.length; n++) {
                                    var a = o[n];
                                    s.font = "12px Arial", s.fillStyle = "rgba(255,255,255,0.5)", s.fillText(a.id, a.position.x + 10, a.position.y - 10)
                                }
                            }
                    }, x.collisions = function(e, t, i) {
                        var r, n, s, o, a = i
                            , l = e.options;
                        for (a.beginPath(), s = 0; s < t.length; s++)
                            if ((r = t[s])
                                .isActive)
                                for (n = r.collision, o = 0; o < r.activeContacts.length; o++) {
                                    var c = r.activeContacts[o].vertex;
                                    a.rect(c.x - 1.5, c.y - 1.5, 3.5, 3.5)
                                }
                            for (l.wireframes ? a.fillStyle = "rgba(255,255,255,0.7)" : a.fillStyle = "orange", a.fill(), a.beginPath(), s = 0; s < t.length; s++)
                                if ((r = t[s])
                                    .isActive && (n = r.collision, 0 < r.activeContacts.length)) {
                                    var h = r.activeContacts[0].vertex.x
                                        , d = r.activeContacts[0].vertex.y;
                                    2 === r.activeContacts.length && (h = (r.activeContacts[0].vertex.x + r.activeContacts[1].vertex.x) / 2, d = (r.activeContacts[0].vertex.y + r.activeContacts[1].vertex.y) / 2), n.bodyB === n.supports[0].body || !0 === n.bodyA.isStatic ? a.moveTo(h - 8 * n.normal.x, d - 8 * n.normal.y) : a.moveTo(h + 8 * n.normal.x, d + 8 * n.normal.y), a.lineTo(h, d)
                                }
                        l.wireframes ? a.strokeStyle = "rgba(255,165,0,0.7)" : a.strokeStyle = "orange", a.lineWidth = 1, a.stroke()
                    }, x.separations = function(e, t, i) {
                        var r, n, s, o, a, l = i
                            , c = e.options;
                        for (l.beginPath(), a = 0; a < t.length; a++)
                            if ((r = t[a])
                                .isActive) {
                                s = (n = r.collision)
                                    .bodyA;
                                var h = 1;
                                (o = n.bodyB)
                                .isStatic || s.isStatic || (h = .5), o.isStatic && (h = 0), l.moveTo(o.position.x, o.position.y), l.lineTo(o.position.x - n.penetration.x * h, o.position.y - n.penetration.y * h), h = 1, o.isStatic || s.isStatic || (h = .5), s.isStatic && (h = 0), l.moveTo(s.position.x, s.position.y), l.lineTo(s.position.x + n.penetration.x * h, s.position.y + n.penetration.y * h)
                            }
                        c.wireframes ? l.strokeStyle = "rgba(255,165,0,0.5)" : l.strokeStyle = "orange", l.stroke()
                    }, x.grid = function(e, t, i) {
                        var r = i;
                        e.options.wireframes ? r.strokeStyle = "rgba(255,180,0,0.1)" : r.strokeStyle = "rgba(255,180,0,0.5)", r.beginPath();
                        for (var n = m.keys(t.buckets), s = 0; s < n.length; s++) {
                            var o = n[s];
                            if (!(t.buckets[o].length < 2)) {
                                var a = o.split(/C|R/);
                                r.rect(.5 + parseInt(a[1], 10) * t.bucketWidth, .5 + parseInt(a[2], 10) * t.bucketHeight, t.bucketWidth, t.bucketHeight)
                            }
                        }
                        r.lineWidth = 1, r.stroke()
                    }, x.inspector = function(e, t) {
                        e.engine;
                        var i, r = e.selected
                            , n = e.render
                            , s = n.options;
                        if (s.hasBounds) {
                            var o = n.bounds.max.x - n.bounds.min.x
                                , a = n.bounds.max.y - n.bounds.min.y
                                , l = o / n.options.width
                                , c = a / n.options.height;
                            t.scale(1 / l, 1 / c), t.translate(-n.bounds.min.x, -n.bounds.min.y)
                        }
                        for (var h = 0; h < r.length; h++) {
                            var d = r[h].data;
                            switch (t.translate(.5, .5), t.lineWidth = 1, t.strokeStyle = "rgba(255,165,0,0.9)", t.setLineDash([1, 2]), d.type) {
                                case "body":
                                    i = d.bounds, t.beginPath(), t.rect(Math.floor(i.min.x - 3), Math.floor(i.min.y - 3), Math.floor(i.max.x - i.min.x + 6), Math.floor(i.max.y - i.min.y + 6)), t.closePath(), t.stroke();
                                    break;
                                case "constraint":
                                    var u = d.pointA;
                                    d.bodyA && (u = d.pointB), t.beginPath(), t.arc(u.x, u.y, 10, 0, 2 * Math.PI), t.closePath(), t.stroke()
                            }
                            t.setLineDash([]), t.translate(-.5, -.5)
                        }
                        null !== e.selectStart && (t.translate(.5, .5), t.lineWidth = 1, t.strokeStyle = "rgba(255,165,0,0.6)", t.fillStyle = "rgba(255,165,0,0.1)", i = e.selectBounds, t.beginPath(), t.rect(Math.floor(i.min.x), Math.floor(i.min.y), Math.floor(i.max.x - i.min.x), Math.floor(i.max.y - i.min.y)), t.closePath(), t.stroke(), t.fill(), t.translate(-.5, -.5)), s.hasBounds && t.setTransform(1, 0, 0, 1, 0, 0)
                    };
                    var n = function(e, t) {
                            var i = document.createElement("canvas");
                            return i.width = e, i.height = t, i.oncontextmenu = function() {
                                return !1
                            }, i.onselectstart = function() {
                                return !1
                            }, i
                        }
                        , s = function(e) {
                            var t = e.getContext("2d");
                            return (window.devicePixelRatio || 1) / (t.webkitBackingStorePixelRatio || t.mozBackingStorePixelRatio || t.msBackingStorePixelRatio || t.oBackingStorePixelRatio || t.backingStorePixelRatio || 1)
                        }
                        , f = function(e, t) {
                            var i = e.textures[t];
                            return i || ((i = e.textures[t] = new Image)
                                .src = t, i)
                        }
                        , _ = function(e, t) {
                            var i = t;
                            /(jpg|gif|png)$/.test(t) && (i = "url(" + t + ")"), e.canvas.style.background = i, e.canvas.style.backgroundSize = "contain", e.currentBackground = t
                        }
                }()
            }, {
                "../body/Composite": 2
                , "../collision/Grid": 6
                , "../core/Common": 14
                , "../core/Events": 16
                , "../core/Mouse": 19
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
            }]
            , 32: [function(e, t, i) {
                var _ = {};
                t.exports = _;
                var x = e("../geometry/Bounds")
                    , b = e("../body/Composite")
                    , f = e("../core/Common")
                    , n = e("../core/Events")
                    , w = e("../geometry/Vector");
                ! function() {
                    var r, t;
                    "undefined" != typeof window && (r = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
                        window.setTimeout(function() {
                            e(f.now())
                        }, 1e3 / 60)
                    }, t = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame), _.create = function(e) {
                        f.warn("RenderPixi.create: Matter.RenderPixi is deprecated (see docs)");
                        var t = {
                                controller: _
                                , engine: null
                                , element: null
                                , frameRequestId: null
                                , canvas: null
                                , renderer: null
                                , container: null
                                , spriteContainer: null
                                , pixiOptions: null
                                , options: {
                                    width: 800
                                    , height: 600
                                    , background: "#fafafa"
                                    , wireframeBackground: "#222"
                                    , hasBounds: !1
                                    , enabled: !0
                                    , wireframes: !0
                                    , showSleeping: !0
                                    , showDebug: !1
                                    , showBroadphase: !1
                                    , showBounds: !1
                                    , showVelocity: !1
                                    , showCollisions: !1
                                    , showAxes: !1
                                    , showPositions: !1
                                    , showAngleIndicator: !1
                                    , showIds: !1
                                    , showShadows: !1
                                }
                            }
                            , i = f.extend(t, e)
                            , r = !i.options.wireframes && "transparent" === i.options.background;
                        return i.pixiOptions = i.pixiOptions || {
                            view: i.canvas
                            , transparent: r
                            , antialias: !0
                            , backgroundColor: e.background
                        }, i.mouse = e.mouse, i.engine = e.engine, i.renderer = i.renderer || new PIXI.WebGLRenderer(i.options.width, i.options.height, i.pixiOptions), i.container = i.container || new PIXI.Container, i.spriteContainer = i.spriteContainer || new PIXI.Container, i.canvas = i.canvas || i.renderer.view, i.bounds = i.bounds || {
                            min: {
                                x: 0
                                , y: 0
                            }
                            , max: {
                                x: i.options.width
                                , y: i.options.height
                            }
                        }, n.on(i.engine, "beforeUpdate", function() {
                            _.clear(i)
                        }), i.textures = {}, i.sprites = {}, i.primitives = {}, i.container.addChild(i.spriteContainer), f.isElement(i.element) ? i.element.appendChild(i.canvas) : f.warn('No "render.element" passed, "render.canvas" was not inserted into document.'), i.canvas.oncontextmenu = function() {
                            return !1
                        }, i.canvas.onselectstart = function() {
                            return !1
                        }, i
                    }, _.run = function(i) {
                        ! function e(t) {
                            i.frameRequestId = r(e), _.world(i)
                        }()
                    }, _.stop = function(e) {
                        t(e.frameRequestId)
                    }, _.clear = function(e) {
                        for (var t = e.container, i = e.spriteContainer; t.children[0];) t.removeChild(t.children[0]);
                        for (; i.children[0];) i.removeChild(i.children[0]);
                        var r = e.sprites["bg-0"];
                        e.textures = {}, e.sprites = {}, e.primitives = {}, (e.sprites["bg-0"] = r) && t.addChildAt(r, 0), e.container.addChild(e.spriteContainer), e.currentBackground = null, t.scale.set(1, 1), t.position.set(0, 0)
                    }, _.setBackground = function(e, t) {
                        if (e.currentBackground !== t) {
                            var i = t.indexOf && -1 !== t.indexOf("#")
                                , r = e.sprites["bg-0"];
                            if (i) {
                                var n = f.colorToNumber(t);
                                e.renderer.backgroundColor = n, r && e.container.removeChild(r)
                            } else if (!r) {
                                var s = o(e, t);
                                (r = e.sprites["bg-0"] = new PIXI.Sprite(s))
                                .position.x = 0, r.position.y = 0, e.container.addChildAt(r, 0)
                            }
                            e.currentBackground = t
                        }
                    }, _.world = function(e) {
                        var t, i = e.engine.world
                            , r = e.renderer
                            , n = e.container
                            , s = e.options
                            , o = b.allBodies(i)
                            , a = b.allConstraints(i)
                            , l = [];
                        s.wireframes ? _.setBackground(e, s.wireframeBackground) : _.setBackground(e, s.background);
                        var c = e.bounds.max.x - e.bounds.min.x
                            , h = e.bounds.max.y - e.bounds.min.y
                            , d = c / e.options.width
                            , u = h / e.options.height;
                        if (s.hasBounds) {
                            for (t = 0; t < o.length; t++) {
                                var f = o[t];
                                f.render.sprite.visible = x.overlaps(f.bounds, e.bounds)
                            }
                            for (t = 0; t < a.length; t++) {
                                var g = a[t]
                                    , p = g.bodyA
                                    , m = g.bodyB
                                    , v = g.pointA
                                    , y = g.pointB;
                                p && (v = w.add(p.position, g.pointA)), m && (y = w.add(m.position, g.pointB)), v && y && ((x.contains(e.bounds, v) || x.contains(e.bounds, y)) && l.push(g))
                            }
                            n.scale.set(1 / d, 1 / u), n.position.set(-e.bounds.min.x * (1 / d), -e.bounds.min.y * (1 / u))
                        } else l = a;
                        for (t = 0; t < o.length; t++) _.body(e, o[t]);
                        for (t = 0; t < l.length; t++) _.constraint(e, l[t]);
                        r.render(n)
                    }, _.constraint = function(e, t) {
                        e.engine;
                        var i = t.bodyA
                            , r = t.bodyB
                            , n = t.pointA
                            , s = t.pointB
                            , o = e.container
                            , a = t.render
                            , l = "c-" + t.id
                            , c = e.primitives[l];
                        c || (c = e.primitives[l] = new PIXI.Graphics), a.visible && t.pointA && t.pointB ? (-1 === f.indexOf(o.children, c) && o.addChild(c), c.clear(), c.beginFill(0, 0), c.lineStyle(a.lineWidth, f.colorToNumber(a.strokeStyle), 1), i ? c.moveTo(i.position.x + n.x, i.position.y + n.y) : c.moveTo(n.x, n.y), r ? c.lineTo(r.position.x + s.x, r.position.y + s.y) : c.lineTo(s.x, s.y), c.endFill()) : c.clear()
                    }, _.body = function(e, t) {
                        e.engine;
                        var i = t.render;
                        if (i.visible)
                            if (i.sprite && i.sprite.texture) {
                                var r = "b-" + t.id
                                    , n = e.sprites[r]
                                    , s = e.spriteContainer;
                                n || (n = e.sprites[r] = c(e, t)), -1 === f.indexOf(s.children, n) && s.addChild(n), n.position.x = t.position.x, n.position.y = t.position.y, n.rotation = t.angle, n.scale.x = i.sprite.xScale || 1, n.scale.y = i.sprite.yScale || 1
                            } else {
                                var o = "b-" + t.id
                                    , a = e.primitives[o]
                                    , l = e.container;
                                a || ((a = e.primitives[o] = h(e, t))
                                    .initialAngle = t.angle), -1 === f.indexOf(l.children, a) && l.addChild(a), a.position.x = t.position.x, a.position.y = t.position.y, a.rotation = t.angle - a.initialAngle
                            }
                    };
                    var c = function(e, t) {
                            var i = t.render.sprite.texture
                                , r = o(e, i)
                                , n = new PIXI.Sprite(r);
                            return n.anchor.x = t.render.sprite.xOffset, n.anchor.y = t.render.sprite.yOffset, n
                        }
                        , h = function(e, t) {
                            var i, r = t.render
                                , n = e.options
                                , s = new PIXI.Graphics
                                , o = f.colorToNumber(r.fillStyle)
                                , a = f.colorToNumber(r.strokeStyle)
                                , l = f.colorToNumber(r.strokeStyle)
                                , c = f.colorToNumber("#bbb")
                                , h = f.colorToNumber("#CD5C5C");
                            s.clear();
                            for (var d = 1 < t.parts.length ? 1 : 0; d < t.parts.length; d++) {
                                i = t.parts[d], n.wireframes ? (s.beginFill(0, 0), s.lineStyle(1, c, 1)) : (s.beginFill(o, 1), s.lineStyle(r.lineWidth, a, 1)), s.moveTo(i.vertices[0].x - t.position.x, i.vertices[0].y - t.position.y);
                                for (var u = 1; u < i.vertices.length; u++) s.lineTo(i.vertices[u].x - t.position.x, i.vertices[u].y - t.position.y);
                                s.lineTo(i.vertices[0].x - t.position.x, i.vertices[0].y - t.position.y), s.endFill(), (n.showAngleIndicator || n.showAxes) && (s.beginFill(0, 0), n.wireframes ? s.lineStyle(1, h, 1) : s.lineStyle(1, l), s.moveTo(i.position.x - t.position.x, i.position.y - t.position.y), s.lineTo((i.vertices[0].x + i.vertices[i.vertices.length - 1].x) / 2 - t.position.x, (i.vertices[0].y + i.vertices[i.vertices.length - 1].y) / 2 - t.position.y), s.endFill())
                            }
                            return s
                        }
                        , o = function(e, t) {
                            var i = e.textures[t];
                            return i || (i = e.textures[t] = PIXI.Texture.fromImage(t)), i
                        }
                }()
            }, {
                "../body/Composite": 2
                , "../core/Common": 14
                , "../core/Events": 16
                , "../geometry/Bounds": 26
                , "../geometry/Vector": 28
            }]
        }, {}, [30])(30)
    });
var mouse, debug = /debug/i.test(window.location.href)
    , vector = new Two.Vector
    , entities = []
    , symbols = []
    , cascadeScalar = 5
    , symbolScalar = 1.33
    , copy = []
    , two = new Two({
        type: Two.Types.canvas
        , fullscreen: !0
    })
    .appendTo(document.querySelector("#interactive__homepage"))
    , dimensions = {
        width: two.width
        , height: two.height
    }
    , runner = Matter.Runner.create()
    , solver = Matter.Engine.create();
solver.world.gravity.y = 1;
var bounds = {
    thickness: 50
    , properties: {
        isStatic: !0
    }
};
bounds.left = createBoundary(bounds.thickness, two.height + bounds.thickness), bounds.right = createBoundary(bounds.thickness, two.height + bounds.thickness), bounds.bottom = createBoundary(two.width + bounds.thickness, bounds.thickness), Matter.World.add(solver.world, [bounds.left.entity, bounds.right.entity, bounds.bottom.entity]);
var defaultStyles = {
    size: getFontSize()
    , weight: 400
    , color: "black"
    , leading: getFontSize()
    , family: "FoundersGrotesk, Helvetica Neue, sans-serif"
    , margin: {
        top: 5
        , left: 10
        , right: 15
        , bottom: 5
    }
};

function setup() {
    setupCopy(), setupSymbols(), addSlogan(), resize(), mouse = addMouseInteraction(), two.bind("resize", resize), window.addEventListener("deviceorientation", function(e) {
        var t = void 0 !== window.orientation ? window.orientation : 0
            , i = solver.world.gravity;
        0 === t ? (i.x = clamp(e.gamma, -90, 90) / 90, i.y = clamp(e.beta, -90, 90) / 90) : 180 === t ? (i.x = clamp(e.gamma, -90, 90) / 90, i.y = clamp(-e.beta, -90, 90) / 90) : 90 === t ? (i.x = clamp(e.beta, -90, 90) / 90, i.y = clamp(-e.gamma, -90, 90) / 90) : -90 === t && (i.x = clamp(-e.beta, -90, 90) / 90, i.y = clamp(e.gamma, -90, 90) / 90)
    }, !1), two.playing = !0, Matter.Runner.run(runner, solver), Matter.Events.on(solver, "afterUpdate", update)
}

function setupCopy() {
    for (var e = document.querySelector("#interactive__text")
            .childNodes, t = 0; t < e.length; t++) {
        var i = e[t];
        copy = copy.concat(a(i))
    }

    function a(e) {
        var t, i, r, n, s = []
            , o = {};
        if (0 < e.childNodes.length) {
            switch (e.tagName.toLowerCase()) {
                case "em":
                    o.style = "italic";
                    break;
                case "span":
                    break;
                case "b":
                case "strong":
                    o.weight = 700
            }
            for (s.push({
                    styles: o
                    , value: []
                }), i = 0; i < e.childNodes.length; i++) t = a(e.childNodes[i]), s[0].value = s[0].value.concat(t)
        } else
            for (t = e.textContent.split(/\s+/i), r = 0; r < t.length; r++)(n = t[r]) && s.push(n);
        return s
    }
}

function setupSymbols() {
    symbols.index = 0;
    for (var e = document.querySelectorAll("#interactive__images > *"), t = 0; t < e.length; t++) {
        var i = e[t].getAttribute("svg-src")
            , r = new Two.Group
            , n = new Two.Texture(i, symbolLoaded(r))
            , s = new Two.Sprite(n);
        s.scale = .5, r.add(s), symbols.push(r)
    }
}

function symbolLoaded(e) {
    return function() {
        symbols.isReady = !0, e.rect = e.getBoundingClientRect(), e.rect.ratio = e.rect.width / e.rect.height, e.isReady = !0
    }
}

function resize() {
    var e = bounds.thickness
        , t = 1.25 * two.width
        , i = 1.25 * two.height;
    vector.x = two.width / 2 - two.width / 2 - e / 2, vector.y = two.height / 2, Matter.Body.setPosition(bounds.left.entity, vector), Matter.Body.scale(bounds.left.entity, 1 / bounds.left.entity.scale.x, 1 / bounds.left.entity.scale.y), Matter.Body.scale(bounds.left.entity, e, i), bounds.left.entity.scale.x = e, bounds.left.entity.scale.y = i, vector.x = two.width / 2 + two.width / 2 + e / 2, vector.y = two.height / 2, Matter.Body.setPosition(bounds.right.entity, vector), Matter.Body.scale(bounds.right.entity, 1 / bounds.right.entity.scale.x, 1 / bounds.right.entity.scale.y), Matter.Body.scale(bounds.right.entity, e, i), bounds.right.entity.scale.x = e, bounds.right.entity.scale.y = i, vector.x = two.width / 2, vector.y = two.height + e / 2, Matter.Body.setPosition(bounds.bottom.entity, vector), Matter.Body.scale(bounds.bottom.entity, 1 / bounds.bottom.entity.scale.x, 1 / bounds.bottom.entity.scale.y), Matter.Body.scale(bounds.bottom.entity, t, e), bounds.bottom.entity.scale.x = t, bounds.bottom.entity.scale.y = e, two.renderer.domElement.setAttribute("data-pixel-ratio", two.renderer.ratio);
    for (var r = getFontSize(), n = .8 * r, s = 0; s < two.scene.children.length; s++) {
        var o = two.scene.children[s];
        if (o.isWord || o.isLetter || o.isSymbol) {
            var a, l = o.text
                , c = o.rectangle
                , h = o.entity;
            l ? (l.size = r, l.leading = n, a = l.getBoundingClientRect(!0)) : (a = {
                width: o.rect.width * (r * symbolScalar) / 300
                , height: o.rect.height * (r * symbolScalar) / 300
            }, o.destinationScale = r * symbolScalar / 300), c.width = a.width, c.height = a.height, Matter.Body.scale(h, 1 / h.scale.x, 1 / h.scale.y), Matter.Body.scale(h, a.width, a.height), vector.x = two.width * h.position.x / dimensions.width, vector.y = two.height * h.position.y / dimensions.height, h.scale.set(a.width, a.height), Matter.Body.setPosition(h, vector)
        }
    }
    dimensions.width = two.width, dimensions.height = two.height
}

function update() {
    for (var e = 0; e < entities.length; e++) {
        var t = entities[e]
            , i = t.object;
        if (t.object.position.copy(t.position), t.object.rotation = t.angle, i.isSymbol) {
            var r = i.destinationScale - i.scale;
            r < .01 && -.01 < r ? i.scale = i.destinationScale : i.scale += .66 * (i.destinationScale - i.scale)
        }
    }
    two.render()
}

function addSlogan() {
    for (var e, t, i, r, n, s, o = defaultStyles.margin.left, a = defaultStyles.leading, l = [{
            width: defaultStyles.margin.right
            , index: 0
        }], c = l.index = 0; c < copy.length; c++) {
        var h = copy[c]
            , d = new Two.Group
            , u = new Two.Text("", 0, 0, defaultStyles);
        if (d.isWord = !0, h.value)
            for (var f in u.value = h.value.join(" "), h.styles) u[f] = h.styles[f];
        else u.value = h;
        e = o + (i = u.getBoundingClientRect(!0))
            .width / 2, t = a + i.height / 2, r = o + i.width, two.width < r && (l[l.index].width += defaultStyles.margin.right, l.index++, l.push({
                width: defaultStyles.margin.left
                , index: c
            }), o = defaultStyles.margin.left, a += defaultStyles.leading + defaultStyles.margin.top + defaultStyles.margin.bottom, e = o + i.width / 2, t = a + i.height / 2), d.translation.x = e, d.translation.y = t, u.translation.y = 14;
        var g = new Two.Rectangle(0, 0, i.width, i.height);
        g.stroke = "rgb(green)", g.noFill(), g.opacity = .75, g.visible = debug;
        var p = Matter.Bodies.rectangle(e, t, 1, 1);
        Matter.Body.scale(p, i.width, i.height), Matter.Body.rotate(p, Math.random() * Math.PI / 16 - Math.PI / 32), p.scale = new Two.Vector(i.width, i.height), p.object = d, entities.push(p);
        var m = i.width + defaultStyles.margin.left + defaultStyles.margin.right;
        o += m, l[l.index].width += m, d.text = u, d.rectangle = g, d.entity = p, d.add(u, g), two.add(d)
    }
    s = Math.max(t - two.height, 0);
    for (var v = 0; v < l.length; v++) {
        var y = l[v]
            , _ = l[v + 1]
            , x = entities.length;
        n = Math.max(two.width - y.width, 0), n *= Math.random(), _ && (x = _.index);
        for (var b = y.index; b < x; b++) {
            p = entities[b];
            vector.x = p.position.x + n, vector.y = p.position.y - s, Matter.Body.setPosition(p, vector)
        }
        lastIndex = y.index
    }
    Matter.World.add(solver.world, entities)
}

function addMouseInteraction() {
    var i, r = document.body
        , n = Matter.Mouse.create(r)
        , e = Matter.MouseConstraint.create(solver, {
            mouse: n
            , constraint: {
                stiffness: .2
            }
        })
        , s = 0
        , o = !1
        , a = !1
        , l = document.body.querySelector("header")
        , c = {
            passive: !1
        }
        , h = !0;

    function d() {
        Matter.Mouse.clearSourceEvents(n), r.removeEventListener("touchmove", n.mousemove, c), r.removeEventListener("touchstart", n.mousedown, c), r.removeEventListener("touchend", n.mouseup, c), h = !1
    }
    return d(), r.addEventListener("dblclick", function(e) {
        a || (i && (cascade(n.position), explode(i)), i = null)
    }, !1), r.addEventListener("mousedown", function(e) {
        var t = l.getBoundingClientRect();
        a = e.clientY < t.bottom, o = !1, i = null
    }, !1), r.addEventListener("touchstart", function(e) {
        var t = l.getBoundingClientRect();
        (a = !!(e.touches && 0 < e.touches.length) && e.touches[0].clientY < t.bottom) ? d(): h || (n.mousedown(e), r.addEventListener("touchmove", n.mousemove, c), r.addEventListener("touchstart", n.mousedown, c), r.addEventListener("touchend", n.mouseup, c), h = !0), o = !0, i = null
    }, !1), Matter.Events.on(e, "mousedown", function(e) {
        a || !i && symbols.isReady && injectSymbol(n.position)
    }), Matter.Events.on(e, "startdrag", function(e) {
        if (!a && (i = e.source.body, o)) {
            var t = Date.now();
            t - s <= 300 && i && (cascade(n.position), explode(i)), s = t
        }
    }), Matter.World.add(solver.world, e), e
}

function explode(e) {
    if (!e.object.isSymbol) {
        var t = e.object
            , i = t.text.value.split("")
            , r = t.text.getBoundingClientRect(!0)
            , n = e.angle
            , s = []
            , o = getIndex(e);
        0 <= o && entities.splice(o, 1);
        for (var a = 0; a < i.length; a++) {
            var l = (a + .5) / i.length
                , c = i[a]
                , h = new Two.Group;
            h.isLetter = !0;
            var d = t.text.clone();
            d.value = c;
            var u = d.getBoundingClientRect(!0)
                , f = l * r.width - r.width / 2
                , g = t.position.x + f * Math.cos(n)
                , p = t.position.y + f * Math.sin(n);
            h.translation.x = g, h.translation.y = p, d.translation.y = 14;
            var m = new Two.Rectangle(0, 0, u.width, u.height);
            m.stroke = "rgb(green)", m.noFill(), m.opacity = .75, m.visible = debug;
            e = Matter.Bodies.rectangle(g, p, 1, 1);
            Matter.Body.scale(e, u.width, u.height), Matter.Body.rotate(e, n), Matter.Body.setMass(e, 2.5);
            var v = l * Math.PI * 2;
            vector.x = .33 * Math.cos(v), vector.y = .33 * Math.sin(v), Matter.Body.applyForce(e, e.position, vector), e.scale = new Two.Vector(u.width, u.height), e.object = h, entities.push(e), s.push(e), h.text = d, h.rectangle = m, h.entity = e, h.add(d, m), two.add(h)
        }
        Matter.World.remove(solver.world, t.entity), t.remove(), Two.Utils.release(t), Matter.World.add(solver.world, s)
    }
}

function injectSymbol(e) {
    var t = getFontSize() * symbolScalar
        , i = getNextSymbol()
        , r = i.clone()
        , n = [];
    r.isSymbol = !0, r.symbol = getPathFromSVG(r), r.symbol.scale = .5;
    var s = e.x
        , o = e.y
        , a = {
            width: i.rect.width * (t * symbolScalar) / 300
            , height: i.rect.height * (t * symbolScalar) / 300
        };
    r.scale = 0, r.destinationScale = t * symbolScalar / 300, r.rect = i.rect, r.position.set(s, o);
    var l = new Two.Rectangle(0, 0, i.rect.width, i.rect.height);
    l.stroke = "rgb(green)", l.noFill(), l.opacity = .75, l.visible = debug;
    var c = Math.random() * Math.PI / 16 - Math.PI / 32
        , h = Matter.Bodies.rectangle(s, o, 1, 1);
    Matter.Body.scale(h, a.width, a.height), Matter.Body.rotate(h, c), Matter.Body.setMass(h, 2.5), h.scale = new Two.Vector(a.width, a.height), h.object = r, entities.push(h), n.push(h), r.rectangle = l, r.entity = h, r.add(l), two.add(r), Matter.World.add(solver.world, n)
}

function getPathFromSVG(e) {
    for (var t = 0; t < e.children.length; t++) {
        var i = e.children[t];
        if (/path/i.test(i._renderer.type)) return i
    }
    return null
}

function getNextSymbol() {
    var e = symbols[symbols.index];
    return symbols.index = (symbols.index + 1) % symbols.length, e.isReady ? e : getNextSymbol()
}

function cascade(e) {
    for (var t = 0; t < entities.length; t++) {
        var i = entities[t]
            , r = i.position.x - e.x
            , n = i.position.y - e.y
            , s = Math.atan2(n, r)
            , o = Math.sqrt(r * r + n + n)
            , a = cascadeScalar / o;
        a || (a = 1), vector.x = a * Math.cos(s), vector.y = a * Math.sin(s), Matter.Body.applyForce(i, i.position, vector)
    }
}

function release(e) {
    vector.x = 0, vector.y = 0, Matter.Body.setStatic(e, !1), Matter.Body.applyForce(e, e.position, vector)
}

function createBoundary(e, t) {
    var i = two.makeRectangle(0, 0, e, t);
    i.visible = debug;
    var r = Matter.Bodies.rectangle(0, 0, 1, 1, bounds.properties);
    return Matter.Body.scale(r, e, t), r.position = i.position, r.scale = new Two.Vector(e, t), i.entity = r, i
}

function getIndex(e) {
    for (var t = 0; t < entities.length; t++)
        if (entities[t].id === e.id) return t;
    return -1
}

function getFontSize() {
    var e = two.width
        , t = (two.height, two.height / two.width);
    two.width, two.height;
    return 2 < t ? .14 * e : 1.75 < t && t < 2.01 ? .13 * e : 1.5 < t && t < 1.76 ? .12 * e : 1.25 < t && t < 1.51 ? .11 * e : 1 < t && t < 1.26 ? .105 * e : .9 < t && t < 1.01 ? .095 * e : .7 < t && t < .91 ? .085 * e : .6 < t && t < .71 ? .08 * e : .5 < t && t < .61 ? .075 * e : .45 < t && t < .51 ? .07 * e : .4 < t && t < .46 ? .065 * e : .35 < t && t < .41 ? .06 * e : .3 < t && t < .36 ? .055 * e : .25 < t && t < .31 ? .05 * e : .2 < t && t < .26 ? .045 * e : .1 < t && t < .11 ? .032 * e : .03 * e
}

function clamp(e, t, i) {
    return Math.min(Math.max(e, t), i)
}
setup();
   
});
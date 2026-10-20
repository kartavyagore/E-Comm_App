export const initialCategories = [
  {
    id: "c1111111-1111-4111-a111-111111111111",
    name: "Spatial Audio",
    slug: "spatial-audio",
    description: "Immersive over-ear planar magnetic and active noise cancelling studio headphones."
  },
  {
    id: "c2222222-2222-4222-a222-222222222222",
    name: "Studio Monitors",
    slug: "studio-monitors",
    description: "Nearfield active acoustic monitors tuned for surgical sound precision."
  },
  {
    id: "c3333333-3333-4333-a333-333333333333",
    name: "Acoustic Gear & DACs",
    slug: "acoustic-gear-dacs",
    description: "High-resolution digital-to-analog converters, tube amps, and acoustic diffusers."
  },
  {
    id: "c4444444-4444-4444-a444-444444444444",
    name: "Desk & Audio Accessories",
    slug: "desk-accessories",
    description: "Precision-milled aluminum headphone stands, braided balanced cables, and isolation pads."
  }
];

export const initialProducts = [
  {
    id: "p1111111-1111-4111-a111-111111111111",
    title: "AURA Obsidian Pro Wireless Planar Headphones",
    slug: "aura-obsidian-pro-wireless",
    category_id: "c1111111-1111-4111-a111-111111111111",
    category_name: "Spatial Audio",
    price: 499.00,
    stock_quantity: 18,
    is_featured: true,
    rating: 4.9,
    num_reviews: 42,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "The pinnacle of wireless acoustic fidelity. Featuring custom 90mm planar magnetic drivers, magnesium alloy earcups, and lossless 24-bit/96kHz low-latency wireless transmission. Memory foam ear cushions wrapped in breathable lambskin ensure 40 hours of fatigue-free listening.",
    specifications: {
      driver: "90mm Planar Magnetic",
      frequency_response: "10Hz - 48kHz",
      battery_life: "40 Hours (ANC On)",
      connectivity: "Bluetooth 5.3 + 2.4GHz RF + 3.5mm Balanced",
      weight: "385g"
    }
  },
  {
    id: "p2222222-2222-4222-a222-222222222222",
    title: "AURA Horizon Studio Monitor Pair (Walnut & Charcoal)",
    slug: "aura-horizon-studio-monitors",
    category_id: "c2222222-2222-4222-a222-222222222222",
    category_name: "Studio Monitors",
    price: 849.00,
    stock_quantity: 9,
    is_featured: true,
    rating: 5.0,
    num_reviews: 29,
    image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Crafted for creators and audiophiles who demand truth in sound. Built with sustainably sourced solid American walnut baffles, 6.5-inch woven carbon fiber woofers, and silk dome tweeters with custom waveguide geometry. Delivers an impeccably linear sonic landscape.",
    specifications: {
      power_output: "140W Class-D Bi-Amplified",
      frequency_response: "38Hz - 22kHz (±1.5dB)",
      inputs: "XLR Balanced, TRS, Optical S/PDIF",
      cabinet: "Curved Walnut & Solid MDF",
      dsp: "Room Calibration Presets"
    }
  },
  {
    id: "p3333333-3333-4333-a333-333333333333",
    title: "AURA ValveOne Desktop Vacuum Tube DAC & Amp",
    slug: "aura-valveone-desktop-tube-dac-amp",
    category_id: "c3333333-3333-4333-a333-333333333333",
    category_name: "Acoustic Gear & DACs",
    price: 379.00,
    stock_quantity: 14,
    is_featured: true,
    rating: 4.8,
    num_reviews: 35,
    image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Harmonic richness meets surgical digital conversion. The ValveOne houses dual matched Russian 6J1 vacuum tubes alongside the flagship ESS Sabre ES9038PRO 32-bit DAC chip. Features an analog precision step attenuator and machined aviation-grade aluminum chassis.",
    specifications: {
      dac_chip: "ESS Sabre ES9038PRO (32-bit/768kHz, DSD512)",
      tubes: "Dual Matched 6J1 Vacuum Tubes",
      headphone_out: "4.4mm Pentaconn Balanced + 6.35mm Single-ended",
      output_power: "2200mW @ 32 Ohms",
      thd_n: "< 0.0003%"
    }
  },
  {
    id: "p4444444-4444-4444-a444-444444444444",
    title: "AURA Kanso Minimalist Solid Aluminum Headphone Stand",
    slug: "aura-kanso-aluminum-headphone-stand",
    category_id: "c4444444-4444-4444-a444-444444444444",
    category_name: "Desk & Audio Accessories",
    price: 89.00,
    stock_quantity: 45,
    is_featured: false,
    rating: 4.9,
    num_reviews: 64,
    image_url: "https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Sculpted from a single block of aerospace-grade 6061 aluminum with an anodized matte finish. Designed to support headband contours without indenting padding. Features an integrated magnetic cable management groove and a weighted non-slip silicone base.",
    specifications: {
      material: "CNC Milled 6061 Aluminum",
      finish: "Micro-bead blasted Matte Space Gray",
      base_weight: "650g anti-tip weighted core",
      dimensions: "285mm x 120mm x 120mm"
    }
  },
  {
    id: "p5555555-5555-4555-a555-555555555555",
    title: "AURA Flux Pure Silver Balanced Audio Cable (4.4mm)",
    slug: "aura-flux-silver-balanced-cable",
    category_id: "c4444444-4444-4444-a444-444444444444",
    category_name: "Desk & Audio Accessories",
    price: 129.00,
    stock_quantity: 26,
    is_featured: false,
    rating: 4.7,
    num_reviews: 19,
    image_url: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "8-core hand-braided monocrystalline pure silver conductors. Zero microphonics, cryogenic treatment, and 24K gold-plated connectors for maximum signal transparency and holographic spatial separation.",
    specifications: {
      conductor: "8-Core 7N Monocrystalline Silver",
      sheath: "Ultra-flexible Medical Grade PVC + Braided Sleeve",
      termination: "4.4mm Balanced TRRRS to Dual 3.5mm",
      length: "1.5 Meters"
    }
  },
  {
    id: "p6666666-6666-4666-a666-666666666666",
    title: "AURA Pulse ANC Reference Earphones",
    slug: "aura-pulse-anc-reference-earphones",
    category_id: "c1111111-1111-4111-a111-111111111111",
    category_name: "Spatial Audio",
    price: 269.00,
    stock_quantity: 32,
    is_featured: true,
    rating: 4.8,
    num_reviews: 51,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Ultra-compact true wireless in-ear monitors equipped with custom Knowles balanced armatures + 10mm beryllium dynamic drivers. Adaptive hybrid noise cancellation dampens ambient noise by up to 45dB while maintaining reference frequency response.",
    specifications: {
      drivers: "Hybrid Beryllium Dynamic + Knowles Balanced Armature",
      noise_cancellation: "Hybrid Adaptive ANC (-45dB)",
      battery: "9 Hours earbuds + 27 Hours wireless charging case",
      waterproof: "IPX5 Sweat & Rain resistant"
    }
  },
  {
    id: "p7777777-7777-4777-a777-777777777777",
    title: "AURA Echo Sub Active Low-Frequency Studio Subwoofer",
    slug: "aura-echo-sub-active-subwoofer",
    category_id: "c2222222-2222-4222-a222-222222222222",
    category_name: "Studio Monitors",
    price: 620.00,
    stock_quantity: 7,
    is_featured: false,
    rating: 4.9,
    num_reviews: 15,
    image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Tight, surgical, non-fatiguing sub-bass response down to 22Hz. 10-inch downward-firing composite woofer powered by a 300W RMS Class-D amplifier. Features bypass footswitch input and adjustable crossover filters.",
    specifications: {
      power: "300W RMS / 500W Peak Class-D",
      frequency_response: "22Hz - 160Hz",
      crossover: "Variable 40Hz - 150Hz + Phase Invert switch",
      enclosure: "Sealed acoustic suspension cabinet"
    }
  },
  {
    id: "p8888888-8888-4888-a888-888888888888",
    title: "AURA Sonus Acoustic Diffuser & Sound Absorption Tiles (Pack of 6)",
    slug: "aura-sonus-acoustic-diffuser-tiles",
    category_id: "c3333333-3333-4333-a333-333333333333",
    category_name: "Acoustic Gear & DACs",
    price: 199.00,
    stock_quantity: 22,
    is_featured: false,
    rating: 4.9,
    num_reviews: 28,
    image_url: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1200&q=80",
    cloudinary_public_id: null,
    description: "Eliminate flutter echoes and standing waves with architectural elegance. Designed with quadratic residue sequence geometry made from sustainable charcoal oak and recycled PET high-density acoustic backing.",
    specifications: {
      material: "Charcoal Oak Facet + High-Density PET Acoustic Felt",
      nrc_rating: "0.85 Noise Reduction Coefficient",
      dimensions: "60cm x 60cm x 5cm per tile",
      fire_rating: "Class A Fire Retardant"
    }
  }
];

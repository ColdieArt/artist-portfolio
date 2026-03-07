const overlords = [
  {
    slug: "elon-musk",
    number: "I",
    name: "Elon Musk",
    title: "The Architect",
    tagline: "Technology's most polarizing figure",
    description: "The first node in the network. Drag, rotate, and export your own interpretation of technology's most polarizing figure. A kinetic 3D portrait exploring the duality of innovation and disruption.",
    medium: "Interactive 3D WebGL - Three.js, custom shaders, particle systems",
    year: 2026,
    artworkFile: "/artworks/elon-musk.html",
    previewImage: "/images/overlords/ElonMusk-Thumbnail.png",
    status: "live",
    order: 1,
  },
  {
    slug: "mark-zuckerberg",
    number: "II",
    name: "Mark Zuckerberg",
    title: "The Connector",
    tagline: "The architect of the social graph",
    description: "The second node activates. A figure who mapped human connection into code and turned identity into currency.",
    medium: "Interactive 3D WebGL - Three.js, custom shaders, particle systems",
    year: 2026,
    artworkFile: "/artworks/mark-zuckerberg.html",
    previewImage: "/images/overlords/Zuckerberg-web.jpg",
    status: "live",
    order: 2,
  },
  {
    slug: "sam-altman",
    number: "III",
    name: "Sam Altman",
    title: "The Accelerationist",
    tagline: "Ushering in the age of artificial minds",
    description: "The network expands. A mind that unleashed artificial intelligence on the world and dared humanity to keep up.",
    medium: "Interactive 3D WebGL - Three.js, custom shaders, particle systems",
    year: 2026,
    artworkFile: "/artworks/sam-altman.html",
    previewImage: "/images/overlords/Altman-web.jpg",
    status: "live",
    order: 3,
  },
  {
    slug: "jeff-bezos",
    number: "IV",
    name: "Jeff Bezos",
    title: "The Optimizer",
    tagline: "Everything is a logistics problem",
    description: "The penultimate node. An optimizer who bent the arc of commerce, labor, and space itself to his vision of relentless efficiency.",
    medium: "Interactive 3D WebGL - Three.js, custom shaders, particle systems",
    year: 2026,
    artworkFile: "/artworks/jeff-bezos.html",
    previewImage: "/images/overlords/Bezos-thumb.jpg",
    status: "live",
    order: 4,
  },
  {
    slug: "jensen-huang",
    number: "V",
    name: "Jensen Huang",
    title: "The Chipmaker",
    tagline: "The silicon behind the intelligence",
    description: "The final node completes the network. The man who forged the silicon brains powering the AI revolution.",
    medium: "Interactive 3D WebGL - Three.js, custom shaders, particle systems",
    year: 2026,
    artworkFile: "/artworks/jensen-huang.html",
    previewImage: "/images/overlords/Huang-web.jpg",
    status: "live",
    order: 5,
  },
];

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { slug } = req.query;

  if (slug) {
    const artwork = overlords.find((o) => o.slug === slug);
    if (!artwork) {
      return res.status(404).json({ error: "Artwork not found" });
    }
    return res.status(200).json(artwork);
  }

  return res.status(200).json({
    artist: "Coldie",
    collection: "Tech Epochalypse",
    description:
      "A series of interactive 3D portraits exploring the figures shaping the technological epoch. Each piece is a kinetic WebGL experience built with Three.js, custom shaders, and particle systems.",
    totalArtworks: overlords.length,
    artworks: overlords,
  });
};

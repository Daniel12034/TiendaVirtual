import { Categoria } from "../models/Categoria.js";
import { Producto } from "../models/Producto.js";
import { VarianteProducto } from "../models/VarianteProducto.js";
import {
  CatalogImageMeta,
  CatalogoEntry
} from "../presentation/types.js";

interface CategoriaSeed {
  id: string;
  nombre: string;
  descripcion: string;
}

interface VarianteSeed {
  id: string;
  nombre: string;
  valor: string;
  stock: number;
}

interface ImagenSeed {
  alt: string;
  url: string;
  sourceName: string;
  sourcePageUrl: string;
  creatorName: string;
  creatorUrl?: string | null;
  licenseLabel: string;
  width: number;
  height: number;
}

interface ProductoSeed {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  etiqueta: string;
  stock: number;
  variantes?: VarianteSeed[];
  imagen: ImagenSeed;
}

function crearVariante(seed: VarianteSeed): VarianteProducto {
  return new VarianteProducto(seed.nombre, seed.valor, seed.stock, seed.id);
}

function crearProducto(seed: ProductoSeed): Producto {
  const variantes = (seed.variantes ?? []).map(crearVariante);

  return new Producto(
    seed.nombre,
    seed.descripcion,
    seed.precio,
    true,
    seed.stock,
    variantes,
    seed.id
  );
}

function crearImagenMeta(seed: ImagenSeed): CatalogImageMeta {
  return {
    sourceName: seed.sourceName,
    sourcePageUrl: seed.sourcePageUrl,
    creatorName: seed.creatorName,
    creatorUrl: seed.creatorUrl,
    licenseLabel: seed.licenseLabel,
    width: seed.width,
    height: seed.height,
    verifiedRealPhoto: true,
    verifiedHd: seed.width >= 1280 || seed.height >= 1280
  };
}

export function crearCatalogoDemo(): {
  categorias: Categoria[];
  catalogo: CatalogoEntry[];
} {
  const categoriasSeed: CategoriaSeed[] = [
    {
      id: "cat-audio",
      nombre: "Audio y Gadgets",
      descripcion:
        "Tecnologia compacta para escuchar, grabar y optimizar tu setup diario."
    },
    {
      id: "cat-escritorio",
      nombre: "Escritorio Creativo",
      descripcion:
        "Piezas pensadas para un espacio de trabajo mas comodo, claro y expresivo."
    },
    {
      id: "cat-viaje",
      nombre: "Viaje y Ruta",
      descripcion:
        "Accesorios practicos para moverte ligero entre ciudad, estudio y escapadas."
    },
    {
      id: "cat-cocina",
      nombre: "Cafe y Cocina",
      descripcion:
        "Objetos honestos para preparar, servir y disfrutar cada pausa con estilo."
    },
    {
      id: "cat-hogar",
      nombre: "Hogar y Decoracion",
      descripcion:
        "Detalles de hogar que suman textura, calidez visual y pequenos rituales."
    },
    {
      id: "cat-estilo",
      nombre: "Estilo Diario",
      descripcion:
        "Basicos con actitud para completar tu rutina con funcionalidad y presencia."
    }
  ];

  const productosSeed: ProductoSeed[] = [
    {
      id: "prod-nimbus-wire",
      categoriaId: "cat-audio",
      nombre: "Auriculares Nimbo",
      descripcion:
        "Auriculares cerrados con perfil balanceado, cable resistente y almohadillas suaves para sesiones largas de enfoque, estudio o escucha casual.",
      precio: 259900,
      etiqueta: "Audio preciso",
      stock: 0,
      variantes: [
        { id: "var-nimbus-grafito", nombre: "Color", valor: "Grafito", stock: 2 },
        { id: "var-nimbus-marfil", nombre: "Color", valor: "Marfil", stock: 5 },
        { id: "var-nimbus-indigo", nombre: "Color", valor: "Indigo", stock: 1 }
      ],
      imagen: {
        alt: "Par de auriculares con cable sobre una superficie clara",
        url: "https://pd.w.org/2023/08/1564e384141b3313.03787600-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/1564e38414/",
        creatorName: "Ajith R N",
        creatorUrl: "https://ajithrn.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-costa-mini-speaker",
      categoriaId: "cat-audio",
      nombre: "Parlante Costa Mini",
      descripcion:
        "Parlante portatil con cuerpo compacto, graves controlados y agarre texturizado para llevar musica a la terraza, el escritorio o un paseo corto.",
      precio: 189900,
      etiqueta: "Outdoor ready",
      stock: 0,
      variantes: [
        { id: "var-costa-azul", nombre: "Color", valor: "Azul Playa", stock: 5 },
        { id: "var-costa-arena", nombre: "Color", valor: "Arena", stock: 2 },
        { id: "var-costa-carbon", nombre: "Color", valor: "Carbon", stock: 0 }
      ],
      imagen: {
        alt: "Parlante azul portatil sobre roca en la playa",
        url: "https://pd.w.org/2026/04/11769cfad42cc53c2.17966441-2048x1152.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/11769cfad4/",
        creatorName: "Faisal Ahammad",
        creatorUrl: "https://faisalahammad.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1152
      }
    },
    {
      id: "prod-elevate-stand",
      categoriaId: "cat-audio",
      nombre: "Soporte Elevado",
      descripcion:
        "Soporte para laptop que mejora el angulo de vision, libera espacio util y combina bien con teclados externos, mouse y setups de videollamadas.",
      precio: 149900,
      etiqueta: "Ergonomia visual",
      stock: 12,
      imagen: {
        alt: "Laptop sobre soporte metalico en un escritorio de trabajo",
        url: "https://pd.w.org/2025/02/7567b6aa72c6d961.41220718-2048x1363.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/7567b6aa72/",
        creatorName: "johnjullies",
        creatorUrl: "https://wordpress.org/photos/author/johnjullies/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1363
      }
    },
    {
      id: "prod-halo-curve-mouse",
      categoriaId: "cat-audio",
      nombre: "Raton Curvo",
      descripcion:
        "Mouse ergonomico con desplazamiento suave, click silencioso y una silueta curvada que reduce la fatiga en jornadas de trabajo o edicion.",
      precio: 119900,
      etiqueta: "Silencio total",
      stock: 0,
      variantes: [
        { id: "var-halo-perla", nombre: "Color", valor: "Perla", stock: 7 },
        { id: "var-halo-negro", nombre: "Color", valor: "Negro Noche", stock: 4 }
      ],
      imagen: {
        alt: "Mouse ergonomico blanco sobre fondo oscuro",
        url: "https://pd.w.org/2026/03/75569cb51b313f050.51943250-2048x1441.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/75569cb51b/",
        creatorName: "nathaliepoveda",
        creatorUrl: "https://wordpress.org/photos/author/nathaliepoveda/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1441
      }
    },
    {
      id: "prod-pulse-cast-mic",
      categoriaId: "cat-audio",
      nombre: "Microfono Pulso",
      descripcion:
        "Microfono dinamico con presencia clara para llamadas, grabaciones de voz y contenido rapido sin complicar la cadena de audio.",
      precio: 209900,
      etiqueta: "Voz nitida",
      stock: 0,
      imagen: {
        alt: "Microfono dinamico en primer plano",
        url: "https://pd.w.org/2024/02/22965c09f88334f67.08709411-2048x1365.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/22965c09f8/",
        creatorName: "vatoyiit",
        creatorUrl: "https://vato.yt/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-atelier-desk-lamp",
      categoriaId: "cat-escritorio",
      nombre: "Lampara de Taller",
      descripcion:
        "Lampara de escritorio para rincones de lectura, sketchbooks y trabajo profundo, con presencia decorativa y una luz amable para cerrar el dia.",
      precio: 179900,
      etiqueta: "Luz con caracter",
      stock: 0,
      variantes: [
        { id: "var-atelier-bronce", nombre: "Acabado", valor: "Bronce", stock: 4 },
        { id: "var-atelier-arena", nombre: "Acabado", valor: "Arena", stock: 2 },
        { id: "var-atelier-obsidiana", nombre: "Acabado", valor: "Obsidiana", stock: 0 }
      ],
      imagen: {
        alt: "Escritorio creativo con lampara y plantas",
        url: "https://pd.w.org/2026/01/75969730cdb02fe15.61443854-1152x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/75969730cd/",
        creatorName: "rashika76",
        creatorUrl: "https://wordpress.org/photos/author/rashika76/",
        licenseLabel: "CC0 1.0",
        width: 1152,
        height: 2048
      }
    },
    {
      id: "prod-atlas-task-chair",
      categoriaId: "cat-escritorio",
      nombre: "Silla Atlas",
      descripcion:
        "Silla de trabajo con respaldo alto, base estable y soporte pensado para alternar entre escritura, reuniones y horas de monitor sin perder postura.",
      precio: 599900,
      etiqueta: "Setup comodo",
      stock: 0,
      variantes: [
        { id: "var-atlas-gris", nombre: "Color", valor: "Gris Humo", stock: 4 },
        { id: "var-atlas-salvia", nombre: "Color", valor: "Salvia", stock: 1 },
        { id: "var-atlas-negro", nombre: "Color", valor: "Negro", stock: 0 }
      ],
      imagen: {
        alt: "Home office con silla, escritorio y ventana grande",
        url: "https://pd.w.org/2024/06/189666a0acc338ce0.02428948-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/189666a0ac/",
        creatorName: "david wolfpaw",
        creatorUrl: "https://david.garden",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-noir-pages-notebook",
      categoriaId: "cat-escritorio",
      nombre: "Cuaderno Nocturno",
      descripcion:
        "Cuaderno de tapa dura para ideas, planeacion y notas largas, con formato limpio que funciona igual de bien en oficina, clase o mesa de noche.",
      precio: 55900,
      etiqueta: "Escritura sobria",
      stock: 24,
      imagen: {
        alt: "Pila de cuadernos negros sobre una mesa",
        url: "https://pd.w.org/2022/12/888639c77c8a0b281.91486273-2048x1365.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/888639c77c/",
        creatorName: "Courtney Robertson",
        creatorUrl: "https://courtneyr.dev",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-linea-fine-pen-set",
      categoriaId: "cat-escritorio",
      nombre: "Set de Boligrafos Finos",
      descripcion:
        "Set de boligrafos de trazo fino para escribir con limpieza, firmar con presencia y mantener un escritorio que siempre se siente en orden.",
      precio: 39900,
      etiqueta: "Trazo limpio",
      stock: 18,
      imagen: {
        alt: "Boligrafos sobre hoja rayada",
        url: "https://pd.w.org/2024/04/1556621057a869b44.91210437-2048x1425.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/1556621057/",
        creatorName: "Sam Alderson",
        creatorUrl: "https://samalderson.co.uk",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1425
      }
    },
    {
      id: "prod-heritage-view-camera",
      categoriaId: "cat-escritorio",
      nombre: "Camara Patrimonial",
      descripcion:
        "Camara de coleccion con estetica clasica para estudio, shelf styling y amantes de los objetos con historia visual y caracter propio.",
      precio: 689900,
      etiqueta: "Objeto iconico",
      stock: 4,
      imagen: {
        alt: "Camara de gran formato en madera y bronce",
        url: "https://pd.w.org/2024/06/911665fabbaeff940.72761161-2048x1361.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/911665fabb/",
        creatorName: "Nilo Velez",
        creatorUrl: "https://www.nilovelez.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1361
      }
    },
    {
      id: "prod-barrio-move-backpack",
      categoriaId: "cat-viaje",
      nombre: "Mochila Barrio",
      descripcion:
        "Mochila urbana con organizacion clara, espacio para laptop y volumen suficiente para una jornada de estudio, trabajo o trayecto extendido.",
      precio: 279900,
      etiqueta: "Ciudad activa",
      stock: 0,
      variantes: [
        { id: "var-barrio-grafito", nombre: "Color", valor: "Grafito", stock: 5 },
        { id: "var-barrio-terracota", nombre: "Color", valor: "Terracota", stock: 2 },
        { id: "var-barrio-musgo", nombre: "Color", valor: "Musgo", stock: 1 }
      ],
      imagen: {
        alt: "Persona caminando con mochila en la ciudad",
        url: "https://pd.w.org/2025/01/7846785910d198d05.07621246-2048x1365.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/7846785910/",
        creatorName: "Nilo Velez",
        creatorUrl: "https://www.nilovelez.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-relic-voyage-suitcase",
      categoriaId: "cat-viaje",
      nombre: "Maleta de Viaje Clasica",
      descripcion:
        "Maleta de inspiracion vintage con presencia decorativa, correas visibles y una silueta que funciona tanto para viaje corto como para interiorismo.",
      precio: 649900,
      etiqueta: "Vintage travel",
      stock: 5,
      imagen: {
        alt: "Maleta vintage de cuero con objetos en su interior",
        url: "https://pd.w.org/2023/10/641653a0360f09af4.57260448-2048x1540.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/641653a036/",
        creatorName: "Javier Casares",
        creatorUrl: "https://www.javiercasares.com/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1540
      }
    },
    {
      id: "prod-ridge-bottle",
      categoriaId: "cat-viaje",
      nombre: "Botella Cresta",
      descripcion:
        "Botella reutilizable con presencia sobria y cuerpo firme para acompanar escritorio, mochila o mesita de noche sin romper la estetica del espacio.",
      precio: 99900,
      etiqueta: "Rutina portable",
      stock: 0,
      variantes: [
        { id: "var-ridge-negro", nombre: "Color", valor: "Negro", stock: 8 },
        { id: "var-ridge-bosque", nombre: "Color", valor: "Bosque", stock: 3 },
        { id: "var-ridge-humo", nombre: "Color", valor: "Humo", stock: 0 }
      ],
      imagen: {
        alt: "Botella negra junto a ventana con fondo verde",
        url: "https://pd.w.org/2023/11/7486552f9cff3c263.21671816-1152x2048.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/7486552f9c/",
        creatorName: "PRABIN M",
        creatorUrl: "https://wordpress.org/photos/author/prabinm/",
        licenseLabel: "CC0 1.0",
        width: 1152,
        height: 2048
      }
    },
    {
      id: "prod-storm-fold-umbrella",
      categoriaId: "cat-viaje",
      nombre: "Sombrilla Plegable Tormenta",
      descripcion:
        "Sombrilla plegable con varillas firmes y perfil limpio para lluvia inesperada, trayectos a pie y dias de ciudad con clima cambiante.",
      precio: 89900,
      etiqueta: "Lluvia elegante",
      stock: 9,
      imagen: {
        alt: "Sombrilla negra vista desde abajo",
        url: "https://pd.w.org/2025/09/42568ca7f8d980957.45371159-1536x2048.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/42568ca7f8/",
        creatorName: "Faisal Ahammad",
        creatorUrl: "https://faisalahammad.com",
        licenseLabel: "CC0 1.0",
        width: 1536,
        height: 2048
      }
    },
    {
      id: "prod-coast-shell-hat",
      categoriaId: "cat-viaje",
      nombre: "Sombrero Costa Marina",
      descripcion:
        "Sombrero de ala ancha para sol suave y escapadas de fin de semana, con una vibra relajada que eleva cualquier look ligero.",
      precio: 129900,
      etiqueta: "Sol y paseo",
      stock: 0,
      variantes: [
        { id: "var-coast-sm", nombre: "Talla", valor: "S/M", stock: 4 },
        { id: "var-coast-xl", nombre: "Talla", valor: "L/XL", stock: 2 }
      ],
      imagen: {
        alt: "Sombrero de paja con conchas sobre mesa de madera",
        url: "https://pd.w.org/2026/03/63069be9cb14fd248.41016627-2048x1151.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/63069be9cb/",
        creatorName: "Mutebi Ivan Junior",
        creatorUrl: "http://naturespulsephotography.com/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1151
      }
    },
    {
      id: "prod-eclipse-mug",
      categoriaId: "cat-cocina",
      nombre: "Taza Eclipse",
      descripcion:
        "Taza de perfil minimalista para cafe filtrado, chai o chocolate, con un acabado oscuro que luce bien incluso cuando no esta en uso.",
      precio: 69900,
      etiqueta: "Pausa limpia",
      stock: 0,
      variantes: [
        { id: "var-eclipse-negro", nombre: "Color", valor: "Negro", stock: 6 },
        { id: "var-eclipse-crema", nombre: "Color", valor: "Crema", stock: 3 },
        { id: "var-eclipse-terracota", nombre: "Color", valor: "Terracota", stock: 0 }
      ],
      imagen: {
        alt: "Taza negra sobre mesa blanca",
        url: "https://pd.w.org/2023/12/557658e9438cd8723.99807826-2048x1536.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/557658e943/",
        creatorName: "Bhuwan Bdr. Rokaha",
        creatorUrl: "https://www.eaglevisionit.com/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-scarlet-teapot",
      categoriaId: "cat-cocina",
      nombre: "Tetera Escarlata",
      descripcion:
        "Tetera decorativa con silueta escultural, ideal para servir mezclas aromaticas y sumar un punto de color profundo a la mesa.",
      precio: 149900,
      etiqueta: "Mesa con acento",
      stock: 4,
      imagen: {
        alt: "Tetera roja decorativa sobre pedestal",
        url: "https://pd.w.org/2025/12/266693a6957af3055.43244447-1152x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/266693a695/",
        creatorName: "Yam B Chhetri",
        creatorUrl: "https://www.webexpertsnepal.com/",
        licenseLabel: "CC0 1.0",
        width: 1152,
        height: 2048
      }
    },
    {
      id: "prod-copper-hearth-kettle",
      categoriaId: "cat-cocina",
      nombre: "Hervidor de Cobre",
      descripcion:
        "Hervidor de inspiracion artesanal con presencia calida, pensado para quienes disfrutan el ritual de preparar agua y bajar el ritmo.",
      precio: 169900,
      etiqueta: "Ritual diario",
      stock: 7,
      imagen: {
        alt: "Tetera de cobre bajo luz solar",
        url: "https://pd.w.org/2025/08/70168964b3d34b7a1.60146632-1365x2048.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/70168964b3/",
        creatorName: "Bigul Malayi",
        creatorUrl: "https://wpml.org/",
        licenseLabel: "CC0 1.0",
        width: 1365,
        height: 2048
      }
    },
    {
      id: "prod-prep-oak-board",
      categoriaId: "cat-cocina",
      nombre: "Tabla de Roble",
      descripcion:
        "Tabla de preparacion pensada para vegetales, frutas y servicio casual, con superficie amplia y una estetica natural que queda bien a la vista.",
      precio: 79900,
      etiqueta: "Prep bonito",
      stock: 10,
      imagen: {
        alt: "Tabla de cortar con bok choy listo para picar",
        url: "https://pd.w.org/2022/05/986295620e4076a1.55108241-1822x2048.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/986295620e/",
        creatorName: "Josh Pollock",
        creatorUrl: "https://JoshPress.net",
        licenseLabel: "CC0 1.0",
        width: 1822,
        height: 2048
      }
    },
    {
      id: "prod-alder-chef-knife",
      categoriaId: "cat-cocina",
      nombre: "Cuchillo de Chef Aliso",
      descripcion:
        "Cuchillo de cocina de hoja amplia para cortes diarios, mise en place rapida y una sensacion de control que hace mas agradable cocinar.",
      precio: 189900,
      etiqueta: "Corte seguro",
      stock: 8,
      imagen: {
        alt: "Cuchillo de cocina sobre tabla de cortar",
        url: "https://pd.w.org/2025/02/42267aba73adbef75.06402815-2048x1365.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/42267aba73/",
        creatorName: "Roberto Vazquez",
        creatorUrl: "https://robertovazquez.es",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-clove-evening-candle",
      categoriaId: "cat-hogar",
      nombre: "Vela Noche de Clavo",
      descripcion:
        "Vela aromatica para bajar la velocidad al final del dia, con una mezcla especiada y envolvente que se siente calida sin ser pesada.",
      precio: 74900,
      etiqueta: "Aroma de hogar",
      stock: 0,
      variantes: [
        { id: "var-clove-pumpkin", nombre: "Aroma", valor: "Pumpkin Clove", stock: 5 },
        { id: "var-clove-cedar", nombre: "Aroma", valor: "Cedar Smoke", stock: 2 },
        { id: "var-clove-linen", nombre: "Aroma", valor: "Linen Air", stock: 0 }
      ],
      imagen: {
        alt: "Velas aromaticas pumpkin clove",
        url: "https://pd.w.org/2022/12/244638a458c8a38d6.21733957-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/244638a458/",
        creatorName: "Topher",
        creatorUrl: "http://topher.how",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-spiral-bloom-pot",
      categoriaId: "cat-hogar",
      nombre: "Maceta Flor Espiral",
      descripcion:
        "Maceta decorativa con patron grafico para interiores verdes, ideal para sumar contraste visual a estantes, mesas laterales y ventanas.",
      precio: 89900,
      etiqueta: "Verde interior",
      stock: 11,
      imagen: {
        alt: "Maceta decorativa con patron en espiral y hojas verdes",
        url: "https://pd.w.org/2025/09/24268c2979a77bee1.30656683-1536x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/24268c2979/",
        creatorName: "Manjil Aryal",
        creatorUrl: "https://manjil0809.github.io/Portfolio/",
        licenseLabel: "CC0 1.0",
        width: 1536,
        height: 2048
      }
    },
    {
      id: "prod-prism-blanket",
      categoriaId: "cat-hogar",
      nombre: "Manta Prisma",
      descripcion:
        "Manta ligera para cama o sofa, pensada para dar textura suave y una sensacion de calma visual en dormitorios y rincones de descanso.",
      precio: 159900,
      etiqueta: "Textura suave",
      stock: 7,
      imagen: {
        alt: "Reflejo de arcoiris sobre manta blanca en una cama",
        url: "https://pd.w.org/2024/07/898668568e0524b25.12959297-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/898668568e/",
        creatorName: "coralpress",
        creatorUrl: "https://wordpress.org/photos/author/coralpress/",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-duo-form-vase",
      categoriaId: "cat-hogar",
      nombre: "Jarron Doble Forma",
      descripcion:
        "Set visual de jarrones ceramicos con acabados neutros, ideal para flores secas, ramas o para dejar la repisa respirar con forma y volumen.",
      precio: 139900,
      etiqueta: "Ceramica serena",
      stock: 6,
      imagen: {
        alt: "Dos jarrones de ceramica sobre superficie de madera",
        url: "https://pd.w.org/2025/05/88568303b61acc051.95378705-1536x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/88568303b6/",
        creatorName: "Yam B Chhetri",
        creatorUrl: "https://www.webexpertsnepal.com/",
        licenseLabel: "CC0 1.0",
        width: 1536,
        height: 2048
      }
    },
    {
      id: "prod-pure-pump-dispenser",
      categoriaId: "cat-hogar",
      nombre: "Dispensador Puro",
      descripcion:
        "Dispensador para jabon liquido con silueta limpia y facil recarga, pensado para banos o cocinas donde los pequenos detalles si importan.",
      precio: 69900,
      etiqueta: "Orden visual",
      stock: 9,
      imagen: {
        alt: "Dispensador de jabon blanco fotografiado de frente",
        url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Soap_dispenser_2017_C1.jpg",
        sourceName: "Wikimedia Commons",
        sourcePageUrl: "https://commons.wikimedia.org/w/index.php?curid=64020587",
        creatorName: "Fructibus",
        creatorUrl: "https://commons.wikimedia.org/wiki/User:Fructibus",
        licenseLabel: "CC0 1.0",
        width: 3456,
        height: 3456
      }
    },
    {
      id: "prod-solis-frame",
      categoriaId: "cat-estilo",
      nombre: "Gafas de Sol Doradas",
      descripcion:
        "Gafas de sol con montura dorada y lente oscura para elevar looks basicos con una silueta limpia que funciona bien en ciudad o vacaciones.",
      precio: 129900,
      etiqueta: "Look definido",
      stock: 6,
      imagen: {
        alt: "Gafas de sol con montura dorada",
        url: "https://pd.w.org/2025/11/483690f23054bcc15.65923144-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/483690f230/",
        creatorName: "Mehraz Morshed",
        creatorUrl: "https://mehrazmorshed.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-orbit-dial-watch",
      categoriaId: "cat-estilo",
      nombre: "Reloj Orbita",
      descripcion:
        "Reloj inteligente con presencia discreta para acompanar agenda, actividad diaria y recordatorios sin verse demasiado tecnico.",
      precio: 319900,
      etiqueta: "Tiempo al centro",
      stock: 4,
      imagen: {
        alt: "Reloj inteligente visto de cerca",
        url: "https://pd.w.org/2023/11/650654910c407fd19.34684292-1365x2048.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/650654910c/",
        creatorName: "Sharankrishna VP",
        creatorUrl: "https://wordpress.org/photos/author/sharankrishna/",
        licenseLabel: "CC0 1.0",
        width: 1365,
        height: 2048
      }
    },
    {
      id: "prod-slate-fold-wallet",
      categoriaId: "cat-estilo",
      nombre: "Billetera Plegable",
      descripcion:
        "Billetera compacta con perfil sobrio para tarjetas esenciales, billetes doblados y bolsillo limpio cuando quieres salir ligero.",
      precio: 149900,
      etiqueta: "Carry ligero",
      stock: 0,
      variantes: [
        { id: "var-slate-negro", nombre: "Color", valor: "Negro", stock: 5 },
        { id: "var-slate-miel", nombre: "Color", valor: "Miel", stock: 2 },
        { id: "var-slate-cobalto", nombre: "Color", valor: "Cobalto", stock: 0 }
      ],
      imagen: {
        alt: "Billetera negra y objetos cotidianos sobre mesa de madera",
        url: "https://pd.w.org/2025/10/14568e4010ec40720.30829568-2048x1536.jpg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/14568e4010/",
        creatorName: "Nur Nobi",
        creatorUrl: "http://needsplugin.com",
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1536
      }
    },
    {
      id: "prod-metro-step-sneakers",
      categoriaId: "cat-estilo",
      nombre: "Tenis Paso Urbano",
      descripcion:
        "Sneakers de perfil urbano para dias largos, trayectos caminados y looks sencillos que necesitan una base comoda con presencia.",
      precio: 289900,
      etiqueta: "Paso comodo",
      stock: 0,
      variantes: [
        { id: "var-metro-38", nombre: "Talla", valor: "38", stock: 3 },
        { id: "var-metro-40", nombre: "Talla", valor: "40", stock: 2 },
        { id: "var-metro-42", nombre: "Talla", valor: "42", stock: 0 }
      ],
      imagen: {
        alt: "Persona sentada con sneakers negros y medias estampadas",
        url: "https://pd.w.org/2025/01/4396794d5997c4083.55077281-1536x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/4396794d59/",
        creatorName: "Yam B Chhetri",
        creatorUrl: "https://www.webexpertsnepal.com/",
        licenseLabel: "CC0 1.0",
        width: 1536,
        height: 2048
      }
    },
    {
      id: "prod-mono-layer-hoodie",
      categoriaId: "cat-estilo",
      nombre: "Buzo de Capa Unica",
      descripcion:
        "Hoodie de silueta relajada para capas ligeras, dias frescos y looks casuales que necesitan una prenda comoda sin perder forma.",
      precio: 219900,
      etiqueta: "Layer esencial",
      stock: 0,
      variantes: [
        { id: "var-mono-m", nombre: "Talla", valor: "M", stock: 4 },
        { id: "var-mono-l", nombre: "Talla", valor: "L", stock: 3 },
        { id: "var-mono-xl", nombre: "Talla", valor: "XL", stock: 0 }
      ],
      imagen: {
        alt: "Hombre usando hoodie oscuro",
        url: "https://pd.w.org/2024/02/83465bb8b29634fb2.56218161-1536x2048.jpeg",
        sourceName: "WordPress Photo Directory",
        sourcePageUrl: "https://wordpress.org/photos/photo/83465bb8b2/",
        creatorName: "Midhun P",
        creatorUrl: "https://wordpress.org/photos/author/midhun0928/",
        licenseLabel: "CC0 1.0",
        width: 1536,
        height: 2048
      }
    },
    {
      id: "prod-monitor-led-24",
      categoriaId: "cat-escritorio",
      nombre: "Monitor LED 24 pulgadas Full HD",
      descripcion:
        "Monitor con resolucion Full HD, panel IPS y bordes delgados, ideal para trabajo, estudio o entretenimiento.",
      precio: 599900,
      etiqueta: "Productividad",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Monitor moderno sobre escritorio",
        url: "https://images.unsplash.com/photo-1621637937627-fa293f158103?q=80&w=1344&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1621637937627-fa293f158103?q=80&w=1344&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Boicu Andrei",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-cargador-multiusb",
      categoriaId: "cat-audio",
      nombre: "Cargador Multi USB 4 Puertos",
      descripcion:
        "Cargador compacto con multiples salidas USB para cargar varios dispositivos simultaneamente con proteccion inteligente.",
      precio: 69900,
      etiqueta: "Utilidad",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Cargador USB multiple",
        url: "https://images.unsplash.com/photo-1616578781575-4e5617e69592?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1616578781575-4e5617e69592?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D/",
        creatorName: "Lasse Jnesen",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-cafetera-goteo",
      categoriaId: "cat-cocina",
      nombre: "Cafetera de Goteo 12 Tazas",
      descripcion:
        "Cafetera electrica con filtro reutilizable y sistema antigoteo, ideal para preparar grandes cantidades de cafe.",
      precio: 189900,
      etiqueta: "Cafe",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Cafetera preparando cafe",
        url: "https://images.unsplash.com/photo-1599861495616-42f603e7b25a?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1599861495616-42f603e7b25a?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Kevin Canlas",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-lonchera-termica",
      categoriaId: "cat-viaje",
      nombre: "Lonchera Termica Portatil",
      descripcion:
        "Bolsa termica con aislamiento interior que mantiene alimentos frescos o calientes durante varias horas.",
      precio: 54900,
      etiqueta: "Práctico",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Bolsa termica para alimentos",
        url: "https://images.unsplash.com/photo-1642705625519-ac6534e6c010?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1642705625519-ac6534e6c010?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D/",
        creatorName: "Sandra Harris",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-cojin-decorativo",
      categoriaId: "cat-hogar",
      nombre: "Cojin Decorativo Textil",
      descripcion:
        "Cojin suave con funda removible y diseño moderno, perfecto para salas y habitaciones.",
      precio: 44900,
      etiqueta: "Decor",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Cojin sobre sofa",
        url: "https://plus.unsplash.com/premium_photo-1763466939922-97046d7eb3f8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1763466939922-97046d7eb3f8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Karolina Graboska",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-tenis-casuales",
      categoriaId: "cat-estilo",
      nombre: "Tenis Casuales Urbanos",
      descripcion:
        "Zapatillas ligeras con suela flexible, ideales para uso diario y caminatas urbanas.",
      precio: 199900,
      etiqueta: "Urbano",
      stock: 0,
      variantes: [
        { id: "var-tenis-42", nombre: "Talla", valor: "42", stock: 2 },
        { id: "var-tenis-41", nombre: "Talla", valor: "41", stock: 3 }
      ],
      imagen: {
        alt: "Tenis blancos casuales",
        url: "https://images.unsplash.com/photo-1771049873881-45b23a2e9847?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1771049873881-45b23a2e9847?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Fujiphilm",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-audifonos-gamer",
      categoriaId: "cat-audio",
      nombre: "Audifonos Gamer con Microfono",
      descripcion:
        "Audifonos over-ear con sonido envolvente, microfono ajustable y almohadillas acolchadas.",
      precio: 159900,
      etiqueta: "Gaming",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Audifonos gamer",
        url: "https://images.unsplash.com/photo-1610041321327-b794c052db27?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1610041321327-b794c052db27?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Fausto Sandoval",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    },
    {
      id: "prod-mesa-plegable",
      categoriaId: "cat-hogar",
      nombre: "Mesa Plegable Multifuncional",
      descripcion:
        "Mesa ligera y resistente, facil de almacenar y perfecta para espacios pequeños o uso temporal.",
      precio: 139900,
      etiqueta: "Funcional",
      stock: 0,
      variantes: [],
      imagen: {
        alt: "Mesa plegable",
        url: "https://images.unsplash.com/photo-1678690832886-046d6848422c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        sourceName: "Unsplash",
        sourcePageUrl: "https://images.unsplash.com/photo-1678690832886-046d6848422c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        creatorName: "Carriza Maiquez",
        creatorUrl: null,
        licenseLabel: "CC0 1.0",
        width: 2048,
        height: 1365
      }
    }
  ];

  const productosPorCategoria = new Map<string, Producto[]>();

  for (const categoria of categoriasSeed) {
    productosPorCategoria.set(categoria.id, []);
  }

  const catalogoMetadata = new Map<
    string,
    Omit<CatalogoEntry, "producto" | "categoria">
  >();

  for (const productoSeed of productosSeed) {
    const producto = crearProducto(productoSeed);
    const productosCategoria = productosPorCategoria.get(productoSeed.categoriaId);

    if (!productosCategoria) {
      throw new Error(
        `La categoria ${productoSeed.categoriaId} no existe para ${productoSeed.id}.`
      );
    }

    productosCategoria.push(producto);
    catalogoMetadata.set(producto.id, {
      imagenUrl: productoSeed.imagen.url,
      imagenAlt: productoSeed.imagen.alt,
      etiqueta: productoSeed.etiqueta,
      imagenMeta: crearImagenMeta(productoSeed.imagen)
    });
  }

  const categorias = categoriasSeed.map(
    (categoriaSeed) =>
      new Categoria(
        categoriaSeed.nombre,
        categoriaSeed.descripcion,
        productosPorCategoria.get(categoriaSeed.id) ?? [],
        categoriaSeed.id
      )
  );

  const catalogo = categorias.flatMap((categoria) =>
    categoria.obtenerProductos().map((producto) => {
      const extra = catalogoMetadata.get(producto.id);

      if (!extra) {
        throw new Error(`No existe metadata para el producto ${producto.id}.`);
      }

      return {
        producto,
        categoria,
        ...extra
      };
    })
  );

  return {
    categorias,
    catalogo
  };
}

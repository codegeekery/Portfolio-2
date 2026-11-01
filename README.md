# Horizonte

Landing page de portafolio para **Horizonte**, un laboratorio ficticio de análisis de suelo que envía kits de muestreo a fincas pequeñas y medianas en México.

Sitio estático hecho con [Astro](https://astro.build), publicado en GitHub Pages: https://codegeekery.github.io/Portfolio-2/

## Desarrollo

```sh
npm install
npm run dev      # servidor local
npm run build    # sitio estático en dist/
```

## La figura del hero

La Fig. 1 (una sonda que toma un núcleo de un monolito de suelo) es un SVG isométrico interactivo generado con el kit de [Anatomy](https://github.com/wheresryan22/anatomy) (MIT), copiado en `figure/kit/`.

- `figure/build.mjs` construye la figura y escribe `src/generated/`. Se ejecuta solo antes de `dev` y `build`, o con `npm run figure`.
- `npm run figure:preview` genera `figure/preview.html` para revisarla aislada.
- Las profundidades de los horizontes vienen de `src/data/site.ts`, igual que el resto del contenido.

## Publicación

Cada push a `main` construye y publica el sitio con `.github/workflows/deploy.yml`.

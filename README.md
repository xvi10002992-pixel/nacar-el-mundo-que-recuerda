# NÁCAR: El mundo que recuerda

Primer prototipo jugable en navegador. Está construido con HTML, CSS y JavaScript; no necesita Unity ni instalar programas.

## Jugar directamente

[**Abrir NÁCAR en el navegador**](https://xvi10002992-pixel.github.io/nacar-el-mundo-que-recuerda/)

El juego carga desde `index.html`, que enlaza los estilos de `styles.css` y el motor de `src/main.js`. Los archivos permanecen separados, pero GitHub Pages los sirve juntos.

## Motor gráfico sin WebGL

NÁCAR utiliza un renderizador 3D por software implementado sobre Canvas 2D. Proyecta geometría 3D en perspectiva mediante la CPU y no utiliza WebGL, WebGPU, Three.js ni shaders. Por eso puede mostrar una escena 3D básica incluso en navegadores donde las APIs gráficas de GPU están desactivadas.

Este modo es una base de compatibilidad: tiene menos detalle y rendimiento que un motor acelerado por GPU. Necesita que el navegador permita Canvas 2D.

## Publicar en GitHub Pages

1. Abre el repositorio en GitHub.
2. Entra en **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama **main** y la carpeta **/(root)**, y guarda.
5. Cuando GitHub Pages termine de publicarlo, abre la URL que aparece en esa sección.

## Controles

- **W A S D:** moverse en relación con la cámara.
- **Shift:** correr.
- **Ctrl:** agacharse.
- **Espacio:** saltar.
- **E:** interacción de prueba.
- **Ratón:** girar la cámara. Haz clic en el mundo para capturar el ratón; Esc lo libera. También puedes arrastrar con el botón izquierdo si la captura no está disponible.

## Estado actual

- Cámara en tercera persona con seguimiento suave.
- Movimiento, carrera, agacharse, salto y gravedad.
- Terreno ondulado, vegetación, rocas, montañas y ruinas.
- Personaje provisional con animación procedural básica.
- Renderizado 3D por CPU sin WebGL ni WebGPU.

## Próximos pasos

1. Sustituir el personaje provisional por el modelo riggeado de Nara.
2. Integrar animaciones de caminar, correr, agacharse, saltar y aterrizar.
3. Añadir colisiones reales, interacción y habilidades de Nara.
4. Mejorar el renderizador, materiales, vegetación y detalle ambiental.

**Importante:** esta es una primera base jugable. El aspecto geométrico del escenario y el personaje es provisional; no pretende igualar el detalle o la velocidad de un juego 3D acelerado por GPU.

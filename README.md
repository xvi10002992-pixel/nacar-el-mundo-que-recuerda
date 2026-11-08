# NÁCAR: El mundo que recuerda

Primer prototipo jugable en navegador. Está construido con HTML, CSS, JavaScript y Three.js; no necesita Unity ni instalar programas.

## Probarlo
1. Abre el repositorio en GitHub.
2. Entra en **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama **main** y la carpeta **/(root)**, y guarda.
5. Cuando GitHub Pages termine de publicarlo, abre la URL que aparece en esa sección.

Three.js se carga desde jsDelivr, por lo que la primera carga necesita conexión a Internet.

## Controles
- **W A S D:** moverse en relación con la cámara.
- **Shift:** correr.
- **Ctrl:** agacharse.
- **Espacio:** saltar.
- **E:** interacción de prueba.
- **Ratón:** girar la cámara. Haz clic en el mundo para capturar el ratón; Esc lo libera.

## Estado actual
- Cámara en tercera persona con seguimiento suave.
- Aceleración y frenado progresivos.
- Movimiento, carrera, agacharse, salto, gravedad y contacto con el terreno.
- Entorno inicial con terreno ondulado, vegetación, rocas y unas ruinas.
- Personaje provisional con animación procedural básica.

## Próximos pasos
1. Sustituir el personaje provisional por el modelo riggeado de Nara, preferiblemente en formato GLB.
2. Integrar animaciones de caminar, correr, agacharse, saltar y aterrizar.
3. Añadir colisiones reales, interacción y habilidades de Nara.
4. Mejorar materiales, iluminación, vegetación y detalle ambiental.

**Importante:** esta es una primera base jugable, no la calidad gráfica final. Las formas del personaje y del escenario son provisionales; los modelos PBR y las animaciones finales se incorporarán cuando estén listos los assets.
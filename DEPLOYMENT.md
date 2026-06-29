# Despliegue público de BugTracker

Esta carpeta contiene un prototipo estático que se puede publicar usando GitHub Pages.

## Pasos para crear un enlace público permanente

1. Crea un repositorio en GitHub.
   - Nombre sugerido: `bugtracker` o `bugtracker-estudio`.
   - Puedes hacerlo público para que el profesor lo vea sin credenciales.

2. Copia los archivos de esta carpeta al repositorio.
   - `bugtracker.html`
   - `style.css`
   - `app.jsx`
   - `README.md`
   - `PUBLIC_LINK.txt`
   - `DEPLOYMENT.md`

3. Haz commit y push al repositorio:
   - `git init`
   - `git add .`
   - `git commit -m "Primer despliegue de BugTracker"`
   - `git branch -M main`
   - `git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git`
   - `git push -u origin main`

4. Activa GitHub Pages en el repositorio:
   - Ve a `Settings` > `Pages`.
   - Selecciona la rama `main`.
   - Elige la carpeta raíz `/`.
   - Guarda los cambios.

5. Copia la URL generada por GitHub Pages.
   - Usualmente será algo como: `https://TU_USUARIO.github.io/NOMBRE_REPO/bugtracker.html`

## Uso del enlace

- Comparte la URL generada con tu profesor.
- El sitio será accesible mientras el repositorio exista y GitHub Pages esté activo.

## Nota

Desde este entorno no puedo crear el enlace público directamente, porque no hay un repositorio Git remoto configurado ni acceso a una cuenta de hosting.

Si quieres, te ayudo a configurar el repositorio y la URL paso a paso.
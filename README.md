<p align="center">
     <h1 align="center">Guía de ObraSmart</h3>
    <h3 align="center">Manual de intalación si eres un desarrollador</h6>
</p>
<br/>

# ObraSmart
**ObraSmart** es una aplicación web diseñada para la gestión eficiente de obras de construcción. Permite a los usuarios administrar presupuestos, facturas, clientes, proyectos y materiales de manera centralizada, facilitando el control y seguimiento de proyecto.

## Demo en Vivo

Puedes acceder a la aplicación desplegada en Vercel:

- [obra-smart-v2-web.vercel.app](https://obra-smart-v2-web.vercel.app)

## Tecnologías Utilizadas

- **Frontend:**
  - [Mithril.js](https://mithril.js.org/): Framework ligero de JavaScript para construir interfaces de usuario.
  - [Bootstrap 5.3.2](https://getbootstrap.com/): Framework CSS para diseño responsivo y componentes predefinidos.
  - [FontAwesome 6.0.0](https://fontawesome.com/): Biblioteca de iconos vectoriales y logotipos sociales.
  - [Google Fonts](https://fonts.google.com/): Fuentes tipográficas personalizadas para mejorar la estética.

- **Utilidades:**
  - [TurboRepo](https://turbo.build/): herramienta basada en Rust que simplifica el proceso de configuración de monorepositorios
  - [Vite](https://vite.dev/): Servidor de desarrollo local basado en TypeScript
  - [Toastify.js](https://apvarun.github.io/toastify-js/): Notificaciones tipo toast para mejorar la interacción con el usuario.
  - [html2pdf.js](https://github.com/eKoopmans/html2pdf): Generación de documentos PDF desde contenido HTML.
  - [charts.js](https://www.chartjs.org/): Biblioteca de gráficos y visualizaciones.
  - [choices.js](https://github.com/Choices-js/Choices): Biblioteca de selectores


- **Backend:**
  - [Laravel](https://laravel.com/): Framework PHP para desarrollo web.
  - [MySQL](https://www.mysql.com/): Sistema de gestión de bases de datos
  - [JWT](https://jwt.io/): Sistema de autenticación basado en tokens.
 


# Desarrollo
## 1. Clonar el repositorio

Primero debes clonar el repositorio de ObraSmart en tu ordenador local.
````bash
git clone https://github.com/SantiagoCalderon1/ObraSmart.git
cd ObraSmart
````

## 2. Instalar dependencias
En la raíz de nuestro proyecto añadimos el siguiente `packege.json`:
```json
{
  "name": "obrasmart",
  "version": "2.0.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build --cache-dir=.turbo"
  },
  "devDependencies": {
    "turbo": "2.5.3"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "packageManager": "npm@8.5.0",
  "dependencies": {
    "chart.js": "^4.4.9",
    "choices.js": "^11.1.0",
    "jspdf": "^3.0.1",
    "jspdf-autotable": "^5.0.2",
    "tabulator-tables": "^6.3.1"
  }
}
```

### Después ejecutaremos el comando `npm install` 
````bash
npm install 
````


## 4. En el repositorio git
Si nuestro proyecto está usando `git`, deberemos añadir el `.gitignore` a la raíz del proyecto con el siguiente contenido:
```bash
# dependencies
node_modules/

# production
.turbo/
.vercel/
dist/

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.dev.vars
.env

# macOS
.DS_Store

# editors
.vscode
.idea
```


## 5. Arquitectura del proyecto - Monorepositorio
Este proyecto se desarrolla en un monorepositorio, esto quiere decir que todo el código fuente se almacena en un 
sólo repositorio "APPS", se ha dividido en 2 workspace "API" y "WEB", hemos decidido usar Vite como herramienta de 
construcción para el desarrollo
```bash
OBRASMART/
  │  apps/
  │  │ API/
  │  │ ╰ El workspace de laravel 
  │  │ WEB/
  │  │ ╰ El workspace de mithril 
  │  ╰ 
  │  LICENSE
  │  package-lock.json
  │  package.json
  │  README.md
  │  gitignore
  │  turbo.json
  ╰
```

- ### Antes de cualquier arranque, lease la sección arranque del motor base de datos

- ## 5.1 Workspace API/ 
  Aquí está alojada toda la logica para el backend en el framework Laravel, con ejecutar los siguientes comando ya podemos poner en marcha el backend
  ```bash 
  php artisan migrate:fresh --seed
  php artisan serve
  ```

  Vease el un archivo env de ejemplo `.env.example` para la configuración de las variables de entorno

- ## 5.2 Workspace WEB/
  Aquí está localizada toda la logica para nuestro front en el framework Mithril, la ventaja con la que contamos es que al estar sobre una capa de vite, el proyecto se puede poner en marcha rapidamente, solo debe ejecutar los siguientes comandos para arrancar el front
  ```bash
  http-serve .  --> solo te deja ver el proyecto, sin poder interactuar con el backend

  npm run dev --> arrancar el proyecto de forma local
  ```

  Vease el un archivo env de ejemplo `.env.example` para la configuración de las variables de entorno


## 6. La carpeta dist (mithril) 
Por defecto deberemos añadir todos los elementos gráficos y públicos a la carpeta `public`, esta nos servirá de contenedor a la hora de desplegar, mientras estemos en desarrollo podemos hacer referencia a las 
images de manera relativa `./`, pero a la hora de desplegar esa referencia cambiará a forma absoluta `/`

```bash
  dist/
  │ assets/
  ╰ favicon.ico
```

## 7. La carpeta public (laravel)
Por defecto esta es la carpeta en la que laravel nos sirve todos los contenidos gráficos


```bash
  public/
  │ build/
  ╰ storage/  --> enlace relativo a la carpeta storage

  storage/
  │ app/
  │ │ private/  
  │ ╰ public/ --> donde se ubican los archivos
  │ framework/
  ╰ logs/
```

sabiendo esto, nosotros debemos poner todos los contenidos en la carpeta storage y realizar un enlace relativo a la carpeta antes mencionada, y esto se logra con 

````bash
php artisan storage:link
````

De este modo vinculamos las dos carpetas, ahora ya podremos alojar todas los archivos que usemos  en la siguiente ruta `/storage/app/public/`  y tendremos todos los contenidos accesibles desde el cliente

## 8. Arranque del motor base de datos
Para el arranque de la base de datos, se recomienda usar XAMP, en este caso en especifico se ha usado MAMP, que es un sotfware que crea un entorno de servidor en local para el desarrollo de sotfware en macOs, aunque teniendo en cuenta la facilidad con la que se puede desarrollar el backend mientras se tiene alojada la base de datos en un servicio como el que presta [Railway](https://railway.com/), se aconseja usar ese tipo de herramientas para la continuidad del desarrollo de este proyecto.

Es muy sencillo en unos simples paso puede conseguirse
  - ### 1. Te logueas con tu cuenta de GitHub
  - ### 2. Das click en Deploy a new project
  - ### 3. En la sección Databases eliges MySql
  - ### 4. Configuras las variables de entorno de laravel con las que vienen de Railway y  ya lo tendrías


 ## 9. Contribuiciones
Las contribuciones son bienvenidas en este proyecto.
- ### 1. Haz un fork del proyecto
- ### 2. Crea una nueva rama
```bash
git chekout -b feature/lo-que-quieras
```
- ### 3. Realiza tus mejoras o adaptaciones y haz un commit
````bash
git commit -m  "feature: Nueva funcionalidad"
````
- ## 4. Sube los cambios a tu fork
```bash
git push origin feature/lo-que-quieras
```
- ## 5. Abre un Pull Request
  Y ya lo tendrías hecho.



# License

Este proyecto está bajo la licencia MIT.

# Autor
Desarrollado por `Santiago Calderón` 

## Gracias por llegar hasta aquí, espero este proyecto sea de tu agrado, estoy atento a cualquier sugerencia o mejora.


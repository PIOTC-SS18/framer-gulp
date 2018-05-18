# Framer IDE Drop-in replacement

- `npm install -g gulp-cli`
- Add the following lines to your `package.json`

```json
"devDependencies": {
  "browser-sync": "^2.23.6",
  "browserify": "^14.5.0",
  "coffeeify": "^3.0.1",
  "coffeescript": "^2.0.2",
  "cz-conventional-changelog": "^2.1.0",
  "del": "^3.0.0",
  "dotenv": "^5.0.1",
  "fs": "0.0.1-security",
  "gulp": "^4.0.0",
  "gulp-babel": "^7.0.1",
  "gulp-concat": "^2.6.1",
  "gulp-hub": "^0.8.0",
  "gulp-less": "^3.4.0",
  "gulp-sourcemaps": "^2.6.1",
  "gulp-uglify": "^3.0.0",
  "gulp-wait": "0.0.2",
  "lodash": "^4.17.4",
  "vinyl-buffer": "^1.0.1",
  "vinyl-source-stream": "^2.0.0",
  "yargs": "^10.0.3"
},
```

- `npm install` to install dependencies
- make sure the gulpfile.js is in your repository
- make sure your <project-name>.framer and the name in the package.json match
- run `gulp` to start developing
- create a new folder custom-html inside your framer project
- add a new line above all script imports:

```html
<script src="vendor.js"></script>
```

- copy the `index.html` there and change the Framer Modules import to 

```html
<script src="framer.modules.js"></script>
```

## Support

- This work flow can work of a project created with the Framer IDE
- Importing Modules with `npm` works out of the box

![Admin logo](https://raw.githubusercontent.com/leongaban/github_images/master/slack-manage-icon.png "Admin logo")
================

### After cloning<br/>
------
Installs <a href="https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md">gulp</a> modules:<br/>
<code>$ npm install</code><br/>

~~Installs bower-installer to install only the required lib files:~~<br/>
Use of `bower-installer` is now deprecated, the vendor files are now minified through gulp using `gulp vendors`. That command will generate a `assets/js/libs/vendors.min.js` file.

Installs required libs from bower (<a href="https://angularjs.org/">Angular</a>, <a href="https://github.com/paulmillr/es6-shim/">es6</a>, <a href="https://lodash.com/">lodash</a> etc):<br/>
<code>$ bower install</code> Installs bower dependencies<br/>
<code>$ bower-installer</code> Copies the required files into the libs folder<br/>

###Create build<br/>
------
<code>$ V={version} gulp build</code> ie: {version} = 1.0.1<br/>
Creates deployable <a href="https://github.com/TickertTags/dashboard/tree/master/build">build</a> folder.

### Deploy
------
tickers directory<br/>
`alias d_manage_dev="fab deploy_manage_to_dev"`<br/>
`alias d_manage="fab deploy_manage"`

###Development watch setup

`webpack -d --watch`<br/>
Watches the app modules and bundles them up.

`gulp watch`<br/>
Watches and compiles the SASS into CSS & generates the templateCache from HTML files.


### API
------

##### **Search for ticker tags by substring**
GET <code>/app/api/ticker_tags?search=apple</code>

#####  **List of active ticker tags**
GET <code>/app/api/ticker_tags?ticker=AAPL&active=1</code>

##### **List of inactive ticker tags**
GET <code>/app/api/ticker_tags?ticker=AAPL&active=0</code>

##### **Update ticker tag status**
PUT <code>/app/api/ticker_tags/:id/:ticker</code>
Either
tag
active

##### **Add a ticker tag to a ticker**
POST <code>/app/api/ticker_tags/:ticker</code>
Both
term
tag

##### **Bulk add terms & tickers**
POST <code>/app/api/ticker_tags/bulk_add</code>
ticker_tags
tickers
tag

##### **List of tickers a user is managing**
GET  <code>/app/api/tickers/manage</code>
POST <code>/app/api/tickers/manage</code>
Optional
user_id
DELETE - todo

##### **List of tickers a user is watching**
GET <code>/app/api/tickers/watch_list</code>
POST - todo
DELETE - todo

##### **Blacklist list of blacklisted items**
GET <code>/app/api/tickers/blacklist</code>

##### **Add a term to the blacklist**
POST <code>/app/api/tickers/blacklist</code>
term_id

##### **Remove term from the blacklist**
DELETE <code>/app/api/tickers/blacklist/:term_id</code>

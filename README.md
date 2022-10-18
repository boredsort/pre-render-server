# pre-render-server

Is a server to pre-render websites and cache html documents, this can be used for scraping single page
apps.
    - Cache html documents
    - Screencapture
    - Alternate view cache

## How to install

Download a couchdb for database from https://hub.docker.com/_/couchdb

```sh
docker pull couchdb
```

Install the node modules
```sh
npm install
```

## How to use

 - Cache a site by sending a POST request on /run route \
Check on the utils/validator.js for the schema of the payload body

 - Get a cache by sending a POST request on /get route



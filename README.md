# EasyMyFS

MyFresnoState is the student portal where fresno state students can search and register for classes. It is powered by PeopleSoft which is slow and has one of the worst experience when searching for classes. This project is an attempt to expose an API for PeopleSoft class search and build an easy to use interface on top of it.

**Currently the interface is a primitive one which is work in progress, but in near future I plan to use [React](https://facebook.github.io/react/) to build a better interface.**

## How does it work?

The core of the project is a scrap script which makes use of [CasperJS](http://casperjs.org/) to scrap information from MyFresnoState website. The scrapped data is stored in to a MongoDB collection, which is later fetched and served as JSON API by a simple [Express](https://expressjs.com/) app. For more info, dive into code. :)

## Getting Started

Make sure you have [node.js](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) installed.


I used [Yarn](https://yarnpkg.com/) as the package manager, so you may have to install yarn as well.

	npm install -g yarn

Once you have yarn, you can install the dependenices by run this in the project directory.

	yarn install

Setup the configuration by copying the included template configuration, which has all the defaults for you to get started like, default connection URL to MongoDB etc.

	cp .env.example .env

Now run the scrap script, which will scrap MyFresnoState and store all the course information to a collection in MongoDB. This may take few minutes and you will see the logs in console as the script is running.

	yarn run scrap

Finally start the web server and visit [http://localhost:4000](http://localhost:4000)

	node server.js

## Todo

* Implement easy to use search interface.
* Add support for other subjects as well.
* Add support for more than one semester.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License
EasyMyFS is available under the MIT license. See the LICENSE file for more info.

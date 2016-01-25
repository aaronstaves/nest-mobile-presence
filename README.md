# nest-mobile-presence
sets nest value to Home/Away based on presence of mobile device(s) on the network

## Installation

```
git clone git@github.com:aaronstaves/nest-mobile-presence.git`
cd nest-mobile-presence
npm install
```

## Setup
You'll need to setup a config file with your info.  You can get your product information from your [Nest developer products page](https://developer.nest.com/products)

```
cd config
cp default.json.example default.json
```

Next edit the values in default.json with your editor of choice
* **client_id** - Your application's Product ID
* **client_secret** - Your application's Product Secret
* **ip_addresses** - an **array** of ip addresses you wish to monitor (static IP of your mobile devices)

```
vi default.json
```

### Authorization
Still haven't figured out a good way to do this.  Any suggestions are welcome!  After the first  run, you should be presented with your PIN authoraization URL:


```
node app.js
[2015-12-11 19:51:31.974] [WARN] [default] - Configuration property "access_token" is not defined
[2015-12-11 19:51:32.002] [ERROR] [default] - Configuration property "auth_code" is not defined
[2015-12-11 19:51:32.006] [ERROR] [default] - Visit https://home.nest.com/login/oauth2?client_id=<your_client_id>&state=STATE to obtain an auth_code and place it in config/default.json
```

Visit that URL and you will be presented with an 8 digit alphanumeric PIN.  Enter that pin into the default.json file you just edited
```
{
  "auth_code": "ABC1DEF2",
  "client_id": "<your_client_id>",
	"client_secret": "<your_client_secret"
}
```

Once that's entered, just run the app and everything **should** fall into place! 
```
node app.js
```

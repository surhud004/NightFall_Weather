var jsonfile = require('jsonfile');
var bodyParser = require('body-parser');
var request = require('request');
var express = require('express');
var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var port = process.env.PORT || 8080;

var defaultData = '{"coord":{"lon":-75.7,"lat":45.41},"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"base":"stations","main":{"temp":-7.29,"pressure":1011,"humidity":67,"temp_min":-8.33,"temp_max":-6},"visibility":24140,"wind":{"speed":5.7,"deg":70,"gust":8.2},"clouds":{"all":90},"dt":1575242754,"sys":{"type":1,"id":872,"country":"CA","sunrise":1575202927,"sunset":1575235309},"timezone":-18000,"id":6094817,"name":"Ottawa","cod":200}';
var wData = JSON.parse(defaultData);
var continentData = "North America";

//Read City List for IDs JSON file
var data = {};
var file = 'data/city.list.json';
jsonfile.readFile(file, function (err, obj) {
  if (err) {
  	console.error(err);
  } else {
  	data = obj;
  	console.log("Data file loaded.");
  }
});
//Read Country Codes JSON file
var countryCode = {};
var file1 = 'data/country.code.json';
jsonfile.readFile(file1, function (err, obj) {
  if (err) {
  	console.error(err);
  } else {
  	countryCode = obj;
  	console.log("Country codes loaded.");
  }
});
//Read Continent JSON file
var continent = {};
var file2 = 'data/continent.json';
jsonfile.readFile(file2, function (err, obj) {
  if (err) {
  	console.error(err);
  } else {
  	continent = obj;
  	console.log("Continents loaded.");
  }
});

//Capitalize the location input
function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' ');
}

//Get City ID from Name
function getCityIDName(obj, city, country) {
    var objects;
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
        	continue;
        } else if (obj[i].name === city) {
    		if(country === "") {
    			objects = obj[i].id;
    			break;
    		} else if(obj[i].country === country) {
    			objects = obj[i].id;
    			break;
    		}
    	}
    }
    return objects;
}

//Get CountryCode
function getCountryCode(obj, value) {
	var objects;
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
        	continue;
        } else if (obj[i].Name === value) {
            objects = obj[i].Code;
    	}
    }
    return objects;
}

//Get Continent
function getContinent(obj, value) {
	var objects;
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
        	continue;
        } else if (obj[i].Two_Letter_Country_Code === value) {
            objects = obj[i].Continent_Name;
    	}
    }
    return objects;
}

app.get("/", function(req, res){
	res.render("home", {wData: wData, continentData: continentData});
});

app.post("/", function(req, res){
	var newLocation = titleCase(req.body.location);
	var newCountry = "";
	if(req.body.country) {
		var getnewCountry = titleCase(req.body.country);
		newCountry = getCountryCode(countryCode, getnewCountry);
		continentData = getContinent(continent, newCountry);
	} else {
		continentData = "";
	}
	var cityId = getCityIDName(data, newLocation, newCountry);
	var url = "http://api.openweathermap.org/data/2.5/weather?id="+cityId+"&appid=3ff4f5e5055ff6b0cffd66d6e8809acd&units=metric";
	request(url, function(error, response, body){
		if(!error && response.statusCode == 200) {
			wData = JSON.parse(body);
			if(!continentData) {
				continentData = getContinent(continent, wData.sys.country);
			}
			res.render("home", {wData: wData, continentData: continentData});
		} else {
			res.render("notfound");
		}
	});
});

app.get("*", function(req, res){
	res.render("notfound");
});

app.listen(port, function(){
	console.log("Server started!!");
});


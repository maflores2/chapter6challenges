angular.module('App', ['ionic'])
.factory('Locations', function ($ionicPopup) {
  var Locations = {
    data: [{
      city: 'Canyon, TX, USA',
      lat: 34.9966488,
      lng: -101.9499805
    }],
    getIndex: function (item) {
      var index = -1;
      angular.forEach(Locations.data, function (location, i) {
        if (item.lat == location.lat && item.lng == location.lng) {
          index = i;
        }
      });
      return index;
    },
    toggle: function (item) {
      var index = Locations.getIndex(item);
      if (index >= 0) {
        $ionicPopup.confirm({
          title: 'Are you sure?',
          template: 'This will remove ' + Locations.data[index].city
        }).then(function (res) {
          if (res) {
            Locations.data.splice(index, 1);
          }
        });
      } else {
        Locations.data.push(item);
        $ionicPopup.alert({
          title: 'Location saved'
        });
      }
    },
    primary: function (item) {
      var index = Locations.getIndex(item);
      if (index >= 0) {
        Locations.data.splice(index, 1);
        Locations.data.splice(0, 0, item);
      } else {
        Locations.data.unshift(item);
      }
    }
  };

  return Locations;
})
.config(function ($stateProvider, $urlRouterProvider, LocationsProvider) {

  $stateProvider
    .state('search', {
      url: '/search',
      controller: 'SearchController',
      templateUrl: 'views/search/search.html'
    })
    .state('settings', {
      url: '/settings',
      controller: 'SettingsController',
      templateUrl: 'views/settings/settings.html'
    })
    .state('weather', {
      url: '/weather/:city/:lat/:lng',
      controller: 'WeatherController',
      templateUrl: 'views/weather/weather.html'
    });

  console.log(LocationsProvider.data);

  //the solution to this is interesting and requires digging around in the AngularJS documentation.
  //while at first it seems that we should just hard-code Chicago into this.
  //however, we want to actually read this value from the factory object
  //the documentation on providers at AngularJS was helpful: https://docs.angularjs.org/guide/providers
  //as was confirmed by user vilsbole's answer here: 
  //http://stackoverflow.com/questions/17485900/injecting-dependencies-in-config-modules-angularjs
  if(LocationsProvider.$get().data.length > 0){
    $urlRouterProvider.otherwise('/weather/' + 
                                 LocationsProvider.$get().data[0].city + '/' +
                                 LocationsProvider.$get().data[0].lat + '/' + 
                                 LocationsProvider.$get().data[0].lng); 
  }else{
    $urlRouterProvider.otherwise('/search'); 
  }

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})

.controller('LeftMenuController', function ($scope, Locations) {
  $scope.locations = Locations.data;
})

.filter('timezone', function () {
  return function (input, timezone) {
    if (input && timezone) {
      var time = moment.tz(input * 1000, timezone);
      return time.format('LT');
    }
    return '';
  };
})

.filter('chance', function () {
  return function (chance) {
    if (chance) {
      var value = Math.round(chance * 10);
      return value * 10;
    }
    return 0;
  };
})

.filter('icons', function () {
  var map = {
    'clear-day': 'ion-ios-sunny',
    'clear-night': 'ion-ios-moon',
    rain: 'ion-ios-rainy',
    snow: 'ion-ios-snowy',
    sleet: 'ion-ios-rainy',
    wind: 'ion-ios-flag',
    fog: 'ion-ios-cloud',
    cloudy: 'ion-ios-cloudy',
    'partly-cloudy-day': 'ion-ios-partlysunny',
    'partly-cloudy-night': 'ion-ios-cloudy-night'
  };
  return function (icon) {
    return map[icon] || '';
  }
})

.factory('Settings', function () {
  var Settings = {
    units: 'us',
    days: 8
  };
  return Settings;
});


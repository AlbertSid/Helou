/**
 * Created by iTattoo on 2015-12-12.
 */
var HaoLouApp = angular.module('HaoLouApp', ['ui.router']);
HaoLouApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('home', {
            url: '',
            templateUrl: '../views/home.html'
        })
        .state('seach', {
            url: '/seach',
            views: {
                '': {
                    templateUrl: '../views/seach.html'
                },
                'seach_t@seach': {
                    templateUrl: '../views/seach_t.html'
                },
                "seach_r@seach": {
                    templateUrl: '../views/seach_r.html'
                }
            }
        })
        .state('xzl', {
            url: '/xzl',
            templateUrl: '../views/xzl.html'
        })
        .state('details', {
            url: '/details',
            templateUrl: '../views/details.html'
        })
});

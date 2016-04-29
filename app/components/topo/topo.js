angular.module('bciDashboard')
    .component('bciTopo', {
        templateUrl: 'components/topo/topo.html',
        bindings: {
            eventName: '@'
        },
        controller: 'topoCtrl'
    });

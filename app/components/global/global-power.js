
(function () {

    angular.module('bciDashboard')
        .directive('bciGlobalPower', bciGlobalPower);

    function bciGlobalPower() {

        var timeSeries = new SmoothieChart({
            millisPerLine: 3000,
            grid: {
                fillStyle: '#333333',
                strokeStyle: 'rgba(0,0,0,0.1)',
                sharpLines: false,
                verticalSections: 8,
                borderVisible: true
            },
            labels: {
                disabled: true
            },
            maxValue: 8 * 2,
            minValue: 0
        });

        return {
            templateUrl: 'components/global-power/global-power.html',
            scope: {
                eventName: '@'
            },
            bindToController: true,
            controllerAs: '$ctrl',
            controller: function ($timeout) {

                var $ctrl = this;

                var socket = io();

                $ctrl.colors = [
                    { strokeColor: 'rgba(112,185,252,1)' },
                    { strokeColor: 'rgba(116,150,161,1)' },
                    { strokeColor: 'rgba(162,86,178,1)'  },
                    { strokeColor: 'rgba(144,132,246,1)' },
                ];

                $ctrl.channels = ['Delta','Theta','Alpha','Beta'];

                // Construct time series array with 8 lines
                var lines = Array(4).fill().map(function () {
                    return new TimeSeries();
                });

                lines.forEach(function (line, index) {
                    timeSeries.addTimeSeries(line, { strokeStyle: $ctrl.colors[index].strokeColor });
                });

                socket.on($ctrl.eventName, function (data) {

                    $timeout(function () {
                      console.log(data)
                        // $ctrl.amplitudes = data.amplitudes;
                        // $ctrl.timeline = data.timeline;
                    });

                    lines.forEach(function (line, index) {
                        data.data[index].forEach(function (amplitude) {
                            line.append(new Date().getTime(), amplitude);
                        });
                    });

                });

                $ctrl.$onDestroy = function () {
                    socket.removeListener($ctrl.eventName);
                };

            },
            link: function (scope, element) {
                // 200 = 50 samples * 4 milliseconds (sample rate)
                timeSeries.streamTo(element[0].querySelector('canvas'), 40);
            }
        }
    }

})();

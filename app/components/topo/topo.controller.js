angular.module('bciDashboard')
    .controller('topoCtrl', function ($timeout) {

        var $ctrl = this;

        var socket = io();

        var topoBitmap;
        var topo;
        var topoGrid;
        var topoSprite;
        var colorData;
        var blocksInfo = {
            width: 20,
            height: 20,
            count: {
                row: 11,
                col: 11
            },
            offset: {
                top: 5,
                left: 5
            },
            zoom: 20
        };

        $ctrl.getClass = function(index){
            return 'topoplot-u' + index
        };

        var getColor = function(pixel,grid){
            var min = Math.min.apply(Math,grid);
            var max = Math.max.apply(Math,grid);
            var f = chroma.scale('Spectral').domain([min,max]);
            return f(pixel)
        };


        socket.on($ctrl.eventName, function (data) {

            //console.log(data.data)
            colorData = data.data.map(function(pixel) {
                return getColor(pixel,data.data);
            });
            //console.log(colorGrid)






            //$timeout(function () {
            //    $ctrl.grid = data.data;
            //
            //});
        });

        $ctrl.$onDestroy = function () {
            socket.removeListener($ctrl.eventName);
        };



        ////////////////////////////////////////////////
        // PHASER STUFF ////////////////////////////////
        ////////////////////////////////////////////////

        var plot;

        // Create
        plot = new Phaser.Game(480, 480, Phaser.AUTO, 'topoPlot', {
            preload: preload, create: create, update: update
        });

        function preload() {
            plot.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
            plot.scale.pageAlignHorizontally = true;
            plot.scale.pageAlignVertically = true;
            plot.stage.backgroundColor = '#eee';
            //util.load.image('electrode', 'components/impedance/img/electrode.png');
            //util.load.image('electrodeOutline', 'components/impedance/img/electrodeOutline.png');
            //util.load.image('head', 'components/impedance/img/head.png');
            //util.load.image('noElectrode', 'components/impedance/img/noElectrode.png');

        }
        function create() {
            plot.physics.startSystem(Phaser.Physics.ARCADE); // Start the 2D Arcade Physics util Engine

            // create the grid
            createTopoGrid();

            //textStyle = { font: '18px Arial', fill: '#000000'};

            //initElectrodes();

            //var head = util.add.sprite((util.world.width * 0.5),(util.world.height * 0.5), 'head');
            //head.anchor.set(0.5);
            //
            //testMessageText = util.add.text(util.world.width * 0.5, 26, "Waiting for test to begin...", textStyle);
            //testMessageText.anchor.set(0.5,1.0);

        }

        //var taco = true;
        function update() {

            if (colorData) {
                //var d = new Date();
                //console.log(d.getTime());

                topo.clear();
                var index = 0;
                for (var r = 0; r < blocksInfo.count.row; r++) {
                    for (var c = 0; c < blocksInfo.count.col; c++) {
                        topo.rect(r * blocksInfo.zoom, c * blocksInfo.zoom, blocksInfo.zoom, blocksInfo.zoom, colorData[index] );
                        index++;
                    }
                }
            }

        }




        function createTopoGrid () {
            plot.create.grid('topoGrid', blocksInfo.count.col * blocksInfo.zoom, blocksInfo.count.row * blocksInfo.zoom, blocksInfo.zoom, blocksInfo.zoom, 'rgba(0,191,243,0.8)');
            topo = plot.make.bitmapData(11 * blocksInfo.zoom, 11 * blocksInfo.zoom);

            topoSprite = topo.addToWorld(blocksInfo.offset.left, blocksInfo.offset.top);
            topoGrid = plot.add.sprite(blocksInfo.offset.left,blocksInfo.offset.top, 'topoGrid');
        }





});
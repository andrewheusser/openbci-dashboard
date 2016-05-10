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
                top: 20,
                left: 20
            },
            zoom: 40
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
            plot.stage.backgroundColor = '#333333';
        }
        function create() {
            plot.physics.startSystem(Phaser.Physics.ARCADE); // Start the 2D Arcade Physics util Engine

            // create the grid
            createTopoGrid();

            //	A mask is a Graphics object
            // var mask = plot.add.graphics(100, 100);
            //
            // //	Shapes drawn to the Graphics object must be filled.
            // mask.beginFill(0xffffff);
            //
            // //	Here we'll draw a circle
            // mask.drawCircle(100, 100, 100);
            //
            // //	And apply it to the Sprite
            // topoGrid.mask = mask;

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
                topo.clear();
                var index = 0;
                for (var c = 0; c < blocksInfo.count.col; c++) {
                    for (var r = 0; r < blocksInfo.count.row; r++) {
                        topo.rect(r * blocksInfo.zoom, c * blocksInfo.zoom, blocksInfo.zoom, blocksInfo.zoom, colorData[index] );
                        index++;
                    }
                }
            }

        };

        function createTopoGrid () {
            plot.create.grid('topoGrid', blocksInfo.count.col * blocksInfo.zoom, blocksInfo.count.row * blocksInfo.zoom, blocksInfo.zoom, blocksInfo.zoom, 'rgba(255,255,255,0.0)');
            topo = plot.make.bitmapData(11 * blocksInfo.zoom, 11 * blocksInfo.zoom);
            topoSprite = topo.addToWorld(blocksInfo.offset.left, blocksInfo.offset.top);
            topoGrid = plot.add.sprite(blocksInfo.offset.left,blocksInfo.offset.top, 'topoGrid');

            // var blurX = plot.add.filter('BlurX');
            // var blurY = plot.add.filter('BlurY');
            //
            // topo.filters = [blurX, blurY];

            // mask = plot.add.graphics(150, 150);
            // mask.beginFill(0xffffff);
            // //
            // // //	Here we'll draw a circle
            // mask.drawCircle(75, 75, 400);
            // //
            // // //	And apply it to the Sprite
            // topoSprite.mask = mask;
        };

});

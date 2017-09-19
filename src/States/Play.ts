namespace AppTS {

    export class Play extends Phaser.State {

        private _mainLayer: MainLayer;
        private goRight = true;
        private cursors;
        // -------------------------------------------------------------------------
        public render() {
            
            this.game.debug.text((this.game.time.fps || '--').toString(), 10, 14, "#00ff00"); 
            this.game.debug.inputInfo(10, 28, "#00ff00");
            this.game.debug.cameraInfo(this.game.camera, 10, 110);
            //this.game.debug.spriteCoords(card, 32, 32);
            //this._mainLayer.render();
        }

        // -------------------------------------------------------------------------
        public create() {
            this.stage.backgroundColor = 0xC0C0C0;

            this.camera.bounds = null;
            this.world.setBounds(0, 0, 1920, 1200);
            // //Generator.JumpTables.setDebug(true, GoblinRun.Global);
            // Generator.JumpTables.instance;

            // // this.game.add.sprite(0, 0, Generator.JumpTables.debugBitmapData);

            // this._mainLayer = new MainLayer(this.game, this.world);
            this.game.add.sprite(200, 200, "Block");
            
            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        // -------------------------------------------------------------------------
        public update() {
            if (this.cursors.left.isDown)
            {
                this.camera.x -= 3;
            }
            else if (this.cursors.right.isDown)
            {
                this.camera.x += 3;
            }

    if (this.cursors.up.isDown)
    {

    }
    else if (this.cursors.down.isDown)
    {

    }
    
            // if (this.camera.x >= 900) { this.goRight = false; } else if (this.camera.x <= 0) {this.goRight = true;}
            // if (this.goRight) {this.camera.x += this.time.physicsElapsed * 100;} else {this.camera.x -= this.time.physicsElapsed * 100;}
            //this._mainLayer.generate(this.camera.x / Generator.Parameters.CELL_SIZE);
        }
    }
}

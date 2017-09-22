namespace Venus {

    export class Preload extends Phaser.State {

        // music decoded, ready for game
        private _ready: boolean = false;

        // -------------------------------------------------------------------------
        public preload() {
            this.game.time.advancedTiming = true;
            this.load.image("Block", "assets/Block.png");
            this.load.image('backdrop', 'assets/limbo1.jpg');
        }

        // -------------------------------------------------------------------------
        public create() {

        }

        // -------------------------------------------------------------------------
        public update() {
            // run only once
            if (this._ready === false) {
                this._ready = true;

                this.game.state.start("Play");
            }
        }
    }
}

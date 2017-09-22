namespace Venus {
    export class Ref {
        public static debug: boolean = true;
        
        public static g: Venus.G;
    }
    
    export class G extends Phaser.Game {
        private currotation: number = 0.0;
        public constructor() {
            super(Screen.cam_width, Screen.cam_height, Phaser.AUTO, "app");
            this.state.add("Boot", Boot);
            this.state.add("Preload", Preload);
            this.state.add("Play", Play);
            this.state.start("Boot");
        }
        
        movement(): void {
            this.currotation += .0001;
            this.world.rotation = this.currotation;
        }
    }
}

window.onload = function () {
    Venus.Ref.g = new Venus.G();
};

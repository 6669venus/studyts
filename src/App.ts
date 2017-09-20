namespace AppTS {
    export class App extends Phaser.Game {
        public static core: Phaser.Game;
        public static debug: boolean = false;
        public constructor() {
            super(Screen.cam_width, Screen.cam_height, Phaser.AUTO, "app");
            this.state.add("Boot", Boot);
            this.state.add("Preload", Preload);
            this.state.add("Play", Play);
            this.state.start("Boot");
        }
        public movement() {
            this.core.world.rotation = .0001;
        }
    }
}

window.onload = function () {
    AppTS.App.core = new AppTS.App();
};

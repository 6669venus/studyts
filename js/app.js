var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AppTS;
(function (AppTS) {
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
            var _this = _super.call(this, AppTS.Screen.cam_width, AppTS.Screen.cam_height, Phaser.AUTO, "app") || this;
            _this.state.add("Boot", AppTS.Boot);
            _this.state.add("Preload", AppTS.Preload);
            _this.state.add("Play", AppTS.Play);
            _this.state.start("Boot");
            return _this;
        }
        App.debug = false;
        return App;
    }(Phaser.Game));
    AppTS.App = App;
})(AppTS || (AppTS = {}));
window.onload = function () {
    AppTS.App.core = new AppTS.App();
};
var AppTS;
(function (AppTS) {
    var MainLayer = (function (_super) {
        __extends(MainLayer, _super);
        function MainLayer(game, parent) {
            var _this = _super.call(this, game, parent) || this;
            _this._lastTile = new Phaser.Point(0, 0);
            _this._piece = null;
            _this._generator = new Generator.Generator(game.rnd);
            _this._wallsPool = new Helper.Pool(Phaser.Sprite, 32, function () {
                var sprite = new Phaser.Sprite(game, 0, 0, "Block");
                game.physics.enable(sprite, Phaser.Physics.ARCADE);
                var body = sprite.body;
                body.allowGravity = false;
                body.immovable = true;
                body.moves = false;
                body.setSize(64, 64, 0, 0);
                return sprite;
            });
            _this._walls = new Phaser.Group(game, _this);
            _this._piece = _this._generator.setPiece(0, 5, 10);
            _this._state = 0;
            return _this;
        }
        MainLayer.prototype.render = function () {
            this._walls.forEachExists(function (sprite) {
                this.game.debug.body(sprite);
            }, this);
        };
        MainLayer.prototype.generate = function (leftTile) {
            this.cleanTiles(leftTile);
            var width = Math.ceil(this.game.width / Generator.Parameters.CELL_SIZE);
            while (this._lastTile.x < leftTile + width) {
                switch (this._state) {
                    case 0:
                        {
                            this._lastTile.copyFrom(this._piece.position);
                            var length_1 = this._piece.length;
                            while (length_1 > 0) {
                                this.addBlock(this._lastTile.x, this._lastTile.y);
                                if ((--length_1) > 0) {
                                    ++this._lastTile.x;
                                }
                            }
                            this._generator.destroyPiece(this._piece);
                            this._state = 1;
                            break;
                        }
                    case 1:
                        {
                            this._piece = this._generator.generate(this._lastTile);
                            this._state = 0;
                            break;
                        }
                }
            }
        };
        MainLayer.prototype.cleanTiles = function (leftTile) {
            leftTile *= Generator.Parameters.CELL_SIZE;
            for (var i = this._walls.length - 1; i >= 0; i--) {
                var wall = this._walls.getChildAt(i);
                if (wall.x - leftTile <= -64) {
                    this._walls.remove(wall);
                    wall.parent = null;
                    this._wallsPool.destroyItem(wall);
                }
            }
        };
        MainLayer.prototype.addBlock = function (x, y) {
            var sprite = this._wallsPool.createItem();
            sprite.position.set(x * 64, y * 64);
            sprite.exists = true;
            sprite.visible = true;
            if (sprite.parent === null) {
                this._walls.add(sprite);
            }
        };
        return MainLayer;
    }(Phaser.Group));
    AppTS.MainLayer = MainLayer;
})(AppTS || (AppTS = {}));
var Generator;
(function (Generator_1) {
    Generator_1.UNDEFINED = -10000;
    var Generator = (function () {
        function Generator(rnd) {
            this._lastGeneratedPiece = null;
            this._rnd = rnd;
            this._jumpTables = Generator_1.JumpTables.instance;
            this._piecesPool = new Helper.Pool(Generator_1.Piece, 16);
        }
        Generator.prototype.createPiece = function () {
            var piece = this._piecesPool.createItem();
            if (piece === null) {
                console.error("No free pieces in pool");
            }
            return piece;
        };
        Generator.prototype.destroyPiece = function (piece) {
            this._piecesPool.destroyItem(piece);
        };
        Generator.prototype.setPiece = function (x, y, length, offsetX, offsetY) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            var piece = this.createPiece();
            piece.position.set(x, y);
            piece.offset.set(offsetX, offsetY);
            piece.length = length;
            return piece;
        };
        Generator.prototype.generate = function (lastPosition) {
            var piece = this.createPiece();
            var ubound = Generator_1.Parameters.UBOUND;
            var lbound = Generator_1.Parameters.LBOUND;
            var minY = this._jumpTables.maxOffsetY();
            var maxY = lbound - ubound;
            var currentY = lastPosition.y - ubound;
            var shiftY = this._rnd.integerInRange(0, lbound - ubound);
            shiftY -= currentY;
            shiftY = Phaser.Math.clamp(shiftY, minY, maxY);
            var newY = Phaser.Math.clamp(currentY + shiftY, 0, lbound - ubound);
            piece.position.y = newY + ubound;
            piece.offset.y = piece.position.y - lastPosition.y;
            var minX = this._jumpTables.minOffsetX(piece.offset.y);
            var maxX = this._jumpTables.maxOffsetX(piece.offset.y);
            var shiftX = this._rnd.integerInRange(minX, maxX);
            piece.position.x = lastPosition.x + shiftX;
            piece.offset.x = shiftX;
            piece.length = this._rnd.integerInRange(3, 5);
            this._lastGeneratedPiece = piece;
            return piece;
        };
        return Generator;
    }());
    Generator_1.Generator = Generator;
})(Generator || (Generator = {}));
var Generator;
(function (Generator) {
    var Jump = (function () {
        function Jump() {
            this.offsetY = 0;
            this.offsetX = 0;
        }
        Jump.prototype.toString = function () {
            return "offsetX: " + this.offsetX + ", offsetY: " + this.offsetY;
        };
        return Jump;
    }());
    Generator.Jump = Jump;
})(Generator || (Generator = {}));
var Generator;
(function (Generator) {
    var JumpTables = (function () {
        function JumpTables() {
            this._jumpVelocities = [];
            this._jumpDefs = [];
            this._jumpOffsetsY = [];
            this._jumpOffsetYMax = 0;
            this._jumpOffsetXMins = {};
            this._jumpOffsetXMaxs = {};
            this.calculateJumpVelocities();
            this.calculateJumpTables();
        }
        Object.defineProperty(JumpTables, "instance", {
            get: function () {
                if (JumpTables._instance === null) {
                    JumpTables._instance = new JumpTables();
                }
                return JumpTables._instance;
            },
            enumerable: true,
            configurable: true
        });
        JumpTables.prototype.calculateJumpVelocities = function () {
            for (var i = 0; i <= Generator.Parameters.HEIGHT_STEPS; i++) {
                var height = Generator.Parameters.HEIGHT_MIN + (Generator.Parameters.HEIGHT_MAX - Generator.Parameters.HEIGHT_MIN) / Generator.Parameters.HEIGHT_STEPS * i;
                this._jumpVelocities[i] = -Math.sqrt(2 * height * Generator.Parameters.GRAVITY);
            }
        };
        Object.defineProperty(JumpTables.prototype, "minJumpVelocity", {
            get: function () {
                return this._jumpVelocities[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JumpTables.prototype, "maxJumpVelocity", {
            get: function () {
                return this._jumpVelocities[this._jumpVelocities.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        JumpTables.prototype.calculateJumpTables = function () {
            for (var height = 0; height <= Generator.Parameters.HEIGHT_STEPS; height++) {
                this._jumpDefs[height] = [];
                for (var step = 0; step < 1; step++) {
                    this.calculateJumpCurve(step, height);
                }
            }
            this.analyzeJumpTables();
        };
        JumpTables.prototype.calculateJumpCurve = function (step, jumpIndex) {
            var timeStep = 1 / 60;
            var velocity = this._jumpVelocities[jumpIndex];
            var x = step * Generator.Parameters.CELL_SIZE / Generator.Parameters.CELL_STEPS
                + Generator.Parameters.CELL_SIZE / Generator.Parameters.CELL_STEPS / 2;
            var y = 0;
            var cellY = 0;
            var prevX, prevY;
            var jumpDefs = [];
            var visitedList = {};
            var playerWidthHalf = Generator.Parameters.PLAYER_BODY_WIDTH / 2 * 0.5;
            var debugBitmap = (JumpTables._DEBUG) ? JumpTables.debugBitmapData : null;
            var yOffset = Generator.Parameters.CELL_SIZE * 4;
            while (cellY < Generator.Parameters.GRID_HEIGHT) {
                prevX = x;
                prevY = y;
                velocity += Generator.Parameters.GRAVITY * timeStep;
                y += velocity * timeStep;
                x += Generator.Parameters.VELOCITY_X * timeStep;
                if (JumpTables._DEBUG) {
                    debugBitmap.rect(x, y + yOffset, 2, 2, "#FFFFFF");
                }
                var leftCell = void 0, rightCell = void 0;
                cellY = Math.floor(y / Generator.Parameters.CELL_SIZE);
                if (velocity > 0) {
                    if (cellY > Math.floor(prevY / Generator.Parameters.CELL_SIZE)) {
                        var pixelBorderY = Math.floor(y / Generator.Parameters.CELL_SIZE) * Generator.Parameters.CELL_SIZE;
                        var pixelBorderX = prevX + (x - prevX) * (pixelBorderY - prevY) / (y - prevY);
                        leftCell = Math.floor((pixelBorderX - playerWidthHalf) / Generator.Parameters.CELL_SIZE);
                        rightCell = Math.floor((pixelBorderX + playerWidthHalf) / Generator.Parameters.CELL_SIZE);
                        for (var i = leftCell; i <= rightCell; i++) {
                            var visitedId = i + (cellY << 8);
                            if (typeof visitedList[visitedId] === "undefined") {
                                var jump = new Generator.Jump();
                                jump.offsetX = i;
                                jump.offsetY = cellY;
                                jumpDefs.push(jump);
                            }
                        }
                        if (JumpTables._DEBUG) {
                            var py = pixelBorderY + yOffset;
                            var color = "#4040FF";
                            var pxLeft = pixelBorderX - Generator.Parameters.PLAYER_BODY_WIDTH / 2;
                            var pxRight = pixelBorderX + Generator.Parameters.PLAYER_BODY_WIDTH / 2;
                            debugBitmap.line(pxLeft, py, pxRight, py, color);
                            color = "#0000FF";
                            pxLeft = pixelBorderX - playerWidthHalf;
                            pxRight = pixelBorderX + playerWidthHalf;
                            debugBitmap.line(pxLeft, py, pxRight, py, color);
                            debugBitmap.line(pxLeft, py - 3, pxLeft, py + 3, color);
                            debugBitmap.line(pxRight, py - 3, pxRight, py + 3, color);
                        }
                    }
                }
                leftCell = Math.floor((x - playerWidthHalf) / Generator.Parameters.CELL_SIZE);
                rightCell = Math.floor((x + playerWidthHalf) / Generator.Parameters.CELL_SIZE);
                for (var i = leftCell; i <= rightCell; i++) {
                    var visitedId = i + (cellY << 8);
                    if (typeof visitedList[visitedId] === "undefined") {
                        visitedList[visitedId] = visitedId;
                    }
                }
            }
            this._jumpDefs[jumpIndex][step] = jumpDefs;
        };
        JumpTables.prototype.analyzeJumpTables = function () {
            this._jumpOffsetYMax = 0;
            for (var velocity = 0; velocity < this._jumpDefs.length; velocity++) {
                this._jumpOffsetsY[velocity] = this._jumpDefs[velocity][0][0].offsetY;
                this._jumpOffsetYMax = Math.min(this._jumpOffsetYMax, this._jumpOffsetsY[velocity]);
            }
            for (var velocity = 1; velocity < this._jumpDefs.length; velocity++) {
                var jumps = this._jumpDefs[velocity][0];
                for (var j = 0; j < jumps.length; j++) {
                    var jump = jumps[j];
                    var currentMin = this._jumpOffsetXMins[jump.offsetY];
                    this._jumpOffsetXMins[jump.offsetY] = (typeof currentMin !== "undefined") ?
                        Math.min(currentMin, jump.offsetX) : jump.offsetX;
                }
                jumps = this._jumpDefs[velocity][this._jumpDefs[velocity].length - 1];
                for (var j = 0; j < jumps.length; j++) {
                    var jump = jumps[j];
                    var currentMax = this._jumpOffsetXMaxs[jump.offsetY];
                    this._jumpOffsetXMaxs[jump.offsetY] = (typeof currentMax !== "undefined") ?
                        Math.max(currentMax, jump.offsetX) : jump.offsetX;
                }
            }
        };
        JumpTables.prototype.maxOffsetY = function (jumpIndex) {
            if (jumpIndex === void 0) { jumpIndex = -1; }
            if (jumpIndex === -1) {
                return this._jumpOffsetYMax;
            }
            else {
                return this._jumpOffsetsY[jumpIndex];
            }
        };
        JumpTables.prototype.maxOffsetX = function (offsetY) {
            var maxX = this._jumpOffsetXMaxs[offsetY];
            if (typeof maxX === "undefined") {
                console.error("max X for offset y = " + offsetY + " does not exist");
                maxX = 0;
            }
            return maxX;
        };
        JumpTables.prototype.minOffsetX = function (offsetY) {
            var minX = this._jumpOffsetXMins[offsetY];
            if (typeof minX === "undefined") {
                console.error("min X for offset y = " + offsetY + " does not exist");
                minX = 0;
            }
            return minX;
        };
        JumpTables.setDebug = function (debug, gameGlobals) {
            JumpTables._DEBUG = debug;
            JumpTables._globals = gameGlobals;
            if (debug) {
                if (typeof gameGlobals === "undefined" || gameGlobals === null) {
                    console.warn("No game globals provided - switching debug off");
                    JumpTables._DEBUG = false;
                }
                else {
                    JumpTables.createDebugBitmap();
                }
            }
        };
        Object.defineProperty(JumpTables, "debugBitmapData", {
            get: function () {
                return JumpTables._debugBmd;
            },
            enumerable: true,
            configurable: true
        });
        JumpTables.createDebugBitmap = function () {
            var global = JumpTables._globals;
            var bmd = new Phaser.BitmapData(global.game, "Grid", global.GAME_WIDTH, global.GAME_HEIGHT);
            bmd.fill(192, 192, 192);
            for (var i = 0; i < global.GAME_HEIGHT; i += Generator.Parameters.CELL_SIZE) {
                bmd.line(0, i + 0.5, global.GAME_WIDTH - 1, i + 0.5);
            }
            for (var i = 0; i < global.GAME_WIDTH; i += Generator.Parameters.CELL_SIZE) {
                bmd.line(i + 0.5, 0, i + 0.5, global.GAME_HEIGHT - 1);
                bmd.text("" + (i / Generator.Parameters.CELL_SIZE), i + 20, 20, "24px Courier", "#FFFF00");
            }
            JumpTables._debugBmd = bmd;
        };
        JumpTables._instance = null;
        JumpTables._DEBUG = false;
        return JumpTables;
    }());
    Generator.JumpTables = JumpTables;
})(Generator || (Generator = {}));
var Generator;
(function (Generator) {
    var Parameters = (function () {
        function Parameters() {
        }
        Parameters.GRID_HEIGHT = 10;
        Parameters.CELL_SIZE = 64;
        Parameters.CELL_STEPS = 4;
        Parameters.GRAVITY = 2400;
        Parameters.PLAYER_BODY_WIDTH = 30;
        Parameters.PLAYER_BODY_HEIGHT = 90;
        Parameters.HEIGHT_MIN = Parameters.CELL_SIZE * 0.75;
        Parameters.HEIGHT_MAX = Parameters.CELL_SIZE * 2.90;
        Parameters.HEIGHT_STEPS = 4;
        Parameters.VELOCITY_X = 300;
        Parameters.UBOUND = 2;
        Parameters.LBOUND = 8;
        return Parameters;
    }());
    Generator.Parameters = Parameters;
})(Generator || (Generator = {}));
var Generator;
(function (Generator) {
    var Piece = (function () {
        function Piece() {
            this.position = new Phaser.Point(0, 0);
            this.offset = new Phaser.Point(0, 0);
        }
        return Piece;
    }());
    Generator.Piece = Piece;
})(Generator || (Generator = {}));
var Helper;
(function (Helper) {
    var Pool = (function () {
        function Pool(classType, count, newFunction) {
            if (newFunction === void 0) { newFunction = null; }
            this._newFunction = null;
            this._count = 0;
            this._pool = [];
            this._canGrow = true;
            this._poolSize = 0;
            this._classType = classType;
            this._newFunction = newFunction;
            for (var i = 0; i < count; i++) {
                var item = this.newItem();
                this._pool[this._count++] = item;
            }
        }
        Pool.prototype.createItem = function () {
            if (this._count === 0) {
                return this._canGrow ? this.newItem() : null;
            }
            else {
                return this._pool[--this._count];
            }
        };
        Pool.prototype.destroyItem = function (item) {
            this._pool[this._count++] = item;
        };
        Pool.prototype.newItem = function () {
            ++this._poolSize;
            if (this._newFunction !== null) {
                return this._newFunction();
            }
            else {
                return new this._classType;
            }
        };
        Object.defineProperty(Pool.prototype, "newFunction", {
            set: function (newFunction) {
                this._newFunction = newFunction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pool.prototype, "canGrow", {
            set: function (canGrow) {
                this._canGrow = canGrow;
            },
            enumerable: true,
            configurable: true
        });
        return Pool;
    }());
    Helper.Pool = Pool;
})(Helper || (Helper = {}));
var AppTS;
(function (AppTS) {
    var Control = (function () {
        function Control() {
        }
        Control.UP = Phaser.Keyboard.UP;
        Control.DOWN = Phaser.Keyboard.DOWN;
        Control.LEFT = Phaser.Keyboard.LEFT;
        Control.RIGHT = Phaser.Keyboard.RIGHT;
        return Control;
    }());
    AppTS.Control = Control;
})(AppTS || (AppTS = {}));
var AppTS;
(function (AppTS) {
    var Screen = (function () {
        function Screen() {
        }
        Screen.world_width = 1600;
        Screen.world_height = 900;
        Screen.cam_width = 1200;
        Screen.cam_height = 600;
        return Screen;
    }());
    AppTS.Screen = Screen;
})(AppTS || (AppTS = {}));
var AppTS;
(function (AppTS) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Boot.prototype.create = function () {
            this.game.state.start("Preload");
        };
        return Boot;
    }(Phaser.State));
    AppTS.Boot = Boot;
})(AppTS || (AppTS = {}));
var AppTS;
(function (AppTS) {
    var Play = (function (_super) {
        __extends(Play, _super);
        function Play() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.goRight = true;
            return _this;
        }
        Play.prototype.render = function () {
            if (AppTS.App.debug) {
                this.game.debug.text((this.game.time.fps || '--').toString(), 10, 14, "#00ff00");
                this.game.debug.inputInfo(10, 28, "#00ff00");
                this.game.debug.cameraInfo(this.game.camera, 10, 110);
            }
        };
        Play.prototype.create = function () {
            this.stage.backgroundColor = 0xC0C0C0;
            this.world.setBounds(0, 0, AppTS.Screen.world_width, AppTS.Screen.world_height);
            this.game.add.sprite(0, -100, 'backdrop');
            this.game.add.sprite(200, 200, "Block");
            this.KeyUP = this.game.input.keyboard.addKey(AppTS.Control.UP);
            this.KeyDOWN = this.game.input.keyboard.addKey(AppTS.Control.DOWN);
            this.KeyLEFT = this.game.input.keyboard.addKey(AppTS.Control.LEFT);
            this.KeyRIGHT = this.game.input.keyboard.addKey(AppTS.Control.RIGHT);
        };
        Play.prototype.update = function () {
            if (this.KeyLEFT.isDown) {
                this.camera.x -= 3;
                this.world.rotation -= .0001;
            }
            else if (this.KeyRIGHT.isDown) {
                this.camera.x += 3;
                this.world.rotation += .0001;
            }
        };
        return Play;
    }(Phaser.State));
    AppTS.Play = Play;
})(AppTS || (AppTS = {}));
var AppTS;
(function (AppTS) {
    var Preload = (function (_super) {
        __extends(Preload, _super);
        function Preload() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._ready = false;
            return _this;
        }
        Preload.prototype.preload = function () {
            this.game.time.advancedTiming = true;
            this.load.image("Block", "assets/Block.png");
            this.load.image('backdrop', 'assets/limbo1.jpg');
        };
        Preload.prototype.create = function () {
        };
        Preload.prototype.update = function () {
            if (this._ready === false) {
                this._ready = true;
                this.game.state.start("Play");
            }
        };
        return Preload;
    }(Phaser.State));
    AppTS.Preload = Preload;
})(AppTS || (AppTS = {}));
//# sourceMappingURL=app.js.map
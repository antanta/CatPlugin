function SpriteSheet(path, frameWidth, frameHeight, frameSpeed, endFrame, framesPerRow, rowOffset, columnOffset, stretch, animationCycles, terminateCanvasAnimation) {
    var that = this;
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameSpeed = frameSpeed;
    this.endFrame = endFrame;

    this.framesPerRow = framesPerRow;
    this.rowOffset = rowOffset;
    this.columnOffset = columnOffset;
    this.stretch = stretch;
    this.animationCycles = animationCycles;
    this.terminateCanvasAnimation = terminateCanvasAnimation;

    // calculate the number of frames in a row after the image loads
    this.image.onload = function () {
        if (that.framesPerRow == null) {
            that.framesPerRow = Math.floor(that.image.width / that.frameWidth);
        }
    };
    this.image.src = path;

    var currentFrame = 0;  // the current frame to draw
    var counter = 0;       // keep track of frame rate
    var totalCycles = 0;   // keep track of the cycles

    // animation end event
    var endEvent = new CustomEvent("spriteSheetAnimationComplete", { "detail": { sender: this } });

    // Update the animation
    this.update = function () {
        // update to the next frame if it is time
        if (counter == (that.frameSpeed - 1)) {
            currentFrame = (currentFrame + 1) % that.endFrame;
        }

        if (currentFrame + 1 == that.endFrame) {
            totalCycles++;
        }

        // update the counter
        counter = (counter + 1) % that.frameSpeed;
    }

    this.draw = function (x, y) {
        // end of animation
        if (that.animationCycles > 0 && totalCycles > that.animationCycles) {
            window.cancelAnimationFrame(reqanimationreference);
            reqanimationreference = null;
            if (that.terminateCanvasAnimation) {
                //stop the canvas animation of necessary
                canvas.stop();
            }
            document.dispatchEvent(endEvent);
            return;
        }

        // clear the rect
        ctx.clearRect(x, y, this.frameWidth * this.stretch, this.frameHeight * this.stretch);

        // get the row and col of the frame
        // apply the row and column offset
        var row = this.rowOffset + Math.floor(currentFrame / this.framesPerRow);
        var col = this.columnOffset + Math.floor(currentFrame % this.framesPerRow);

        ctx.drawImage(
            this.image,
            col * this.frameWidth, row * this.frameHeight,
            this.frameWidth, this.frameHeight,
            x, y,
            this.frameWidth * this.stretch, this.frameHeight * this.stretch); //stretch or reduce the image
    };

    // animate this spritesheet only
    this.beginAnimation = function () {
        window.requestAnimationFrame(animate.bind(that));
    }

    return this;
}

function Animation(spritesheets) {
    var counter = 0;
    var that = this;

    this.isRunning = false;

    // Animate a sequence of spritesheets
    this.beginAnimation = function () {
        if (spritesheets.length > 0) {
            counter = 0;
            that.isRunning = true;
            that.startSpritesheet(spritesheets[0]);
        }
    };

    this.stopAnimation = function () {
        window.cancelAnimationFrame(reqanimationreference);
        this.isRunning = false;
    };

    // Animate a single spiresheet animation
    this.startSpritesheet = function (spritesheet) {
        document.addEventListener("spriteSheetAnimationComplete", function (e) {
            //start next spritesheet animation if any
            if (spritesheets.length > ++counter) {
                that.startSpritesheet(spritesheets[counter]);
            } else {
                that.isRunning = false;
            }
        });

        spritesheet.beginAnimation();
    }

    return this;
}

function Cat() {

}

Cat.prototype = {
    reqanimationreference: null,    // indicates the runnning animation
    runningAnim: null,                     // the current animation
    settings: {
        useCat: false,
        initialCanvasRight: "-120px",
        canvasWidth: 120,
        cavaseheight: 60,

        frameWidth: 400,
        frameHeight: 200,
        stretch: 0.8,               // 1:1 fill with the whole canvas
        spriteImagePath: 'images/cat_sprite.png'
    },
    settingKeys: {
        useCat: {
            storageKey: "catPlugin.useCat",
            type: "boolean"
        }
    },
    // spritesheets
    spritesheet1: null,
    spritesheet2: null,
    spritesheet3: null,
    spritesheet4: null,


    init: function () {
        /// <summary>Initial configuration.</summary>

        var c = document.getElementById("myCanvas");
        canvas = $(c);
        ctx = c.getContext("2d");

        var args1 = [this.settings.spriteImagePath, this.settings.frameWidth, this.settings.frameHeight, 7, 12, 1, 0, 0, this.settings.stretch, 10, true];
        var args2 = [this.settings.spriteImagePath, this.settings.frameWidth, this.settings.frameHeight, 7, 6, 1, 0, 1, this.settings.stretch, 1, false];
        var args3 = [this.settings.spriteImagePath, this.settings.frameWidth, this.settings.frameHeight, 5, 12, 1, 0, 2, this.settings.stretch, 0, false];
        var args4 = [this.settings.spriteImagePath, this.settings.frameWidth, this.settings.frameHeight, 4, 13, 1, 0, 3, this.settings.stretch, 0, false];

        // spritesheets
        this.spritesheet1 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args1);
        this.spritesheet2 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args2);
        this.spritesheet3 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args3);
        this.spritesheet4 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args4);

        // do other stuff
        this.loadSettingFromStorage();
        this.setupCanvas();
        this.addHandlersToButtons();
        this.runningAnim = new Animation([this.spritesheet1, this.spritesheet2]);// animation sequences - multiple spritesheets
    },

    loadSettingFromStorage: function () {
        /// <summary>Оverride the initial settings from the session storage.</summary>

        if (sessionStorage) {
            for (var prop in this.settingKeys) {
                if (this.settingKeys.hasOwnProperty(prop)) {
                    key = this.settingKeys[prop].storageKey;

                    var item = sessionStorage.getItem(key);
                    if (item == null) {
                        sessionStorage.setItem(key, this.settings[prop]);
                    } else {
                        // Appropriate parsing is done here for each key setting
                        var newValue;
                        switch (this.settingKeys[prop].type) {
                            case 'boolean':
                                newValue = item == "true";
                                break;
                            default:
                                newValue = item;
                        }
                        this.settings[prop] = newValue;
                    }
                }
            }
        }
    },

    setUseCat: function (value) {
        sessionStorage.setItem(this.settingKeys.useCat.storageKey, value);
    },

    setupCanvas: function () {
        var that = this;
        var duration = 5000;
        var howfar;
        var right = this.settings.initialCanvasRight;

        canvas.css({
            bottom: 0,
            // TODO 90px instead 340px actually the animation stopped earlier - save this in the session storage
            right: this.settings.useCat ? "90px" : right,
            left: "",
            width: this.settings.canvasWidth + "px",
            height: this.settings.canvasHeight + "px"
        })
            .on('click', function (e) {
                if (that.runningAnim && !that.runningAnim.isRunning) {

                    that.settings.useCat = !that.settings.useCat;
                    that.setUseCat(false);
                    canvas.stop();
                    canvas.animate({
                        left: right // almost the same like the initial right position
                    }, {
                            duration: duration,
                            step: function (now, fx) {
                                howfar = fx.pos;  // between 0 and 1, tells how far along %
                            },
                            complete: function () {
                                that.runningAnim.stopAnimation();
                            }
                        });

                    that.runningAnim = new Animation([that.spritesheet4]);
                    that.runningAnim.beginAnimation();
                }
            });

        // if initial setting is use cat, then draw it
        if (this.settings.useCat) {
            this.drawCatFrame(0, 0, this.settings.spriteImagePath, this.settings.frameWidth, this.settings.frameHeight, 5, 1, this.settings.stretch);
        }
    },

    drawCatFrame: function (x, y, path, frameWidth, frameHeight, rowPos, colPos, stretch) {
        var image = new Image();
        image.onload = function () {
            // At this point, the image is fully loaded

            ctx.drawImage(
                image,
                colPos * frameWidth, rowPos * frameHeight,
                frameWidth, frameHeight,
                x, y,
                frameWidth * stretch, frameHeight * stretch);
        };

        image.src = path;
    },

    addHandlersToButtons: function () {
        var that = this,
            right = this.settings.initialCanvasRight;

        $('#toggleCat').on('click', function () {
            if (that.runningAnim.isRunning) {
                return;
            }

            that.settings.useCat = !that.settings.useCat;
            that.setUseCat(that.settings.useCat);

            canvas
                .stop()
                .css({
                    right: right,
                    left: "",
                });

            if (that.settings.useCat) {
                that.runningAnim = new Animation([that.spritesheet1, that.spritesheet2]);
                that.runningAnim.beginAnimation();
                
                canvas.animate({
                    right: "340px"
                }, {
                        duration: 6000
                    });

            }
        });
    }
};

var reqanimationreference; // indicates the runnning animation
var ctx; // the drawing context
var canvas;

function animate() {
    /// <summary>Main animate functon. The context is set to an instance of SpriteSheet class</summary>

    var spritesheet = this;
    // call again to animate the next frame
    reqanimationreference = window.requestAnimationFrame(animate.bind(spritesheet));
    spritesheet.update();
    spritesheet.draw(0, 0);
}

$(document).ready(function () {
    new Cat().init();
});
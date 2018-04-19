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

var reqanimationreference; // indicates the runnning animation
var canvas; // the canvas
var ctx; // the canvas' context

$(document).ready(function () {
    var c = document.getElementById("myCanvas");
    canvas = $(c);
    ctx = c.getContext("2d");

    var stretch = 0.8; // 1:1 fill with the whole canvas
    var args1 = ['images/cat_sprite.png', 400, 200, 7, 12, 1, 0, 0, stretch, 10, true];
    var args2 = ['images/cat_sprite.png', 400, 200, 10, 6, 1, 0, 1, stretch, 1, false];
    var args3 = ['images/cat_sprite.png', 400, 200, 5, 12, 1, 0, 2, stretch, 0, false];
    var args4 = ['images/cat_sprite.png', 400, 200, 5, 13, 1, 0, 3, stretch, 0, false];

    // spritesheets
    var spritesheet1 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args1);
    var spritesheet2 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args2);
    var spritesheet3 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args3);
    var spritesheet4 = SpriteSheet.apply(Object.create(SpriteSheet.prototype), args4);

    // animation sequences - multiple spritesheets
    var anim = new Animation([spritesheet1, spritesheet2]);

    // prepare the canvas

    //read the local storage to determine if cat should be displayed
    var useCat = false;
    if (sessionStorage) {
        var item = sessionStorage.getItem('useCat');
        if (item == null) {
            sessionStorage.setItem("useCat", useCat);
        } else {
            useCat = item == "true";
        }
    }

    canvas
        .css({
            bottom: 0,
            right: "-120px",
            width: "120px",
            height: "60px"
        })
        .on('click', function (e) {
            if (!anim.isRunning) {
                new Animation([spritesheet4]).beginAnimation();
            }
            //anim.stopAnimation();
        });

    if (useCat) {
        canvas
        .css({
            right: "90px",//TODO: 340px actually the animation stopped earlier - save this in the session storage
        });
        drawCat(0, 0, 'images/cat_sprite.png', 400, 200, 5, 1, stretch);
    }

    $('#toggleCat').on('click', function () {
        if (anim.isRunning) {
            return;
        }

        useCat = !useCat;
        sessionStorage.setItem("useCat", useCat);
        
        canvas
        .css({
            bottom: 0,
            right: "-120px",
            width: "120px",
            height: "60px"
        })

        if (useCat) {
            canvas
            .css({
                right: "-120px"
            })
            .animate({
                right: "340px"
            }, 6000);
    
            anim.beginAnimation();    
        } else {
            //do nothing, just hide the cat
        }
    });
});

function prepareCanvas() {
    // fix the canvas
    $('#myCanvas').on('click', function (e) {
        if (!anim.isRunning) {
            new Animation([spritesheet4]).beginAnimation();
        }
        //anim.stopAnimation();
    });

}

function drawCat(x, y, path, frameWidth, frameHeight, rowPos, colPos, stretch) {
    var image2 = new Image();
    image2.onload = function() {
        // At this point, the image is fully loaded
        // So do your thing!

        ctx.drawImage(
            image2,
            colPos * frameWidth, rowPos * frameHeight,
            frameWidth, frameHeight,
            x, y,
            frameWidth * stretch, frameHeight * stretch); //stretch or reduce the image
    };

    image2.src = 'images/cat_sprite.png';
    
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(300,150);
    // ctx.stroke();
    
    //ctx.clearRect(x, y, frameWidth * stretch, frameHeight * stretch);
    //return;
    
}

function animate() {
    // this is the spritesheet
    var spritesheet = this;
    // call again to animate the next frame
    reqanimationreference = window.requestAnimationFrame(animate.bind(spritesheet));
    spritesheet.update();
    spritesheet.draw(0, 0);
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
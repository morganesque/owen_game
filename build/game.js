var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/grass_block.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('ladder', 'assets/ladder.png');
  game.load.spritesheet('dude', 'assets/Player.png', 32, 32);
  game.load.spritesheet('baddie', 'assets/goast_monster.png', 32, 32);
  game.load.spritesheet('lava', 'assets/lava.png', 32, 32);
  game.load.image('portal', 'assets/portal.png');

}

var platforms;
var player;
var baddie;
var cursors;
var stars;
var lava; // undefined = empty = nothing
var ladder;
var score = 0;
var scoreText;
var guy_scale = 2;
var portal;
var dead = false;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();
    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    var ground = game.add.tileSprite(0, game.world.height - 20, game.world.width, 20, 'ground');
    game.physics.enable(ground)
    ground.body.immovable = true;
    platforms.add(ground);

    var ledge = game.add.tileSprite(400, 400, 500, 20, 'ground');
    game.physics.enable(ledge)
    ledge.body.immovable = true;
    platforms.add(ledge);

    var ledge = game.add.tileSprite(0, 300, 200, 20, 'ground');
    game.physics.enable(ledge)
    ledge.body.immovable = true;
    platforms.add(ledge);

    var ledge = game.add.tileSprite(200, 100, 300, 20, 'ground');
    game.physics.enable(ledge)
    ledge.body.immovable = true;
    platforms.add(ledge);

    var ledge = game.add.tileSprite(500,260, 200, 20, 'ground');
    game.physics.enable(ledge)
    ledge.body.immovable = true;
    platforms.add(ledge);

    lava = game.add.tileSprite(600,388, 200, 32, 'lava');
    lava.animations.add('bloo');
    lava.animations.play('bloo',4,true);
    game.physics.arcade.enable(lava)
    lava.body.immovable = true;

    ladder = game.add.tileSprite(400, 400, 32, 200, 'ladder');
    game.physics.arcade.enable(ladder)
    ladder.body.immovable = true;

    baddie = game.add.sprite(250, 50, 'baddie');
    game.physics.arcade.enable(baddie);
    baddie.animations.add('move', [0, 1, 2, 3, 4, 5], 10, true);
    baddie.animations.play('move');

    portal = game.add.sprite(424, 30, 'portal');
    game.physics.arcade.enable(portal);
    portal.scale.x = 2.5;
    portal.scale.y = 2.5;

    player = game.add.sprite(32, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);
    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.anchor.setTo(.5, 1);
    player.scale.y = guy_scale;
    player.scale.x = guy_scale;
    player.animations.add('left', [0, 1, 2, 3, 4], 10, true);
    player.animations.add('right', [0, 1, 2, 3, 4], 10, true);
    player.animations.add('die', [5, 6, 7, 8, 9, 10, 11], 10, true);

    cursors = game.input.keyboard.createCursorKeys();

    stars = game.add.group();
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
       //  Create a star inside of the 'stars' group
       var star = stars.create(i * 70, 0, 'star');

       //  Let gravity do its thing
       star.body.gravity.y = 6;

       //  This just gives each star a slightly random bounce value
       star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);


    game.physics.arcade.collide(player, lava, checkIt, null, this);


    game.physics.arcade.collide(player, ladder);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, baddie, gotCha, null, this);
    game.physics.arcade.overlap(player, portal, youWin, null, this);


    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown && !dead)
    {
        //  Move to the left
        player.body.velocity.x = -150;
        player.scale.x = 1 * guy_scale;
        player.animations.play('left');
    }
    else if (cursors.right.isDown && !dead)
    {
        //  Move to the right
        player.body.velocity.x = 150;
        player.scale.x = -1 * guy_scale;
        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        dead = false;
        player.body.velocity.y = -350;
    }

    if (game.input.mousePointer.isDown)
    {
      console.log(game.input.mousePointer.x, game.input.mousePointer.y)
    }

} // end of update function

function collectStar (player, star)
{
    // Removes the star from the screen
    star.y = -100;
    star.body.gravity.y = 0;
    star.body.velocity.y = 0;
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function checkIt()
{
  if (!dead)
  {
    console.log('wooopeeedoo!');
    dead = true;
    player.kill()
  }
}

function gotCha(player, baddie) {
  console.log('got here');

  player.kill();
}

function youWin(player, portal) {
  if(score == 120 ) {
    console.log('PORTAL REACHED');
    player.x = 12;
    player.y = 520;

    for (var i = 0; i < 12; i++)
    {
        stars.children[i].y = 0;
        stars.children[i].body.gravity.y = 6;
        console.log(stars);

        baddie = game.add.sprite(93, 259, 'baddie');
        baddie.animations.add('move', [0, 1, 2, 3, 4, 5], 10, true);
        baddie.animations.play('move');
        game.physics.arcade.enable(baddie);
        game.physics.arcade.overlap(player, baddie, gotCha, null, this);


        score = 0;
        scoreText.text = 'Score: ' + score;

    }
  }
}

import kaboom, { GameObj } from "kaboom";
import { maps } from "./maps";

interface IGameProps {
  level: number;
  score: number;
}

const DEFAULT_SPRITE_SIZE = 48;
const ENEMY_SPEED = 80;
const SHIP_SPEED = 130;
const BULLET_SPEED = 200;

let enemyDirection = 1;

kaboom({
  global: true,
  width: DEFAULT_SPRITE_SIZE * 17,
  height: DEFAULT_SPRITE_SIZE * 12,
  debug: true,
  background: [0, 0, 0],
});

loadSprite("wall", "sprites/wall.png");
loadSprite("space-invader", "sprites/space-invader.png");
loadSprite("spaceship", "sprites/spaceship.png");

scene('gameover', () => {
  add([
    text(`Game Over!`, {
      size: 36,
      font: "sink",
    }),
    origin('center'),
    pos(width() / 2, height() / 2),
  ]);
})

scene('game', ({ level = 1, score = 0 }: IGameProps) => {
  // eslint-disable-next-line no-console
  console.log('>>>>> score', score);

  layers([
    "obj",
    "ui",
  ], "obj");

  const player = add([
    sprite('spaceship'),
    area(),
    solid(),
    origin('bot'),
    pos(width()/2, DEFAULT_SPRITE_SIZE * maps[0].length - (DEFAULT_SPRITE_SIZE / 3)),
    'spaceship'
  ]);

  const gameScore = add([
    text(`Score: ${score}`, {
      size: 24,
      font: "sink",
    }),
    pos(DEFAULT_SPRITE_SIZE, 0),
    layer('ui'),
  ]);

  add([
    text(`Level: ${level}`, {
      size: 24,
      font: "sink",
    }),
    pos(width() - DEFAULT_SPRITE_SIZE, 10),
    layer('ui'),
    origin('right'),
  ]);

  addLevel(maps[0], { // repeat same level, but with faster enemies
    width: DEFAULT_SPRITE_SIZE,
    height: DEFAULT_SPRITE_SIZE,
    '!': () => [sprite('wall'), area(), solid(), 'left-wall'],
    '@': () => [sprite('wall'), area(), solid(), 'right-wall'],
    '#': () => [sprite('space-invader'), area(), solid(), 'space-invader'],
  });

  onKeyDown('right', () => {
    player.move(SHIP_SPEED, 0);
  })

  onKeyDown('d', () => {
    player.move(SHIP_SPEED, 0);
  })

  onKeyDown('left', () => {
    player.move(-SHIP_SPEED, 0);
  })

  onKeyDown('a', () => {
    player.move(-SHIP_SPEED, 0);
  })

  const shoot = (p: number) => {
    add([
      rect(5, 20),
      pos(p),
      origin('center'),
      color(100, 100, 255),
      area(),
      solid(),
      'bullet',
    ])
  }

  onKeyPress('enter', () => {
    shoot(player.pos.add(0, -25));
  })

  onKeyPress('space', () => {
    shoot(player.pos.add(0, -25));
  })

  const advance = () => {
    revery('space-invader', (enemy: GameObj) => {
      enemy.move(0, DEFAULT_SPRITE_SIZE * (ENEMY_SPEED / 2));

      if (enemy.pos.y >= height()) {
        go('gameover');
      }
    });
  }

  onCollide('space-invader', 'right-wall', () => {
    enemyDirection = -1;
    advance();
  });

  onCollide('space-invader', 'left-wall', () => {
    enemyDirection = 1;
    advance();
  });

  onCollide('space-invader', 'spaceship', () => {
    go('gameover');
  });

  onCollide('space-invader', 'bullet', (invader: GameObj, bullet: GameObj) => {
    invader.destroy();
    bullet.destroy();

    if (!get('space-invader').length) {
      go('game', { level: level + 1, score: score + 1 });
    } else {
      score += 1;
      gameScore.text = `Score: ${score}`;
    }
  })

  onUpdate('space-invader', (invader: GameObj) => {
    invader.move((ENEMY_SPEED * enemyDirection) + ((level * 10) * enemyDirection), 0);
  });

  onUpdate('bullet', (bullet: GameObj) => {
    bullet.move(0, -BULLET_SPEED);

    if (bullet.pos.y < 0) {
      bullet.destroy();
    }
  })
})

go('game', { level: 1, score: 0 });
class TelaInicial extends Phaser.Scene {
  constructor() {
    super({ key: 'TelaInicial' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1b4332);

    this.add.text(width / 2, height / 2 - 40, 'Floresta em Jogo', {
      fontSize: '48px',
      color: '#a8d5a2',
      fontFamily: 'Georgia',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, 'Restauração florestal na Amazônia', {
      fontSize: '20px',
      color: '#52b788',
      fontFamily: 'Georgia',
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: TelaInicial,
};

new Phaser.Game(config);

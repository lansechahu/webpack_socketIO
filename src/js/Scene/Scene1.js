import * as PixiUtils from 'chc-pixi-utils';
import Scene from './Scene.js';

export default class Scene1 extends Scene {

    init() {
        this.VIDEO_PLAY = 'video_play';

        this.bg = PixiUtils.CdrawRect(this.wid, this.hei, {fillColor: 0xc5dfff});
        this.man = PixiUtils.CSprite('man.png', 'fromFrame');
        this.btn = PixiUtils.CSprite('btn_back.png', 'fromFrame');

        super.init(); //再执行父类的init()
    }

    get wid() {
        return 640;
    }

    get hei() {
        return 1258;
    }

    begin() {
        this.addChild(this.bg);
        this.addChild(this.man);
        this.man.x = this.wid / 2 - this.man.width / 2;
        this.man.y = this.hei / 2 - this.man.height / 2;

        this.addChild(this.btn);
        this.btn.x = this.wid / 2 - this.btn.width / 2;
        this.btn.y = this.man.y + this.man.height + 50;
        this.btn.interactive = true;
        this.btn.on('pointerdown', () => {
            this.btn.interactive = false;
            this.emit(this.VIDEO_PLAY);
        });

        this.emit(this.SCENE_IN);
        this._isSceneIn = true;
    }

    out() {
        super.out();
    }


    //Scene类update方法执行的方法，在这里自定义逐帧内容
    updateFun() {
        //console.log('33333');
    }
}


class GameMap extends AcGameObject {  //说明GameMap是基类的派生类

    constructor (playground)
    {
        super();  //调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }
    start()
    {

    }

    update()
    {
        this.render();  //渲染函数每一帧都要执行，所以要在update里执行
    }

    render()   //渲染函数
    {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}

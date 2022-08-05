class Particle extends AcGameObject
{
    constructor(playground,x,y,radius,vx,vy,color,speed,move_length)
    {
        super();  //调用基类构造函数
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.speed=speed;
        this.move_length=move_length;
        this.friction=0.9;    //摩擦力
        this.eps=1;         //小值
    }

    start()
    {

    }

    update()   //每一帧调用的函数
    {
        if(this.move_length<this.eps||this.speed<this.eps)
        {
            this.destroy();  //消失
            return false;  //直接return即可
        }
        let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.speed*=this.friction;  //乘上摩擦力
        this.move_length-=moved;
        this.render();   //老规矩，每次更新都要渲染一下
    }

    render()     //渲染函数
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fill();
    }
}

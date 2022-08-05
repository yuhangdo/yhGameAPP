class FireBall extends AcGameObject
{
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage)
    {
        super();


        this.playground=playground;
        this.player=player;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.vx=vx;  //vx是方向
        this.vy=vy;
        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.move_length=move_length;
        this.damage=damage;
        this.eps=0.1;


    }
    start()
    {

    }

    update()
    {
        if(this.move_length<this.eps)
        {
            this.destroy();
            return false;
        }
        let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);  //移动的距离是剩余的长度与速度*时间取min
        this.x +=this.vx*moved;
        this.y +=this.vy*moved;
        this.move_length -=moved;

        for(let i=0;i<this.playground.players.length;i++)
        {
            let player = this.playground.players[i];
            if(this.player !=player&&this.is_collision(player))  //如果这个玩家不是主玩家且发生了与这个玩家的碰撞
            {
                this.attack(player);  //则攻击这位玩家
            }
        }
        this.render();

    }
    //写出碰撞的距离函数
    get_dist(x1,y1,x2,y2)
    {
        let dx = x1-x2;
        let dy = y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    is_collision(player)     //判断是否碰撞且碰撞后的处理
    {
        let distance = this.get_dist(this.x,this.y,player.x,player.y);  //定义一个变量表示主玩家与敌人的球心距离
        if(distance<this.radius+player.radius)
        {
            return true;
        }
        return false;
    }
    attack(player)
    {
        let angle=Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attached(angle,this.damage);
        this.destroy();   //首先火球会消失
    }
    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }


}

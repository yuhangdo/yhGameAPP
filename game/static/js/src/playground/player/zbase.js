class Player extends AcGameObject
{
    constructor (playground,x,y,radius,color, speed,is_me)
    {
        super();  //调用基类
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.vx=0;  //x方向上速度
        this.vy=0;
        this.move_length=0;

        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.is_me=is_me;
        this.eps=0.1;


    }
    start()
    {
        if(this.is_me)
        {
            this.add_listening_events();

        }


    }

    add_listening_events()  //表示要加一个监听函数
    {
        let outer=this;  //来用于在this里使用this    这个是Js的一个语法
        this.playground.game_map.$canvas.on("contextmenu",function(){return false});   //加上一个菜单事件，直接return false 表示这个事件不处理了
        this.playground.game_map.$canvas.mousedown(function(e)
        {
            if(e.which === 3)
            {
                outer.move_to(e.clientX,e.clientY);   //坐标也有API  e.clientX

            }

        });
    }


    get_dist(x1,y1,x2,y2)
    {

        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);


    }


    move_to(tx,ty)
    {
        this.move_length=this.get_dist(this.x,this.y,tx,ty);
        let angle=Math.atan2(ty-this.y,tx-this.x);
        this.vx=Math.cos(angle);
        this.vy=Math.sin(angle);

    }

    update()
    {
        if(this.move_length<this.eps)
        {
            this.move_length=0;
            this.vx=this.vy=0;  //不需要移动了，这个也是零
        }
        else
        {
            let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);   // 是速度*时间与移动的距离取小，不要移出界
            this.x+=this.vx*moved;  //算出真实移动的距离  角度乘距离得偏移量
            this.y+=this.vy*moved;
            this.move_length -=moved;
        }
       // this.x +=this.vx;
       //this.y+=this.vy;

        this.render();  //玩家也要每次刷新画一次

    }


    render()
    {
        this.ctx.beginPath();   //ctx要定义
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2, false);  //画圆
        this.ctx.fillStyle=this.color;
        this.ctx.fill();


    }



}

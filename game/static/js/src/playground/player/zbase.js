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
        this.damage_x=0;  //被碰撞的x向量
        this.damage_y=0;
        this.damage_speed=0;
        this.move_length=0;

        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.is_me=is_me;
        this.eps=0.1;
        this.friction=0.9;   //加上摩擦力的概念
        this.cur_skill=null;
        this.spent_time=0;
    }
    start()
    {
        if(this.is_me)
        {
            this.add_listening_events();

        }
        else
        {
            let tx = Math.random()*this.playground.width;  //如果是敌人，就加一个随机方向
            let ty = Math.random()*this.playground.height;
            this.move_to(tx,ty);     //将敌人移动tx,ty这个点，下面实现过一个很棒的函数 move_to；
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
            else if(e.which ===1)
            {
                if(outer.cur_skill=="fireball")
                {
                    outer.shoot_fireball(e.clientX,e.clientY);
                }
                outer.cur_skill=null;
            }

        });
        $(window).keydown(function(e)    //不能用canvas了，因为canvas不能注销，所以改用Windows来获取
         {//查keycode事件

            if(e.which === 81)  //q键
            {
                outer.cur_skill="fireball";
                return false;
            }

         });
    }


    is_attached(angle,damage)  //处理碰撞后的事情
    {
        for(let i=0;i<20+Math.random()*5;i++)  //被攻击后会产生粒子特效                                                                                                     
        {
            let x=this.x;
            let y=this.y;
            let radius=this.radius*Math.random()*0.1;
            let angle=Math.PI*2*Math.random();  //粒子的角度随机
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color=this.color;  //颜色应该为自己的颜色
            let speed=this.speed*10;
            let move_length=this.radius*Math.random()*5;  //移动的距离是半径乘随机数乘10；
            new Particle(this.playground,x,y,radius,vx,vy,color,speed,move_length);
        }
        this.radius-=damage;
        if(this.radius<10)
        {
            this.destroy();
            return false;
        }
        this.damage_x=Math.cos(angle);
        this.damage_y=Math.sin(angle);
        this.damage_speed=damage*100;  //被击退后的速度
        this.speed*=0.8;   //被攻击后速度变慢

    }
    shoot_fireball(tx,ty)
    {
        console.log("出现啊");
        let x =this.x,y=this.y;  //写火球的参数
        let radius = this.playground.height*0.01;
        let angle=Math.atan2(ty-this.y,tx-this.x);
        let vx =Math.cos(angle),vy=Math.sin(angle);
        let color="orange";
        let speed=this.playground.height*0.5;  //火球的速度应该快一些
        let move_length=this.playground.height*1;  //长度应该是高度的一点五倍
        new FireBall(this.playground,this,x,y,radius,vx,vy,color,speed,move_length,this.playground.height*0.01);  //加上伤害值，每次打掉玩家20的血量

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
        this.spent_time+=this.timedelta/1000;
        if(!this.is_me&&this.spent_time>4&&Math.random()<1/300)    //每次更新有180分之一的概率，会朝玩家发射一枚炮弹
        {
            let player=this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx=player.x+player.speed*this.vx*this.timedelta/1000*0.3;   //加个预判
            let ty=player.y+player.speed*this.vy*this.timedelta/1000*0.3;   //预判一秒后的位置
            this.shoot_fireball(tx,ty);

        }
        if(this.damage_speed>10)  //如果被击退了，就是产生击退速度了，就得先判断一下
        {
            this.vx=this.vy=0;   //自身速度归零
            this.move_length=0;  //一旦被伤害就停下来了
            this.x+=this.damage_x*this.damage_speed*this.timedelta/1000;    //更新被碰撞小球的坐标
            this.y+=this.damage_y*this.damage_speed*this.timedelta/1000;
            this.damage_speed*=this.friction;
        }
        if(this.move_length<this.eps)
        {
            this.move_length=0;
            this.vx=this.vy=0;  //不需要移动了，这个也是零
            if(!this.is_me)
            {
                let tx = Math.random()*this.playground.width;
                let ty = Math.random()*this.playground.height;
                this.move_to(tx,ty);
            }
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

class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item  ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        </br>
        <div class="ac-game-menu-field-item  ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        </br>
        <div class="ac-game-menu-field-item  ac-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }
    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide(); //将当前对象关闭
            outer.root.playground.show();  //将游戏界面显示出来
        });
        this.$multi_mode.click(function(){
          console.log("cilck multi mode");
        });
        this.$settings.click(function(){
          console.log("click settings");
        })
    }
    show(){  //显示menu界面
        this.$menu.show();
    }
    hide(){  //关闭menu界面
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;  //是否执行过start函数
        this.timedelta = 0;  //当前帧距离上一帧的时间间隔
    }

    start(){  //只会在第一帧执行一次

    }
    update() { //每一帧均会执行一次

    }

    on_destroy(){ //在被销毁前执行一次

    }

    destroy() { //删除该物体
        this.on_destroy();
        for(let i=0; i<AC_GAME_OBJECTS.length; i++) {
            if(AC_GAME_OBJECTS[i] === this) {   //js用三个等号表示全等
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}

let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp) {

    for(let i = 0;i< AC_GAME_OBJECTS.length; i++){
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp =timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
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
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class = "ac-game-playground"></div>`);
        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width= this.$playground.width();
        this.height = this.$playground.height();
        this.game_map=new GameMap(this);
        this.players=[];
        this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.15,true));

        for(let i=0;i<5;i++)   //创建五个敌人，注意敌人是false
        {
            this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,this.get_random_color(),this.height*0.15,false));

        }

        this.start();
    }


    get_random_color()
    {
        let colors=["blue","red","yellow","pink","grey","green"];
        return colors[Math.floor(Math.random()*5)];   //每次随机取颜色，下取整

    }
    start(){
    }
    show(){
        this.$playground.show();
    }
    hide(){  //关闭playground界面
        this.$playground.hide();
    }
}
 export class AcGame {
    constructor(id){
        this.id = id;
        this.$ac_game = $('#' + id);
       // this.menu = new AcGameMenu(this);
        this.playground= new AcGamePlayground(this);
        this.start();
    }

    start(){

    }
}

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

    on_destory(){ //在被销毁前执行一次

    }

    destory() { //删除该物体
        this.on_destory();
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
        this.start();
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

from django.http import HttpResponse

def index(request):
    line1='<h1 style="text-align: center">爱吃代码的霸王虎</h1>'
    line3='<hr>'
    line2='<img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg2.027art.cn%2Fimg%2F2020%2F08%2F02%2F1596379830824853.jpg&refer=http%3A%2F%2Fimg2.027art.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1661497470&t=d8fd1df07a3b0bff31fe42da6ccd7617"width=1200>'
    return HttpResponse(line1+line3+line2)

def play(request):
    line1='<h1 style="text-align: center">游戏界面</h1>'
    return HttpResponse(line1)

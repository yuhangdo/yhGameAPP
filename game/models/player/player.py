from django.db import models          # 导入基类
from django.contrib.auth.models import User

class Player(models.Model):

    user = models.OneToOneField(User, on_delete = models.CASCADE)
    photo = models.URLField(max_length = 256, blank= True);

    def __str__(self):
        return str(self.user)



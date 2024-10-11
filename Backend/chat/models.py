from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid

class User(AbstractUser):
    TOKEN_BASED = 'token_based'
    TIME_BASED = 'time_based'
    MESSAGE_LIMIT_CHOICES = [
        (TOKEN_BASED, 'Token Based'),
        (TIME_BASED, 'Time Based')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tokens = models.IntegerField(default=10)
    is_admin = models.BooleanField(default=False) 
    max_tokens = models.IntegerField(default=10)
    last_token_update = models.DateTimeField(default=timezone.now)
    message_limit_type = models.CharField(max_length=20, choices=MESSAGE_LIMIT_CHOICES, default=TOKEN_BASED)
    time_window_start = models.DateTimeField(null=True, blank=True)  # To track the start of the active message time window
    message_time_window = models.DurationField(default=timedelta(hours=1))  # Duration of allowed message window
    is_active_user = models.BooleanField(default=False)  
    TOKEN_REGEN_INTERVAL = timedelta(hours=24)

    def replenish_tokens(self):
        now = timezone.now()
        elapsed_time = now - self.last_token_update

        if elapsed_time >= self.TOKEN_REGEN_INTERVAL:
            num_intervals = self.max_tokens
            tokens_to_add = num_intervals

            # Ensure that the tokens do not exceed max_tokens
            self.tokens = min(self.tokens + tokens_to_add, self.max_tokens)
            self.last_token_update = now
            self.save()

    def can_send_message(self):
        now = timezone.now()
        if not self.is_active_user:
            return False
        if self.message_limit_type == "token_based":
            return self.tokens > 0
        elif self.message_limit_type == "time_based":
            # Check if current time is within the start and end of the allowed window
            if self.time_window_start is not None:
                window_end = self.time_window_start + self.message_time_window
                return self.time_window_start <= now <= window_end
            return False
        return False


    def use_message_limit(self):
        if self.message_limit_type == self.TOKEN_BASED:
            if self.tokens > 0 and not self.is_admin :
                self.tokens -= 1
                self.save()

    def __str__(self):
        return self.username
    


    
class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  
    name = models.CharField(max_length=255)
    user =models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms')

    def __str__(self):
        return f'{self.name} ({self.user.username})'

class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.user.username} in {self.room.name}: {self.content[:20]}'

from django.contrib import admin
from .models import User, Room, Message

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        'username', 'email', 'is_active_user', 'tokens', 'max_tokens',
        'message_limit_type', 'time_window_start', 'message_time_window', 'last_token_update','is_admin'
    ]
    list_filter = ['is_staff', 'is_active', 'message_limit_type', 'is_active_user']
    search_fields = ['username', 'email']
    fields = [
        'username', 'email', 'is_active_user', 'tokens', 'max_tokens', 
        'message_limit_type', 'time_window_start', 'message_time_window', 'is_staff', 'is_active','is_admin'
    ]
    readonly_fields = ['last_token_update']

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['user']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'content', 'timestamp']
    search_fields = ['user__username', 'content']

from rest_framework import serializers
from .models import Message, Room, User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        # Ensure tokens are up-to-date whenever the user information is serialized
        instance.replenish_tokens()
        return super().to_representation(instance)

    class Meta:
        model = User
        fields = ['id', 'username', 'tokens','message_limit_type',
                   'is_active_user','time_window_start','message_time_window']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'content', 'timestamp']

        
class RoomSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'user','name']
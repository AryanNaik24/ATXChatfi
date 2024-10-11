import requests
from django.shortcuts import get_object_or_404
from rest_framework import generics,viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message, Room, User
from .serializers import MessageSerializer, RoomSerializer
from .serializers import UserRegistrationSerializer
from rest_framework.views import APIView
from .serializers import UserSerializer

import os
from dotenv import load_dotenv

load_dotenv('.env')

CHATFIAPI = os.getenv('CHATFIAPI')

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user.replenish_tokens()  # Ensure tokens are replenished when fetching user data
        serializer = UserSerializer(user)
        return Response(serializer.data)






class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Automatically create a room for the user
        Room.objects.create(user=user,name=f'{user.username}\'s Room')

        # Optionally start a time window for time-based users
        if user.message_limit_type == User.TIME_BASED:
            user.start_time_window()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    





class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return rooms that belong to the logged-in user
        return Room.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the new room
        serializer.save(user=self.request.user)

    def messages(self, request, pk=None):
        # Get all messages for a specific room
        room = get_object_or_404(Room, pk=pk, user=request.user)
        messages = Message.objects.filter(room=room).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)








class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        
        room_pk = self.kwargs.get('room_pk')  
        user = self.request.user
        room = get_object_or_404(Room, pk=room_pk, user=user)
        return Message.objects.filter(room=room).order_by('timestamp')

    def create(self, request, *args, **kwargs):
        user = request.user

       
        if not user.is_active_user:
            return Response({"error": "User is not active. Cannot send messages."}, status=status.HTTP_403_FORBIDDEN)

      
        if hasattr(user, 'message_limit_type') and user.message_limit_type == "token_based":
            user.replenish_tokens()

     
        if not user.can_send_message():
            
                if user.message_limit_type == "token_based":
                    return Response({"error": "Not enough tokens to send a message."}, status=status.HTTP_403_FORBIDDEN)
                elif user.message_limit_type == "time_based":
                    return Response({"error": "Your time window for sending messages has expired."}, status=status.HTTP_403_FORBIDDEN)

        
        room_pk = self.kwargs.get('room_pk')
        room = get_object_or_404(Room, pk=room_pk, user=user)


        content = request.data.get('content')
        if not content:
            return Response({"error": "Message content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(user=user, room=room, content=content)

        if user.message_limit_type == "token_based":
            user.tokens -= 1  
            user.save()  

 
        if hasattr(user, 'message_limit_type') and user.message_limit_type == "token_based":
            user.use_message_limit()

        bot_response_content = self.get_bot_response(content,room_pk)


        if bot_response_content:
            try:
                # Create a new message for the bot's response in the same room
                bot_message = Message.objects.create(
                    user=User.objects.get(email="bot@bot.bot"),  
                    room=room,
                    content=bot_response_content
                )
            except Exception as e:
                return Response({"error": "Failed to create bot response: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created user message
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get_bot_response(self, user_input,room_id):
        user_id = self.request.user.id

        try:
            api_url = CHATFIAPI 
            payload = {"input": user_input,"config":{"session_id":f"{room_id}{user_id}"}}
            headers = {"Content-Type": "application/json"}
            response = requests.post(api_url, json=payload, headers=headers)
      
      
            if response.status_code == 200:
              
                return response.json().get("response",{}).get("output",{})
            else:
                print(f"Error from API: {response.status_code} - {response.text}")
                return "Sorry, I couldn't process your request at the moment."

        except requests.RequestException as e:
            print(f"Error calling ChatFi API: {str(e)}")
            return "Sorry, I couldn't process your request due to a connection issue."
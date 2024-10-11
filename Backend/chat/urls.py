from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, RoomViewSet, UserDetailView,UserRegistrationView

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'rooms/(?P<room_pk>[^/.]+)/messages', MessageViewSet, basename='messages')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('rooms/<uuid:room_pk>/messages/', MessageViewSet.as_view({'get': 'list', 'post': 'create'}), name='room-messages'),
]

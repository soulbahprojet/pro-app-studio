import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  MapPin, 
  Package, 
  Truck,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
}

interface NotificationSystemProps {
  showUnreadOnly?: boolean;
  maxHeight?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  showUnreadOnly = false,
  maxHeight = '400px'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      console.log('NotificationSystem: No user found');
      return;
    }

    try {
      setIsLoading(true);
      console.log('NotificationSystem: Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('notifications', {
        method: 'GET',
      });

      console.log('NotificationSystem: Response data:', data);
      console.log('NotificationSystem: Response error:', error);

      if (error) {
        console.error('NotificationSystem: API Error:', error);
        throw error;
      }

      const notificationsData = data.data || [];
      console.log('NotificationSystem: Notifications data:', notificationsData);
      setNotifications(notificationsData);
      
      const unread = notificationsData.filter((n: Notification) => !n.is_read).length;
      console.log('NotificationSystem: Unread count:', unread);
      setUnreadCount(unread);

    } catch (err) {
      console.error('NotificationSystem: Error fetching notifications:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('notifications', {
        method: 'PATCH',
        body: { notificationIds },
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));

    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme lu",
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'push_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_assigned':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'pickup_ready':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-green-600" />;
      case 'position_update':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      order_assigned: 'Commande assignée',
      pickup_ready: 'Prêt pour collecte',
      in_transit: 'En transit',
      delivered: 'Livré',
      position_update: 'Position mise à jour',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      order_assigned: 'bg-blue-100 text-blue-800',
      pickup_ready: 'bg-orange-100 text-orange-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      position_update: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <CardDescription>
          {showUnreadOnly ? 'Notifications non lues' : 'Toutes les notifications'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {showUnreadOnly ? 'Aucune notification non lue' : 'Aucune notification'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead([notification.id])}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.is_read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(notification.type)}`}
                        >
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTime(notification.sent_at)}</span>
                        
                        {notification.order_id && (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {notification.order_id.slice(-8)}
                          </span>
                        )}
                      </div>
                      
                      {/* Position data for location updates */}
                      {notification.type === 'position_update' && notification.data && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono">
                              {notification.data.latitude?.toFixed(4)}, {notification.data.longitude?.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationSystem;

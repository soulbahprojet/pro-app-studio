import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Clock, Star, Bike, Target, Trophy, Calendar } from "lucide-react";

const DriverStats: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const dailyEarnings = [
    { day: 'Lun', earnings: 85000, rides: 8 },
    { day: 'Mar', earnings: 120000, rides: 12 },
    { day: 'Mer', earnings: 95000, rides: 10 },
    { day: 'Jeu', earnings: 140000, rides: 14 },
    { day: 'Ven', earnings: 160000, rides: 16 },
    { day: 'Sam', earnings: 180000, rides: 18 },
    { day: 'Dim', earnings: 110000, rides: 11 }
  ];

  const rideTypeData = [
    { name: 'Courses courtes', value: 45, color: '#10B981' },
    { name: 'Courses moyennes', value: 35, color: '#3B82F6' },
    { name: 'Courses longues', value: 20, color: '#8B5CF6' }
  ];

  const monthlyGoals = {
    ridesTarget: 300,
    ridesCompleted: 245,
    earningsTarget: 2500000,
    earningsCompleted: 2100000,
    ratingTarget: 4.8,
    currentRating: 4.7
  };

  const achievements = [
    {
      id: 1,
      title: 'Conducteur du mois',
      description: '150+ courses en janvier',
      icon: '🏆',
      earned: true,
      date: 'Janvier 2024'
    },
    {
      id: 2,
      title: 'Service 5 étoiles',
      description: 'Note moyenne 4.8+',
      icon: '⭐',
      earned: true,
      date: 'Décembre 2023'
    },
    {
      id: 3,
      title: 'Ponctualité parfaite',
      description: '100 courses à l\'heure',
      icon: '⏰',
      earned: false,
      progress: 85
    }
  ];

  const performanceMetrics = {
    totalRides: 1245,
    totalEarnings: 15750000,
    averageRating: 4.7,
    onTimePercentage: 92,
    acceptanceRate: 88,
    cancellationRate: 3,
    totalHours: 342,
    avgRideTime: 18,
    topDestination: 'Kaloum',
    peakHour: '17h-19h'
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiques de performance</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total courses</p>
                <p className="text-2xl font-bold">{performanceMetrics.totalRides}</p>
              </div>
              <Bike className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold">{(performanceMetrics.totalEarnings / 1000).toFixed(0)}K GNF</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{performanceMetrics.averageRating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures totales</p>
                <p className="text-2xl font-bold">{performanceMetrics.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectifs du mois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Courses terminées</span>
              <span className="text-sm text-muted-foreground">
                {monthlyGoals.ridesCompleted}/{monthlyGoals.ridesTarget}
              </span>
            </div>
            <Progress 
              value={(monthlyGoals.ridesCompleted / monthlyGoals.ridesTarget) * 100} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Revenus ciblés</span>
              <span className="text-sm text-muted-foreground">
                {(monthlyGoals.earningsCompleted / 1000).toFixed(0)}K/{(monthlyGoals.earningsTarget / 1000).toFixed(0)}K GNF
              </span>
            </div>
            <Progress 
              value={(monthlyGoals.earningsCompleted / monthlyGoals.earningsTarget) * 100} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Note cible</span>
              <span className="text-sm text-muted-foreground">
                {monthlyGoals.currentRating}/{monthlyGoals.ratingTarget}
              </span>
            </div>
            <Progress 
              value={(monthlyGoals.currentRating / monthlyGoals.ratingTarget) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus hebdomadaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} GNF`, 'Revenus']} />
                <Bar dataKey="earnings" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ride Types */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rideTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {rideTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {rideTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques de performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{performanceMetrics.onTimePercentage}%</div>
              <div className="text-sm text-muted-foreground">Ponctualité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{performanceMetrics.acceptanceRate}%</div>
              <div className="text-sm text-muted-foreground">Taux d'acceptation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{performanceMetrics.cancellationRate}%</div>
              <div className="text-sm text-muted-foreground">Taux d'annulation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{performanceMetrics.avgRideTime} min</div>
              <div className="text-sm text-muted-foreground">Durée moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Récompenses et badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned ? (
                      <Badge variant="default" className="mt-2">
                        Obtenu - {achievement.date}
                      </Badge>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Zone la plus rentable</h4>
              <p className="text-2xl font-bold text-primary">{performanceMetrics.topDestination}</p>
              <p className="text-sm text-muted-foreground">35% de vos courses</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Heure de pointe</h4>
              <p className="text-2xl font-bold text-primary">{performanceMetrics.peakHour}</p>
              <p className="text-sm text-muted-foreground">Maximum de demandes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverStats;
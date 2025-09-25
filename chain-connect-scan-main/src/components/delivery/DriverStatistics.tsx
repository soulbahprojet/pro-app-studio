import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star, 
  Target,
  Award,
  Calendar,
  Download
} from "lucide-react";

const DriverStatistics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { key: 'day', label: 'Aujourd\'hui' },
    { key: 'week', label: 'Cette semaine' },
    { key: 'month', label: 'Ce mois' },
    { key: 'year', label: 'Cette année' }
  ];

  const stats = {
    day: {
      rides: 12,
      earnings: '185,000',
      hours: 8.5,
      rating: 4.9,
      acceptance: 95,
      cancellation: 2
    },
    week: {
      rides: 78,
      earnings: '1,285,000',
      hours: 42,
      rating: 4.8,
      acceptance: 92,
      cancellation: 5
    },
    month: {
      rides: 285,
      earnings: '4,850,000',
      hours: 165,
      rating: 4.8,
      acceptance: 90,
      cancellation: 8
    },
    year: {
      rides: 1247,
      earnings: '12,450,000',
      hours: 785,
      rating: 4.7,
      acceptance: 88,
      cancellation: 12
    }
  };

  const goals = [
    {
      title: 'Courses mensuelles',
      current: 285,
      target: 300,
      unit: 'courses',
      progress: 95
    },
    {
      title: 'Revenus mensuels',
      current: 4850000,
      target: 5000000,
      unit: 'GNF',
      progress: 97
    },
    {
      title: 'Note moyenne',
      current: 4.8,
      target: 4.9,
      unit: '/5',
      progress: 98
    },
    {
      title: 'Taux d\'acceptation',
      current: 90,
      target: 95,
      unit: '%',
      progress: 95
    }
  ];

  const achievements = [
    {
      title: 'Conducteur fiable',
      description: '100 courses sans annulation',
      icon: '🏆',
      earned: true,
      earnedDate: '2024-02-15'
    },
    {
      title: 'Service client excellent',
      description: 'Note moyenne de 4.8+ pendant 30 jours',
      icon: '⭐',
      earned: true,
      earnedDate: '2024-02-20'
    },
    {
      title: '1000+ courses',
      description: 'Milestone de 1000 courses complétées',
      icon: '🚗',
      earned: true,
      earnedDate: '2024-01-30'
    },
    {
      title: 'Vitesse éclair',
      description: 'Temps de réponse moyen < 30 secondes',
      icon: '⚡',
      earned: false,
      progress: 75
    },
    {
      title: 'Marathon',
      description: '12 heures de conduite en une journée',
      icon: '🏃',
      earned: false,
      progress: 45
    }
  ];

  const weeklyData = [
    { day: 'Lun', rides: 15, earnings: 225000 },
    { day: 'Mar', rides: 12, earnings: 185000 },
    { day: 'Mer', rides: 18, earnings: 275000 },
    { day: 'Jeu', rides: 14, earnings: 210000 },
    { day: 'Ven', rides: 22, earnings: 345000 },
    { day: 'Sam', rides: 25, earnings: 390000 },
    { day: 'Dim', rides: 20, earnings: 310000 }
  ];

  const currentStats = stats[selectedPeriod as keyof typeof stats];

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiques de performance</h2>
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses totales</p>
                <p className="text-3xl font-bold text-primary">{currentStats.rides}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs période précédente
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Revenus</p>
              <p className="text-2xl font-bold text-green-600">{currentStats.earnings}</p>
              <p className="text-xs text-muted-foreground">GNF</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Heures</p>
              <p className="text-2xl font-bold text-blue-600">{currentStats.hours}h</p>
              <p className="text-xs text-muted-foreground">En ligne</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-2xl font-bold text-yellow-600">{currentStats.rating}</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(currentStats.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taux acceptation</p>
              <p className="text-2xl font-bold text-purple-600">{currentStats.acceptance}%</p>
              <p className="text-xs text-muted-foreground">Missions acceptées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Performance hebdomadaire
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <div className="flex items-end justify-between h-48 gap-4">
              {weeklyData.map((data, index) => {
                const maxRides = Math.max(...weeklyData.map(d => d.rides));
                const height = (data.rides / maxRides) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '192px' }}>
                      <div 
                        className="bg-primary rounded-t-lg w-full absolute bottom-0 transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium">
                        {data.rides}
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-center">{data.day}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>Courses par jour</span>
              <span>Revenus: {weeklyData.reduce((sum, day) => sum + day.earnings, 0).toLocaleString()} GNF</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectifs mensuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((goal, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{goal.title}</p>
                  <Badge variant="outline">{goal.progress}%</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Actuel: {goal.current.toLocaleString()} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: {goal.target.toLocaleString()} {goal.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges et réalisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${
                  achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{achievement.title}</p>
                      {achievement.earned ? (
                        <Badge className="bg-green-600">Obtenu</Badge>
                      ) : (
                        <Badge variant="outline">{achievement.progress}%</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    {achievement.earned ? (
                      <p className="text-xs text-green-600">
                        Obtenu le {new Date(achievement.earnedDate!).toLocaleDateString()}
                      </p>
                    ) : (
                      <div className="w-full bg-muted rounded-full h-1">
                        <div 
                          className="bg-primary rounded-full h-1 transition-all duration-500"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverStatistics;
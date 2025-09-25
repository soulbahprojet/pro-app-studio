#!/bin/bash

# Script de démonstration du système d'activation des fonctionnalités
# Ce script montre comment utiliser votre système via l'API

echo "🚀 Démonstration du Système d'Activation des Fonctionnalités 224SOLUTIONS"
echo "========================================================================="

# Configuration
PROJECT_URL="https://vuqauasbhkfozehfmkjt.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cWF1YXNiaGtmb3plaGZta2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjIyMDgsImV4cCI6MjA3MTEzODIwOH0.Eyzp2qTGUAGN74hbb35FoohcIRdqWIJ1O4oc9hjZyLU"

echo ""
echo "1️⃣ Vérification du statut actuel des fonctionnalités..."
echo "------------------------------------------------------"

curl -X POST "${PROJECT_URL}/functions/v1/features-activation" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_features_status"
  }' | jq '.'

echo ""
echo "2️⃣ Activation de toutes les fonctionnalités..."
echo "---------------------------------------------"

curl -X POST "${PROJECT_URL}/functions/v1/features-activation" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "activate_all_features"
  }' | jq '.'

echo ""
echo "3️⃣ Activation spécifique pour le rôle Vendeur..."
echo "-----------------------------------------------"

curl -X POST "${PROJECT_URL}/functions/v1/features-activation" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "activate_role_features",
    "role_filter": "seller"
  }' | jq '.'

echo ""
echo "4️⃣ Désactivation d'une fonctionnalité spécifique..."
echo "---------------------------------------------------"

curl -X POST "${PROJECT_URL}/functions/v1/features-activation" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "toggle_feature",
    "role": "seller",
    "feature": "analytics",
    "enabled": false
  }' | jq '.'

echo ""
echo "5️⃣ Vérification finale du statut..."
echo "---------------------------------"

curl -X POST "${PROJECT_URL}/functions/v1/features-activation" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_features_status"
  }' | jq '.'

echo ""
echo "✅ Démonstration terminée!"
echo ""
echo "🔗 Interfaces disponibles:"
echo "  • Interface d'activation: https://votre-app.com/features-activation"
echo "  • Dashboard sécurité:     https://votre-app.com/security-dashboard"
echo "  • Exemples de flags:      Voir FeatureFlagsExample.tsx"
echo ""
echo "📋 Fonctionnalités configurées par rôle:"
echo "  • Vendeur:     products, orders, wallet, subscription, social_module, audio_video_calls"
echo "  • Client:      orders, wallet, subscription, social_module, audio_video_calls"
echo "  • Livreur:     deliveries, tracking, wallet, audio_video_calls"
echo "  • Transitaire: shipments, tracking, wallet, audio_video_calls"
echo "  • Moto-taxi:   rides, tracking, wallet, audio_video_calls"
echo "  • Admin:       all_features, system_management, user_management, analytics"
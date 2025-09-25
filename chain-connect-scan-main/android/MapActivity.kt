package com.224solutions.app.maps

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.mapbox.maps.MapView
import com.mapbox.maps.Style
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.mapbox.geojson.Point
import androidx.core.content.ContextCompat
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation

/**
 * 224Solutions Android Map Activity
 * Intégration Mapbox pour les services Livreur, Taxi Moto, et Transitaire
 */
class MapActivity : AppCompatActivity() {

    private lateinit var mapView: MapView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Configuration du token depuis les secrets Android
        // Le token ACCESS_TOKEN_ANDROID doit être configuré dans AndroidManifest.xml
        mapView = MapView(this)
        setContentView(mapView)

        mapView.getMapboxMap().loadStyleUri(Style.MAPBOX_STREETS) { style ->
            // Activer la géolocalisation
            mapView.location.updateSettings {
                enabled = true
                pulsingEnabled = true
            }
            
            // Initialiser les services 224Solutions
            initializeServices()
        }
    }

    private fun initializeServices() {
        // Services actifs 224Solutions avec couleurs officielles
        val services = listOf(
            Service("livreur", 9.540, 13.240, ServiceType.LIVREUR),
            Service("taxi_moto", 9.530, 13.230, ServiceType.TAXI),
            Service("transitaire", 9.538, 13.235, ServiceType.TRANSITAIRE),
            Service("client", 9.535, 13.238, ServiceType.CLIENT),
            Service("vendeur", 9.542, 13.232, ServiceType.VENDEUR)
        )

        val annotationApi = mapView.annotations
        val pointAnnotationManager = annotationApi.createPointAnnotationManager()

        services.forEach { service ->
            val pointAnnotationOptions = PointAnnotationOptions()
                .withPoint(Point.fromLngLat(service.lng, service.lat))
                .withIconImage(getServiceIcon(service.type))
                .withIconSize(1.5)

            val pointAnnotation = pointAnnotationManager.create(pointAnnotationOptions)
            
            // Ajouter listener pour les clics sur marqueurs
            pointAnnotationManager.addClickListener { annotation ->
                showServiceInfo(service)
                true
            }
        }
    }

    private fun getServiceIcon(serviceType: ServiceType): String {
        return when (serviceType) {
            ServiceType.LIVREUR -> "custom-marker-blue"    // Bleu pour livreurs
            ServiceType.TAXI -> "custom-marker-yellow"     // Jaune pour taxi moto
            ServiceType.TRANSITAIRE -> "custom-marker-green" // Vert pour transitaires
            ServiceType.CLIENT -> "custom-marker-green"    // Vert pour clients
            ServiceType.VENDEUR -> "custom-marker-green"   // Vert pour vendeurs
        }
    }

    private fun showServiceInfo(service: Service) {
        // Afficher les informations du service sélectionné
        // Peut ouvrir un dialog ou une bottom sheet avec détails
    }

    /**
     * Mettre à jour la position d'un service en temps réel
     */
    fun updateServicePosition(serviceId: String, lat: Double, lng: Double) {
        // Implémenter mise à jour dynamique depuis le backend 224Solutions
        // Connexion WebSocket ou polling pour updates en temps réel
    }

    override fun onStart() {
        super.onStart()
        mapView.onStart()
    }

    override fun onStop() {
        super.onStop()
        mapView.onStop()
    }

    override fun onLowMemory() {
        super.onLowMemory()
        mapView.onLowMemory()
    }

    override fun onDestroy() {
        super.onDestroy()
        mapView.onDestroy()
    }
}

/**
 * Modèle de données pour les services 224Solutions
 */
data class Service(
    val id: String,
    val lat: Double, 
    val lng: Double,
    val type: ServiceType,
    val status: String = "active",
    val lastUpdate: Long = System.currentTimeMillis()
)

/**
 * Types de services 224Solutions
 */
enum class ServiceType {
    LIVREUR,      // Service de livraison
    TAXI,         // Taxi moto
    TRANSITAIRE,  // Logistique internationale  
    CLIENT,       // Clients
    VENDEUR       // Marchands/Vendeurs
}
import UIKit
import MapboxMaps
import CoreLocation

/**
 * 224Solutions iOS Map Controller
 * Intégration Mapbox pour tous les services mobile
 */
class MapViewController: UIViewController {

    internal var mapView: MapView!
    private var locationManager: CLLocationManager!
    private var services: [Service] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupMapView()
        setupLocationServices()
        loadServices()
    }
    
    private func setupMapView() {
        // Configuration avec token iOS sécurisé
        let myResourceOptions = ResourceOptions(accessToken: "ACCESS_TOKEN_IOS")
        let myMapInitOptions = MapInitOptions(
            resourceOptions: myResourceOptions, 
            styleURI: StyleURI.streets
        )
        
        mapView = MapView(frame: view.bounds, mapInitOptions: myMapInitOptions)
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(mapView)
        
        // Centrer sur la Guinée (Conakry)
        let camera = CameraOptions(
            center: CLLocationCoordinate2D(latitude: 9.537, longitude: 13.234),
            zoom: 12
        )
        mapView.mapboxMap.setCamera(to: camera)
    }
    
    private func setupLocationServices() {
        locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        
        // Activer la localisation sur la carte
        mapView.location.options.puckType = .puck2D()
    }
    
    private func loadServices() {
        // Services 224Solutions avec couleurs officielles
        services = [
            Service(type: .livreur, lat: 9.540, lng: 13.240, status: "en_ligne"),
            Service(type: .taxi, lat: 9.530, lng: 13.230, status: "disponible"),
            Service(type: .transitaire, lat: 9.538, lng: 13.235, status: "actif"),
            Service(type: .client, lat: 9.535, lng: 13.238, status: "connecte"),
            Service(type: .vendeur, lat: 9.542, lng: 13.232, status: "ouvert")
        ]
        
        addServiceMarkers()
        
        mapView.mapboxMap.onNext(.mapLoaded) { _ in
            print("✅ Carte 224Solutions chargée avec tous les services")
        }
    }
    
    private func addServiceMarkers() {
        // Supprimer les anciens marqueurs
        clearMarkers()
        
        services.forEach { service in
            let coordinate = CLLocationCoordinate2D(
                latitude: service.lat, 
                longitude: service.lng
            )
            
            // Créer annotation personnalisée avec couleur du service
            let pointAnnotation = PointAnnotation(coordinate: coordinate)
            
            // Configuration du marqueur selon le type de service
            var pointAnnotation = PointAnnotation(coordinate: coordinate)
            pointAnnotation.image = .init(image: createServiceMarker(for: service.type), name: service.type.rawValue)
            
            // Ajouter le marqueur à la carte
            var annotations = [pointAnnotation]
            let pointAnnotationManager = mapView.annotations.makePointAnnotationManager()
            pointAnnotationManager.annotations = annotations
            
            // Listener pour les clics
            pointAnnotationManager.onTap = { annotation in
                self.showServiceDetails(service)
                return true
            }
        }
    }
    
    private func createServiceMarker(for serviceType: ServiceType) -> UIImage {
        let size = CGSize(width: 20, height: 20)
        let color = getServiceColor(for: serviceType)
        
        return UIGraphicsImageRenderer(size: size).image { context in
            context.cgContext.setFillColor(color.cgColor)
            context.cgContext.fillEllipse(in: CGRect(origin: .zero, size: size))
            
            // Bordure blanche
            context.cgContext.setStrokeColor(UIColor.white.cgColor)
            context.cgContext.setLineWidth(2)
            context.cgContext.strokeEllipse(in: CGRect(origin: .zero, size: size))
        }
    }
    
    private func getServiceColor(for serviceType: ServiceType) -> UIColor {
        switch serviceType {
        case .livreur:
            return UIColor.systemBlue      // Bleu pour livreurs
        case .taxi:
            return UIColor.systemYellow    // Jaune pour taxi moto
        case .transitaire, .client, .vendeur:
            return UIColor.systemGreen     // Vert pour transitaires, clients, vendeurs
        }
    }
    
    private func showServiceDetails(_ service: Service) {
        let alert = UIAlertController(
            title: service.type.displayName,
            message: "Statut: \(service.status)\nDernière mise à jour: \(formatTime(service.lastUpdate))",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func clearMarkers() {
        // Supprimer tous les gestionnaires d'annotations existants
        mapView.annotations.annotationManagers.removeAll()
    }
    
    /**
     * Mettre à jour la position d'un service en temps réel
     */
    func updateServicePosition(serviceId: String, lat: Double, lng: Double) {
        // Implémenter la mise à jour depuis le backend 224Solutions
        if let index = services.firstIndex(where: { $0.id == serviceId }) {
            services[index].lat = lat
            services[index].lng = lng
            services[index].lastUpdate = Date().timeIntervalSince1970
            
            // Recharger les marqueurs
            addServiceMarkers()
        }
    }
    
    private func formatTime(_ timestamp: TimeInterval) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: Date(timeIntervalSince1970: timestamp))
    }
}

// MARK: - CLLocationManagerDelegate
extension MapViewController: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Traiter les mises à jour de localisation
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ Erreur de localisation: \(error.localizedDescription)")
    }
}

// MARK: - Models

/**
 * Modèle de service 224Solutions
 */
struct Service {
    let id: String
    let type: ServiceType
    var lat: Double
    var lng: Double
    var status: String
    var lastUpdate: TimeInterval
    
    init(type: ServiceType, lat: Double, lng: Double, status: String) {
        self.id = UUID().uuidString
        self.type = type
        self.lat = lat
        self.lng = lng
        self.status = status
        self.lastUpdate = Date().timeIntervalSince1970
    }
}

/**
 * Types de services 224Solutions
 */
enum ServiceType: String, CaseIterable {
    case livreur = "livreur"
    case taxi = "taxi"
    case transitaire = "transitaire"
    case client = "client"
    case vendeur = "vendeur"
    
    var displayName: String {
        switch self {
        case .livreur: return "LIVREUR"
        case .taxi: return "TAXI MOTO"
        case .transitaire: return "TRANSITAIRE"
        case .client: return "CLIENT"
        case .vendeur: return "VENDEUR"
        }
    }
}
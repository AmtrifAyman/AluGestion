from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (TierViewSet, ProduitViewSet, FactureViewSet, 
                    LigneFactureViewSet, AchatViewSet, LigneAchatViewSet, 
                    PaiementViewSet, ChargeViewSet, ParametresSocieteViewSet)

router = DefaultRouter()
router.register('tiers', TierViewSet)
router.register('produits', ProduitViewSet)
router.register('factures', FactureViewSet)
router.register('lignes-facture', LigneFactureViewSet)
router.register('achats', AchatViewSet)
router.register('lignes-achat', LigneAchatViewSet)
router.register('paiements', PaiementViewSet)
router.register('charges', ChargeViewSet)
router.register('parametres', ParametresSocieteViewSet)

urlpatterns = [
    path('api/', include(router.urls)), # URL dyalk hya localhost:8000/api/tiers ...
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
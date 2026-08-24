from rest_framework import viewsets
from .models import Tier, Produit, Facture, LigneFacture, Achat, LigneAchat, Paiement, Charge, ParametresSociete
from .serializers import (TierSerializer, ProduitSerializer, FactureSerializer, 
                          LigneFactureSerializer, AchatSerializer, LigneAchatSerializer, 
                          PaiementSerializer, ChargeSerializer, ParametresSocieteSerializer)

class TierViewSet(viewsets.ModelViewSet):
    queryset = Tier.objects.all().order_by('-created_at')
    serializer_class = TierSerializer

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all().order_by('-created_at')
    serializer_class = ProduitSerializer

class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all().order_by('-date_facture')
    serializer_class = FactureSerializer

class LigneFactureViewSet(viewsets.ModelViewSet):
    queryset = LigneFacture.objects.all()
    serializer_class = LigneFactureSerializer

class AchatViewSet(viewsets.ModelViewSet):
    queryset = Achat.objects.all().order_by('-date_achat')
    serializer_class = AchatSerializer

class LigneAchatViewSet(viewsets.ModelViewSet):
    queryset = LigneAchat.objects.all()
    serializer_class = LigneAchatSerializer

class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all().order_by('-date_paiement')
    serializer_class = PaiementSerializer

class ChargeViewSet(viewsets.ModelViewSet):
    queryset = Charge.objects.all().order_by('-date_charge')
    serializer_class = ChargeSerializer

class ParametresSocieteViewSet(viewsets.ModelViewSet):
    queryset = ParametresSociete.objects.all()
    serializer_class = ParametresSocieteSerializer
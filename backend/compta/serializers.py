from rest_framework import serializers
from django.db.models import Sum
from .models import Tier, Produit, Facture, LigneFacture, Achat, LigneAchat, Paiement, Charge, ParametresSociete

class TierSerializer(serializers.ModelSerializer):
    solde = serializers.SerializerMethodField()

    class Meta:
        model = Tier
        fields = '__all__'

    def get_solde(self, obj):
        total_paiements = Paiement.objects.filter(tier=obj).aggregate(total=Sum('montant'))['total'] or 0.0
        
        if obj.type_tier == 'CLIENT':
            # Solde = Total dyal ga3 l'TTC dyal l'factures - X7al Khles
            total_ttc = Facture.objects.filter(client=obj).aggregate(total=Sum('montant_ttc'))['total'] or 0.0
            return round(float(total_ttc) - float(total_paiements), 2)
            
        elif obj.type_tier == 'FOURNISSEUR':
            total_ttc = Achat.objects.filter(fournisseur=obj).aggregate(total=Sum('montant_ttc'))['total'] or 0.0
            return round(float(total_ttc) - float(total_paiements), 2)
            
        return 0.00

class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = '__all__'

class LigneFactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneFacture
        fields = '__all__'
        read_only_fields = ['total'] # Had l'champ kayt7seb bo7do f models.py

class FactureSerializer(serializers.ModelSerializer):
    lignes = LigneFactureSerializer(many=True, required=False)

    class Meta:
        model = Facture
        fields = '__all__'
        read_only_fields = ['montant_ht', 'montant_tva', 'montant_ttc'] # Hado kayt7esbo b l'signals

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        facture = Facture.objects.create(**validated_data)
        
        for ligne in lignes_data:
            LigneFacture.objects.create(facture=facture, **ligne)
            
        facture.refresh_from_db() # Nrécupériw l'facture jdida mn db ba3d ma l'signals 7esbo l'totals
        return facture

class LigneAchatSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneAchat
        fields = '__all__'
        read_only_fields = ['total']

class AchatSerializer(serializers.ModelSerializer):
    lignes = LigneAchatSerializer(many=True, required=False)

    class Meta:
        model = Achat
        fields = '__all__'
        read_only_fields = ['montant_ht', 'montant_tva', 'montant_ttc']

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        achat = Achat.objects.create(**validated_data)
        
        for ligne in lignes_data:
            LigneAchat.objects.create(achat=achat, **ligne)
            
        achat.refresh_from_db()
        return achat

class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'

class ChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Charge
        fields = '__all__'

class ParametresSocieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametresSociete
        fields = '__all__'
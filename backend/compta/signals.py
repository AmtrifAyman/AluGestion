from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from django.db.models import Sum
from .models import Facture, LigneFacture, Achat, LigneAchat, Produit

# === 1. MISE A JOUR AUTOMATIQUE DYAL L'FACTURE (HT, TVA, TTC) ===
def recalculer_totaux_facture(facture):
    # Njm3o total dyal sl3a li f l'facture
    total_brut = facture.lignes.aggregate(total=Sum('total'))['total'] or 0.0
    total_brut = float(total_brut)
    
    remise = float(facture.valeur_remise or 0)
    montant_ht = total_brut
    
    if facture.type_remise == 'POURCENTAGE':
        montant_ht = total_brut - (total_brut * (remise / 100.0))
    elif facture.type_remise == 'MONTANT':
        montant_ht = total_brut - remise
        
    if facture.avec_tva:
        montant_tva = montant_ht * 0.20 # TVA 20%
        montant_ttc = montant_ht + montant_tva
    else:
        montant_tva = 0.0
        montant_ttc = montant_ht
        
    # Nst3mlo update() bax manb9awx n3iyto l save() w ndiro boucle infinie
    Facture.objects.filter(id=facture.id).update(
        montant_ht=montant_ht,
        montant_tva=montant_tva,
        montant_ttc=montant_ttc
    )

# Mli tzad wla tmsse7 chi Ligne, n3awdo n7esbo l'Facture
@receiver([post_save, post_delete], sender=LigneFacture)
def signal_maj_facture(sender, instance, **kwargs):
    recalculer_totaux_facture(instance.facture)

# Mli tbdel Remise wla TVA f l'Facture brassha, n3awdo n7esbo
@receiver(post_save, sender=Facture)
def signal_maj_facture_direct(sender, instance, **kwargs):
    recalculer_totaux_facture(instance)


# === 2. MISE A JOUR STOCK B LES VENTES ===
@receiver(post_save, sender=LigneFacture)
def maj_stock_vente_add(sender, instance, created, **kwargs):
    if created:
        Produit.objects.filter(id=instance.produit.id).update(quantite_stock=models.F('quantite_stock') - instance.quantite)

@receiver(post_delete, sender=LigneFacture)
def maj_stock_vente_delete(sender, instance, **kwargs):
    Produit.objects.filter(id=instance.produit.id).update(quantite_stock=models.F('quantite_stock') + instance.quantite)


# === 3. MISE A JOUR AUTOMATIQUE DYAL L'ACHAT (HT, TVA, TTC) ===
def recalculer_totaux_achat(achat):
    montant_ht = achat.lignes.aggregate(total=Sum('total'))['total'] or 0.0
    montant_ht = float(montant_ht)
    
    if achat.avec_tva:
        montant_tva = montant_ht * 0.20
        montant_ttc = montant_ht + montant_tva
    else:
        montant_tva = 0.0
        montant_ttc = montant_ht
        
    Achat.objects.filter(id=achat.id).update(
        montant_ht=montant_ht,
        montant_tva=montant_tva,
        montant_ttc=montant_ttc
    )

@receiver([post_save, post_delete], sender=LigneAchat)
def signal_maj_achat(sender, instance, **kwargs):
    recalculer_totaux_achat(instance.achat)

@receiver(post_save, sender=Achat)
def signal_maj_achat_direct(sender, instance, **kwargs):
    recalculer_totaux_achat(instance)


# === 4. MISE A JOUR STOCK B LES ACHATS ===
@receiver(post_save, sender=LigneAchat)
def maj_stock_achat_add(sender, instance, created, **kwargs):
    if created:
        Produit.objects.filter(id=instance.produit.id).update(quantite_stock=models.F('quantite_stock') + instance.quantite)

@receiver(post_delete, sender=LigneAchat)
def maj_stock_achat_delete(sender, instance, **kwargs):
    Produit.objects.filter(id=instance.produit.id).update(quantite_stock=models.F('quantite_stock') - instance.quantite)
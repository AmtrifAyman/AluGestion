from django.db import models
from django.db.models import Q


# ==========================================
# 1. TABLE DYAL CLIENTS W FOURNISSEURS (TIERS)
# ==========================================
class Tier(models.Model):
    TYPE_CHOICES = (
        ('CLIENT', 'Client'),
        ('FOURNISSEUR', 'Fournisseur'),
    )
    nom = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    ice = models.CharField(max_length=50, blank=True, null=True)
    type_tier = models.CharField(max_length=15, choices=TYPE_CHOICES, default='CLIENT')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} ({self.type_tier})"




# ==========================================
# 2. TABLE DYAL PRODUITS / STOCK
# ==========================================
class Produit(models.Model):
    designation = models.CharField(max_length=255)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantite_stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.designation



# ==========================================
# 3. GESTION DES VENTES (FACTURES CLIENTS)
# ==========================================
class Facture(models.Model):
    TYPE_REMISE = (('AUCUNE', 'Aucune'), ('POURCENTAGE', 'Pourcentage (%)'), ('MONTANT', 'Montant Fixe (DH)'))
    
    numero_facture = models.CharField(max_length=50, unique=True, blank=True, null=True)
    client = models.ForeignKey(Tier, on_delete=models.CASCADE, limit_choices_to={'type_tier': 'CLIENT'})
    date_facture = models.DateField(auto_now_add=True)
    
    type_remise = models.CharField(max_length=15, choices=TYPE_REMISE, default='AUCUNE')
    valeur_remise = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    avec_tva = models.BooleanField(default=False)
    
    montant_ht = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    montant_tva = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    montant_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)


    def __str__(self):
        return f"Facture {self.id} - {self.client.nom}"


class LigneFacture(models.Model):
    facture = models.ForeignKey(Facture, related_name='lignes', on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)



# ==========================================
# 4. GESTION DES ACHATS (FOURNISSEURS)
# ==========================================
class Achat(models.Model):
    numero_facture = models.CharField(max_length=50, blank=True, null=True)
    fournisseur = models.ForeignKey(Tier, on_delete=models.CASCADE, limit_choices_to={'type_tier': 'FOURNISSEUR'})
    date_achat = models.DateField(auto_now_add=True)
    
    avec_tva = models.BooleanField(default=False)
    montant_ht = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    montant_tva = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    montant_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)


class LigneAchat(models.Model):
    achat = models.ForeignKey(Achat, related_name='lignes', on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2) # Prix d'achat unitaire
    total = models.DecimalField(max_digits=15, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)



# ==========================================
# 5. PAIEMENTS (L'flous li dakhla wla kharja)
# ==========================================
class Paiement(models.Model):
    MODE_CHOICES = (('ESPECE', 'Espèce'), ('CHEQUE', 'Chèque'), ('VIREMENT', 'Virement'))
    
    tier = models.ForeignKey(Tier, on_delete=models.CASCADE) # Klyan wla Fournisseur
    date_paiement = models.DateField(auto_now_add=True)
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='ESPECE')
    remarque = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.montant} DH - {self.tier.nom}"

# ==========================================
# 6. GESTION DES CHARGES (MASARIF SIMPLIFIÉS)
# ==========================================
class Charge(models.Model):
    designation = models.CharField(max_length=255) # Detail dyal lmasrouf
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    date_charge = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.designation} - {self.montant} DH"



# ==========================================
# 7. PARAMÈTRES DYAL L'APPLICATION
# ==========================================
class ParametresSociete(models.Model):
    CHOIX_TVA = (('OUI', 'Toujours'), ('NON', 'Jamais'), ('MIXTE', 'Au Choix'))
    
    tva_vente_mode = models.CharField(max_length=10, choices=CHOIX_TVA, default='MIXTE')
    tva_achat_mode = models.CharField(max_length=10, choices=CHOIX_TVA, default='MIXTE')
    taux_tva_defaut = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)
    
    def __str__(self):
        return "Paramètres de l'entreprise"
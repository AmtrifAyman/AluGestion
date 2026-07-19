from django.contrib import admin
from .models import Tier, Produit, Facture, LigneFacture, Achat, LigneAchat, Paiement, Charge, ParametresSociete

class LigneFactureInline(admin.TabularInline):
    model = LigneFacture
    extra = 1

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    inlines = [LigneFactureInline]
    readonly_fields = ('montant_ht', 'montant_tva', 'montant_ttc') # Mamno3 tmodifierhom b yddek

class LigneAchatInline(admin.TabularInline):
    model = LigneAchat
    extra = 1

@admin.register(Achat)
class AchatAdmin(admin.ModelAdmin):
    inlines = [LigneAchatInline]
    readonly_fields = ('montant_ht', 'montant_tva', 'montant_ttc') # Mamno3 tmodifierhom b yddek

admin.site.register(Tier)
admin.site.register(Produit)
admin.site.register(Paiement)
admin.site.register(Charge)
admin.site.register(ParametresSociete)
from django.apps import AppConfig

class ComptaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'compta' # Hna rdtha 'compta' blast 'api'

    def ready(self):
        # Hna kan-activiw l'signals dyal compta
        import compta.signals
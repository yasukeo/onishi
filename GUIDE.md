# Guide de prise en main — Équipe Onishi

Ce guide explique le quotidien sur l'**espace équipe** (`/admin`). Pas besoin d'être
technique.

---

## Se connecter

1. Allez sur **`/admin`** (lien « Accès staff » en bas du site).
2. **En production (Supabase) :** entrez votre **email** et **mot de passe** fournis par le gérant.
3. **En démo :** choisissez simplement un rôle (Gérant / Cuisine / Livreur).

Trois rôles :

| Rôle        | Peut faire                                                            |
| ----------- | -------------------------------------------------------------------- |
| **Gérant**  | Tout : commandes + **gestion du menu** + vue du jour                 |
| **Cuisine** | Traiter les commandes, voir la vue du jour                          |
| **Livreur** | Voir les commandes à livrer                                         |

---

## Traiter une commande

Tout se passe sur le **tableau des commandes** (page d'accueil de l'admin).

1. **Nouvelle commande = alerte.** Un carillon sonne et la carte clignote dans la colonne
   **« Nouvelle »**. (Le bouton 🔔 en haut à droite coupe/active le son. Le son
   nécessite un premier clic dans la page, sécurité du navigateur.)
2. Les commandes sont rangées en colonnes par statut :
   **Nouvelle → Confirmée → En préparation → En livraison → Livrée**.
3. Sur chaque carte, le bouton orange fait **passer la commande à l'étape suivante**.
   Le client voit le changement **en temps réel** sur son lien de suivi.
4. Cliquez le **numéro** (#…) pour ouvrir le **détail**.

### Sur la fiche détail

- **Faire avancer** : bouton « Passer à … », ou cliquez n'importe quel statut.
- **Imprimer le ticket** : bouton « Imprimer le ticket » (mise en page cuisine).
- **Livreur** (commandes en livraison) : saisissez le nom/identifiant du livreur.
- **Annuler** : bouton rouge « Annuler la commande » (le client est prévenu).
- **Historique** : l'horodatage de chaque changement de statut.

---

## Ajouter ou modifier un plat *(rôle Gérant)*

Menu latéral → **Gestion du menu**.

- **Ajouter** : bouton « + Ajouter » en face d'une catégorie → nom, prix, description → Enregistrer.
- **Modifier** : icône crayon ✏️ sur la ligne du plat.
- **Disponibilité** : l'icône œil 👁️ rend un plat indisponible (il reste affiché barré
  côté client, non commandable) — pratique en cas de rupture.
- **Supprimer** : icône corbeille 🗑️.

> **En mode démo**, ces changements restent dans votre navigateur. Une fois **Supabase
> connecté**, ils sont enregistrés et **visibles publiquement** immédiatement.

---

## Vue du jour

Menu latéral → **Vue du jour** : chiffre du jour, nombre de commandes, panier moyen,
répartition livraison / à emporter, et la liste des commandes du jour.

---

## Zone de livraison

Les quartiers livrés et leurs frais sont **configurables** (jamais codés en dur).

- **En production :** table `settings`, clé `livraison` (modifiable en SQL ou via un futur
  écran admin). Exemple de structure dans `supabase/migrations/0003_seed.sql`.
- **Valeurs par défaut :** Témara Centre (10 dh), Massira/Wifak (15 dh),
  Harhoura/Guich Oudaya (20 dh), minimum de commande 80 dh.

---

## Questions fréquentes

**Le son ne marche pas ?** Cliquez une fois dans la page : les navigateurs bloquent le son
tant qu'il n'y a pas eu d'interaction. Vérifiez aussi le bouton 🔔.

**Un client a perdu son lien de suivi ?** Le lien contient un identifiant unique. Retrouvez
sa commande par son **numéro** dans la vue du jour et confirmez son statut par téléphone.

**Réinitialiser la démo ?** Bouton « Réinit. démo » en haut du tableau (visible uniquement
en mode démo) : efface commandes et modifications de menu de test.

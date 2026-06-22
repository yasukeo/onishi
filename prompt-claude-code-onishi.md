# PROMPT — Plateforme Onishi : site + commande en ligne + back-office (à coller dans Claude Code)

## 0. Avant de commencer

### 0.1 Installe ces skills (tu as accès au terminal)

```bash
npx skills add anthropics/skills --skill frontend-design -a claude-code -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code -y
```

### 0.2 Statut du projet : ceci est une maquette de présentation, pas le produit final

Ce site sert à **pitcher le restaurant**, pas à servir de vraies commandes pour l'instant. Conséquence concrète : tu peux générer les photos de plats avec Higgsfield (description du style exact en section 8) pour peupler la maquette. Le menu fourni en section 6 est une reconstitution à partir de photos basse résolution du vrai menu papier — exact sur les catégories et la structure, approximatif sur certains intitulés/prix précis (marqués "à vérifier"). Avant toute mise en production réelle (vraies commandes, vrai paiement), il faudra : remplacer les photos générées par de vraies photos du restaurant, et faire valider le menu exact avec le client.

### 0.3 Décisions déjà prises (pas d'aller-retour possible, donc voici les choix par défaut — challenge-les seulement si tu vois un vrai problème technique)

- **Paiement v1 = à la livraison/au retrait (cash).** Le paiement en ligne (CMI, carte) est une phase 2 — conçois le schéma de données pour pouvoir l'ajouter sans tout refaire, mais ne le code pas maintenant.
- **Pas de réservation de table en v1.** Uniquement commande à emporter et en livraison.
- **Commande possible en invité** (nom, téléphone, adresse) — un compte client est optionnel, seulement utile pour retrouver son historique.
- **Zone de livraison configurable depuis l'admin** (liste de quartiers ou rayon en km), jamais codée en dur dans le frontend.
- **Supabase** pour tout : Postgres (menu, commandes), Auth (staff), Realtime (suivi de commande + notifications admin).

### 0.4 Comment je veux que tu travailles

Propose-moi d'abord un plan de design (palette, typo, layout, élément signature — voir section 9) ET un schéma de base de données (voir section 7) avant de coder. Auto-critique les deux : le design ressemble-t-il à un site de sushi générique (rouge/noir/dragon) ? Le schéma a-t-il des trous de sécurité (RLS) ? Corrige avant de continuer. Construis ensuite par blocs : d'abord le schéma Supabase + RLS, puis le site public, puis l'admin.

---

## 1. Le client : Onishi — Authentic Sushi

- Restaurant japonais/sushi à **Témara**, centre-ville. Coordonnées : 33.9407112, -6.8984887 — [lien Google Maps](https://www.google.com/maps/place/Onishi/@33.9406475,-6.8983935,18z/data=!4m6!3m5!1s0xda713b471b89103:0x35c222edc95891e6!8m2!3d33.9407112!4d-6.8984887!16s%2Fg%2F11t40f288g). Adresse exacte à compléter.
- Bien noté en ligne (4.3-4.4/5 sur plusieurs plateformes, une centaine d'avis) — réputé pour son rapport qualité-prix et son service. Panier moyen observé : 100-150 MAD/personne.
- Horaires rapportés par le gérant en réponse à un avis : **tous les jours de midi à minuit, sauf mardi (fermé)** — *à reconfirmer.*
- Ils ont leurs propres livreurs sur place → ce n'est pas qu'une vitrine, il faut un vrai système de commande + un back-office pour le traiter.
- Style de dressage réel observé sur photos : présentation sur plateau-bateau en bois, garnitures de fleurs comestibles, rolls légèrement flambés avec sauces en zigzag (mayo épicée, sauce anguille), nigiri sur ardoise noire, gunkan au tobiko coloré. C'est un positionnement plutôt haut de gamme pour Témara, pas un fast-food sushi.

## 2. Ce qu'on construit (un seul repo, deux espaces)

**A) Site public** — vitrine + menu + commande en ligne (panier, checkout, suivi de commande).
**B) Espace admin/employés** (`/admin`) — réception, traitement et gestion des commandes en temps réel, gestion du menu.

## 3. Identité de marque existante — palette extraite du vrai logo

- Terracotta `#DA693F` (fond dominant du logo)
- Crème chaud `#FFF5E6` (texte/wordmark)
- Wordmark fin et élégant, motif de vagues tone-on-tone en arrière-plan, petite icône minimaliste baguettes + maki
- Direction : chaleureux et raffiné. **PAS** le cliché rouge vif / noir / dragon / lanternes qu'on voit sur 90% des sites de sushi.

## 4. Stack technique imposée

- **Next.js 15** (App Router), **TypeScript** strict
- **Supabase** : Postgres + Auth (staff) + Realtime (suivi commande + notifications admin) — utilise le MCP Supabase si tu y as accès pour créer le projet et lancer les migrations
- **Tailwind v4**, **shadcn/ui**
- **Framer Motion** avec retenue — sur le tunnel de commande, la vitesse de lecture prime sur l'esthétique
- Gestion du panier : **Zustand** (ou Context simple), persistant en localStorage côté client
- Déploiement : **Vercel**

## 5. Carte du menu — structure réelle confirmée

Catégories confirmées en lisant les photos du vrai menu papier (fiabilité haute sur les noms de catégories) :

`Crunchy` · `Sushi pizza` · `Formules` · `Assortiments` · `Boxes` · `Nigiris` · `Maki` · `Gunkan` · `Sashimi` · `Chirashi` · `Tartares` · `California` · `Aromaki` · `Special Rolls` · `Delice Rolls` · `Boissons` · `Onishi Deals` (formules combo)

Deals confirmés avec prix lisibles sur la photo :
- **Deal Saumon 25pcs — 210 dhs**
- **Deal Oishi 20pcs — 180 dhs**
- (un 3ème deal "Tonno" existe, prix illisible sur la photo — à compléter)

Fourchette de prix générale observée : rolls/crunchy à l'unité **~75-95 dh**, formules combo **~180-210 dh**.

## 6. Données d'exemple pour peupler la maquette (reconstitution — à faire valider par le client avant mise en ligne réelle)

```
Crunchy
  - Crunchy Classic — 80 dh — saumon, fromage, panure croustillante
  - Crunchy Crevette — 95 dh — crevette tempura, sauce épicée, panure croustillante
  - Crunchy Spécial — 95 dh — saumon, avocat, fromage, panure, sauce maison

California
  - California Saumon — 85 dh — saumon, avocat, concombre, sésame
  - California Crevette — 85 dh — crevette, avocat, concombre
  - California Cream Cheese — 80 dh — saumon, cream cheese, ciboulette

Special Rolls
  - Roll Dragon — 110 dh — crevette tempura, avocat, sauce anguille, tobiko
  - Roll Volcano — 115 dh — saumon flambé, sauce épicée, oignons frits

Delice Rolls
  - Delice Saumon — 100 dh — saumon, fromage, sauce sucrée-épicée, fleurs comestibles

Nigiris (la pièce ou par paire)
  - Nigiri Saumon — 18 dh
  - Nigiri Thon — 22 dh
  - Nigiri Crevette — 18 dh

Maki
  - Maki Saumon (6pcs) — 45 dh
  - Maki Avocat (6pcs) — 35 dh

Gunkan
  - Gunkan Tobiko — 25 dh
  - Gunkan Saumon épicé — 28 dh

Sashimi
  - Sashimi Saumon (6pcs) — 70 dh
  - Sashimi Thon (6pcs) — 85 dh

Chirashi
  - Chirashi Saumon — 95 dh — bol de riz vinaigré, saumon, avocat, sésame

Tartares
  - Tartare Saumon Avocat — 75 dh

Boxes / Formules / Assortiments
  - Box Solo (12pcs) — 90 dh
  - Box Duo (24pcs) — 160 dh
  - Assortiment Découverte (18pcs) — 130 dh

Onishi Deals
  - Deal Saumon 25pcs — 210 dh — 6 California, 6 hosomaki saumon, nigiri, sushi
  - Deal Oishi 20pcs — 180 dh — California cream cheese, California avocat, nigiri saumon, crevette tempura

Boissons
  - Eau minérale — 15 dh
  - Soda — 15 dh
  - Thé glacé — 18 dh
```

## 7. Schéma de données Supabase

```
categories        (id, nom, ordre_affichage)
menu_items        (id, category_id, nom, description, prix, photo_url, disponible bool, options jsonb)
orders            (id, statut enum[nouvelle, confirmée, en_préparation, en_livraison, livrée, annulée],
                    type enum[livraison, emporter], client_nom, client_téléphone, adresse, notes,
                    total, livreur_id, créée_le)
order_items       (id, order_id, menu_item_id, quantité, prix_unitaire, options_choisies jsonb)
staff_users       (id, nom, rôle enum[admin, employé, livreur], lié à auth.users)
order_status_log  (id, order_id, statut, horodatage, changé_par)
```

**RLS non négociable** : un client anonyme peut *créer* une commande (insert) mais ne peut lire/modifier que la sienne (via un token/id renvoyé à la création). Le staff authentifié voit selon son rôle. Aucune table sans policy explicite. Pas de clé `service_role` côté client.

## 8. Visuels — Higgsfield autorisé pour cette maquette

Puisque c'est une maquette de présentation (section 0.2), génère les photos de plats avec Higgsfield (`nano_banana_pro`, format `4:3` ou `1:1` selon l'emplacement). Reste fidèle au style réel observé sur les photos du restaurant :

- Présentation sur plateau-bateau en bois OU ardoise noire selon le plat
- Garnitures de fleurs comestibles blanches, microgreens, sésame, tobiko coloré
- Rolls légèrement flambés/caramélisés avec sauces en zigzag (mayo épicée, sauce anguille sucrée)
- Éclairage chaud et ambiant, tons terracotta/ambre cohérents avec la marque
- Photographie culinaire professionnelle, peu de profondeur de champ, jamais de texte ni logo généré dans l'image

Le vrai logo est joint à ce prompt (`onishi-logo.png`) — à utiliser tel quel, jamais régénéré.

## 9. Site public — structure

- **Hero** — photo du plat signature, accroche, CTA "Commander en ligne"
- **Menu** — par catégories (section 5), filtrable, photos générées en attendant les vraies
- **Commande** — panier persistant → choix livraison/à emporter → formulaire client → récapitulatif → confirmation
- **Suivi de commande** — statut en temps réel (Supabase Realtime) via lien unique après confirmation
- **Localisation** — carte, horaires, lien Google Maps, téléphone
- **À propos / Contact**

## 10. Espace admin/employés (`/admin`) — structure

- **Connexion** via Supabase Auth, rôles admin / employé / livreur
- **Tableau de bord commandes** en temps réel, alerte visuelle+sonore sur nouvelle commande, vue kanban par statut
- **Détail commande** — changer le statut, historique, assigner un livreur, imprimer un ticket
- **Gestion du menu** — ajouter/modifier/désactiver un plat, prix, photo, disponibilité — réservé au rôle admin
- **Vue du jour** — nombre de commandes, chiffre du jour

## 11. Direction artistique

- Pars de la palette terracotta/crème existante. Garde le motif de vagues comme élément signature discret (fond de hero, séparateurs) — avec retenue.
- Typographie : un serif fin reprenant l'esprit du wordmark pour les titres/éditorial ; une sans-serif claire et dense pour le tunnel de commande et l'admin, où la lisibilité prime.
- Éviter : rouge vif saturé + noir, dragons, lanternes japonaises clichées, baguettes croisées en photo stock.
- **L'admin doit être visuellement sobre** — un employé doit lire une commande en 2 secondes en cuisine.

## 12. Exigences qualité non négociables

- Performance mobile prioritaire — la majorité des commandes viendront du mobile, parfois en 3G/4G.
- Mobile-first absolu sur le site public.
- Accessibilité standard (focus clavier, contrastes, `prefers-reduced-motion`).
- Sécurité : RLS systématique, variables d'environnement pour les clés Supabase, jamais de clé sensible côté client.

## 13. Livrable attendu

- Repo Next.js avec les deux espaces (`/` public et `/admin`)
- Migrations SQL Supabase (schéma + policies RLS)
- Mini guide de prise en main : comment ajouter un plat, comment traiter une commande

---

**Note pour Claude Code** : commence par le schéma Supabase + RLS et le plan de design (section 0.4), présente les deux avant de coder. Le menu (section 6) est une reconstitution à faire valider par le client — utilise-le tel quel pour la maquette, mais signale clairement dans le repo (README) qu'il doit être vérifié avant toute mise en production réelle.

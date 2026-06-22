# Onishi — Authentic Sushi · Plateforme de commande

Site vitrine + commande en ligne + back-office pour **Onishi**, restaurant japonais à
Témara. Un seul repo Next.js, deux espaces : le **site public** (`/`) et l'**espace
équipe** (`/admin`).

> ⚠️ **Maquette de présentation.** Ce projet sert à *pitcher* le restaurant.
> Avant toute mise en production réelle (vraies commandes, paiement) :
> 1. **Faire valider le menu** (section [« Menu à valider »](#menu--reconstitution-à-valider)) — les intitulés/prix sont une reconstitution à partir de photos du menu papier.
> 2. **Remplacer les photos** par de vraies photos du restaurant (ou des visuels Higgsfield validés).
> 3. **Connecter Supabase** pour activer le vrai backend (voir [« Passer en mode Supabase »](#passer-en-mode-supabase)).

---

## Démarrage rapide (mode démo, sans backend)

```bash
npm install
npm run dev
```

Ouvrez **http://localhost:3000**.

Sans variables d'environnement, l'app tourne en **mode démo** :

- Le menu vient d'un seed local.
- Les commandes sont stockées **dans le navigateur** (localStorage) — aucun paiement, aucune donnée envoyée.
- Le **suivi temps réel** et le **dashboard admin** se synchronisent entre onglets
  (via `BroadcastChannel`). Idéal pour démontrer le parcours complet.

### Démo de bout en bout en 30 secondes

1. Onglet A : `/menu` → ajoutez des plats → `/panier` → **Passer la commande** → remplissez → **Confirmer**.
   Vous arrivez sur la page de **suivi temps réel**.
2. Onglet B : `/admin` → choisissez le rôle **Gérant** → la commande apparaît dans la
   colonne « Nouvelle » (avec **alerte sonore**). Faites-la avancer de statut.
3. Revenez à l'onglet A : le suivi se met à jour **en direct**.

---

## Stack

- **Next.js 15** (App Router) · **TypeScript** strict
- **Tailwind v4** · composants UI maison (style shadcn, sans dépendance lourde)
- **Zustand** (panier persistant en localStorage)
- **Framer Motion** (animations sobres, `prefers-reduced-motion` respecté)
- **Supabase** : Postgres + Auth (staff) + Realtime — *optionnel en démo, requis en prod*
- **lucide-react** (icônes) · **Vercel** (déploiement)

---

## Structure

```
app/
  (site)/            Site public (header/footer partagés)
    page.tsx         Accueil (hero signature, deals, sélection)
    menu/            Carte filtrable + ajout panier
    panier/          Panier
    commande/        Checkout : livraison/emporter → formulaire → confirmation
    suivi/[token]/   Suivi de commande temps réel (lien unique)
    localisation/    Carte, horaires, zone de livraison, contact
    a-propos/        Histoire & valeurs
  admin/
    login/           Connexion (rôles en démo, email/mot de passe avec Supabase)
    page.tsx         Tableau kanban temps réel + alerte sonore/visuelle
    commandes/[id]/  Détail commande : statut, historique, livreur, impression ticket
    menu/            Gestion du menu (rôle admin)
    jour/            Vue du jour : chiffre, nombre de commandes, panier moyen
lib/
  data/              Couche données unifiée (Supabase OU démo localStorage)
  store/cart.ts      Panier Zustand
  supabase/          Clients navigateur + serveur, détection de config
  auth.tsx           Contexte d'auth staff (Supabase / démo)
  types.ts           Types alignés sur le schéma
components/          UI, marque, site, admin
supabase/migrations/ SQL : schéma + RLS + seed + bootstrap admin
```

---

## Direction artistique

Palette **extraite du vrai logo** — terracotta `#DA693F`, crème `#FFF5E6`, neutres chauds
(jamais de noir pur). Titres en **serif fin** (Cormorant Garamond, esprit du wordmark) ;
**sans dense** (Inter) pour le tunnel de commande et l'admin où la lisibilité prime.
Élément signature : le **motif de vagues** du logo, repris en SVG (hero, séparateurs).
Aucun cliché rouge vif / dragon / lanterne. L'admin est volontairement **sobre et
contrasté** : une commande se lit en 2 secondes en cuisine.

---

## Passer en mode Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Copiez `.env.example` → `.env.local` et renseignez :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Dans le **SQL Editor** de Supabase, exécutez dans l'ordre les fichiers de
   `supabase/migrations/` :
   - `0001_schema.sql` — tables, enums, triggers, realtime
   - `0002_rls.sql` — **Row Level Security** (obligatoire)
   - `0003_seed.sql` — catégories + menu d'exemple + réglages livraison
   - `0004_admin_bootstrap.sql` — fonction `make_staff(...)`
4. Créez les comptes staff (**Authentication → Add user**) puis promouvez-les :
   ```sql
   select make_staff('admin@onishi.ma',   'Gérant',  'admin');
   select make_staff('cuisine@onishi.ma', 'Cuisine', 'employe');
   ```
5. Relancez `npm run dev`. L'app bascule automatiquement sur Supabase
   (la bannière « mode démo » disparaît, l'admin demande email/mot de passe).

> Si vous avez accès au **MCP Supabase** dans Claude Code, vous pouvez créer le projet
> et appliquer ces migrations directement (`apply_migration`).

### Sécurité (RLS) — résumé

- Un **client anonyme** peut *créer* une commande, mais ne lit **que la sienne**, via une
  fonction `get_order_by_token()` (token UUID non devinable). Il ne peut jamais lister les
  commandes des autres.
- Le **staff authentifié** accède selon son rôle (`admin` / `employe` / `livreur`).
- Aucune table sans policy. La clé `service_role` n'est **jamais** côté client.
- Le **paiement** est à la livraison/au retrait (cash) en v1 ; le schéma prévoit déjà les
  champs (`mode_paiement`, `paiement_statut`) pour ajouter le paiement en ligne sans tout refaire.

---

## Photos des plats (Higgsfield)

La maquette est livrée avec **29 photos générées via Higgsfield** (`nano_banana_pro`,
4:3) dans **`public/plats/`**, fidèles au style réel : plateau-bateau en bois ou ardoise
noire, fleurs comestibles, rolls flambés à sauces en zigzag, éclairage chaud terracotta,
sans aucun texte ni logo. Elles sont câblées via `photo_url` dans `lib/menu-data.ts`
(mode démo) et `0003_seed.sql` (Supabase).

> ⚠️ **Ce sont des visuels de présentation.** Avant la mise en production, **remplacez-les
> par de vraies photos du restaurant** : déposez les fichiers dans `public/plats/` (mêmes
> noms) ou pointez `photo_url` vers Supabase Storage. Le placeholder brandé reste le filet
> de sécurité si une photo manque.

**Le logo (`public/logo.webp`) est le vrai logo — ne jamais le régénérer.**

---

## Guide de prise en main (équipe)

➡️ Voir **[GUIDE.md](GUIDE.md)** : comment ajouter un plat, traiter une commande,
imprimer un ticket, configurer la zone de livraison.

---

## Menu : reconstitution à valider

Le menu (`lib/menu-data.ts` et `supabase/migrations/0003_seed.sql`) est une
**reconstitution** à partir de photos basse résolution du menu papier. Catégories et
structure fiables ; **certains intitulés et prix sont approximatifs** et doivent être
confirmés par le client avant mise en ligne. Quelques points à reconfirmer :
les horaires, le 3ᵉ Onishi Deal (« Tonno »), l'adresse exacte et le téléphone.

---

## Scripts

| Commande         | Effet                                  |
| ---------------- | -------------------------------------- |
| `npm run dev`    | Développement (http://localhost:3000)  |
| `npm run build`  | Build de production                    |
| `npm run start`  | Sert le build de production            |

## Déploiement (Vercel)

Importez le repo sur Vercel, ajoutez les variables `NEXT_PUBLIC_SUPABASE_*` (Production),
déployez. Pensez à configurer les URLs de redirection Auth dans Supabase.

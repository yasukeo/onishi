-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0003_seed.sql
-- Données d'exemple (brief section 6). RECONSTITUTION à faire VALIDER par
-- le client avant toute mise en production. Prix/intitulés approximatifs.
-- Idempotent : on peut le rejouer sans dupliquer.
-- ════════════════════════════════════════════════════════════════════

-- ── Catégories (ordre = ordre du menu papier, brief section 5) ──────
insert into categories (slug, nom, ordre_affichage) values
  ('onishi-deals',  'Onishi Deals',  1),
  ('crunchy',       'Crunchy',       2),
  ('sushi-pizza',   'Sushi Pizza',   3),
  ('formules',      'Formules',      4),
  ('assortiments',  'Assortiments',  5),
  ('boxes',         'Boxes',         6),
  ('california',    'California',     7),
  ('special-rolls', 'Special Rolls', 8),
  ('delice-rolls',  'Delice Rolls',  9),
  ('aromaki',       'Aromaki',       10),
  ('maki',          'Maki',          11),
  ('nigiris',       'Nigiris',       12),
  ('gunkan',        'Gunkan',        13),
  ('sashimi',       'Sashimi',       14),
  ('chirashi',      'Chirashi',      15),
  ('tartares',      'Tartares',      16),
  ('boissons',      'Boissons',      17)
on conflict (slug) do update set nom = excluded.nom, ordre_affichage = excluded.ordre_affichage;

-- ── Helper local : insert d'un plat par slug de catégorie ───────────
do $$
declare c_id uuid;
  function_marker text := 'seed';
begin
  -- ONISHI DEALS
  select id into c_id from categories where slug = 'onishi-deals';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Deal Saumon 25 pcs', '6 California, 6 hosomaki saumon, nigiris, sushis', 210, 1),
    (c_id, 'Deal Oishi 20 pcs', 'California cream cheese, California avocat, nigiri saumon, crevette tempura', 180, 2),
    (c_id, 'Deal Tonno', 'Combo thon — composition à confirmer avec le client', 190, 3)
  on conflict do nothing;

  -- CRUNCHY
  select id into c_id from categories where slug = 'crunchy';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Crunchy Classic', 'Saumon, fromage, panure croustillante', 80, 1),
    (c_id, 'Crunchy Crevette', 'Crevette tempura, sauce épicée, panure croustillante', 95, 2),
    (c_id, 'Crunchy Spécial', 'Saumon, avocat, fromage, panure, sauce maison', 95, 3)
  on conflict do nothing;

  -- CALIFORNIA
  select id into c_id from categories where slug = 'california';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'California Saumon', 'Saumon, avocat, concombre, sésame', 85, 1),
    (c_id, 'California Crevette', 'Crevette, avocat, concombre', 85, 2),
    (c_id, 'California Cream Cheese', 'Saumon, cream cheese, ciboulette', 80, 3)
  on conflict do nothing;

  -- SPECIAL ROLLS
  select id into c_id from categories where slug = 'special-rolls';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Roll Dragon', 'Crevette tempura, avocat, sauce anguille, tobiko', 110, 1),
    (c_id, 'Roll Volcano', 'Saumon flambé, sauce épicée, oignons frits', 115, 2)
  on conflict do nothing;

  -- DELICE ROLLS
  select id into c_id from categories where slug = 'delice-rolls';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Delice Saumon', 'Saumon, fromage, sauce sucrée-épicée, fleurs comestibles', 100, 1)
  on conflict do nothing;

  -- NIGIRIS
  select id into c_id from categories where slug = 'nigiris';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Nigiri Saumon', 'À la pièce', 18, 1),
    (c_id, 'Nigiri Thon', 'À la pièce', 22, 2),
    (c_id, 'Nigiri Crevette', 'À la pièce', 18, 3)
  on conflict do nothing;

  -- MAKI
  select id into c_id from categories where slug = 'maki';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Maki Saumon', '6 pcs', 45, 1),
    (c_id, 'Maki Avocat', '6 pcs', 35, 2)
  on conflict do nothing;

  -- GUNKAN
  select id into c_id from categories where slug = 'gunkan';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Gunkan Tobiko', 'Tobiko coloré', 25, 1),
    (c_id, 'Gunkan Saumon épicé', 'Saumon, sauce épicée', 28, 2)
  on conflict do nothing;

  -- SASHIMI
  select id into c_id from categories where slug = 'sashimi';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Sashimi Saumon', '6 pcs', 70, 1),
    (c_id, 'Sashimi Thon', '6 pcs', 85, 2)
  on conflict do nothing;

  -- CHIRASHI
  select id into c_id from categories where slug = 'chirashi';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Chirashi Saumon', 'Bol de riz vinaigré, saumon, avocat, sésame', 95, 1)
  on conflict do nothing;

  -- TARTARES
  select id into c_id from categories where slug = 'tartares';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Tartare Saumon Avocat', 'Saumon frais, avocat, assaisonnement maison', 75, 1)
  on conflict do nothing;

  -- BOXES / FORMULES / ASSORTIMENTS
  select id into c_id from categories where slug = 'boxes';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Box Solo', '12 pcs', 90, 1),
    (c_id, 'Box Duo', '24 pcs', 160, 2)
  on conflict do nothing;

  select id into c_id from categories where slug = 'assortiments';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Assortiment Découverte', '18 pcs — sélection du chef', 130, 1)
  on conflict do nothing;

  -- BOISSONS
  select id into c_id from categories where slug = 'boissons';
  insert into menu_items (category_id, nom, description, prix, ordre_affichage) values
    (c_id, 'Eau minérale', '50 cl', 15, 1),
    (c_id, 'Soda', 'Canette 33 cl', 15, 2),
    (c_id, 'Thé glacé', 'Maison', 18, 3)
  on conflict do nothing;
end $$;

-- ── Réglages par défaut : zone de livraison (modifiable depuis l'admin) ──
insert into settings (cle, valeur) values
  ('livraison', jsonb_build_object(
    'frais_par_defaut', 15,
    'minimum_commande', 80,
    'quartiers', jsonb_build_array(
      jsonb_build_object('nom', 'Témara Centre',   'frais', 10),
      jsonb_build_object('nom', 'Massira',          'frais', 15),
      jsonb_build_object('nom', 'Wifak',            'frais', 15),
      jsonb_build_object('nom', 'Harhoura',         'frais', 20),
      jsonb_build_object('nom', 'Guich Oudaya',     'frais', 20)
    )
  )),
  ('horaires', jsonb_build_object(
    'texte', 'Tous les jours de 12h à minuit — fermé le mardi (à reconfirmer)',
    'ferme_le', 'mardi'
  ))
on conflict (cle) do nothing;

-- ── Photos de la maquette (générées Higgsfield, livrées dans public/plats/) ──
-- ⚠️ À remplacer par de vraies photos du restaurant avant mise en production.
update menu_items m set photo_url = '/plats/' || p.slug || '.png'
from (values
  ('Deal Saumon 25 pcs','deal-saumon'),
  ('Deal Oishi 20 pcs','deal-oishi'),
  ('Deal Tonno','deal-tonno'),
  ('Crunchy Classic','crunchy-classic'),
  ('Crunchy Crevette','crunchy-crevette'),
  ('Crunchy Spécial','crunchy-special'),
  ('California Saumon','california-saumon'),
  ('California Crevette','california-crevette'),
  ('California Cream Cheese','california-cream-cheese'),
  ('Roll Dragon','roll-dragon'),
  ('Roll Volcano','roll-volcano'),
  ('Delice Saumon','delice-saumon'),
  ('Box Solo','box-solo'),
  ('Box Duo','box-duo'),
  ('Assortiment Découverte','assortiment-decouverte'),
  ('Nigiri Saumon','nigiri-saumon'),
  ('Nigiri Thon','nigiri-thon'),
  ('Nigiri Crevette','nigiri-crevette'),
  ('Maki Saumon','maki-saumon'),
  ('Maki Avocat','maki-avocat'),
  ('Gunkan Tobiko','gunkan-tobiko'),
  ('Gunkan Saumon épicé','gunkan-saumon-epice'),
  ('Sashimi Saumon','sashimi-saumon'),
  ('Sashimi Thon','sashimi-thon'),
  ('Chirashi Saumon','chirashi-saumon'),
  ('Tartare Saumon Avocat','tartare-saumon-avocat'),
  ('Eau minérale','eau-minerale'),
  ('Soda','soda'),
  ('Thé glacé','the-glace')
) as p(nom, slug)
where m.nom = p.nom;

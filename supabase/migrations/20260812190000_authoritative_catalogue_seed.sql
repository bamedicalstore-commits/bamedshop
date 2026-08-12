-- BA MEDICAL STORE — authoritative catalogue seed
-- Sources: uploaded supplier price lists dated 2024-08 (Pharmatec)
-- and Rossmax supplier price list (uploaded 2026-07-07).
-- IMPORTANT: imported rows are intentionally INACTIVE. The source prices are supplier/PV HT
-- values, not validated BA Medical Store public retail prices. No fabricated retail price is used.

INSERT INTO public.suppliers (name, country)
VALUES ('Pharmatec', 'Tunisie'), ('Rossmax', 'Suisse')
ON CONFLICT DO NOTHING;

INSERT INTO public.brands (name, slug, ce_certified)
VALUES
  ('Rossmax', 'rossmax', true),
  ('Bionime', 'bionime', true),
  ('Sterilance', 'sterilance', true),
  ('Mission', 'mission', true),
  ('Clickfine', 'clickfine', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug)
VALUES
  ('Diagnostic médical', 'diagnostic-medical'),
  ('Diabète & surveillance glycémique', 'diabete-surveillance-glycemique'),
  ('Nébulisation & respiration', 'nebulisation-respiration'),
  ('Thermométrie', 'thermometrie'),
  ('Oxymétrie', 'oxymetrie'),
  ('Soins & consommables', 'soins-consommables'),
  ('Mobilité & maintien à domicile', 'mobilite-maintien-domicile'),
  ('Maternité & allaitement', 'maternite-allaitement')
ON CONFLICT (slug) DO NOTHING;

-- Rossmax source catalogue: LISTE DES PRIX ROSSMAX (1).pdf
INSERT INTO public.products
  (name, slug, description, sku, category_id, brand_id, supplier_id, price, currency,
   ce_certified, warranty_months, technical_specs, active)
SELECT v.name,
       v.slug,
       v.name,
       v.sku,
       c.id,
       b.id,
       s.id,
       v.source_price_ht,
       'TND',
       true,
       0,
       jsonb_build_object(
         'catalog_status', 'source_import_unpriced',
         'source_document', 'LISTE DES PRIX ROSSMAX (1).pdf',
         'source_price_type', 'PV_HT',
         'source_vat_percent', v.source_vat,
         'source_uploaded_at', '2026-07-07'
       ),
       false
FROM (VALUES
  ('AM30','rossmax-am30','MATELAS A BULLE D''AIR','AM30','mobilite-maintien-domicile',135.000,7),
  ('AM40','rossmax-am40','MATELAS A CELLULE D''AIR','AM40','mobilite-maintien-domicile',300.000,7),
  ('NA100','rossmax-na100','NEBULISEUR A PISTON AVEC BOITIER DE RANGEMENT','NA100','nebulisation-respiration',105.000,7),
  ('NL100','rossmax-nl100','NEBULISEUR A PISTON','NL100','nebulisation-respiration',85.000,7),
  ('AS175-S','rossmax-as175-s','CHAMBRE D''INHALATION SMALL','AS175-S','nebulisation-respiration',32.000,7),
  ('AS175-M','rossmax-as175-m','CHAMBRE D''INHALATION MOYEN','AS175-M','nebulisation-respiration',32.000,7),
  ('AS175-L','rossmax-as175-l','CHAMBRE D''INHALATION LARGE','AS175-L','nebulisation-respiration',32.000,7),
  ('CUFF-S','rossmax-cuff-s','BRASSARD SMALL','CUFF-S','diagnostic-medical',33.000,7),
  ('CUFF','rossmax-cuff','BRASSARD UNIVERSEL','CUFF','diagnostic-medical',33.000,7),
  ('CUFF-L','rossmax-cuff-l','BRASSARD LARGE','CUFF-L','diagnostic-medical',33.000,7),
  ('CUFF-M','rossmax-cuff-m','BRASSARD MOYEN','CUFF-M','diagnostic-medical',33.000,7),
  ('EB100','rossmax-eb100','STETHOSCOPE TETE UNIQUE','EB100','diagnostic-medical',13.000,7),
  ('EB500','rossmax-eb500','STETHOSCOPE DUAL HEAD','EB500','diagnostic-medical',54.000,7),
  ('MW701F','rossmax-mw701f','TENSIOMETRE BRASSARD AUTOMATIQUE','MW701F','diagnostic-medical',160.000,7),
  ('NEBACC','rossmax-nebacc','ACCESSOIRE NEBULISEUR N1','NEBACC','nebulisation-respiration',16.500,7),
  ('S150','rossmax-s150','TENSIOMETRE ELECTRONIQUE AU POIGNET','S150','diagnostic-medical',78.000,7),
  ('SA310','rossmax-sa310','Fingertip Pulse Oximeters And Parts','SA310','oxymetrie',850.000,7),
  ('SB100','rossmax-sb100','OXYMETRE DE POULS ROSSMAX','SB100','oxymetrie',108.000,7),
  ('TG100','rossmax-tg100','THERMOMETRE RIGIDE','TG100','thermometrie',6.000,19),
  ('V3','rossmax-v3','UNITE D''ASPIRATION','V3','nebulisation-respiration',350.000,7),
  ('WB101','rossmax-wb101','PESE PERSONNE','WB101','mobilite-maintien-domicile',69.000,19),
  ('X3','rossmax-x3','TENSIOMETRE ELECTRONIQUE MOYEN ECRAN','X3','diagnostic-medical',108.000,7),
  ('Z1','rossmax-z1','TENSIOMETRE ELECTRONIQUE AVEC CABLE USB','Z1','diagnostic-medical',90.000,7),
  ('BP5','rossmax-bp5','Tire lait électrique Rossmax','BP5','maternite-allaitement',180.000,7),
  ('TG380','rossmax-tg380','THERMOMETRE FLEXIBLE','TG380','thermometrie',11.000,19)
) AS v(label, slug, name, sku, category_slug, source_price_ht, source_vat)
JOIN public.categories c ON c.slug = v.category_slug
JOIN public.brands b ON b.slug = 'rossmax'
JOIN public.suppliers s ON s.name = 'Rossmax'
ON CONFLICT (sku) DO NOTHING;

-- Pharmatec source catalogue: LISTE DES PRIX PHARMATEC_ (2).pdf — MAJ AOUT 2024
INSERT INTO public.products
  (name, slug, description, sku, category_id, brand_id, supplier_id, price, currency,
   ce_certified, warranty_months, technical_specs, active)
SELECT v.name,
       v.slug,
       v.name,
       v.sku,
       c.id,
       CASE WHEN v.brand_slug IS NULL THEN NULL ELSE b.id END,
       s.id,
       v.source_price_ht,
       'TND',
       true,
       0,
       jsonb_build_object(
         'catalog_status', 'source_import_unpriced',
         'source_document', 'LISTE DES PRIX PHARMATEC_ (2).pdf',
         'source_document_date', '2024-08',
         'source_price_type', 'PU_HT',
         'source_vat_percent', v.source_vat,
         'source_uploaded_at', '2026-07-07'
       ),
       false
FROM (VALUES
  ('GM550-21F','bionime-gm550-21f','LECTEUR DE GLYCEMIE BIONIME GM550','GM550-21F','diabete-surveillance-glycemique','bionime',22.000,0),
  ('GM550-03F','bionime-gm550-03f','COFFRET BIONIME (2 BD50UI + LECTEUR GRATUIT)','GM550-03F','diabete-surveillance-glycemique','bionime',75.500,0),
  ('GS550-02F','bionime-gs550-02f','BOITE DE BANDELETTES (25 UI)','GS550-02F','diabete-surveillance-glycemique','bionime',19.000,0),
  ('GS550-05F','bionime-gs550-05f','BOITE DE BANDELETTES (50 UI)','GS550-05F','diabete-surveillance-glycemique','bionime',36.000,0),
  ('GS550-0AF','bionime-gs550-0af','BOITE DE BANDELETTES (100 UI)','GS550-0AF','diabete-surveillance-glycemique','bionime',66.000,0),
  ('10-0111','sterilance-10-0111','STERILANCE LAME BISTOURI CHIRURGICALE N°11-100 Lames/pack','10-0111','soins-consommables','sterilance',18.000,7),
  ('10-0115','sterilance-10-0115','STERILANCE LAME BISTOURI CHIRURGICALE N°15-100 Lames/pack','10-0115','soins-consommables','sterilance',18.000,7),
  ('10-0123','sterilance-10-0123','STERILANCE LAME BISTOURI CHIRURGICALE N°23-100','10-0123','soins-consommables','sterilance',18.000,7),
  ('10-0124','sterilance-10-0124','STERILANCE LAME BISTOURI CHIRURGICALE N°24-100 Lames/pack','10-0124','soins-consommables','sterilance',18.000,7),
  ('18-3106','sterilance-easy-drip-6mm','STERILANCE EASY DRIP 6 mm','18-3106','soins-consommables','sterilance',19.980,19),
  ('18-3108','sterilance-easy-drip-8mm','STERILANCE EASY DRIP 8 mm','18-3108','soins-consommables','sterilance',19.980,19),
  ('18-3204','sterilance-easy-drip-4mm','STERILANCE EASY DRIP 4 mm','18-3204','soins-consommables','sterilance',19.980,19),
  ('05-063018','bionime-sterilance-press-2','Lancette Bionime Sterilance PRESS 2 (100UI)','05-063018','diabete-surveillance-glycemique','bionime',15.500,0),
  ('01-0130-100','sterilance-soft-100','Lancette Bionime Sterilance Soft Boite 100','01-0130-100','diabete-surveillance-glycemique','bionime',8.000,19),
  ('01-0130-50','sterilance-soft-50','Lancette Bionime Sterilance Soft Boite 50','01-0130-50','diabete-surveillance-glycemique','bionime',4.900,19),
  ('U031-051-CBN03B','mission-urinalysis-5b','MISSION URINALYSIS 5B BANDELETTES URINAIRES 5 PARAMETRES-BOITE DE 100 BD','U031-051-CBN03B','soins-consommables','mission',15.500,0),
  ('U031-101-CBN03B','mission-urinalysis-10u','MISSION URINALYSIS 10U BANDELETTES URINAIRES 10 PARAMETRES-BOITE DE 100 BD','U031-101-CBN03B','soins-consommables','mission',21.500,0),
  ('3200924','clickfine-32gx4mm','CLICK FINE 32GX4MM','3200924','diabete-surveillance-glycemique','clickfine',30.000,19),
  ('3200925','clickfine-31gx6mm','CLICK FINE 31GX6MM','3200925','diabete-surveillance-glycemique','clickfine',30.000,19),
  ('3200926','clickfine-31gx8mm','CLICK FINE 31GX8MM','3200926','diabete-surveillance-glycemique','clickfine',30.000,19)
) AS v(label, slug, name, sku, category_slug, brand_slug, source_price_ht, source_vat)
JOIN public.categories c ON c.slug = v.category_slug
LEFT JOIN public.brands b ON b.slug = v.brand_slug
JOIN public.suppliers s ON s.name = 'Pharmatec'
ON CONFLICT (sku) DO NOTHING;

-- Source commercial conditions are retained as documentation, not silently
-- transformed into public promotions. See docs/catalogue/authoritative-seed.md.

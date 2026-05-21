-- =====================================================================
-- Datos de prueba (seed) para entornos local / staging.
--
-- =====================================================================

-- ---------------------------------------------------------------------
-- Catálogo: species (flora y fauna del humedal)
-- ---------------------------------------------------------------------
insert into public.species (common_name, scientific_name, kind, description, habitat, conservation_status, mapuche_name)
values
  ('Pidén',           'Pardirallus sanguinolentus', 'fauna', 'Ave acuática de plumaje pardo común en humedales del sur de Chile.', 'Vegas y juncales', 'Preocupación menor', 'Pidén'),
  ('Coipo',           'Myocastor coypus',           'fauna', 'Roedor semi-acuático que habita madrigueras en orillas de cuerpos de agua.', 'Orillas de humedales y ríos', 'Preocupación menor', 'Coypu'),
  ('Tagua común',     'Fulica armillata',           'fauna', 'Ave acuática negra con pico amarillo y rojo.', 'Lagunas y humedales', 'Preocupación menor', null),
  ('Totora',          'Schoenoplectus californicus','flora', 'Planta acuática usada tradicionalmente por comunidades Mapuche.', 'Aguas someras de humedales', null, 'Trome'),
  ('Junquillo',       'Juncus procerus',            'flora', 'Hierba perenne abundante en suelos saturados.', 'Vegas húmedas', null, null),
  ('Pelo de chancho', 'Lemna minor',                'flora', 'Pequeña planta flotante indicadora de calidad del agua.', 'Superficie de aguas calmas', null, null)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Catálogo de medallas (badges)
-- ---------------------------------------------------------------------
insert into public.badges (code, name, description, points_required)
values
  ('first_quiz',     'Primer Quiz',            'Completaste tu primer quiz en la app.',                       0),
  ('explorer_50',    'Explorador del humedal', 'Acumulaste 50 puntos explorando el contenido.',              50),
  ('guardian_100',   'Guardián del humedal',   'Alcanzaste 100 puntos demostrando compromiso ambiental.',   100),
  ('mapuche_friend', 'Amigo del Mapudungun',   'Revisaste el contenido cultural Mapuche.',                    0)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- "Sabías que..." (did_you_know)
-- ---------------------------------------------------------------------
insert into public.did_you_know (title, content, source)
values
  ('Un humedal único', 'Las Vegas de Chivilcán cumplen un rol clave en la regulación hídrica de Temuco.', 'Documentación local'),
  ('Refugio de aves',  'Más de 40 especies de aves han sido observadas en el humedal.',                    'Catastro escolar'),
  ('Filtro natural',   'La totora ayuda a filtrar nutrientes y mejora la calidad del agua del humedal.',  'Material educativo Escuela Monteverde')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Contenido cultural Mapuche
-- ---------------------------------------------------------------------
insert into public.mapuche_content (title, content, category)
values
  ('Itrofill mongen',    'Concepto Mapuche que refiere a la integridad de la vida en el territorio.', 'cosmovisión'),
  ('El Ngen del agua',   'Espíritu protector del agua en la cosmovisión Mapuche.',                    'leyenda'),
  ('Mapudungun básico',  'Mari mari = hola, Chaltu may = muchas gracias, Pewkayal = hasta pronto.',   'vocabulario')
on conflict do nothing;



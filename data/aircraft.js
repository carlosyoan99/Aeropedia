/**
 * AeroPedia — Base de Datos de Aeronaves
 * ─────────────────────────────────────────────────────────────────────────────
 * Estructura de cada entrada:
 *   id       {string}  Identificador único snake_case
 *   name     {string}  Nombre oficial del modelo
 *   type     {string}  Caza | Bombardero | Ataque | Especial | Transporte | Experimental
 *   country  {string}  País o consorcio de origen
 *   year     {number}  Año de entrada en servicio operativo
 *   speed    {number}  Velocidad máxima en km/h
 *   range    {number}  Alcance operativo en km
 *   ceiling  {number}  Techo de servicio en metros
 *   mtow     {number}  Peso máximo al despegue en kg
 *   arm      {string}  Armamento principal
 *   trivia   {string}  Dato curioso o hito histórico
 *   img      {string}  URL directa de imagen pública (Wikimedia Commons)
 *   desc     {string}  Descripción del rol estratégico
 * ─────────────────────────────────────────────────────────────────────────────
 */

const aircraftDB = [

    // ═══════════════════════════════════════════
    // CAZAS
    // ═══════════════════════════════════════════
    {
        id: "f22", name: "F-22 Raptor", type: "Caza", country: "EE.UU.", year: 2005,
        speed: 2410, range: 2960, ceiling: 20000, mtow: 38000,
        arm: "AIM-120D, AIM-9X, Cañón M61A2 20mm",
        trivia: "Su firma de radar es del tamaño de una canica metálica, a pesar de medir 19 metros de largo.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/F-22_Raptor_edit1_%28cropped%29.jpg/1200px-F-22_Raptor_edit1_%28cropped%29.jpg",
        desc: "Primer caza de quinta generación del mundo, diseñado para la superioridad aérea total mediante el sigilo, la supercrucero y la agilidad extrema."
    },
    {
        id: "su57", name: "Su-57 Felon", type: "Caza", country: "Rusia", year: 2020,
        speed: 2600, range: 3500, ceiling: 20000, mtow: 35000,
        arm: "R-77M, R-73, Kh-59MK2, Cañón 30mm GSh-30-1",
        trivia: "Utiliza un sistema de radar distribuido por toda la superficie de sus alas, sin precedentes en la aviación.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sukhoi_Su-57_at_the_MAKS-2019_airshow_%285%29.jpg/1200px-Sukhoi_Su-57_at_the_MAKS-2019_airshow_%285%29.jpg",
        desc: "Respuesta rusa al F-22, destacando por su vectorización de empuje 3D y su potente conjunto de sensores distribuidos."
    },
    {
        id: "f35", name: "F-35 Lightning II", type: "Caza", country: "EE.UU. / Aliados", year: 2015,
        speed: 1930, range: 2220, ceiling: 15000, mtow: 31800,
        arm: "AIM-120C, AIM-9X, JDAM, Cañón 25mm GAU-22/A",
        trivia: "El casco del piloto integra seis cámaras que le permiten ver a través del fuselaje del avión en tiempo real.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/F-35A_flight_%28cropped%29.jpg/1200px-F-35A_flight_%28cropped%29.jpg",
        desc: "La computadora voladora más avanzada del mundo, centrada en la fusión de sensores y el combate en red multidomain."
    },
    {
        id: "ef2000", name: "Eurofighter Typhoon", type: "Caza", country: "Europa", year: 2003,
        speed: 2495, range: 2900, ceiling: 19800, mtow: 23500,
        arm: "Meteor, IRIS-T, Brimstone, Cañón Mauser BK-27",
        trivia: "Su diseño canard-delta es inestable por diseño: sin el fly-by-wire, el avión sería incontrolable.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Eurofighter_Typhoon_of_the_Royal_Air_Force_MOD_45156521.jpg/1200px-Eurofighter_Typhoon_of_the_Royal_Air_Force_MOD_45156521.jpg",
        desc: "Caza polivalente de cuarta generación plus desarrollado por Reino Unido, Alemania, Italia y España, con capacidades BVR excepcionales."
    },
    {
        id: "mig21", name: "MiG-21 Fishbed", type: "Caza", country: "URSS", year: 1959,
        speed: 2175, range: 1225, ceiling: 19000, mtow: 10400,
        arm: "K-13, R-60, Cañón GSh-23L 23mm",
        trivia: "Con más de 11.000 unidades fabricadas, es el caza supersónico más producido de la historia.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/MiG-21_%28Fishbed%29_2.jpg/1200px-MiG-21_%28Fishbed%29_2.jpg",
        desc: "Símbolo de la aviación soviética de la Guerra Fría, exportado a más de 50 países y protagonista de innumerables conflictos regionales."
    },
    {
        id: "f16", name: "F-16 Fighting Falcon", type: "Caza", country: "EE.UU.", year: 1978,
        speed: 2120, range: 3200, ceiling: 15240, mtow: 19187,
        arm: "AIM-9, AIM-120, Cañón M61A1 20mm, JDAM",
        trivia: "Fue el primer caza de producción en serie diseñado con inestabilidad aerodinámica deliberada para maximizar la maniobrabilidad.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/F-16_June_2008.jpg/1200px-F-16_June_2008.jpg",
        desc: "El caza multirol más exportado del mundo, con más de 4.600 unidades fabricadas para 25 países. Columna vertebral de la OTAN durante décadas."
    },
    {
        id: "f15", name: "F-15 Eagle", type: "Caza", country: "EE.UU.", year: 1976,
        speed: 2655, range: 3450, ceiling: 20000, mtow: 30845,
        arm: "AIM-7, AIM-9, AIM-120, Cañón M61A1 20mm",
        trivia: "El F-15 tiene un récord de combate de más de 100 victorias aéreas con cero derrotas confirmadas.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/F-15_MSIP_II.jpg/1200px-F-15_MSIP_II.jpg",
        desc: "El superioridad aérea por excelencia de la USAF durante tres décadas, con el motor más potente de su generación y radar de largo alcance."
    },
    {
        id: "rafale", name: "Dassault Rafale", type: "Caza", country: "Francia", year: 2001,
        speed: 1912, range: 3700, ceiling: 15240, mtow: 24500,
        arm: "MICA, Meteor, AASM, Cañón DEFA 791B 30mm",
        trivia: "El Rafale fue el primer avión en combinar capacidades nucleares tácticas y estratégicas simultáneamente.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Dassault_Rafale_%28cropped%29.jpg/1200px-Dassault_Rafale_%28cropped%29.jpg",
        desc: "Caza omnirrol francés diseñado para operar tanto desde portaviones como desde tierra, cubriendo todas las misiones sin compromisos."
    },
    {
        id: "j20", name: "Chengdu J-20", type: "Caza", country: "China", year: 2017,
        speed: 2100, range: 2700, ceiling: 20000, mtow: 37000,
        arm: "PL-15, PL-10, Cañón interno en pruebas",
        trivia: "China reveló el J-20 durante la visita oficial del Secretario de Defensa de EE.UU., en un gesto de provocación diplomática.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Chengdu_J-20_at_Airshow_China_2016_%28cropped%29.jpg/1200px-Chengdu_J-20_at_Airshow_China_2016_%28cropped%29.jpg",
        desc: "Primer caza furtivo de quinta generación de China, diseñado para el combate BVR de largo alcance y la penetración de defensas enemigas."
    },
    {
        id: "su27", name: "Su-27 Flanker", type: "Caza", country: "URSS / Rusia", year: 1985,
        speed: 2500, range: 3530, ceiling: 18500, mtow: 33000,
        arm: "R-27, R-73, Cañón GSh-30-1 30mm",
        trivia: "La maniobra Pugachev Cobra, ejecutada por primera vez con este avión en 1989, deja al avión suspendido en el aire a 90° durante un segundo.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Su-27_inflight_2005.jpg/1200px-Su-27_inflight_2005.jpg",
        desc: "Caza de superioridad aérea soviético diseñado para superar al F-15, base de toda la familia Flanker que domina la aviación rusa moderna."
    },

    // ═══════════════════════════════════════════
    // BOMBARDEROS
    // ═══════════════════════════════════════════
    {
        id: "b2", name: "B-2 Spirit", type: "Bombardero", country: "EE.UU.", year: 1997,
        speed: 1010, range: 11100, ceiling: 15200, mtow: 170600,
        arm: "80× JDAM 227kg, B61/B83 nuclear, MOP 14.000kg",
        trivia: "Con un coste de 2.100 millones de dólares por unidad, es el avión más caro jamás fabricado.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/B-2_Spirit_Spirit_of_Mississippi.jpg/1200px-B-2_Spirit_Spirit_of_Mississippi.jpg",
        desc: "Bombardero estratégico invisible al radar, capaz de penetrar las defensas aéreas más densas del mundo y atacar blancos a 11.000 km de distancia."
    },
    {
        id: "tu160", name: "Tu-160 Blackjack", type: "Bombardero", country: "Rusia", year: 1987,
        speed: 2220, range: 12300, ceiling: 16000, mtow: 275000,
        arm: "Kh-101, Kh-555, Kh-55 (12 misiles de crucero)",
        trivia: "Es el avión de combate más grande, más pesado y más rápido del mundo, apodado 'el cisne blanco' por sus tripulaciones.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Russian_Air_Force_Tupolev_Tu-160.jpg/1200px-Russian_Air_Force_Tupolev_Tu-160.jpg",
        desc: "Bombardero estratégico supersónico de alas variables diseñado para lanzar misiles de crucero a distancias intercontinentales."
    },
    {
        id: "b52", name: "B-52 Stratofortress", type: "Bombardero", country: "EE.UU.", year: 1955,
        speed: 1047, range: 14200, ceiling: 15000, mtow: 220000,
        arm: "31.500 kg de carga: JDAM, ALCM, bombas convencionales y nucleares",
        trivia: "Se espera que el B-52 siga en servicio hasta 2050, haciendo de él un avión con casi 100 años de operación activa.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/B-52_Stratofortress_side_view.jpg/1200px-B-52_Stratofortress_side_view.jpg",
        desc: "El pilar del mando estratégico estadounidense durante siete décadas, en constante actualización y con capacidad nuclear y convencional."
    },
    {
        id: "b1b", name: "B-1B Lancer", type: "Bombardero", country: "EE.UU.", year: 1986,
        speed: 1340, range: 9400, ceiling: 18000, mtow: 216400,
        arm: "56.700 kg de carga: JASSM, JSOW, JDAM, minas Mk-62",
        trivia: "La mayor carga de bombas de precisión de cualquier avión del mundo: puede llevar 24 misiles JASSM-ER de manera interna.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/B-1B_Lancer_040316-F-0000S-001.jpg/1200px-B-1B_Lancer_040316-F-0000S-001.jpg",
        desc: "Bombardero supersónico de ala variable, el más rápido de la tríada nuclear americana, reconvertido para misiones convencionales de alta precisión."
    },
    {
        id: "tu95", name: "Tu-95 Bear", type: "Bombardero", country: "URSS / Rusia", year: 1956,
        speed: 920, range: 15000, ceiling: 12000, mtow: 188000,
        arm: "Kh-101, Kh-55, Kh-20 (hasta 15 misiles de crucero)",
        trivia: "Es el avión de propulsión a turbohélice más rápido del mundo y el único bombardero estratégico a hélice en servicio activo.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Tupolev_Tu-95.jpg/1200px-Tupolev_Tu-95.jpg",
        desc: "Bombardero estratégico soviético con más de 60 años de servicio continuo, modernizado para lanzar misiles de crucero de última generación."
    },

    // ═══════════════════════════════════════════
    // ATAQUE
    // ═══════════════════════════════════════════
    {
        id: "a10", name: "A-10 Thunderbolt II", type: "Ataque", country: "EE.UU.", year: 1977,
        speed: 706, range: 4150, ceiling: 13700, mtow: 23000,
        arm: "Cañón GAU-8/A Avenger 30mm, AGM-65 Maverick, Mk-82",
        trivia: "El avión fue diseñado alrededor del cañón: el GAU-8 es tan grande que no cabría en ningún otro fuselaje existente.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/A-10_Thunderbolt_II_In-flight-2009.jpg/1200px-A-10_Thunderbolt_II_In-flight-2009.jpg",
        desc: "Diseñado exclusivamente para destruir tanques en el campo de batalla, famoso por su resistencia extrema y el inconfundible rugido BRRRT de su cañón rotativo."
    },
    {
        id: "su25", name: "Su-25 Grach", type: "Ataque", country: "URSS / Rusia", year: 1981,
        speed: 975, range: 1000, ceiling: 7000, mtow: 19300,
        arm: "Cañón GSh-30-2 30mm, Cohetes S-25, FAB-500",
        trivia: "Sus motores pueden funcionar con queroseno, gasolina de automoción o incluso aceite vegetal en emergencias.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sukhoi_Su-25SM%2C_Russia_-_Air_Force_AN2149479.jpg/1200px-Sukhoi_Su-25SM%2C_Russia_-_Air_Force_AN2149479.jpg",
        desc: "El equivalente soviético del A-10, con blindaje extensivo y diseñado para operar desde campos de hierba en apoyo cercano a las tropas."
    },
    {
        id: "su34", name: "Su-34 Fullback", type: "Ataque", country: "Rusia", year: 2014,
        speed: 1900, range: 4000, ceiling: 17000, mtow: 45100,
        arm: "Kh-29, Kh-31, KAB-500, Cañón GSh-30-1 30mm",
        trivia: "La cabina tiene espacio para que los pilotos puedan caminar y tiene una cocinilla eléctrica para misiones de larga duración.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Sukhoi_Su-34_in_2010.jpg/1200px-Sukhoi_Su-34_in_2010.jpg",
        desc: "Bombardero táctico de largo alcance basado en el Flanker, con capacidades nucleares y aviónica de última generación para misiones de penetración."
    },
    {
        id: "av8b", name: "AV-8B Harrier II", type: "Ataque", country: "EE.UU. / Reino Unido", year: 1985,
        speed: 1065, range: 3200, ceiling: 15200, mtow: 14100,
        arm: "GAU-12 25mm, AIM-9, Mk-82, AGM-65",
        trivia: "Es el único avión de combate de ala fija de fabricación occidental capaz de despegue y aterrizaje vertical (VTOL).",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/AV-8B_Harrier_VMA-231.jpg/1200px-AV-8B_Harrier_VMA-231.jpg",
        desc: "Avión de ataque con capacidad STOVL (despegue corto / aterrizaje vertical) diseñado para operar desde portaaviones de cubierta corta y bases improvisadas."
    },

    // ═══════════════════════════════════════════
    // ESPECIALES
    // ═══════════════════════════════════════════
    {
        id: "sr71", name: "SR-71 Blackbird", type: "Especial", country: "EE.UU.", year: 1966,
        speed: 3540, range: 5400, ceiling: 25900, mtow: 78000,
        arm: "Sistemas de inteligencia óptica y SIGINT",
        trivia: "El fuselaje goteaba combustible en tierra porque las planchas de titanio solo encajaban al dilatarse por el calor a velocidad de crucero.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/SR-71_Blackbird.jpg/1200px-SR-71_Blackbird.jpg",
        desc: "El avión de reconocimiento tripulado más rápido de la historia: ningún misil lanzado contra él logró alcanzarlo nunca."
    },
    {
        id: "e3", name: "E-3 Sentry (AWACS)", type: "Especial", country: "EE.UU.", year: 1977,
        speed: 855, range: 9250, ceiling: 12500, mtow: 156000,
        arm: "Radar rotativo AN/APY-2 (detección a +400 km)",
        trivia: "Su radar puede detectar simultáneamente hasta 600 blancos aéreos y coordinar más de 100 interceptaciones.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/E-3_Sentry_over_the_Pacific_Ocean.jpg/1200px-E-3_Sentry_over_the_Pacific_Ocean.jpg",
        desc: "Plataforma de mando y control aerotransportado que actúa como cuartel general volante, coordinando operaciones aéreas en tiempo real."
    },
    {
        id: "u2", name: "U-2 Dragon Lady", type: "Especial", country: "EE.UU.", year: 1956,
        speed: 805, range: 10300, ceiling: 21300, mtow: 18600,
        arm: "Cámaras de alta resolución, sensores SIGINT/IMINT",
        trivia: "Los pilotos deben llevar trajes de presión similares a los de astronauta. El avión vuela tan alto que ven la curvatura de la Tierra.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/U-2_high_altitude_aircraft.jpg/1200px-U-2_high_altitude_aircraft.jpg",
        desc: "Avión de reconocimiento de altísima cota, operativo desde 1956 y aún en servicio activo. Sus imágenes desencadenaron la Crisis de los Misiles de Cuba."
    },
    {
        id: "rq4", name: "RQ-4 Global Hawk", type: "Especial", country: "EE.UU.", year: 2001,
        speed: 629, range: 22780, ceiling: 18288, mtow: 14628,
        arm: "Sensores SAR, EO/IR, SIGINT; sin armamento",
        trivia: "Puede sobrevolar un área del tamaño de Corea del Sur en 24 horas con una resolución capaz de leer matrículas de vehículos.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/RQ-4A_Global_Hawk.jpg/1200px-RQ-4A_Global_Hawk.jpg",
        desc: "UAV estratégico de reconocimiento persistente capaz de misiones de 32 horas sin repostaje, el ISR no tripulado de mayor alcance del mundo."
    },

    // ═══════════════════════════════════════════
    // TRANSPORTE
    // ═══════════════════════════════════════════
    {
        id: "c17", name: "C-17 Globemaster III", type: "Transporte", country: "EE.UU.", year: 1995,
        speed: 830, range: 4480, ceiling: 13700, mtow: 265350,
        arm: "Capacidad: 1 tanque M1 Abrams, 102 paracaidistas o 36 pacientes en camillas",
        trivia: "Puede aterrizar en pistas de tierra de apenas 900 metros y dar marcha atrás con carga completa mediante empuje inverso.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/C-17_Globemaster_III.jpg/1200px-C-17_Globemaster_III.jpg",
        desc: "Avión de transporte estratégico-táctico capaz de llevar cargas pesadas a cualquier punto del planeta y aterrizar en aeródromos sin preparar."
    },
    {
        id: "c130", name: "C-130 Hercules", type: "Transporte", country: "EE.UU.", year: 1956,
        speed: 643, range: 6850, ceiling: 10060, mtow: 79380,
        arm: "Hasta 92 tropas, 74 camillas o 20.000 kg de carga",
        trivia: "El C-130 es el único avión de ala fija que ha aterrizado en un portaviones sin catapultas (en 1963) y nunca fue diseñado para ello.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Lockheed_C-130_Hercules_%28modified%29.jpg/1200px-Lockheed_C-130_Hercules_%28modified%29.jpg",
        desc: "El caballo de batalla del transporte táctico militar, en servicio continuo desde 1956 con más de 70 variantes y 2.500 unidades fabricadas para 63 países."
    },
    {
        id: "an124", name: "An-124 Ruslan", type: "Transporte", country: "URSS / Ucrania", year: 1986,
        speed: 865, range: 5400, ceiling: 12000, mtow: 405000,
        arm: "Carga útil: 150.000 kg (el doble que el C-17)",
        trivia: "Su morro abatible y rampa trasera permiten cargar simultáneamente por ambos extremos, reduciendo los tiempos de carga a la mitad.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Antonov_An-124_Ruslan%2C_Volga-Dnepr_Airlines_AN1895955.jpg/1200px-Antonov_An-124_Ruslan%2C_Volga-Dnepr_Airlines_AN1895955.jpg",
        desc: "El mayor avión de transporte en producción del mundo durante décadas, capaz de transportar locomotoras, turbinas industriales o helicópteros completos."
    },
    {
        id: "kc135", name: "KC-135 Stratotanker", type: "Transporte", country: "EE.UU.", year: 1957,
        speed: 933, range: 14800, ceiling: 15200, mtow: 134717,
        arm: "Barra extensible de repostaje en vuelo, hasta 90.700 kg de combustible transferible",
        trivia: "Ha repostado en vuelo a más de un millón de aviones desde su entrada en servicio, multiplicando el alcance de toda la flota de la USAF.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/KC-135_Stratotanker_Refuels_B-2_Spirit_%28cropped%29.jpg/1200px-KC-135_Stratotanker_Refuels_B-2_Spirit_%28cropped%29.jpg",
        desc: "El repostador aéreo que hizo posible el poder global americano: sin él, ningún bombardero estratégico podría alcanzar objetivos en cualquier parte del mundo."
    },

    // ═══════════════════════════════════════════
    // EXPERIMENTALES
    // ═══════════════════════════════════════════
    {
        id: "x15", name: "North American X-15", type: "Experimental", country: "EE.UU.", year: 1959,
        speed: 7274, range: 450, ceiling: 107960, mtow: 15420,
        arm: "Instrumentación científica y registros de vuelo",
        trivia: "Cruzó la línea de Kármán (100 km), convirtiendo a sus pilotos en astronautas. Sigue siendo el avión con motor más rápido jamás construido.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/North_American_X-15.jpg/1200px-North_American_X-15.jpg",
        desc: "Avión-cohete experimental que estableció marcas de velocidad y altitud que siguen sin superarse, y cuyo programa de vuelo nutrío directamente el Apollo."
    },
    {
        id: "x47b", name: "Northrop Grumman X-47B", type: "Experimental", country: "EE.UU.", year: 2011,
        speed: 1000, range: 3900, ceiling: 12190, mtow: 20215,
        arm: "Dos bahías de armamento (configuración demostradora)",
        trivia: "Primer UAV de combate en despegar y aterrizar de forma autónoma en un portaviones en mar abierto, sin intervención humana.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/X-47B_CVN77.jpg/1200px-X-47B_CVN77.jpg",
        desc: "UCAV demostrativo que validó la operación autónoma en portaviones, abriendo el camino a los cazas no tripulados de próxima generación."
    },
    {
        id: "b21", name: "B-21 Raider", type: "Experimental", country: "EE.UU.", year: 2023,
        speed: 1000, range: 13000, ceiling: 15000, mtow: 90000,
        arm: "JDAM, B61-12 nuclear, GBU-57 MOP (estimado)",
        trivia: "El avión más secreto en activo: Northrop Grumman desarrolló un lenguaje de programación propietario para que el código fuente no pudiera ser robado.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/B-21_Raider_first_flight.jpg/1200px-B-21_Raider_first_flight.jpg",
        desc: "El sucesor del B-2, diseñado con una arquitectura digital abierta para actualizar sus capacidades furtivas a medida que evolucionen las amenazas."
    },
    {
        id: "x59", name: "NASA X-59 QueSST", type: "Experimental", country: "EE.UU.", year: 2024,
        speed: 1510, range: 1900, ceiling: 16800, mtow: 14700,
        arm: "Sensores acústicos y de vuelo",
        trivia: "Está diseñado para que su estruendo supersónico suene como un golpe suave de 75 dB en tierra, en lugar de un boom de 110 dB.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/X-59_QueSST_artist_concept_%28cropped%29.jpg/1200px-X-59_QueSST_artist_concept_%28cropped%29.jpg",
        desc: "Demostrador de vuelo supersónico silencioso de la NASA, diseñado para reabrir el espacio aéreo civil a vuelos supersónicos comerciales sobre tierra."
    }
];


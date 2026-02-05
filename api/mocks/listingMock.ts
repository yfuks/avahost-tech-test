const listingMock = {
  id: 'DEMO',
  publicListingData: {
    title: 'Maison rétro avec jeux vidéo, jaccuzi et barbecue',
    shortName: 'La Maison COSYGAMER',
    propertyType: 'house',
    roomType: 'entire_home',
    location: {
      city: 'Évry-Grégy-sur-Yerre',
      region: 'Île-de-France',
      country: 'France',
      nearbyInfo:
        'Située à Évry les châteaux, point de départ idéal pour explorer la région',
    },
    capacity: {
      guests: 7,
      bedrooms: 2,
      beds: 4,
      bathrooms: 1,
    },
    bedConfiguration: {
      bedroom1: {
        name: 'Chambre 1',
        beds: [{ type: 'queen', size: '160x200', quantity: 1 }],
        extras: ['lit pour bébé disponible sur demande'],
      },
      bedroom2: {
        name: 'Chambre 2',
        beds: [{ type: 'bunk_bed', quantity: 1 }],
      },
      livingRoom: {
        name: 'Salon',
        beds: [{ type: 'sofa_bed', quantity: 1 }],
      },
    },
    description: {
      summary:
        "Préparez vos moustaches et vos chapeaux de plombier ! 🎂󰔨🤠 Vivez une expérience unique en famille ou entre amis en plongeant dans l'univers des jeux vidéo des années 80 et 90 grâce à nos nombreuses bornes d'arcade 🕹🎮 et son mur d'ESCALADE. Après les sessions de jeu, détendez-vous dans notre espace JACUZZI extérieur.",
      theSpace: `Prêts à sauver la princesse Peach 👸 ? Dans notre GameRoom, vous allez devoir user de votre cerveau et de votre sens de l'orientation pour réussir votre mission.
    Un moment de détente garanti pour un anniversaire, un EVJF ou une soirée entre copin(es).`,
      guestAccess: `Profitez de ce logement en toute intimité ! Il est réservé aux personnes ayant effectué la réservation uniquement.
    Si vous avez des amis qui souhaitent passer vous voir, ou si vous prévoyez un petit événement, n'hésitez pas à nous en parler à l'avance. Nous serons ravis de trouver une solution ensemble.`,
      otherNotes:
        "Profitez d'un moment de détente supplémentaire avec notre jacuzzi, accessible toute l'année ! D'octobre à mai, pensez à nous contacter 24h avant votre venue pour que nous puissions vous accueillir dans les meilleures conditions.",
      idealFor: [
        'Familles avec enfants',
        "Groupes d'amis",
        'Anniversaires',
        'EVJF/EVG',
        'Soirées à thème retrogaming',
        'Week-ends détente',
      ],
    },
    activities: {
      indoor: {
        gaming: [
          {
            name: "Bornes d'arcade",
            description: 'Plus de 10 jeux disponibles',
          },
          { name: 'Racecab', emoji: '🚘', description: 'Jeux de course' },
          { name: 'Guncab', emoji: '🛸', description: 'Jeux de tir' },
          { name: 'Fighting', emoji: '🤼', description: 'Jeux de combat' },
          { name: 'Guitar Hero', emoji: '🎸' },
          { name: 'Jeux de danse', emoji: '🕺' },
          { name: 'Karaoke', emoji: '🎤' },
          { name: 'Console de jeu' },
        ],
        sports: [
          { name: "Mur d'escalade", emoji: '🧗' },
          { name: 'Baby-foot', emoji: '⚽' },
          { name: 'Jeux de fléchette' },
        ],
        other: [
          { name: 'Piscine à balles', emoji: '🎈' },
          { name: 'Jeux de société' },
          { name: 'Énigmes', emoji: '📩' },
          { name: 'Cinéma / Home cinema' },
          { name: 'Jeux géants' },
        ],
      },
      outdoor: [
        {
          name: 'Jacuzzi / Spa',
          emoji: '🛀',
          available: "toute l'année",
          note: "Contacter 24h avant d'octobre à mai",
        },
        {
          name: 'Piscine',
          emoji: '🤽',
          note: 'Vérifier disponibilité saisonnière',
        },
        { name: 'Barbecue', emoji: '🍖' },
        { name: 'Aire de jeux extérieure' },
      ],
      forKids: [
        'Salle de jeux pour enfants',
        'Livres et jouets (2-5 ans, 5-10 ans, +10 ans)',
        'Piscine à balles',
        'Aire de jeux extérieure',
        'Jeux de société',
      ],
      forAdults: ['Jacuzzi', 'Espace détente', 'Bar / coin café'],
    },
    amenities: {
      internet: {
        items: ['wifi', 'ethernet'],
        note: 'Connexion Ethernet disponible pour le gaming',
      },
      climate: {
        items: ['air_conditioning_central', 'ceiling_fan', 'heating'],
        note: 'Climatisation centrale dans tout le logement',
      },
      kitchen: {
        items: [
          'kitchen',
          'refrigerator',
          'mini_fridge',
          'freezer',
          'microwave',
          'stove',
          'cooktop',
          'electric_kettle',
          'coffee_maker_espresso',
          'dishes_silverware',
          'wine_glasses',
          'dining_table',
          'coffee',
        ],
        note: 'Cuisine entièrement équipée avec machine à expresso',
      },
      bathroom: {
        items: [
          'hair_dryer',
          'shampoo',
          'conditioner',
          'body_soap',
          'shower_gel',
          'hot_water',
          'outdoor_shower',
        ],
        note: 'Produits de toilette fournis',
      },
      laundry: {
        items: ['washer', 'iron', 'bed_linens'],
      },
      entertainment: {
        items: [
          'tv',
          'bluetooth_sound_system',
          'game_console',
          'arcade_games',
          'climbing_wall',
          'cinema_room',
        ],
      },
      family: {
        items: [
          'crib_on_request',
          'pack_n_play',
          'childrens_books_toys',
          'childrens_dinnerware',
          'outlet_covers',
          'board_games',
          'baby_safety_gates',
          'childrens_playroom',
          'outdoor_playground',
        ],
        note: 'Lit bébé disponible sur demande',
      },
      outdoor: {
        items: [
          'outdoor_furniture',
          'outdoor_dining',
          'outdoor_kitchen',
          'bbq_grill',
          'private_hot_tub',
        ],
        note: 'Ustensiles de barbecue fournis',
      },
      parking: {
        items: ['free_parking_on_premises'],
        note: 'Parking gratuit sur place',
      },
      safety: {
        items: [
          'smoke_detector',
          'carbon_monoxide_detector',
          'first_aid_kit',
          'exterior_security_cameras',
          'noise_decibel_monitors',
        ],
        warnings: [
          "Caméras de surveillance extérieures (cour commune, aucune à l'intérieur)",
          'Piscine/jacuzzi sans clôture ni verrou',
          "Aire de jeux / structure d'escalade",
        ],
      },
      services: {
        items: [
          'pets_allowed',
          'long_term_stays_allowed',
          'self_check_in',
          'lockbox',
        ],
        note: 'Animaux acceptés',
      },
    },
    houseRules: {
      checkIn: {
        time: { start: '17:00', end: '00:00' },
        method: 'self_check_in',
        accessMethod: 'lockbox',
        description: 'Arrivée autonome avec boîte à clé sécurisée',
      },
      checkOut: {
        time: '11:00',
      },
      maxGuests: 7,
      petsAllowed: true,
      additionalRules: [
        'Logement réservé aux personnes ayant effectué la réservation',
        "Prévenir l'hôte si des amis souhaitent passer",
        "Prévenir l'hôte pour tout petit événement",
      ],
    },
    safetyInfo: {
      hazards: [
        'Piscine/jacuzzi sans clôture ni verrou - surveillance des enfants requise',
        "Mur d'escalade - utilisation sous responsabilité des voyageurs",
        'Aire de jeux - surveillance des enfants recommandée',
      ],
      equipment: [
        'Détecteur de fumée',
        'Détecteur de monoxyde de carbone',
        'Kit de premiers secours',
      ],
      cameras: {
        location: 'Extérieures uniquement (cour commune)',
        note: "Aucune caméra à l'intérieur du logement",
      },
      noiseMonitor: true,
    },
  },
  privateHostData: {
    internet: {
      networkName: 'cosy-wifi-guest',
      password: 'AlphaTango?5',
      troubleshootingProcedure: [
        'Débrancher la box internet',
        'Attendre 20 secondes',
        'Rebrancher la box',
        'Attendre 2 minutes',
      ],
    },
    stay: {
      lockboxCode: '0007',
      confirmationCode: 'HM8BSDEMO',
    },
    hotTub: {
      winterNote:
        "D'octobre à mai, contacter l'hôte 24h avant pour mise en route",
    },
    emergencyContacts: {
      host: {
        name: 'COSYGAMER Manager',
        preferredContact: 'Airbnb messages',
      },
      emergency: '112',
      police: '17',
      medical: '15',
      fire: '18',
    },
  },
};
export default listingMock;

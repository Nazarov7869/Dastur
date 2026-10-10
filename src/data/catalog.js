// Namuna ma'lumotlari — keyin serverdan (API) olinadi.
// Taom: [nomi, tavsifi, narxi (so'm), og'irligi, rasm fayli (public/img/<nom>.jpg)]

const DRINKS = [
  ['Limonad', 'Uy usulida, limon va yalpiz bilan', 16000, '0.4 l', 'lemonade'],
  ['Muzli choy', 'Laym bilan, sovuq holda', 14000, '0.4 l', 'tea'],
  ['Suv', 'Gazsiz', 5000, '0.5 l', 'water']
];

export const MENUS = {
  pizza: [
    ['Pitsa', [
      ['Margarita', 'Pomidor sousi, mozzarella, yangi rayhon', 62000, '480 g', 'pizza3'],
      ['Pepperoni', 'Achchiq pepperoni, mozzarella, pomidor sousi', 74000, '520 g', 'pizza4'],
      ['Tovuqli', 'Tovuq filesi, qizil piyoz, mozzarella', 72000, '540 g', 'pizza2'],
      ["To'rt xil pishloq", 'Mozzarella, parmezan, dorblu, cheddar', 82000, '500 g', 'pizza1'],
      ['Rikotta va ismaloq', 'Yangi ismaloq, rikotta, sarimsoq moyi', 78000, '490 g', 'pizza6'],
      ['Neapolitana', "O'tinli pechda, yupqa xamirda", 69000, '460 g', 'pizza5']
    ]],
    ['Pasta', [
      ['Karbonara', 'Qaymoqli sous, bekon, parmezan', 48000, '320 g', 'pasta3'],
      ['Penne bolonyeze', "Mol go'shtli pomidor sousi", 46000, '340 g', 'pasta1'],
      ['Dengiz mahsulotli', 'Krevetka, pomidor, sarimsoq', 64000, '350 g', 'pasta2']
    ]],
    ['Gazak va salatlar', [
      ['Sezar', 'Tovuq, parmezan, kruton, sezar sousi', 44000, '250 g', 'salad4'],
      ['Tovuq qanotchalari', '8 dona, achchiq-shirin sousda', 44000, '300 g', 'wings1'],
      ['Kartoshka fri', 'Tuzlangan, qarsildoq', 18000, '150 g', 'fries2']
    ]],
    ['Shirinliklar', [
      ['Shokoladli pechenye', 'Katta, issiq holda beriladi', 22000, '120 g', 'cookie'],
      ['Chizkeyk', "Qora smorodina sousi bilan", 28000, '130 g', 'cheesecake']
    ]],
    ['Ichimliklar', DRINKS]
  ],
  burger: [
    ['Burgerlar', [
      ['Klassik burger', "Mol go'shti kotleti, salat bargi, pomidor", 38000, '280 g', 'burger3'],
      ['Chizburger', "Eritilgan cheddar, maxsus sous", 42000, '300 g', 'burger1'],
      ['Bekonli burger', 'Qarsildoq bekon, cheddar, salat', 48000, '320 g', 'burger6'],
      ['Dabl burger', "Ikkita kotlet, karamellangan piyoz", 62000, '420 g', 'burger4']
    ]],
    ['Kombo', [
      ['Kombo klassik', 'Burger + kartoshka fri', 52000, '450 g', 'burger5']
    ]],
    ['Gazaklar', [
      ['Parmezanli fri', 'Parmezan va ko\'katlar bilan', 22000, '170 g', 'fries1'],
      ['Tovuq strips', '6 dona, sarimsoqli sous bilan', 32000, '200 g', 'nuggets'],
      ['Achchiq qanotchalar', '8 dona, kunjut bilan', 44000, '300 g', 'wings2']
    ]],
    ['Ichimliklar', [
      ['Milksheyk', 'Shokoladli, pechenye bilan', 26000, '0.4 l', 'milkshake'],
      ...DRINKS
    ]]
  ],
  sushi: [
    ['Rollar', [
      ['Filadelfiya', 'Losos, qaymoqli pishloq, bodring', 68000, '260 g', 'sushi1'],
      ['Sake maki', 'Losos, kunjut, nori', 42000, '180 g', 'sushi4'],
      ['Losos nigiri', '3 dona', 39000, '110 g', 'sushi6']
    ]],
    ['Setlar', [
      ['Set «Kema»', '32 dona, 4 xil roll', 219000, '1.1 kg', 'sushi2'],
      ['Set «Assorti»', '24 dona, roll va nigiri', 169000, '820 g', 'sushi5'],
      ['Nigiri set', '8 dona, 4 xil baliq', 98000, '300 g', 'sushi3']
    ]],
    ['Issiq taomlar', [
      ['Ramen dengiz mahsulotli', 'Krevetka, tuxum, ugra', 54000, '450 ml', 'ramen1'],
      ['Ramen shoyu', "Tovuq sho'rvasi, tuxum, nori", 48000, '450 ml', 'ramen2'],
      ['Yakisoba', 'Qovurilgan ugra, sabzavotlar', 44000, '320 g', 'noodles'],
      ['Gyoza', '6 dona, soya sousi bilan', 34000, '180 g', 'dumplings1']
    ]],
    ['Ichimliklar', DRINKS]
  ],
  milliy: [
    ['Asosiy taomlar', [
      ["To'y oshi", "Qo'y go'shti, sariq sabzi, no'xat, mayiz", 42000, '400 g', 'plov'],
      ['Choyxona oshi', "Mol go'shti, qizil sabzi", 38000, '400 g', 'plov2'],
      ["Qovurma lag'mon", "Cho'zma ugra, go'sht, bulg'or qalampiri", 36000, '380 g', 'lagman'],
      ['Manti', "5 dona, qo'y go'shti va piyoz", 34000, '350 g', 'manti'],
      ['Dimlama', "Go'sht va mavsumiy sabzavotlar", 46000, '420 g', 'dimlama'],
      ["Tabaka jo'ja", "Butun jo'ja, sarimsoqli sous", 68000, '700 g', 'chicken']
    ]],
    ['Kaboblar', [
      ["Qo'y go'shtli kabob", '2 six', 44000, '200 g', 'shashlik'],
      ['Tovuq kabob', '2 six', 32000, '220 g', 'tovuqkabob'],
      ['Kabob assorti', '5 six, piyoz bilan', 98000, '500 g', 'kabob']
    ]],
    ["Sho'rvalar", [
      ['Mastava', 'Guruchli, qatiq bilan', 26000, '400 ml', 'mastava'],
      ['Chuchvara', "Sho'rvada, ko'katlar bilan", 30000, '400 ml', 'chuchvara']
    ]],
    ['Non va somsa', [
      ['Tandir non', 'Issiq, kunjutli', 5000, '1 dona', 'non'],
      ['Somsa', "Tandirda, go'shtli, 2 dona", 22000, '220 g', 'samsa'],
      ['Mavsumiy salat', 'Yangi sabzavotlar, zaytun moyi', 24000, '220 g', 'veggies']
    ]],
    ['Ichimliklar', DRINKS]
  ],
  cafe: [
    ['Nonushta', [
      ['Kruassan', "Sariyog'li, yangi yopilgan", 18000, '80 g', 'croissant'],
      ['Pankeyk', 'Banan va chernika bilan', 34000, '240 g', 'pancakes2'],
      ['Asalli pankeyk', 'Asal va yalpiz bilan', 32000, '220 g', 'pancakes1'],
      ['Tuxumli tost', 'Avokado pastasi, qovurilgan tuxum', 36000, '200 g', 'eggs'],
      ['Avokado tost', 'Qaynatilgan tuxum bilan', 42000, '210 g', 'avotoast'],
      ['Inglizcha nonushta', 'Tuxum, tost, pomidor', 46000, '320 g', 'breakfast']
    ]],
    ['Salatlar', [
      ['Sezar', 'Tovuq, parmezan, kruton', 44000, '250 g', 'salad4'],
      ['Grek salati', 'Feta, zaytun, sabzavotlar', 38000, '240 g', 'salad3'],
      ['Tovuqli boul', "Tovuq, makkajo'xori, sabzavotlar", 46000, '320 g', 'salad2'],
      ['Sabzavotli boul', "Avokado, no'xat, pomidor", 42000, '300 g', 'salad1']
    ]],
    ['Shirinliklar', [
      ['Tiramisu', 'Italyancha klassika', 34000, '140 g', 'tiramisu'],
      ['Malinali tort', 'Yengil krem, yangi malina', 32000, '140 g', 'cake1'],
      ['Shokoladli tort', 'Quyuq shokoladli krem', 34000, '150 g', 'cake2'],
      ['Makarun', '4 dona', 36000, '80 g', 'macarons'],
      ['Donat', 'Shokoladli glazur bilan', 16000, '90 g', 'donuts']
    ]],
    ['Qahva va ichimliklar', [
      ['Kapuchino', 'Arabika 100%', 24000, '0.3 l', 'coffee1'],
      ['Latte', 'Sirop tanlovi bilan', 26000, '0.35 l', 'latte'],
      ['Ays-latte', 'Muz bilan', 28000, '0.4 l', 'coffee3'],
      ['Mevali smuzi', 'Banan, qulupnay', 30000, '0.4 l', 'smoothie']
    ]]
  ],
  steak: [
    ['Steyklar', [
      ['Ribay', "Marmar mol go'shti, o'rtacha pishirilgan", 189000, '300 g', 'steak3'],
      ['Steyk va fri', "Mol go'shti, kartoshka fri", 148000, '380 g', 'steak1'],
      ['Brisket', "12 soat dudlangan mol to'shi", 165000, '280 g', 'bbq'],
      ["Qovurg'a BBQ", 'BBQ sousida, kartoshka bilan', 145000, '450 g', 'ribs']
    ]],
    ['Assorti', [
      ["Go'shtli assorti", "4 kishilik, 5 xil go'sht va sabzavot", 420000, '1.4 kg', 'kebab1'],
      ['Kabob assorti', '5 six, piyoz bilan', 98000, '500 g', 'kabob']
    ]],
    ['Garnirlar', [
      ['Mavsumiy salat', 'Yangi sabzavotlar, zaytun moyi', 24000, '220 g', 'veggies'],
      ['Kartoshka fri', 'Tuzlangan, qarsildoq', 18000, '150 g', 'fries2'],
      ['Hunarmand noni', 'Javdar unidan', 12000, '250 g', 'bread']
    ]],
    ['Ichimliklar', DRINKS]
  ]
};

export const RESTAURANTS = [
  { id: 'pitsa-uyi', name: 'Pitsa Uyi', menu: 'pizza', cats: ['pizza', 'pasta'], rating: 4.7, reviews: 1628, time: 15, dist: 0.92, discount: 0, address: "Amir Temur ko'chasi, 12", hours: '10:00 – 23:00' },
  { id: 'gosht', name: "Go'sht", menu: 'steak', cats: ['gosht'], rating: 4.7, reviews: 904, time: 25, dist: 0.71, discount: 0, address: "Shota Rustaveli ko'chasi, 45", hours: '12:00 – 00:00' },
  { id: 'bufet-17', name: 'Bufet 17', menu: 'cafe', cats: ['nonushta', 'shirinlik'], rating: 4.8, reviews: 512, time: 30, dist: 1.7, discount: 20, address: "Mirobod ko'chasi, 17", hours: '08:00 – 22:00' },
  { id: 'roni-pitsa', name: 'Roni Pitsa', menu: 'pizza', cats: ['pizza', 'pasta'], rating: 4.7, reviews: 733, time: 25, dist: 0.44, discount: 0, address: "Bobur ko'chasi, 8", hours: '11:00 – 23:00' },
  { id: 'chorsu', name: 'Chorsu Oshxonasi', menu: 'milliy', cats: ['milliy', 'gosht'], rating: 4.6, reviews: 2140, time: 25, dist: 1.5, discount: 0, address: "Navoiy ko'chasi, 30", hours: '09:00 – 22:00' },
  { id: 'oqsuv', name: 'Oqsuv', menu: 'milliy', cats: ['milliy'], rating: 4.8, reviews: 1187, time: 30, dist: 0.84, discount: 0, address: "Beruniy ko'chasi, 3", hours: '10:00 – 23:00' },
  { id: 'bon', name: 'Bon!', menu: 'cafe', cats: ['nonushta', 'shirinlik'], rating: 4.8, reviews: 1456, time: 20, dist: 1.9, discount: 15, address: "Taras Shevchenko ko'chasi, 28", hours: '07:30 – 23:00' },
  { id: 'tokio-sushi', name: 'Tokio Sushi', menu: 'sushi', cats: ['sushi'], rating: 4.8, reviews: 860, time: 10, dist: 1.4, discount: 0, address: "Oybek ko'chasi, 22", hours: '11:00 – 23:00' },
  { id: 'qora-burger', name: 'Qora Burger', menu: 'burger', cats: ['burger'], rating: 4.5, reviews: 96, time: 25, dist: 1.7, discount: 0, address: "Nukus ko'chasi, 71", hours: '10:00 – 02:00' },
  { id: 'burger-elchixona', name: 'Burger Elchixonasi', menu: 'burger', cats: ['burger'], rating: 4.5, reviews: 640, time: 10, dist: 1.1, discount: 40, address: "Mustaqillik shoh ko'chasi, 5", hours: '10:00 – 00:00' },
  { id: 'ya-sushi', name: 'Yapon Sushi', menu: 'sushi', cats: ['sushi'], rating: 4.5, reviews: 1320, time: 20, dist: 1.6, discount: 40, address: "Labzak ko'chasi, 14", hours: '11:00 – 23:00' },
  { id: 'teppan', name: 'Teppan', menu: 'sushi', cats: ['sushi'], rating: 4.7, reviews: 418, time: 35, dist: 0.65, discount: 0, address: "Sadiq Azimov ko'chasi, 9", hours: '12:00 – 23:00' }
];

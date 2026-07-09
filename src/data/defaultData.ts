import { Game, GamePackage } from '../types';

export const DEFAULT_GAMES: Game[] = [
  // PC Games
  {
    id: 'pc-gta5-enc',
    name: 'GTA 5 Enhance',
    image: 'https://img.gta5-mods.com/q95/images/gta-v-definitive-edition-logo/32b414-GTAV-DefinitiveEdition_Logo_V5.png',
    type: 'PC'
  },
  {
    id: 'pc-gta5-leg',
    name: 'GTA 5 Legacy',
    image: 'https://img.gta5-mods.com/q95/images/gta-v-definitive-edition-logo/32b414-GTAV-DefinitiveEdition_Logo_V5.png',
    type: 'PC'
  },
  {
    id: 'pc-fifa22',
    name: 'Fifa 22',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/FIFA_22_Cover.jpg/250px-FIFA_22_Cover.jpg',
    type: 'PC'
  },
  {
    id: 'pc-efootball',
    name: 'eFootball',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkYgPh_wav6SvbFoPNFz6S7IaDKqpyfZzGhVCGYIq27byJH7ZM53wlm4k&s=10',
    type: 'PC'
  },
  {
    id: 'pc-gta4',
    name: 'GTA 4',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Grand_Theft_Auto_IV_cover.jpg/250px-Grand_Theft_Auto_IV_cover.jpg',
    type: 'PC'
  },
  {
    id: 'pc-roblox',
    name: 'Roblox',
    image: 'https://media.wired.com/photos/611e8c4c616d2959940414e8/4:3/w_2132,h_1599,c_limit/Games-Roblox-Exploitation.jpg',
    type: 'PC'
  },
  {
    id: 'pc-mk11',
    name: 'Mortal Kombat 11',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Mortal_Kombat_11_cover_art.png/250px-Mortal_Kombat_11_cover_art.png',
    type: 'PC'
  },
  {
    id: 'pc-minecraft',
    name: 'Minecraft Java',
    image: 'https://i.ytimg.com/vi/qNMfF9TYETM/maxresdefault.jpg',
    type: 'PC'
  },
  // PSP Games
  {
    id: 'psp-gow1',
    name: 'God of War 1',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkOWW376-Mmga-6N9rez9jRP0sX7JJ_AqZjtIgwn88mvN7hTM791UK4Q&s=10',
    type: 'PSP'
  },
  {
    id: 'psp-gow2',
    name: 'God of War 2',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqG5894Z2MAW214YWTufp0bmbtUqXygQT9eCeqoySgcA&s=10',
    type: 'PSP'
  },
  {
    id: 'psp-tekken',
    name: 'Tekken for PSP',
    image: 'https://upload.wikimedia.org/wikipedia/en/d/d0/PSP-TekkenDarkRessurectionUSversion-FrontCover.jpg',
    type: 'PSP'
  },
  {
    id: 'psp-spiderman3',
    name: 'Spider-Man 3',
    image: 'https://i.ebayimg.com/images/g/XFoAAOSwVTtkq3kC/s-l1200.jpg',
    type: 'PSP'
  },
  {
    id: 'psp-tekken6',
    name: 'Tekken 6',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Tekken_6_Box_Art.jpg/250px-Tekken_6_Box_Art.jpg',
    type: 'PSP'
  },
  {
    id: 'psp-nfs',
    name: 'Need for Speed',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVSNkjQJCtM9amMEMLW-AfBSZ8IJkKboRTAPujIfN1yAhmY2ZTced-oEUx&s=10',
    type: 'PSP'
  },
  {
    id: 'psp-dbz',
    name: 'Dragon Ball',
    image: 'https://m.media-amazon.com/images/I/714tw2EEAxL._AC_UF1000,1000_QL80_.jpg',
    type: 'PSP'
  },
  {
    id: 'psp-gtavc',
    name: 'GTA Vice City',
    image: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Vice-city-cover.jpg',
    type: 'PSP'
  }
];

export const DEFAULT_PACKAGES: GamePackage[] = [
  // PC High-End packages
  { id: 'pkg-pc-30m', system: 'PC', name: 'PC Standard - 30 Mins', durationMinutes: 30, price: 50 },
  { id: 'pkg-pc-1h', system: 'PC', name: 'PC Standard - 1 Hour', durationMinutes: 60, price: 100 },
  { id: 'pkg-pc-2h', system: 'PC', name: 'PC Gamer - 2 Hours', durationMinutes: 120, price: 200 },
  { id: 'pkg-pc-3h', system: 'PC', name: 'PC Pro - 3 Hours', durationMinutes: 180, price: 300 },
  { id: 'pkg-pc-5h', system: 'PC', name: 'PC Half-Day (5 Hours)', durationMinutes: 300, price: 450 },

  // PSP packages
  { id: 'pkg-psp-30m', system: 'PSP', name: 'PSP Standard - 30 Mins', durationMinutes: 30, price: 30 },
  { id: 'pkg-psp-1h', system: 'PSP', name: 'PSP Standard - 1 Hour', durationMinutes: 60, price: 60 },
  { id: 'pkg-psp-2h', system: 'PSP', name: 'PSP Gamer - 2 Hours', durationMinutes: 120, price: 120 },
  { id: 'pkg-psp-3h', system: 'PSP', name: 'PSP Pro - 3 Hours', durationMinutes: 180, price: 180 },
  { id: 'pkg-psp-5h', system: 'PSP', name: 'PSP Half-Day (5 Hours)', durationMinutes: 300, price: 250 },
];

export const ACCOUNTS = {
  admin: {
    username: 'Rahin',
    password: 'rahin5566'
  },
  pcUser: {
    username: 'RAHINEMP',
    password: 'rahinemp'
  },
  pspUser: {
    username: 'psp123',
    password: 'rahin5566'
  }
};

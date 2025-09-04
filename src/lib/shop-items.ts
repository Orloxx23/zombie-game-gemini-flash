import type { ShopItem } from './types';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'medkit',
    name: 'Botiquín',
    icon: '🩹',
    price: 25,
    description: 'Kit médico para curar heridas',
    effect: 'Restaura 50 puntos de salud',
    statEffects: { health: 50 },
    consumable: true
  },
  {
    id: 'food',
    name: 'Comida',
    icon: '🥫',
    price: 15,
    description: 'Lata de comida nutritiva',
    effect: 'Restaura 40 puntos de hambre',
    statEffects: { hunger: 40 },
    consumable: true
  },
  {
    id: 'water',
    name: 'Agua',
    icon: '💧',
    price: 12,
    description: 'Botella de agua purificada',
    effect: 'Restaura 50 puntos de sed',
    statEffects: { thirst: 50 },
    consumable: true
  },
  {
    id: 'energy_drink',
    name: 'Energizante',
    icon: '⚡',
    price: 20,
    description: 'Bebida energética',
    effect: 'Restaura 60 puntos de energía',
    statEffects: { energy: 60 },
    consumable: true
  },
  {
    id: 'pills',
    name: 'Pastillas',
    icon: '💊',
    price: 30,
    description: 'Medicamentos para la ansiedad',
    effect: 'Restaura 30 puntos de cordura',
    statEffects: { sanity: 30 },
    consumable: true
  },
  {
    id: 'weapon',
    name: 'Arma',
    icon: '🔫',
    price: 45,
    description: 'Pistola con munición limitada',
    effect: 'Aumenta efectividad en combate',
    statEffects: {},
    consumable: false
  },
  {
    id: 'flashlight',
    name: 'Linterna',
    icon: '🔦',
    price: 18,
    description: 'Ilumina áreas oscuras',
    effect: 'Revela objetos ocultos',
    statEffects: {},
    consumable: false
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: '📻',
    price: 35,
    description: 'Radio de comunicación',
    effect: 'Contacta otros supervivientes',
    statEffects: {},
    consumable: false
  }
];

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}
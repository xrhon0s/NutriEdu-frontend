export const foodGroupOptions = [
  ["protein", "Proteínas"], ["carbohydrate", "Cereales y carbohidratos"],
  ["vegetable", "Verduras"], ["fruit", "Frutas"], ["dairy", "Lácteos"],
  ["fat", "Grasas, nueces y semillas"], ["legume", "Legumbres"],
  ["seasoning", "Condimentos y endulzantes"], ["beverage", "Bebidas"], ["other", "Otros"],
];

export const substitutionGroupOptions = [
  ["poultry", "Aves"], ["red_meat", "Carnes rojas"], ["fish", "Pescados"],
  ["shellfish", "Mariscos"], ["egg", "Huevos"], ["plant_protein", "Proteína vegetal"],
  ["grain", "Granos y cereales"], ["flour", "Harinas"], ["pasta", "Pastas"],
  ["bread", "Panes"], ["tortilla", "Tortillas"], ["tuber", "Tubérculos"],
  ["leafy_vegetable", "Verduras de hoja"], ["cruciferous_vegetable", "Crucíferas"],
  ["root_vegetable", "Verduras de raíz"], ["allium", "Ajo y cebolla"],
  ["nightshade", "Tomate, pimiento y similares"], ["squash", "Calabazas y similares"],
  ["mushroom", "Hongos"], ["stalk_vegetable", "Verduras de tallo"],
  ["watery_vegetable", "Verduras acuosas"], ["citrus", "Cítricos"],
  ["pome_fruit", "Manzana y pera"], ["berry", "Frutos rojos"],
  ["tropical_fruit", "Frutas tropicales"], ["stone_fruit", "Frutas de hueso"],
  ["melon", "Melones"], ["grape", "Uvas"], ["avocado", "Aguacate"],
  ["dairy_milk", "Leche animal"], ["cultured_dairy", "Lácteos fermentados"],
  ["cheese", "Quesos"], ["dairy_cream", "Cremas lácteas"],
  ["cooking_fat", "Grasas de cocción"], ["nut", "Frutos secos"], ["seed", "Semillas"],
  ["legume", "Legumbres"], ["sweetener", "Endulzantes"], ["herb", "Hierbas"],
  ["spice", "Especias"], ["salt", "Sales"], ["acid", "Ácidos culinarios"],
  ["plant_milk", "Bebidas vegetales"], ["other", "Sin equivalencia definida"],
];

export const foodGroupLabels = Object.fromEntries(foodGroupOptions);
export const substitutionGroupLabels = Object.fromEntries(substitutionGroupOptions);

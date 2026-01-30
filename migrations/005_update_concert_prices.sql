-- Mise à jour des prix des concerts
-- Ce script ajoute des prix réalistes aux concerts existants

UPDATE concerts SET price = '45.00' WHERE id = 1;
UPDATE concerts SET price = '55.00' WHERE id = 2;
UPDATE concerts SET price = '65.00' WHERE id = 3;
UPDATE concerts SET price = '75.00' WHERE id = 4;
UPDATE concerts SET price = '85.00' WHERE id = 5;
UPDATE concerts SET price = '95.00' WHERE id = 6;
UPDATE concerts SET price = '105.00' WHERE id = 7;
UPDATE concerts SET price = '115.00' WHERE id = 8;
UPDATE concerts SET price = '125.00' WHERE id = 9;
UPDATE concerts SET price = '135.00' WHERE id = 10;
UPDATE concerts SET price = '50.00' WHERE id = 11;
UPDATE concerts SET price = '60.00' WHERE id = 12;
UPDATE concerts SET price = '70.00' WHERE id = 13;
UPDATE concerts SET price = '80.00' WHERE id = 14;
UPDATE concerts SET price = '90.00' WHERE id = 15;
UPDATE concerts SET price = '100.00' WHERE id = 16;
UPDATE concerts SET price = '110.00' WHERE id = 17;
UPDATE concerts SET price = '120.00' WHERE id = 18;
UPDATE concerts SET price = '130.00' WHERE id = 19;
UPDATE concerts SET price = '140.00' WHERE id = 20;
UPDATE concerts SET price = '45.00' WHERE id = 21;
UPDATE concerts SET price = '113.00' WHERE id = 22;
UPDATE concerts SET price = '65.00' WHERE id = 23;
UPDATE concerts SET price = '75.00' WHERE id = 24;
UPDATE concerts SET price = '85.00' WHERE id = 25;
UPDATE concerts SET price = '95.00' WHERE id = 26;
UPDATE concerts SET price = '105.00' WHERE id = 27;
UPDATE concerts SET price = '115.00' WHERE id = 28;
UPDATE concerts SET price = '125.00' WHERE id = 29;
UPDATE concerts SET price = '135.00' WHERE id = 30;

-- Mise à jour de tous les concerts sans prix avec un prix par défaut
UPDATE concerts SET price = '50.00' WHERE price IS NULL OR price = '';

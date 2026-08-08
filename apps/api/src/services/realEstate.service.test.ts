/**
 * Testes do Real Estate Service — Sprint Real Estate Phase I (Vision
 * 2.0, Sprint 6), Fase 10. Mesma ressalva de ambiente já documentada em
 * housing.service.test.ts: `DB_PATH=":memory:"` só é honrado se nenhum
 * outro arquivo da suíte completa já importou `config/env.js` primeiro —
 * identificadores únicos por execução + limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getDb } from "../config/database.js";
import { createKingdom } from "./kingdom.service.js";
import { joinKingdom } from "./citizen.service.js";
import { createHouse, getHouse } from "./housing.service.js";
import { getCharacterResourceBalance } from "./economy.service.js";
import { buyHouse, cancelSale, createSale, getSale, listSales } from "./realEstate.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_SELLER = `profile-sale-seller-${RUN_ID}`;
const PROFILE_BUYER = `profile-sale-buyer-${RUN_ID}`;
const PROFILE_POOR = `profile-sale-poor-${RUN_ID}`;
const PROFILE_OUTSIDER = `profile-sale-outsider-${RUN_ID}`;
const CHARACTER_SELLER = randomUUID();
const CHARACTER_BUYER = randomUUID();
const CHARACTER_POOR = randomUUID();
const CHARACTER_OUTSIDER = randomUUID();

let kingdomId: string;
let houseId: string;
let soldSaleId: string;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_SELLER, "SaleSeller");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_BUYER, "SaleBuyer");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_POOR, "SalePoor");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_OUTSIDER, "SaleOutsider");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_SELLER,
    PROFILE_SELLER,
    "Vendedor",
    0,
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_BUYER,
    PROFILE_BUYER,
    "Comprador",
    1000,
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_POOR,
    PROFILE_POOR,
    "SemGrana",
    0,
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_OUTSIDER,
    PROFILE_OUTSIDER,
    "Estranho",
    1000,
  );

  const kingdom = createKingdom(PROFILE_SELLER, { name: `Reino Imobiliário ${RUN_ID}` });
  if (!kingdom.success) throw new Error("setup failed to found kingdom");
  kingdomId = kingdom.kingdom.id;

  joinKingdom(CHARACTER_SELLER, kingdomId);

  const house = createHouse(CHARACTER_SELLER, { kingdom_id: kingdomId, name: `Casa à Venda ${RUN_ID}` });
  if (!house.success) throw new Error("setup failed to build house");
  houseId = house.house.id;
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM house_sales WHERE house_id = ?`).run(houseId);
  db.prepare(`DELETE FROM houses WHERE id = ?`).run(houseId);
  db.prepare(`DELETE FROM citizens WHERE character_id = ?`).run(CHARACTER_SELLER);
  db.prepare(`DELETE FROM kingdoms WHERE id = ?`).run(kingdomId);
  db.prepare(`DELETE FROM characters WHERE id IN (?, ?, ?, ?)`).run(
    CHARACTER_SELLER,
    CHARACTER_BUYER,
    CHARACTER_POOR,
    CHARACTER_OUTSIDER,
  );
  db.prepare(`DELETE FROM profiles WHERE id IN (?, ?, ?, ?)`).run(
    PROFILE_SELLER,
    PROFILE_BUYER,
    PROFILE_POOR,
    PROFILE_OUTSIDER,
  );
});

describe("createSale", () => {
  test("rejeita Casa inexistente", () => {
    const result = createSale(CHARACTER_SELLER, "casa-que-nao-existe", 100);
    assert.deepEqual(result, { success: false, reason: "house-not-found" });
  });

  test("rejeita quem não é o proprietário atual", () => {
    const result = createSale(CHARACTER_OUTSIDER, houseId, 100);
    assert.deepEqual(result, { success: false, reason: "not-the-owner" });
  });

  test("rejeita preço inválido", () => {
    assert.deepEqual(createSale(CHARACTER_SELLER, houseId, 0), { success: false, reason: "invalid-price" });
    assert.deepEqual(createSale(CHARACTER_SELLER, houseId, -5), { success: false, reason: "invalid-price" });
  });

  test("anuncia a Casa com status active", () => {
    const result = createSale(CHARACTER_SELLER, houseId, 250);
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.sale.house_id, houseId);
    assert.equal(result.sale.seller_character_id, CHARACTER_SELLER);
    assert.equal(result.sale.asking_price, 250);
    assert.equal(result.sale.status, "active");
    assert.equal(result.sale.buyer_character_id, null);
  });

  test("rejeita segundo anúncio enquanto o primeiro está ativo", () => {
    const result = createSale(CHARACTER_SELLER, houseId, 300);
    assert.deepEqual(result, { success: false, reason: "already-listed" });
  });
});

describe("cancelSale", () => {
  test("rejeita anúncio inexistente", () => {
    const result = cancelSale(CHARACTER_SELLER, "anuncio-que-nao-existe");
    assert.deepEqual(result, { success: false, reason: "sale-not-found" });
  });

  test("rejeita quem não é o vendedor", () => {
    const sales = listSales();
    const sale = sales.find((s) => s.house_id === houseId);
    assert.ok(sale);
    if (!sale) return;
    const result = cancelSale(CHARACTER_OUTSIDER, sale.id);
    assert.deepEqual(result, { success: false, reason: "not-the-seller" });
  });

  test("cancela um anúncio ativo, liberando a Casa para novo anúncio", () => {
    const sales = listSales();
    const sale = sales.find((s) => s.house_id === houseId);
    assert.ok(sale);
    if (!sale) return;

    const result = cancelSale(CHARACTER_SELLER, sale.id);
    assert.deepEqual(result, { success: true });

    const cancelled = getSale(sale.id);
    assert.equal(cancelled?.status, "cancelled");

    const relisted = createSale(CHARACTER_SELLER, houseId, 400);
    assert.equal(relisted.success, true);
  });
});

describe("buyHouse", () => {
  test("rejeita anúncio inexistente", () => {
    const result = buyHouse(CHARACTER_BUYER, "anuncio-que-nao-existe");
    assert.deepEqual(result, { success: false, reason: "sale-not-found" });
  });

  test("rejeita comprar a própria Casa", () => {
    const sales = listSales();
    const sale = sales.find((s) => s.house_id === houseId);
    assert.ok(sale);
    if (!sale) return;
    const result = buyHouse(CHARACTER_SELLER, sale.id);
    assert.deepEqual(result, { success: false, reason: "cannot-buy-own-house" });
  });

  test("rejeita débito insuficiente sem alterar a Casa nem o anúncio", () => {
    const sales = listSales();
    const sale = sales.find((s) => s.house_id === houseId);
    assert.ok(sale);
    if (!sale) return;

    const result = buyHouse(CHARACTER_POOR, sale.id);
    assert.deepEqual(result, { success: false, reason: "debit-rejected" });

    const house = getHouse(houseId);
    assert.equal(house?.current_owner_character_id, CHARACTER_SELLER);
    assert.equal(getSale(sale.id)?.status, "active");
  });

  test("compra com sucesso: debita comprador, credita vendedor, transfere posse, marca vendido, acrescenta evento 'sold' ao histórico", () => {
    const sales = listSales();
    const sale = sales.find((s) => s.house_id === houseId);
    assert.ok(sale);
    if (!sale) return;

    const sellerGoldBefore = getCharacterResourceBalance(CHARACTER_SELLER, "gold");

    const result = buyHouse(CHARACTER_BUYER, sale.id);
    assert.equal(result.success, true);
    if (!result.success) return;
    soldSaleId = sale.id;

    assert.equal(result.sale.status, "sold");
    assert.equal(result.sale.buyer_character_id, CHARACTER_BUYER);
    assert.ok(result.sale.sold_at);
    assert.equal(result.newBuyerGoldBalance, 1000 - sale.asking_price);
    assert.equal(getCharacterResourceBalance(CHARACTER_SELLER, "gold"), sellerGoldBefore + sale.asking_price);

    const house = getHouse(houseId);
    assert.equal(house?.current_owner_character_id, CHARACTER_BUYER);
    assert.equal(house?.original_builder_character_id, CHARACTER_SELLER);
    const lastEvent = house?.history[house.history.length - 1];
    assert.equal(lastEvent?.event, "sold");
    assert.equal(lastEvent?.from_character_id, CHARACTER_SELLER);
    assert.equal(lastEvent?.to_character_id, CHARACTER_BUYER);
    assert.equal(lastEvent?.price, sale.asking_price);
  });

  test("rejeita comprar um anúncio já vendido", () => {
    const result = buyHouse(CHARACTER_OUTSIDER, soldSaleId);
    assert.deepEqual(result, { success: false, reason: "not-active" });
  });
});

describe("listSales / getSale", () => {
  test("listSales só inclui anúncios ativos", () => {
    const all = listSales();
    assert.ok(!all.some((s) => s.house_id === houseId));
  });
});

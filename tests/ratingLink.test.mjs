import assert from 'node:assert/strict';
import test from 'node:test';
import { postLoginDestination, ratingLinkResult } from '../src/utils/ratingLink.ts';

const incident = { numericId: 42, reporterId: 7, status: 'Resuelta', calificacion: null };

test('conserva el enlace exacto de calificación durante el login', () => {
  const path = '/dashboard/mis-incidencias?calificar=42';
  assert.equal(postLoginDestination('?redirect=' + encodeURIComponent(path)), path);
  assert.equal(postLoginDestination(''), '/dashboard');
});

test('rechaza redirecciones externas, rutas ajenas y evasiones con barras', () => {
  for (const path of ['https://malicioso.invalid', '//malicioso.invalid', '/dashboard-falso', '/dashboard/../../externo', '/dashboard\\\\malicioso.invalid', '/dashboard\nLocation: otro']) {
    assert.equal(postLoginDestination('?redirect=' + encodeURIComponent(path)), '/dashboard');
  }
});

test('abre únicamente la incidencia resuelta del estudiante autenticado', () => {
  assert.equal(ratingLinkResult('42', [incident], 7, 'ESTUDIANTE').incident, incident);
  assert.equal(ratingLinkResult('42', [incident], 8, 'ESTUDIANTE').incident, null);
  assert.equal(ratingLinkResult('42', [incident], 7, 'ADMIN').incident, null);
  assert.equal(ratingLinkResult('43', [incident], 7, 'ESTUDIANTE').incident, null);
});

test('no permite volver a calificar una incidencia cerrada o con calificación', () => {
  for (const change of [{status: 'Cerrada'}, {calificacion: 5}, {status: 'En atención'}]) {
    const result = ratingLinkResult('42', [{...incident, ...change}], 7, 'ESTUDIANTE');
    assert.equal(result.incident, null);
    assert.ok(result.message);
  }
});

test('rechaza IDs vacíos, negativos, decimales, texto y valores fuera de rango', () => {
  for (const id of ['', '0', '-1', '42.0', '42abc', '9007199254740992']) {
    assert.equal(ratingLinkResult(id, [incident], 7, 'ESTUDIANTE').incident, null);
  }
});

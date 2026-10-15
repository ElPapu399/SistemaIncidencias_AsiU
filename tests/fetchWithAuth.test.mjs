import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Ejecuta el código TypeScript real con HTTP y almacenamiento aislados.
// No envía peticiones al servidor ni utiliza la sesión del usuario.
async function crearEntorno(status, body = {}) {
  let logoutCalls = 0;
  let request;
  const response = new Response(JSON.stringify(body), { status });
  const location = { pathname: '/dashboard/configuracion', href: '/dashboard/configuracion' };
  const context = vm.createContext({
    Headers, FormData,
    window: { location },
    fetch: async (url, options) => { request = { url, options }; return response; },
  });
  const config = new vm.SyntheticModule(['API_BASE'], function () {
    this.setExport('API_BASE', 'http://test.invalid/api');
  }, { context });
  const auth = new vm.SyntheticModule(['getToken', 'logout'], function () {
    this.setExport('getToken', () => 'test-token');
    this.setExport('logout', () => { logoutCalls += 1; });
  }, { context });
  const source = await readFile(new URL('../src/utils/fetchWithAuth.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = new vm.SourceTextModule(compiled, { context });
  await module.link((specifier) => {
    if (specifier === '../config/api') return config;
    if (specifier === './auth') return auth;
    throw new Error(`Importación inesperada: ${specifier}`);
  });
  await module.evaluate();
  return { fetchWithAuth: module.namespace.fetchWithAuth, response, location,
    logoutCalls: () => logoutCalls, request: () => request };
}

test('403 conserva la sesión y devuelve el rechazo para mostrarlo en la página', async () => {
  const entorno = await crearEntorno(403, { error: 'Sin permisos' });
  assert.equal(await entorno.fetchWithAuth('/categorias/configuracion'), entorno.response);
  assert.equal(entorno.logoutCalls(), 0);
  assert.equal(entorno.location.href, '/dashboard/configuracion');
});

test('401 cierra la sesión y redirige al login', async () => {
  const entorno = await crearEntorno(401);
  await assert.rejects(entorno.fetchWithAuth('/estados'), /Sesión expirada/);
  assert.equal(entorno.logoutCalls(), 1);
  assert.equal(entorno.location.href, '/');
});

test('404 conserva la sesión y permite informar de una ruta no disponible', async () => {
  const entorno = await crearEntorno(404);
  assert.equal(await entorno.fetchWithAuth('/estados'), entorno.response);
  assert.equal(entorno.logoutCalls(), 0);
  assert.equal(entorno.location.href, '/dashboard/configuracion');
});

test('adjunta el token de autenticación y conserva el cuerpo y sus cabeceras', async () => {
  const entorno = await crearEntorno(201);
  const body = JSON.stringify({ nombre: 'Categoría' });
  await entorno.fetchWithAuth('/categorias', { method: 'POST', body });
  const request = entorno.request();
  assert.equal(request.url, 'http://test.invalid/api/categorias');
  assert.equal(request.options.headers.get('Authorization'), 'Bearer test-token');
  assert.equal(request.options.headers.get('Content-Type'), 'application/json');
  assert.equal(request.options.body, body);
  assert.equal(entorno.logoutCalls(), 0);
});

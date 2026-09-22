// CP-09 - Flujo principal en todos los navegadores del proyecto:
// login -> crear cliente -> crear contrato -> consultar auditoría.
// Usa los mismos datos de CP-04 y CP-05. Los selectores se ajustan cuando
// tengamos acceso a la interfaz real en el ambiente QA.
const { test, expect } = require('@playwright/test');

const usuario = process.env.ATLAS_USER || 'admin.pyme01';
const password = process.env.ATLAS_PASS;

test.describe('CP-09 flujo principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill(usuario);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('crear cliente, asociarle un contrato y verlo en auditoría', async ({ page }) => {
    const razonSocial = `Comercial Ñuñoa Ltda. ${Date.now()}`;

    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await page.getByLabel('Razón social').fill(razonSocial);
    await page.getByLabel('RUT').fill('76.123.456-0');
    await page.getByLabel('Teléfono').fill('+56 9 8765 4321');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(razonSocial)).toBeVisible();

    await page.getByText(razonSocial).click();
    await page.getByRole('button', { name: 'Nuevo contrato' }).click();
    await page.getByLabel('Fecha de inicio').fill('2026-01-01');
    await page.getByLabel('Fecha de término').fill('2026-12-31');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Activo')).toBeVisible();

    await page.getByRole('link', { name: 'Auditoría' }).click();
    await expect(page.getByRole('row', { name: new RegExp(razonSocial) }).first()).toBeVisible();
  });

  test('la pantalla no necesita scroll horizontal', async ({ page }) => {
    await page.getByRole('link', { name: 'Clientes' }).click();
    const anchoContenido = await page.evaluate(() => document.documentElement.scrollWidth);
    const anchoVentana = page.viewportSize().width;
    expect(anchoContenido).toBeLessThanOrEqual(anchoVentana);
  });

  test('en celular los botones miden al menos 44 x 44 px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'solo aplica en los proyectos móviles');
    await page.getByRole('link', { name: 'Clientes' }).click();
    const botones = page.getByRole('button');
    const total = await botones.count();
    for (let i = 0; i < total; i++) {
      const caja = await botones.nth(i).boundingBox();
      if (!caja) continue; // botones ocultos
      expect(caja.width, `botón ${i}`).toBeGreaterThanOrEqual(44);
      expect(caja.height, `botón ${i}`).toBeGreaterThanOrEqual(44);
    }
  });
});

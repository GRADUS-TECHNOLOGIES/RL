// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { UserDropdown } from '../components/Header';
import ErrorPage from '../pages/ErrorPage';
import UnderConstructionPage from '../pages/UnderConstructionPage';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage, ref } from 'firebase/storage';

afterEach(cleanup);
class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = ResizeObserverMock;
HTMLElement.prototype.scrollIntoView = () => {};
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => {};
HTMLElement.prototype.releasePointerCapture = () => {};
function Location() { return <div data-testid="location">{useLocation().pathname}{useLocation().search}</div>; }
const user = { username: 'Usuario', email: 'user@example.test', profilePicture: '/avatar.png' };
describe('menú y navegación', () => {
  test('abre perfil y navega a la página correcta', async () => {
    const click = userEvent.setup();
    render(<MemoryRouter><UserDropdown currentUser={user} onSignout={vi.fn()} /><Location /></MemoryRouter>);
    await click.click(screen.getByRole('button', {name:'Menú de usuario'}));
    expect(screen.getByText('user@example.test')).toBeTruthy();
    await click.click(screen.getByRole('menuitem', {name:'Perfil'}));
    expect(screen.getByTestId('location').textContent).toBe('/dashboard?tab=profile');
  });
  test('cierra sesión y permite cerrar el menú con Escape', async () => {
    const click = userEvent.setup(); const onSignout=vi.fn();
    render(<MemoryRouter><UserDropdown currentUser={user} onSignout={onSignout} /></MemoryRouter>);
    const button=screen.getByRole('button', {name:'Menú de usuario'});
    await click.click(button); await click.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    await click.click(button); await click.click(screen.getByRole('menuitem', {name:'Cerrar sesión'}));
    expect(onSignout).toHaveBeenCalledOnce();
  });
  test.each([ErrorPage,UnderConstructionPage])('páginas conservan enlace al inicio', Component => {
    render(<Component />); expect(screen.getByRole('link', {name:'Regresar al inicio'}).getAttribute('href')).toBe('/');
  });
});
test('SDK público inicializa Auth y Storage para un proyecto ficticio', async () => {
  const app=initializeApp({apiKey:'test-key',authDomain:'example.test',projectId:'example-test',storageBucket:'example-test.appspot.com'},'isolated-test');
  expect(getAuth(app).app).toBe(app);
  expect(new GoogleAuthProvider().providerId).toBe('google.com');
  expect(ref(getStorage(app),'test/file').fullPath).toBe('test/file');
  await deleteApp(app);
});

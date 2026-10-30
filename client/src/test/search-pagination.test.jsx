// @vitest-environment jsdom
import { test, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Search from '../pages/Search';

vi.mock('../components/PostCard', () => ({ default: ({ post }) => <div>{post.title}</div> }));
vi.mock('../components/InstitutionalBanner', () => ({ default: () => <div>Banner</div> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const posts = (start, count) => Array.from({ length: count }, (_, i) => ({ _id: String(start+i), title: `Publicación ${start+i}`, createdAt: '2025-01-01T00:00:00Z' }));
function CurrentLocation() { return <div data-testid="location">{useLocation().search}</div>; }

test('carga más publicaciones sin filtrar por la categoría de todas', async () => {
  const fetchMock=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({posts:posts(0,9)})}).mockResolvedValueOnce({ok:true,json:async()=>({posts:posts(9,3)})});
  vi.stubGlobal('fetch',fetchMock);
  render(<MemoryRouter initialEntries={['/search?category=uncategorized']}><Search /><CurrentLocation /></MemoryRouter>);
  await screen.findByText('9 resultados mostrados');
  expect(new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams.has('category')).toBe(false);
  await userEvent.click(screen.getByRole('button',{name:/Mostrar más/}));
  await screen.findByText('12 resultados mostrados');
  const next=new URL(fetchMock.mock.calls[1][0], 'http://localhost').searchParams;
  expect(next.get('startIndex')).toBe('9');
  expect(next.has('category')).toBe(false);
  expect(screen.getByText('Publicación 11')).toBeTruthy();
  expect(screen.queryByRole('button',{name:/Mostrar más/})).toBeNull();
});

test('aplicar todas las categorías no agrega un filtro oculto', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({posts:[]})}));
  render(<MemoryRouter initialEntries={['/search']}><Search /><CurrentLocation /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button',{name:'Aplicar filtros'}));
  await waitFor(()=>expect(screen.getByTestId('location').textContent).toContain('sort=desc'));
  expect(new URLSearchParams(screen.getByTestId('location').textContent).has('category')).toBe(false);
});

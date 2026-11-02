// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RecoverAccess from '../pages/RecoverAccess';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
test('permite establecer una contraseña con código sin mostrar respuestas técnicas', async () => {
  const fetchMock=vi.fn().mockResolvedValueOnce({ok:false,status:400}).mockResolvedValueOnce({ok:true,status:200});
  vi.stubGlobal('fetch',fetchMock);
  render(<MemoryRouter><RecoverAccess /></MemoryRouter>);
  await userEvent.type(screen.getByLabelText('Código de recuperación'),'a'.repeat(43));
  await userEvent.type(screen.getByLabelText('Nueva contraseña'),'contraseña segura');
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'),'contraseña segura');
  await userEvent.click(screen.getByRole('button',{name:'Actualizar contraseña'}));
  await screen.findByText(/No fue posible usar el código/);
  await userEvent.click(screen.getByRole('button',{name:'Actualizar contraseña'}));
  await screen.findByText(/Tu contraseña se actualizó/);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
